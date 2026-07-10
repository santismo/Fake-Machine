(function attachFakebotMiditarMidi(global) {
  'use strict';

  const VERSION = '1.0.0';
  const DEFAULT_MPQ = 500000;
  const MAX_VAR_LENGTH_BYTES = 4;

  function titleFromFileName(fileName) {
    const value = typeof fileName === 'string' && fileName.trim() ? fileName.trim() : 'Untitled.mid';
    const leaf = value.split(/[\\/]/).pop() || value;
    return leaf.replace(/\.(mid|midi)$/i, '') || 'Untitled';
  }

  function asBytes(buffer) {
    if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
    if (ArrayBuffer.isView(buffer)) {
      return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    throw new TypeError('MIDI data must be an ArrayBuffer or typed-array view.');
  }

  function ensureAvailable(bytes, offset, length, label, limit) {
    const boundary = limit === undefined ? bytes.length : Math.min(limit, bytes.length);
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || offset + length > boundary) {
      throw new Error(`Unexpected end of MIDI data while reading ${label}.`);
    }
  }

  function readUint16(bytes, offset, label, limit) {
    ensureAvailable(bytes, offset, 2, label || '16-bit value', limit);
    return (bytes[offset] << 8) | bytes[offset + 1];
  }

  function readUint32(bytes, offset, label, limit) {
    ensureAvailable(bytes, offset, 4, label || '32-bit value', limit);
    return (
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]
    ) >>> 0;
  }

  function readAscii(bytes, offset, length, label, limit) {
    ensureAvailable(bytes, offset, length, label || 'chunk identifier', limit);
    let value = '';
    for (let index = 0; index < length; index += 1) value += String.fromCharCode(bytes[offset + index]);
    return value;
  }

  function readVarLength(bytes, offset, limit, label) {
    let value = 0;
    let cursor = offset;

    for (let count = 0; count < MAX_VAR_LENGTH_BYTES; count += 1) {
      ensureAvailable(bytes, cursor, 1, label || 'variable-length value', limit);
      const byte = bytes[cursor];
      cursor += 1;
      value = value * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return { value, offset: cursor };
    }

    throw new Error(`Invalid MIDI ${label || 'variable-length value'} (more than four bytes).`);
  }

  function decodeText(payload) {
    const compact = [];
    for (let index = 0; index < payload.length; index += 1) {
      if (payload[index] !== 0) compact.push(payload[index]);
    }

    const bytes = new Uint8Array(compact);
    if (typeof TextDecoder === 'function') {
      try {
        return new TextDecoder('utf-8').decode(bytes).trim();
      } catch (_error) {
        // Fall through for older browsers with incomplete TextDecoder support.
      }
    }

    let value = '';
    for (let index = 0; index < bytes.length; index += 1) value += String.fromCharCode(bytes[index]);
    return value.trim();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values)).sort((left, right) => left - right);
  }

  function eventSort(left, right) {
    return left.tick - right.tick || (left.order || 0) - (right.order || 0);
  }

  function normalizedTempoSource(tempos) {
    const sorted = Array.isArray(tempos)
      ? tempos
          .filter((tempo) => tempo && Number.isFinite(tempo.tick) && Number.isFinite(tempo.mpq) && tempo.mpq > 0)
          .map((tempo, order) => ({ tick: Math.max(0, tempo.tick), mpq: tempo.mpq, order }))
          .sort(eventSort)
      : [];

    if (!sorted.some((tempo) => tempo.tick === 0)) sorted.unshift({ tick: 0, mpq: DEFAULT_MPQ, order: -1 });
    return sorted;
  }

  function ticksToSeconds(first, second, third) {
    let tick;
    let tempos;
    let ppq;

    if (first && typeof first === 'object' && !Array.isArray(first) && Array.isArray(first.tempos)) {
      tick = second;
      tempos = first.tempos;
      ppq = first.ppq;
    } else {
      tick = first;
      tempos = second;
      ppq = third;
    }

    if (!Number.isFinite(tick)) throw new TypeError('tick must be a finite number.');
    if (!Number.isFinite(ppq) || ppq <= 0) throw new TypeError('ppq must be a positive number.');

    const targetTick = Math.max(0, tick);
    const sorted = normalizedTempoSource(tempos);
    return secondsFromTempoSource(targetTick, sorted, ppq);
  }

  function secondsFromTempoSource(targetTick, sorted, ppq) {
    let lastTick = 0;
    let seconds = 0;
    let mpq = DEFAULT_MPQ;

    for (const tempo of sorted) {
      if (tempo.tick > targetTick) break;
      seconds += ((tempo.tick - lastTick) * mpq) / ppq / 1000000;
      lastTick = tempo.tick;
      mpq = tempo.mpq;
    }

    seconds += ((targetTick - lastTick) * mpq) / ppq / 1000000;
    return seconds;
  }

  function normalizeTempos(rawTempos, ppq) {
    const source = normalizedTempoSource(rawTempos);
    let lastTick = 0;
    let seconds = 0;
    let mpq = DEFAULT_MPQ;

    return source.map((tempo) => {
      seconds += ((tempo.tick - lastTick) * mpq) / ppq / 1000000;
      lastTick = tempo.tick;
      mpq = tempo.mpq;
      return {
        tick: tempo.tick,
        time: seconds,
        bpm: 60000000 / tempo.mpq,
        mpq: tempo.mpq,
      };
    });
  }

  function secondsFromNormalizedTempos(tick, tempos, ppq) {
    const targetTick = Math.max(0, tick);
    let low = 0;
    let high = tempos.length - 1;
    let selected = 0;

    while (low <= high) {
      const middle = (low + high) >> 1;
      if (tempos[middle].tick <= targetTick) {
        selected = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    const tempo = tempos[selected];
    return tempo.time + ((targetTick - tempo.tick) * tempo.mpq) / ppq / 1000000;
  }

  function parse(buffer, fileName) {
    const bytes = asBytes(buffer);
    const resolvedFileName = typeof fileName === 'string' && fileName.trim() ? fileName : 'Untitled.mid';

    ensureAvailable(bytes, 0, 14, 'MIDI header');
    if (readAscii(bytes, 0, 4, 'MIDI header identifier') !== 'MThd') {
      throw new Error('This does not look like a Standard MIDI file (missing MThd).');
    }

    const headerLength = readUint32(bytes, 4, 'MIDI header length');
    if (headerLength < 6) throw new Error('Invalid Standard MIDI header length.');
    ensureAvailable(bytes, 8, headerLength, 'MIDI header body');

    const format = readUint16(bytes, 8, 'MIDI format');
    const trackCount = readUint16(bytes, 10, 'MIDI track count');
    const division = readUint16(bytes, 12, 'MIDI time division');

    if (format > 2) throw new Error(`Unsupported Standard MIDI format ${format}.`);
    if (format === 0 && trackCount !== 1) throw new Error('Standard MIDI format 0 must contain exactly one track.');
    if (trackCount < 1) throw new Error('The MIDI file contains no tracks.');
    if (division & 0x8000) throw new Error('SMPTE time division is not supported.');
    if (division === 0) throw new Error('The MIDI PPQ value must be greater than zero.');
    const ppq = division;

    let offset = 8 + headerLength;
    const rawTracks = [];
    const rawMarkers = [];
    const rawTempos = [];
    const rawTimeSignatures = [];
    const rawKeySignatures = [];
    let title = titleFromFileName(resolvedFileName);
    let durationTicks = 0;
    let globalOrder = 0;

    for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
      ensureAvailable(bytes, offset, 8, `track ${trackIndex + 1} header`);
      const chunkType = readAscii(bytes, offset, 4, `track ${trackIndex + 1} identifier`);
      if (chunkType !== 'MTrk') throw new Error(`Expected MTrk at track ${trackIndex + 1}, found ${chunkType || 'unknown data'}.`);

      const trackLength = readUint32(bytes, offset + 4, `track ${trackIndex + 1} length`);
      const startOffset = offset + 8;
      const endOffset = startOffset + trackLength;
      ensureAvailable(bytes, startOffset, trackLength, `track ${trackIndex + 1} data`);

      let cursor = startOffset;
      let tick = 0;
      let runningStatus = null;
      let trackName = `Track ${trackIndex + 1}`;
      let noteSequence = 0;
      const activeNotes = new Map();
      const rawNotes = [];
      const channels = new Set();
      const programs = {};
      const rawProgramChanges = [];

      while (cursor < endOffset) {
        const delta = readVarLength(bytes, cursor, endOffset, `delta time in track ${trackIndex + 1}`);
        tick += delta.value;
        cursor = delta.offset;
        durationTicks = Math.max(durationTicks, tick);

        ensureAvailable(bytes, cursor, 1, `event status in track ${trackIndex + 1}`, endOffset);
        let status = bytes[cursor];
        let firstDataByte = null;

        if (status < 0x80) {
          if (runningStatus === null) throw new Error(`Invalid running status in track ${trackIndex + 1} at tick ${tick}.`);
          firstDataByte = status;
          status = runningStatus;
          cursor += 1;
        } else {
          cursor += 1;
          runningStatus = status < 0xf0 ? status : null;
        }

        if (status === 0xff) {
          ensureAvailable(bytes, cursor, 1, `meta-event type in track ${trackIndex + 1}`, endOffset);
          const metaType = bytes[cursor];
          cursor += 1;
          const length = readVarLength(bytes, cursor, endOffset, `meta-event length in track ${trackIndex + 1}`);
          cursor = length.offset;
          ensureAvailable(bytes, cursor, length.value, `meta-event payload in track ${trackIndex + 1}`, endOffset);
          const payload = bytes.subarray(cursor, cursor + length.value);
          cursor += length.value;
          const order = globalOrder;
          globalOrder += 1;

          if (metaType === 0x2f) {
            if (length.value !== 0) throw new Error(`Invalid end-of-track event in track ${trackIndex + 1}.`);
            break;
          }

          if (metaType === 0x03) {
            trackName = decodeText(payload) || trackName;
            if (trackIndex === 0 && trackName.trim()) title = trackName.trim();
          } else if (metaType === 0x01 || metaType === 0x05 || metaType === 0x06) {
            const text = decodeText(payload);
            if (text) {
              rawMarkers.push({
                tick,
                text,
                type: metaType === 0x06 ? 'marker' : metaType === 0x05 ? 'lyric' : 'text',
                order,
              });
            }
          } else if (metaType === 0x51 && payload.length === 3) {
            const mpq = (payload[0] << 16) | (payload[1] << 8) | payload[2];
            if (mpq > 0) rawTempos.push({ tick, mpq, order });
          } else if (metaType === 0x58 && payload.length >= 4) {
            rawTimeSignatures.push({
              tick,
              numerator: payload[0],
              denominator: 2 ** payload[1],
              clocksPerClick: payload[2],
              thirtySecondNotes: payload[3],
              order,
            });
          } else if (metaType === 0x59 && payload.length >= 2) {
            rawKeySignatures.push({
              tick,
              sf: payload[0] > 127 ? payload[0] - 256 : payload[0],
              minor: payload[1] === 1,
              order,
            });
          }

          continue;
        }

        if (status === 0xf0 || status === 0xf7) {
          const length = readVarLength(bytes, cursor, endOffset, `system-exclusive length in track ${trackIndex + 1}`);
          cursor = length.offset;
          ensureAvailable(bytes, cursor, length.value, `system-exclusive payload in track ${trackIndex + 1}`, endOffset);
          cursor += length.value;
          continue;
        }

        if (status >= 0xf0) throw new Error(`Unsupported system event 0x${status.toString(16)} in track ${trackIndex + 1}.`);

        const eventType = status & 0xf0;
        const channel = status & 0x0f;
        const channelNumber = channel + 1;
        let data1;
        if (firstDataByte === null) {
          ensureAvailable(bytes, cursor, 1, `channel-event data in track ${trackIndex + 1}`, endOffset);
          data1 = bytes[cursor];
          cursor += 1;
        } else {
          data1 = firstDataByte;
        }
        if (data1 > 0x7f) throw new Error(`Invalid channel-event data byte in track ${trackIndex + 1}.`);

        channels.add(channelNumber);

        if (eventType === 0xc0 || eventType === 0xd0) {
          if (eventType === 0xc0) {
            programs[channelNumber] = data1;
            rawProgramChanges.push({ tick, channel: channelNumber, program: data1, order: globalOrder });
            globalOrder += 1;
          }
          continue;
        }

        if (eventType < 0x80 || eventType > 0xe0) {
          throw new Error(`Unsupported MIDI channel event 0x${status.toString(16)} in track ${trackIndex + 1}.`);
        }

        ensureAvailable(bytes, cursor, 1, `channel-event data in track ${trackIndex + 1}`, endOffset);
        const data2 = bytes[cursor];
        cursor += 1;
        if (data2 > 0x7f) throw new Error(`Invalid channel-event data byte in track ${trackIndex + 1}.`);

        if (eventType === 0x90 && data2 > 0) {
          const key = `${channel}:${data1}`;
          const note = {
            id: `${trackIndex}-${noteSequence}`,
            trackIndex,
            trackName,
            channel: channelNumber,
            midi: data1,
            velocity: data2 / 127,
            tick,
            durationTicks: 0,
            endTick: tick,
          };
          noteSequence += 1;
          if (!activeNotes.has(key)) activeNotes.set(key, []);
          activeNotes.get(key).push(note);
        } else if (eventType === 0x80 || (eventType === 0x90 && data2 === 0)) {
          const key = `${channel}:${data1}`;
          const stack = activeNotes.get(key);
          const note = stack && stack.shift();
          if (note) {
            note.durationTicks = Math.max(1, tick - note.tick);
            note.endTick = note.tick + note.durationTicks;
            rawNotes.push(note);
          }
          if (stack && stack.length === 0) activeNotes.delete(key);
        }
      }

      const trackEndTick = tick;
      for (const stack of activeNotes.values()) {
        for (const note of stack) {
          note.durationTicks = Math.max(1, trackEndTick - note.tick);
          note.endTick = note.tick + note.durationTicks;
          rawNotes.push(note);
          durationTicks = Math.max(durationTicks, note.endTick);
        }
      }

      rawTracks.push({
        index: trackIndex,
        name: trackName.trim() || `Track ${trackIndex + 1}`,
        notes: rawNotes.sort((left, right) => left.tick - right.tick || left.midi - right.midi || left.channel - right.channel),
        channels,
        programs,
        programChanges: rawProgramChanges.sort(eventSort),
      });

      offset = endOffset;
    }

    const tempos = normalizeTempos(rawTempos, ppq);
    const toSeconds = (tick) => secondsFromNormalizedTempos(tick, tempos, ppq);
    const tracks = rawTracks.map((track) => ({
      index: track.index,
      name: track.name,
      channels: uniqueSorted(track.channels),
      programs: track.programs,
      programChanges: track.programChanges.map((event) => ({
        tick: event.tick,
        time: toSeconds(event.tick),
        channel: event.channel,
        program: event.program,
      })),
      notes: track.notes.map((note) => {
        const time = toSeconds(note.tick);
        const end = toSeconds(note.endTick);
        return {
          ...note,
          trackName: track.name,
          time,
          duration: Math.max(0.01, end - time),
        };
      }),
    }));

    return {
      fileName: resolvedFileName,
      title,
      format,
      ppq,
      durationTicks,
      duration: toSeconds(durationTicks),
      tempos,
      timeSignatures: rawTimeSignatures.sort(eventSort).map((event) => ({
        tick: event.tick,
        time: toSeconds(event.tick),
        numerator: event.numerator,
        denominator: event.denominator,
        clocksPerClick: event.clocksPerClick,
        thirtySecondNotes: event.thirtySecondNotes,
      })),
      keySignatures: rawKeySignatures.sort(eventSort).map((event) => ({
        tick: event.tick,
        time: toSeconds(event.tick),
        sf: event.sf,
        minor: event.minor,
      })),
      markers: rawMarkers.sort(eventSort).map((marker) => ({
        tick: marker.tick,
        time: toSeconds(marker.tick),
        text: marker.text,
        type: marker.type,
      })),
      tracks,
    };
  }

  global.FakebotMiditarMidi = Object.freeze({
    version: VERSION,
    parse,
    ticksToSeconds,
    titleFromFileName,
  });
})(typeof window !== 'undefined' ? window : globalThis);
