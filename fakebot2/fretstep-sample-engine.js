(function(){
  "use strict";
  const STORE_KEY = "fakebot2.fretstepSamples.v2";
  const DEFAULTS = { enabled:true, keys:"real:gm:electric_piano_1", bass:"real:gm:electric_bass_finger", drums:"real:drum:LM-2", route:"all", mix:0.82 };
  const NOTE_NAMES = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  const INSTRUMENTS = [
    {id:"real:gm:electric_piano_1", name:"Sample Electric Piano", group:"keys", sample:true, instrument:"electric_piano_1"},
    {id:"real:gm:acoustic_grand_piano", name:"Sample Grand Piano", group:"keys", sample:true, instrument:"acoustic_grand_piano"},
    {id:"real:gm:music_box", name:"Sample Music Box", group:"keys", sample:true, instrument:"music_box"},
    {id:"real:gm:vibraphone", name:"Sample Vibraphone", group:"keys", sample:true, instrument:"vibraphone"},
    {id:"real:gm:marimba", name:"Sample Marimba", group:"keys", sample:true, instrument:"marimba"},
    {id:"real:gm:acoustic_guitar_steel", name:"Sample Steel Guitar", group:"keys", sample:true, instrument:"acoustic_guitar_steel"},
    {id:"real:gm:drawbar_organ", name:"Sample Drawbar Organ", group:"keys", sample:true, instrument:"drawbar_organ"},
    {id:"real:gm:string_ensemble_1", name:"Sample String Ensemble", group:"keys", sample:true, instrument:"string_ensemble_1"},
    {id:"real:chip:coin_pluck", name:"8-Bit Coin Pluck", group:"keys", wave:"pulse", duty:.2, roots:[60,72,84], duration:.58, gain:.86, bitDepth:4, pluck:true, pitchEnd:1.6, color:"#ffee78"},
    {id:"real:chip:tiny_bell", name:"8-Bit Tiny Bell", group:"keys", wave:"fm", roots:[60,72,84], duration:.92, gain:.82, fmRatio:3, modIndex:2.1, bitDepth:5, pluck:true, color:"#78f0ff"},
    {id:"real:chip:fm_keys", name:"16-Bit FM Keys", group:"keys", wave:"fm", roots:[48,60,72], duration:1.18, gain:.68, fmRatio:1.5, modIndex:1.9, bitDepth:8, color:"#ac7cff"},
    {id:"real:chip:pcm_pad", name:"16-Bit PCM Pad", group:"keys", wave:"organ", roots:[48,60,72], duration:2.4, gain:.48, bitDepth:8, pad:true, color:"#7c5cff"},
    {id:"real:gm:fx_3_crystal", name:"Sample Crystal FX", group:"keys", sample:true, instrument:"fx_3_crystal"},
    {id:"real:chip:gb_bass", name:"Gameboy Bass", group:"bass", wave:"pulse", duty:.25, roots:[36,48], duration:1.2, gain:.94, bitDepth:4, lowpass:.45, color:"#ff4778"},
    {id:"real:gm:electric_bass_finger", name:"Sample Finger Bass", group:"bass", sample:true, instrument:"electric_bass_finger"},
    {id:"real:gm:acoustic_bass", name:"Sample Acoustic Bass", group:"bass", sample:true, instrument:"acoustic_bass"},
    {id:"real:gm:fretless_bass", name:"Sample Fretless Bass", group:"bass", sample:true, instrument:"fretless_bass"},
    {id:"real:gm:slap_bass_1", name:"Sample Slap Bass", group:"bass", sample:true, instrument:"slap_bass_1"},
    {id:"real:gm:synth_bass_1", name:"Sample Synth Bass", group:"bass", sample:true, instrument:"synth_bass_1"},
    {id:"real:chipsfx:gem_1.wav", name:"CC0 Gem SFX", group:"fx", sampleUrl:"https://raw.githubusercontent.com/subsoap/chip-sounds/master/chip-sounds/gem_1.wav", root:72, gain:.9, color:"#00e0a4"},
    {id:"real:chipsfx:bonus_1.wav", name:"CC0 Bonus SFX", group:"fx", sampleUrl:"https://raw.githubusercontent.com/subsoap/chip-sounds/master/chip-sounds/bonus_1.wav", root:72, gain:.86, color:"#ffcf5a"},
    {id:"real:chipsfx:pew.wav", name:"CC0 Pew Shot", group:"fx", sampleUrl:"https://raw.githubusercontent.com/subsoap/chip-sounds/master/chip-sounds/pew.wav", root:72, gain:.78, color:"#ff4778"}
  ];
  const DRUM_KITS = [
    {id:"real:drum:LM-2", name:"Sample Linn LM-2", instrument:"LM-2"},
    {id:"real:drum:TR-808", name:"Sample TR-808", instrument:"TR-808"},
    {id:"real:drum:Casio-RZ1", name:"Sample Casio RZ-1", instrument:"Casio-RZ1"},
    {id:"real:drum:MFB-512", name:"Sample MFB-512", instrument:"MFB-512"}
  ];
  function readSettings(){
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE_KEY) || "{}")); }
    catch { return Object.assign({}, DEFAULTS); }
  }
  const settings = readSettings();
  if (!INSTRUMENTS.some(x=>x.id === settings.keys && x.group === "keys")) settings.keys = DEFAULTS.keys;
  if (!INSTRUMENTS.some(x=>x.id === settings.bass && x.group === "bass")) settings.bass = DEFAULTS.bass;
  if (!DRUM_KITS.some(x=>x.id === settings.drums)) settings.drums = DEFAULTS.drums;
  function saveSettings(){ try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch {} }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function midiHz(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  function pc(v){ return ((Math.round(v) % 12) + 12) % 12; }
  function noteName(m){ return NOTE_NAMES[pc(m)] + Math.floor(m / 12 - 1); }
  function getInst(id){ return INSTRUMENTS.find(x=>x.id === id) || INSTRUMENTS[0]; }
  function nearestRoot(midi, roots){
    const list = Array.isArray(roots) && roots.length ? roots : [60];
    return list.reduce((best, r)=> Math.abs(r - midi) < Math.abs(best - midi) ? r : best, list[0]);
  }
  function waveSample(kind, phase, spec, t, freq){
    const twoPi = Math.PI * 2;
    if (kind === "fm") return Math.sin(phase + (spec.modIndex || 1.5) * Math.sin(phase * (spec.fmRatio || 2)));
    if (kind === "triangle") return 2 * Math.asin(Math.sin(phase)) / Math.PI;
    if (kind === "saw") return 2 * (phase / twoPi - Math.floor(phase / twoPi + 0.5));
    if (kind === "pulse") return (Math.sin(phase) >= (2 * (spec.duty || .5) - 1)) ? 1 : -1;
    if (kind === "organ") return Math.sin(phase) * .65 + Math.sin(phase * 2) * .22 + Math.sin(phase * 3) * .13;
    if (kind === "noise") return Math.random() * 2 - 1;
    return Math.sin(phase);
  }
  function envelope(t, duration, spec){
    if (spec.pad){
      const a = .09, r = .42;
      if (t < a) return t / a;
      if (t > duration - r) return Math.max(0, (duration - t) / r);
      return .78;
    }
    if (spec.pluck){
      return Math.pow(Math.max(0, 1 - t / duration), 2.25);
    }
    const a = .012, d = .18, s = .42, r = .24;
    if (t < a) return t / a;
    if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
    if (t > duration - r) return s * Math.max(0, (duration - t) / r);
    return s;
  }
  const Engine = {
    ctx:null, master:null, buffers:new Map(), urlBuffers:new Map(), active:new Map(), sampleInstruments:new Map(), sampleRuntimePromise:null, hostAudio:null, status:null,
    ensure(){
      if (this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC({ latencyHint:"interactive" });
      this.master = this.ctx.createGain();
      this.master.gain.value = settings.enabled ? Number(settings.mix || .8) : 0;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .12;
      this.master.connect(comp); comp.connect(this.ctx.destination);
      return this.ctx;
    },
    async resume(){
      const c = this.ensure();
      if (c.state === "suspended") c.resume().catch(()=>{});
      return c;
    },
    updateMix(){ if (this.master) this.master.gain.value = settings.enabled ? clamp(Number(settings.mix)||.82, 0, 1.25) : 0; },
    setStatus(text){ if (typeof this.status === "function") this.status(text); },
    sampleRuntime(){
      if (!this.sampleRuntimePromise){
        this.setStatus("Loading FretStep sample library…");
        this.sampleRuntimePromise = import("https://unpkg.com/smplr@1.0.0/dist/index.mjs").catch((err)=>{
          this.sampleRuntimePromise = null;
          throw err;
        });
      }
      return this.sampleRuntimePromise;
    },
    sampleProgress(label){
      return ({loaded,total}={})=>{
        if (Number.isFinite(total) && total > 0) this.setStatus(`${label} · ${loaded || 0}/${total}`);
      };
    },
    sampleInstrument(id, type="voice"){
      const key = `${type}:${id}`;
      if (this.sampleInstruments.has(key)) return this.sampleInstruments.get(key);
      const promise = (async()=>{
        const c = this.ensure();
        const runtime = await this.sampleRuntime();
        const destination = this.master;
        let instance;
        if (type === "drum"){
          const kit = DRUM_KITS.find(x=>x.id === id) || DRUM_KITS[0];
          this.setStatus(`Loading ${kit.name}…`);
          instance = runtime.DrumMachine(c, { destination, instrument:kit.instrument, volume:100, onLoadProgress:this.sampleProgress(kit.name) });
        } else {
          const voice = getInst(id);
          this.setStatus(`Loading ${voice.name}…`);
          instance = runtime.Soundfont(c, { destination, kit:"FluidR3_GM", instrument:voice.instrument, volume:100, onLoadProgress:this.sampleProgress(voice.name) });
        }
        await instance.ready;
        this.setStatus(`${type === "drum" ? (DRUM_KITS.find(x=>x.id === id)?.name || "Drums") : getInst(id).name} ready`);
        return instance;
      })().catch((err)=>{
        this.sampleInstruments.delete(key);
        throw err;
      });
      this.sampleInstruments.set(key, promise);
      return promise;
    },
    async playSampleVoice(id, midi, vel=.75, t0, dur=.55){
      const target = this.sourceTime(t0);
      try{
        await this.resume();
        const instance = await this.sampleInstrument(id, "voice");
        const time = Math.max(this.ctx.currentTime + .006, target);
        instance.start({ note:midi, time, duration:Math.max(.08, Number(dur)||.55), velocity:Math.round(clamp(Number(vel)||.75,.05,1)*127) });
      }catch(err){
        this.setStatus("Sample unavailable · using lightweight fallback");
        const fallback = getInst(id).group === "bass" ? "real:chip:gb_bass" : "real:chip:fm_keys";
        this.playInstrument(fallback, midi, vel, t0, dur);
      }
    },
    drumGroupName(kind, instance){
      const preferred = {
        kick:["Kick","Bass Drum"], snare:["Snare"], clap:["Clap","Snare"], hat:["Hi-Hat Closed","Hihat Closed","Closed Hat","hihat-close","hihat","hat"],
        ride:["Ride","Cymbal"], crash:["Crash","Cymbal"], tom:["Tom Mid","Mid Tom","Tom"]
      }[kind] || [kind];
      const groups = typeof instance?.getGroupNames === "function" ? instance.getGroupNames() : [];
      const norm = value=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const mapped = groups.map(raw=>({raw,key:norm(raw)}));
      for (const name of preferred){ const match = mapped.find(item=>item.key === norm(name)); if (match) return match.raw; }
      for (const name of preferred){ const key = norm(name); const match = mapped.find(item=>item.key.includes(key) || key.includes(item.key)); if (match) return match.raw; }
      return preferred[0];
    },
    async playSampleDrum(kind, vel=.8, t0){
      const target = this.sourceTime(t0);
      try{
        await this.resume();
        const instance = await this.sampleInstrument(settings.drums, "drum");
        instance.start({ note:this.drumGroupName(kind, instance), time:Math.max(this.ctx.currentTime + .006, target), velocity:Math.round(clamp(Number(vel)||.8,.05,1)*127) });
      }catch(err){
        this.setStatus("Drum samples unavailable · using lightweight fallback");
        const buf = this.drumBuffer(kind, "fallback");
        this.playBuffer(buf, 60, 60, vel, t0, buf.duration, {gainScale:1});
      }
    },
    sourceTime(t0){
      const c = this.ensure();
      let hostNow = c.currentTime;
      try { if (this.hostAudio && typeof this.hostAudio.now === "function") hostNow = this.hostAudio.now(); } catch {}
      return c.currentTime + Math.max(0, (Number.isFinite(t0) ? t0 : hostNow) - hostNow);
    },
    renderedBuffer(inst, root){
      const c = this.ensure();
      const key = `${inst.id}:${root}:${c.sampleRate}`;
      if (this.buffers.has(key)) return this.buffers.get(key);
      const duration = clamp(Number(inst.duration) || 1.1, .16, 3.2);
      const len = Math.max(1, Math.ceil(duration * c.sampleRate));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      let phase = 0;
      const baseFreq = midiHz(root);
      for (let i=0;i<len;i++){
        const t = i / c.sampleRate;
        const glide = inst.pitchEnd ? (1 + (inst.pitchEnd - 1) * Math.pow(Math.max(0, 1 - t / Math.min(duration, .4)), 2)) : 1;
        const f = baseFreq * glide;
        phase += 2 * Math.PI * f / c.sampleRate;
        let v = waveSample(inst.wave || "sine", phase, inst, t, f);
        if (inst.wave === "saw") v = v * .7 + Math.sin(phase) * .18;
        if (inst.noise) v += (Math.random() * 2 - 1) * inst.noise;
        v *= envelope(t, duration, inst);
        if (inst.lowpass){
          const prev = i ? data[i-1] : 0;
          v = prev + (v - prev) * clamp(inst.lowpass, .08, .9);
        }
        if (inst.bitDepth && inst.bitDepth < 12){
          const steps = Math.pow(2, inst.bitDepth);
          v = Math.round(v * steps) / steps;
        }
        data[i] = clamp(v * (inst.gain || .75), -1, 1);
      }
      this.buffers.set(key, buf);
      return buf;
    },
    async urlBuffer(inst){
      const c = this.ensure();
      if (this.urlBuffers.has(inst.sampleUrl)) return this.urlBuffers.get(inst.sampleUrl);
      const res = await fetch(inst.sampleUrl, { cache:"force-cache" });
      if (!res.ok) throw new Error("sample fetch failed");
      const arr = await res.arrayBuffer();
      const buf = await c.decodeAudioData(arr);
      this.urlBuffers.set(inst.sampleUrl, buf);
      return buf;
    },
    playBuffer(buf, midi, root, vel, t0, dur, inst){
      const c = this.ensure();
      const src = c.createBufferSource();
      const g = c.createGain();
      src.buffer = buf;
      src.playbackRate.value = Math.pow(2, (midi - root) / 12);
      const start = this.sourceTime(t0);
      const gain = clamp((Number(vel) || .7) * (inst.gainScale || 1), .02, 1.5);
      g.gain.setValueAtTime(gain, start);
      const requestedDur = Number.isFinite(dur) ? Math.max(.05, dur) : Math.min(1.4, buf.duration);
      const stopAt = start + Math.min(Math.max(requestedDur + .18, .08), 4.0);
      src.connect(g); g.connect(this.master);
      try { src.start(start); src.stop(stopAt); } catch {}
      return { src, gain:g, stopAt };
    },
    playInstrument(id, midi, vel=.75, t0, dur=.55){
      if (!settings.enabled || !Number.isFinite(midi)) return;
      this.ensure(); this.updateMix();
      const inst = getInst(id);
      if (inst.sample) return this.playSampleVoice(id, midi, vel, t0, dur);
      if (inst.sampleUrl){
        if (this.urlBuffers.has(inst.sampleUrl)){
          return this.playBuffer(this.urlBuffers.get(inst.sampleUrl), midi, inst.root || 72, vel, t0, dur, inst);
        }
        this.urlBuffer(inst).then(buf=>this.playBuffer(buf, midi, inst.root || 72, vel, t0, dur, inst)).catch(()=>{
          const fallback = getInst("real:chip:tiny_bell");
          const root = nearestRoot(midi, fallback.roots);
          this.playBuffer(this.renderedBuffer(fallback, root), midi, root, vel, t0, dur, fallback);
        });
        return;
      }
      const root = nearestRoot(midi, inst.roots);
      return this.playBuffer(this.renderedBuffer(inst, root), midi, root, vel, t0, dur, inst);
    },
    noteOn(id, midi, vel=.75){
      if (!Number.isFinite(midi)) return;
      if (getInst(id).sample){ this.playInstrument(id, midi, vel, undefined, 6); return; }
      const handle = this.playInstrument(id, midi, vel, undefined, 3.5);
      if (!handle) return;
      const stack = this.active.get(midi) || [];
      stack.push(handle); this.active.set(midi, stack);
    },
    noteOff(midi){
      const stack = this.active.get(midi); if (!stack || !stack.length) return;
      const h = stack.pop(); if (!stack.length) this.active.delete(midi);
      const c = this.ensure(); const t = c.currentTime;
      try { h.gain.gain.cancelScheduledValues(t); h.gain.gain.setValueAtTime(Math.max(.0001, h.gain.gain.value || .0001), t); h.gain.gain.exponentialRampToValueAtTime(.0001, t + .08); h.src.stop(t + .1); } catch {}
    },
    drumBuffer(kind, kitId){
      const c = this.ensure(); const key = `drum:${kitId}:${kind}:${c.sampleRate}`;
      if (this.buffers.has(key)) return this.buffers.get(key);
      const tight = kitId.indexOf("tight") >= 0, lofi = kitId.indexOf("lofi") >= 0;
      const dur = kind === "ride" || kind === "crash" ? .72 : kind === "hat" ? .16 : .36;
      const len = Math.ceil(dur * c.sampleRate); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
      for (let i=0;i<len;i++){
        const t = i / c.sampleRate, x = t / dur;
        let v = 0;
        if (kind === "kick"){
          const f = 120 * Math.pow(45/120, Math.min(1, t/.16));
          v = Math.sin(2*Math.PI*f*t) * Math.pow(1-x, tight?4:3);
        } else if (kind === "snare" || kind === "clap"){
          v = (Math.random()*2-1) * Math.pow(1-x, kind === "clap" ? 2.5 : 2.0) + Math.sin(2*Math.PI*185*t)*.18*Math.pow(1-x,3);
        } else if (kind === "tom"){
          const f = 170 * Math.pow(90/170, Math.min(1, t/.22));
          v = Math.sin(2*Math.PI*f*t) * Math.pow(1-x, 2.5);
        } else {
          v = (Math.random()*2-1) * Math.pow(1-x, kind === "hat" ? 4.8 : 1.8);
        }
        if (lofi) v = Math.round(v * 18) / 18;
        d[i] = clamp(v * (kind === "kick" ? .95 : .65), -1, 1);
      }
      this.buffers.set(key, buf); return buf;
    },
    playDrum(kind, vel=.8, t0){
      return this.playSampleDrum(kind, vel, t0);
    },
    stopAll(){
      this.active.forEach((stack, midi)=>stack.forEach(()=>this.noteOff(midi)));
      this.active.clear();
      this.sampleInstruments.forEach(promise=>Promise.resolve(promise).then(instance=>{ try { if (typeof instance.stop === "function") instance.stop(); } catch {} }).catch(()=>{}));
    },
    async preload(){
      this.ensure();
      const tasks = [];
      [settings.keys, settings.bass].forEach(id=>{ const inst=getInst(id); if (inst.sample) tasks.push(this.sampleInstrument(id, "voice")); else (inst.roots||[60]).forEach(r=>this.renderedBuffer(inst,r)); });
      tasks.push(this.sampleInstrument(settings.drums, "drum"));
      const urls = INSTRUMENTS.filter(x=>x.sampleUrl);
      tasks.push(...urls.map(x=>this.urlBuffer(x)));
      const results = await Promise.allSettled(tasks);
      if (results.some(result=>result.status === "rejected")) throw new Error("Some samples could not be loaded");
    }
  };
  function enabledFor(role){ return !!settings.enabled && (settings.route === "all" || settings.route === role); }
  function chordMidis(ch, style){
    try { if (typeof chordVoicingMidi === "function") return chordVoicingMidi(ch, style || "closed"); } catch {}
    const root = Number.isFinite(ch && ch.root) ? ch.root : 0;
    let tones = [0,4,7];
    try { if (typeof chordTonesPCs === "function") tones = chordTonesPCs(ch).map(p=>pc(p-root)); } catch {}
    return tones.map(t=>48 + pc(root) + t).sort((a,b)=>a-b);
  }
  function bassMidi(rootPc){ let m = 36 + pc(rootPc || 0); while (m > 52) m -= 12; return m; }
  function drumKindFromMidi(midi){
    const m = Math.round(midi);
    if ([35,36].includes(m)) return "kick";
    if ([37,38,39,40].includes(m)) return m === 39 ? "clap" : "snare";
    if ([41,43,45,47,48,50].includes(m)) return "tom";
    if ([42,44,46].includes(m)) return "hat";
    if ([49,52,55,57].includes(m)) return "crash";
    if ([51,53,59].includes(m)) return "ride";
    return "snare";
  }
  function patchAudioKit(){
    const AudioKit = window.FakebotAudioKit;
    if (!AudioKit || AudioKit.__fakebot2SamplesPatched) return false;
    Engine.hostAudio = AudioKit;
    const original = {
      playChord:AudioKit.playChord && AudioKit.playChord.bind(AudioKit),
      playNote:AudioKit.playNote && AudioKit.playNote.bind(AudioKit),
      noteOn:AudioKit.noteOn && AudioKit.noteOn.bind(AudioKit),
      noteOff:AudioKit.noteOff && AudioKit.noteOff.bind(AudioKit),
      playMidiNote:AudioKit.playMidiNote && AudioKit.playMidiNote.bind(AudioKit),
      playBass:AudioKit.playBass && AudioKit.playBass.bind(AudioKit),
      playDrumHit:AudioKit.playDrumHit && AudioKit.playDrumHit.bind(AudioKit),
      hardStop:AudioKit.hardStop && AudioKit.hardStop.bind(AudioKit),
      resume:AudioKit.resume && AudioKit.resume.bind(AudioKit),
      setMasterVolume:AudioKit.setMasterVolume && AudioKit.setMasterVolume.bind(AudioKit)
    };
    AudioKit.playChord = function(ch, preset, t0, dur, vel=.7){
      if (enabledFor("keys")) { chordMidis(ch, "closed").forEach((m,i)=>Engine.playInstrument(settings.keys, m, vel * (i ? .82 : .92), t0, dur)); return; }
      return original.playChord && original.playChord(ch, preset, t0, dur, vel);
    };
    AudioKit.playNote = function(midi, preset, t0, dur, vel=.7){
      if (enabledFor("keys")) return Engine.playInstrument(settings.keys, midi, vel, t0, dur);
      return original.playNote && original.playNote(midi, preset, t0, dur, vel);
    };
    AudioKit.noteOn = function(midi, preset, vel=.7){
      if (enabledFor("keys")) return Engine.noteOn(settings.keys, midi, vel);
      return original.noteOn && original.noteOn(midi, preset, vel);
    };
    AudioKit.noteOff = function(midi){
      Engine.noteOff(midi);
      return original.noteOff && original.noteOff(midi);
    };
    AudioKit.playMidiNote = function(midi, channel, t0, dur, vel=.7){
      const ch = Number.isFinite(channel) ? Math.round(channel) : 0;
      if (ch === 9 && enabledFor("drums")) return Engine.playDrum(drumKindFromMidi(midi), vel, t0);
      if (ch === 1 && enabledFor("bass")) return Engine.playInstrument(settings.bass, midi, vel, t0, dur);
      if (enabledFor("keys")) return Engine.playInstrument(settings.keys, midi, vel, t0, dur);
      return original.playMidiNote && original.playMidiNote(midi, channel, t0, dur, vel);
    };
    AudioKit.playBass = function(rootPc, preset, t0, dur, vel=.8){
      if (enabledFor("bass")) return Engine.playInstrument(settings.bass, bassMidi(rootPc), vel, t0, dur);
      return original.playBass && original.playBass(rootPc, preset, t0, dur, vel);
    };
    AudioKit.playDrumHit = function(kind, preset, t0, vel=.8){
      if (enabledFor("drums")) return Engine.playDrum(kind || "snare", vel, t0);
      return original.playDrumHit && original.playDrumHit(kind, preset, t0, vel);
    };
    AudioKit.hardStop = function(){ Engine.stopAll(); return original.hardStop && original.hardStop(); };
    AudioKit.resume = async function(){ const r = original.resume ? await original.resume() : undefined; await Engine.resume(); return r; };
    AudioKit.setMasterVolume = function(v){ const r = original.setMasterVolume ? original.setMasterVolume(v) : v; Engine.updateMix(); return r; };
    AudioKit.__fakebot2SamplesPatched = { original, Engine, settings };
    return true;
  }
  function optionList(items, selected){ return items.map(x=>`<option value="${x.id}"${x.id===selected?" selected":""}>${x.name}</option>`).join(""); }
  function addPanel(){
    if (document.getElementById("fakebot2SamplePanel")) return;
    const css = document.createElement("style");
    css.textContent = `
      #fakebot2SamplePanel{position:fixed;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));z-index:99999;width:min(360px,calc(100vw - 16px));border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(8,11,18,.92);color:#e9eef6;box-shadow:0 16px 34px rgba(0,0,0,.42);backdrop-filter:blur(12px);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;overflow:hidden}
      #fakebot2SamplePanel summary{cursor:pointer;list-style:none;padding:9px 11px;font-size:12px;font-weight:950;color:#00e0a4;display:flex;align-items:center;justify-content:space-between;gap:10px}#fakebot2SamplePanel summary::-webkit-details-marker{display:none}
      #fakebot2SamplePanel .fb2Body{display:grid;gap:7px;padding:0 10px 10px}#fakebot2SamplePanel label{display:grid;gap:3px;font-size:9px;font-weight:900;text-transform:uppercase;color:#9aa6b2}#fakebot2SamplePanel select,#fakebot2SamplePanel input[type=range]{width:100%;min-width:0}#fakebot2SamplePanel select{height:30px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:#151b27;color:#e9eef6;font-size:11px;font-weight:800}#fakebot2SamplePanel .row{display:grid;grid-template-columns:1fr 1fr;gap:7px}#fakebot2SamplePanel .check{display:flex;align-items:center;gap:8px;color:#e9eef6;text-transform:none;font-size:12px}#fakebot2SamplePanel button{min-height:30px;border-radius:9px;border:1px solid rgba(0,224,164,.34);background:rgba(0,224,164,.12);color:#e9eef6;font-weight:900}#fakebot2SampleStatus{font-size:10px;color:#9aa6b2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;
    document.head.appendChild(css);
    const panel = document.createElement("details");
    panel.id = "fakebot2SamplePanel";
    panel.innerHTML = `<summary><span>🎛 FretStep samples</span><span id="fakebot2SampleBadge">on</span></summary>
      <div class="fb2Body">
        <label class="check"><input id="fb2SampleEnabled" type="checkbox"> use sample engine</label>
        <div class="row"><label>keys/chords<select id="fb2KeysInst">${optionList(INSTRUMENTS.filter(x=>x.group==="keys"||x.group==="fx"), settings.keys)}</select></label><label>bass<select id="fb2BassInst">${optionList(INSTRUMENTS.filter(x=>x.group==="bass"), settings.bass)}</select></label></div>
        <div class="row"><label>drums<select id="fb2DrumKit">${optionList(DRUM_KITS, settings.drums)}</select></label><label>route<select id="fb2Route"><option value="all">all tracks</option><option value="keys">keys only</option><option value="bass">bass only</option><option value="drums">drums only</option></select></label></div>
        <label>sample mix <input id="fb2Mix" type="range" min="0" max="1.25" step="0.01"></label>
        <button id="fb2Preload" type="button">load selected sounds</button><div id="fakebot2SampleStatus">Real FretStep samples are ready to load.</div>
      </div>`;
    document.body.appendChild(panel);
    const enabled = document.getElementById("fb2SampleEnabled"), keys = document.getElementById("fb2KeysInst"), bass = document.getElementById("fb2BassInst"), drums = document.getElementById("fb2DrumKit"), route = document.getElementById("fb2Route"), mix = document.getElementById("fb2Mix"), status = document.getElementById("fakebot2SampleStatus"), badge = document.getElementById("fakebot2SampleBadge");
    enabled.checked = !!settings.enabled; route.value = settings.route; mix.value = settings.mix;
    Engine.status = text=>{ status.textContent = text; };
    function sync(){ badge.textContent = settings.enabled ? "on" : "off"; badge.style.color = settings.enabled ? "#00e0a4" : "#9aa6b2"; Engine.updateMix(); saveSettings(); }
    enabled.onchange = ()=>{ settings.enabled = enabled.checked; sync(); status.textContent = settings.enabled ? "FretStep sample playback on." : "Sample engine bypassed; original Fakebot audio restored."; };
    keys.onchange = ()=>{ settings.keys = keys.value; sync(); status.textContent = `Keys: ${getInst(settings.keys).name}`; };
    bass.onchange = ()=>{ settings.bass = bass.value; sync(); status.textContent = `Bass: ${getInst(settings.bass).name}`; };
    drums.onchange = ()=>{ settings.drums = drums.value; sync(); status.textContent = `Drums: ${DRUM_KITS.find(x=>x.id===settings.drums)?.name || settings.drums}`; };
    route.onchange = ()=>{ settings.route = route.value; sync(); status.textContent = `Routing samples to ${settings.route}.`; };
    mix.oninput = ()=>{ settings.mix = Number(mix.value); sync(); };
    document.getElementById("fb2Preload").onclick = async ()=>{
      status.textContent = "Loading selected FretStep samples…";
      try{ await Engine.resume(); await Engine.preload(); status.textContent = "Selected keys, bass, and drums are ready."; }
      catch(err){ status.textContent = "Samples could not load. Lightweight fallback remains available."; }
    };
    sync();
  }
  function boot(attempt=0){
    if (patchAudioKit()){ addPanel(); return; }
    if (attempt < 80) setTimeout(()=>boot(attempt+1), 125);
  }
  boot();
})();
