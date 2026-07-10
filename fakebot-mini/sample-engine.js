(() => {
  "use strict";
  const VERSION = "1.3.0";
  const STORE_KEY = "fakebot-mini.samples.v1";
  const MODULE_URL = "https://unpkg.com/smplr@1.0.0/dist/index.mjs";

  const VOICES = [
    {id:"acoustic_grand_piano",label:"Grand Piano",role:"keys",group:"Pianos & keys"},
    {id:"bright_acoustic_piano",label:"Bright Piano",role:"keys",group:"Pianos & keys"},
    {id:"electric_grand_piano",label:"Electric Grand",role:"keys",group:"Pianos & keys"},
    {id:"honkytonk_piano",label:"Honky-tonk Piano",role:"keys",group:"Pianos & keys"},
    {id:"electric_piano_1",label:"Electric Piano 1",role:"keys",group:"Pianos & keys"},
    {id:"electric_piano_2",label:"Electric Piano 2",role:"keys",group:"Pianos & keys"},
    {id:"harpsichord",label:"Harpsichord",role:"keys",group:"Pianos & keys"},
    {id:"clavinet",label:"Clavinet",role:"keys",group:"Pianos & keys"},
    {id:"celesta",label:"Celesta",role:"keys",group:"Pianos & keys"},
    {id:"music_box",label:"Music Box",role:"keys",group:"Pianos & keys"},
    {id:"ep:CP80",instrument:"CP80",engine:"ep",label:"CP-80 Electric Grand",role:"keys",group:"Pianos & keys"},
    {id:"ep:WurlitzerEP200",instrument:"WurlitzerEP200",engine:"ep",label:"Wurlitzer EP200",role:"keys",group:"Pianos & keys"},
    {id:"ep:PianetT",instrument:"PianetT",engine:"ep",label:"Pianet T",role:"keys",group:"Pianos & keys"},
    {id:"ep:TX81Z",instrument:"TX81Z",engine:"ep",label:"TX81Z FM Piano",role:"keys",group:"Pianos & keys"},

    {id:"glockenspiel",label:"Glockenspiel",role:"keys",group:"Mallets & bells"},
    {id:"vibraphone",label:"Vibraphone",role:"keys",group:"Mallets & bells"},
    {id:"marimba",label:"Marimba",role:"keys",group:"Mallets & bells"},
    {id:"xylophone",label:"Xylophone",role:"keys",group:"Mallets & bells"},
    {id:"tubular_bells",label:"Tubular Bells",role:"keys",group:"Mallets & bells"},
    {id:"dulcimer",label:"Dulcimer",role:"keys",group:"Mallets & bells"},
    {id:"steel_drums",label:"Steel Drums",role:"keys",group:"Mallets & bells"},
    {id:"kalimba",label:"Kalimba",role:"keys",group:"Mallets & bells"},
    {id:"mallet:Balafon - Hard Mallet",instrument:"Balafon - Hard Mallet",engine:"mallet",label:"Balafon",role:"keys",group:"Mallets & bells"},
    {id:"mallet:Vibraphone - Soft Mallets",instrument:"Vibraphone - Soft Mallets",engine:"mallet",label:"Soft Vibraphone",role:"keys",group:"Mallets & bells"},
    {id:"mallet:Xylophone - Medium Mallets",instrument:"Xylophone - Medium Mallets",engine:"mallet",label:"Medium Xylophone",role:"keys",group:"Mallets & bells"},

    {id:"drawbar_organ",label:"Drawbar Organ",role:"keys",group:"Organs"},
    {id:"percussive_organ",label:"Percussive Organ",role:"keys",group:"Organs"},
    {id:"rock_organ",label:"Rock Organ",role:"keys",group:"Organs"},
    {id:"church_organ",label:"Church Organ",role:"keys",group:"Organs"},
    {id:"reed_organ",label:"Reed Organ",role:"keys",group:"Organs"},
    {id:"accordion",label:"Accordion",role:"keys",group:"Organs"},

    {id:"acoustic_guitar_nylon",label:"Nylon Guitar",role:"keys",group:"Guitars & strings"},
    {id:"acoustic_guitar_steel",label:"Steel Guitar",role:"keys",group:"Guitars & strings"},
    {id:"electric_guitar_jazz",label:"Jazz Guitar",role:"keys",group:"Guitars & strings"},
    {id:"electric_guitar_clean",label:"Clean Guitar",role:"keys",group:"Guitars & strings"},
    {id:"electric_guitar_muted",label:"Muted Guitar",role:"keys",group:"Guitars & strings"},
    {id:"banjo",label:"Banjo",role:"keys",group:"Guitars & strings"},
    {id:"orchestral_harp",label:"Orchestral Harp",role:"keys",group:"Guitars & strings"},
    {id:"violin",label:"Violin",role:"keys",group:"Guitars & strings"},
    {id:"cello",label:"Cello",role:"keys",group:"Guitars & strings"},
    {id:"string_ensemble_1",label:"String Ensemble 1",role:"keys",group:"Guitars & strings"},
    {id:"string_ensemble_2",label:"String Ensemble 2",role:"keys",group:"Guitars & strings"},
    {id:"pizzicato_strings",label:"Pizzicato Strings",role:"keys",group:"Guitars & strings"},

    {id:"choir_aahs",label:"Choir Aahs",role:"keys",group:"Winds & voices"},
    {id:"voice_oohs",label:"Voice Oohs",role:"keys",group:"Winds & voices"},
    {id:"trumpet",label:"Trumpet",role:"keys",group:"Winds & voices"},
    {id:"french_horn",label:"French Horn",role:"keys",group:"Winds & voices"},
    {id:"flute",label:"Flute",role:"keys",group:"Winds & voices"},
    {id:"clarinet",label:"Clarinet",role:"keys",group:"Winds & voices"},
    {id:"alto_sax",label:"Alto Sax",role:"keys",group:"Winds & voices"},

    {id:"synth_strings_1",label:"Synth Strings",role:"keys",group:"Pads & color"},
    {id:"pad_1_new_age",label:"New Age Pad",role:"keys",group:"Pads & color"},
    {id:"pad_2_warm",label:"Warm Pad",role:"keys",group:"Pads & color"},
    {id:"pad_3_polysynth",label:"Poly Synth Pad",role:"keys",group:"Pads & color"},
    {id:"pad_7_halo",label:"Halo Pad",role:"keys",group:"Pads & color"},
    {id:"fx_3_crystal",label:"Crystal",role:"keys",group:"Pads & color"},
    {id:"mellotron:MIXED STRGS",instrument:"MIXED STRGS",engine:"mellotron",label:"Mellotron Strings",role:"keys",group:"Tape sounds"},
    {id:"mellotron:8VOICE CHOIR",instrument:"8VOICE CHOIR",engine:"mellotron",label:"Mellotron Choir",role:"keys",group:"Tape sounds"},
    {id:"mellotron:TRON FLUTE",instrument:"TRON FLUTE",engine:"mellotron",label:"Mellotron Flute",role:"keys",group:"Tape sounds"},
    {id:"mellotron:MKII ORGAN",instrument:"MKII ORGAN",engine:"mellotron",label:"Mellotron Organ",role:"keys",group:"Tape sounds"},
    {id:"mellotron:MKII VIBES",instrument:"MKII VIBES",engine:"mellotron",label:"Mellotron Vibes",role:"keys",group:"Tape sounds"},

    {id:"electric_bass_finger",label:"Finger Bass",role:"bass",group:"Basses"},
    {id:"electric_bass_pick",label:"Pick Bass",role:"bass",group:"Basses"},
    {id:"acoustic_bass",label:"Acoustic Bass",role:"bass",group:"Basses"},
    {id:"fretless_bass",label:"Fretless Bass",role:"bass",group:"Basses"},
    {id:"slap_bass_1",label:"Slap Bass 1",role:"bass",group:"Basses"},
    {id:"slap_bass_2",label:"Slap Bass 2",role:"bass",group:"Basses"},
    {id:"synth_bass_1",label:"Synth Bass 1",role:"bass",group:"Basses"},
    {id:"synth_bass_2",label:"Synth Bass 2",role:"bass",group:"Basses"},
    {id:"smolken:Arco",instrument:"Arco",engine:"smolken",label:"Smolken Arco Bass",role:"bass",group:"Basses"},
    {id:"smolken:Pizzicato",instrument:"Pizzicato",engine:"smolken",label:"Smolken Pizzicato Bass",role:"bass",group:"Basses"},
    {id:"smolken:Switched",instrument:"Switched",engine:"smolken",label:"Smolken Switched Bass",role:"bass",group:"Basses"}
  ];
  const DRUMS = [
    {id:"LM-2",label:"Linn LM-2",group:"Classic kits"},
    {id:"TR-808",label:"TR-808",group:"Classic kits"},
    {id:"Casio-RZ1",label:"Casio RZ-1",group:"Classic kits"},
    {id:"MFB-512",label:"MFB-512",group:"Classic kits"},
    {id:"Roland CR-8000",label:"Roland CR-8000",group:"Classic kits"},
    {id:"abuse:roland-tr-606",instrument:"roland-tr-606",engine:"abuse",label:"Roland TR-606",group:"More drum machines"},
    {id:"abuse:roland-tr-707",instrument:"roland-tr-707",engine:"abuse",label:"Roland TR-707",group:"More drum machines"},
    {id:"abuse:roland-tr-808",instrument:"roland-tr-808",engine:"abuse",label:"Roland TR-808 Extended",group:"More drum machines"},
    {id:"abuse:roland-tr-909",instrument:"roland-tr-909",engine:"abuse",label:"Roland TR-909",group:"More drum machines"},
    {id:"abuse:roland-cr-78",instrument:"roland-cr-78",engine:"abuse",label:"Roland CR-78",group:"More drum machines"},
    {id:"abuse:linn-lm-1",instrument:"linn-lm-1",engine:"abuse",label:"Linn LM-1",group:"More drum machines"},
    {id:"abuse:linn-9000",instrument:"linn-9000",engine:"abuse",label:"Linn 9000",group:"More drum machines"},
    {id:"abuse:oberheim-dmx",instrument:"oberheim-dmx",engine:"abuse",label:"Oberheim DMX",group:"More drum machines"},
    {id:"abuse:emu-sp-12",instrument:"emu-sp-12",engine:"abuse",label:"E-mu SP-12",group:"More drum machines"},
    {id:"abuse:boss-dr-110",instrument:"boss-dr-110",engine:"abuse",label:"Boss DR-110",group:"More drum machines"},
    {id:"abuse:yamaha-rx-5",instrument:"yamaha-rx-5",engine:"abuse",label:"Yamaha RX-5",group:"More drum machines"},
    {id:"abuse:simmons-sds-5",instrument:"simmons-sds-5",engine:"abuse",label:"Simmons SDS-5",group:"More drum machines"}
  ];
  const DEFAULTS = {keys:"electric_piano_1",bass:"electric_bass_finger",drums:"LM-2",mix:.9,muteMelody:false,muteSolo:false};
  const wait = (milliseconds)=>new Promise(resolve=>window.setTimeout(resolve,milliseconds));

  function readSettings(){
    try{ return {...DEFAULTS,...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")}; }
    catch{ return {...DEFAULTS}; }
  }
  const settings = readSettings();
  if (!VOICES.some(item=>item.role === "keys" && item.id === settings.keys)) settings.keys = DEFAULTS.keys;
  if (!VOICES.some(item=>item.role === "bass" && item.id === settings.bass)) settings.bass = DEFAULTS.bass;
  if (!DRUMS.some(item=>item.id === settings.drums)) settings.drums = DEFAULTS.drums;
  settings.muteMelody = settings.muteMelody === true;
  settings.muteSolo = settings.muteSolo === true;
  const clamp = (value,min,max)=>Math.max(min,Math.min(max,value));
  const saveSettings = ()=>{ try{ localStorage.setItem(STORE_KEY, JSON.stringify(settings)); }catch{} };

  const Engine = {
    core:null,
    host:null,
    context:null,
    input:null,
    runtimePromise:null,
    storage:null,
    instruments:new Map(),
    holds:new Map(),
    statusElement:null,
    preparePromise:null,
    randomizePromise:null,
    midiPlaybackActive:false,
    trackAvailability:{melody:false,solo:false},
    midiScheduleEpoch:0,
    midiScheduledStops:new Set(),

    cancelMidiSchedules(){
      this.midiScheduleEpoch += 1;
      this.midiScheduledStops.forEach((stop)=>{ try{ stop(); }catch{} });
      this.midiScheduledStops.clear();
      return this.midiScheduleEpoch;
    },

    isCurrentMidiSchedule(epoch){
      return Number.isFinite(epoch)
        && this.midiPlaybackActive
        && epoch === this.midiScheduleEpoch;
    },

    trackMidiSchedule(stop,epoch){
      if (typeof stop !== "function") return;
      if (!this.isCurrentMidiSchedule(epoch)){
        try{ stop(); }catch{}
        return;
      }
      this.midiScheduledStops.add(stop);
    },

    setMidiPlaybackActive(active){
      const next = active === true;
      this.midiPlaybackActive = false;
      this.cancelMidiSchedules();
      this.midiPlaybackActive = next;
      return this.midiPlaybackActive;
    },

    updateTrackMuteControls(){
      [["melody","miniMuteMelody"],["solo","miniMuteSolo"]].forEach(([role,id])=>{
        const button = document.getElementById(id);
        if (!button) return;
        const available = this.trackAvailability[role] === true;
        const muted = settings[role === "melody" ? "muteMelody" : "muteSolo"] === true;
        button.disabled = !available;
        button.classList.toggle("isMuted", available && muted);
        button.setAttribute("aria-pressed", String(available && muted));
        button.textContent = available
          ? (muted ? `Unmute ${role}` : `Mute ${role}`)
          : `${role === "melody" ? "Melody" : "Solo"}: no track`;
      });
    },

    setTrackAvailability(availability={}){
      this.trackAvailability = {
        melody:availability.melody === true,
        solo:availability.solo === true
      };
      this.updateTrackMuteControls();
      return {...this.trackAvailability};
    },

    toggleTrackMute(role){
      if (role !== "melody" && role !== "solo") return false;
      const key = role === "melody" ? "muteMelody" : "muteSolo";
      settings[key] = !settings[key];
      saveSettings();
      this.updateTrackMuteControls();
      window.dispatchEvent(new CustomEvent("fakebot-midi-track-mute",{detail:{role,muted:settings[key]}}));
      return settings[key];
    },

    report(message,state="loading"){
      if (this.statusElement){
        this.statusElement.textContent = message;
        this.statusElement.dataset.state = state;
      }
      window.parent.postMessage({source:"fakebot-mini",type:"audio-status",message,state}, "*");
    },

    initialize(){
      this.core = window.FakebotCore;
      this.host = this.core?.audio;
      if (!this.host || typeof this.host.createExternalInput !== "function") throw new Error("Fakebot sample input is unavailable");
      const external = this.host.createExternalInput();
      this.context = external.context;
      this.input = external.input;
      this.input.gain.value = clamp(Number(settings.mix)||.9,0,1.1);
      const voicingProbe = this.core.chordVoicingForPreset({
        root:0,symbol:"maj7",family:"maj",intervals:[0,4,7,11],scaleRoot:0
      },"ep");
      if (!Array.isArray(voicingProbe) || !voicingProbe.length) throw new Error("Fakebot chord voicing bridge is unavailable");
    },

    async runtime(){
      if (!this.runtimePromise){
        this.report("Loading sample library…");
        this.runtimePromise = import(MODULE_URL).then((runtime)=>{
          try{ this.storage = runtime.CacheStorage("fretstep-sample-cache-v1"); }
          catch{ this.storage = undefined; }
          return runtime;
        }).catch((error)=>{
          this.runtimePromise = null;
          throw error;
        });
      }
      return this.runtimePromise;
    },

    instrumentKey(role,id){ return `${role}:${id}`; },

    async load(role,id){
      const key = this.instrumentKey(role,id);
      if (this.instruments.has(key)) return this.instruments.get(key);
      const promise = (async()=>{
        const runtime = await this.runtime();
        const definition = role === "drums"
          ? DRUMS.find(item=>item.id === id)
          : VOICES.find(item=>item.role === role && item.id === id);
        if (!definition) throw new Error(`Unknown ${role} sample`);
        const label = definition.label;
        this.report(`Loading ${label}…`);
        const common = {
          destination:this.input,
          storage:this.storage,
          volume:100,
          onLoadProgress:({loaded,total}={})=>{
            if (Number.isFinite(total) && total > 0) this.report(`${label} ${loaded || 0}/${total}`);
          }
        };
        let instance;
        if (role === "drums"){
          instance = definition.engine === "abuse"
            ? runtime.DrumAbuse(this.context,{...common,source:{kind:"machine",machine:definition.instrument}})
            : runtime.DrumMachine(this.context,{...common,instrument:definition.instrument || definition.id});
        }else if (definition.engine === "ep"){
          instance = runtime.ElectricPiano(this.context,{...common,instrument:definition.instrument,formats:["ogg","m4a"]});
        }else if (definition.engine === "mallet"){
          instance = runtime.Mallet(this.context,{...common,instrument:definition.instrument});
        }else if (definition.engine === "mellotron"){
          instance = runtime.Mellotron(this.context,{...common,instrument:definition.instrument});
        }else if (definition.engine === "smolken"){
          instance = runtime.Smolken(this.context,{...common,instrument:definition.instrument});
        }else{
          instance = runtime.Soundfont(this.context,{...common,kit:"FluidR3_GM",instrument:definition.instrument || definition.id});
        }
        await instance.ready;
        return instance;
      })().catch((error)=>{
        this.instruments.delete(key);
        throw error;
      });
      this.instruments.set(key,promise);
      return promise;
    },

    async prepare(){
      if (this.preparePromise) return this.preparePromise;
      this.preparePromise = (async()=>{
        const results = await Promise.allSettled([
          this.load("keys",settings.keys),
          this.load("bass",settings.bass),
          this.load("drums",settings.drums)
        ]);
        if (results[0].status === "rejected") throw results[0].reason;
        this.report(
          results.slice(1).some(result=>result.status === "rejected")
            ? "Keys ready · some rhythm samples unavailable"
            : "Samples ready",
          "ready"
        );
      })().catch((error)=>{
        this.preparePromise = null;
        this.report("Samples unavailable — tap Retry","error");
        throw error;
      });
      return this.preparePromise;
    },

    async resume(){
      if (this.context.state !== "running"){
        const attempt = Promise.resolve(this.context.resume()).catch(()=>{});
        await Promise.race([attempt,wait(900)]);
      }
      if (this.context.state !== "running") throw new Error("Audio is waiting for a user gesture");
    },

    async play(role,midi,time,duration,velocity,midiEpoch=null){
      try{
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        const id = settings[role];
        const instance = await this.load(role,id);
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        const stop = instance.start({
          note:Math.round(midi),
          time:Math.max(this.context.currentTime+.006,Number(time)||this.context.currentTime+.006),
          duration:Math.max(.06,Number(duration)||.5),
          velocity:Math.round(clamp(Number(velocity)||.75,.04,1)*127)
        });
        if (midiEpoch !== null) this.trackMidiSchedule(stop,midiEpoch);
      }catch{
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        this.report("Samples unavailable — playback is silent","error");
      }
    },

    async noteOn(midi,velocity=.75){
      const key = Math.round(midi);
      const token = {cancelled:false,stop:null};
      const stack = this.holds.get(key) || [];
      stack.push(token);
      this.holds.set(key,stack);
      try{
        const instance = await this.load("keys",settings.keys);
        if (token.cancelled) return;
        token.stop = instance.start({note:key,time:this.context.currentTime+.006,velocity:Math.round(clamp(Number(velocity)||.75,.04,1)*127)});
      }catch{
        this.report("Samples unavailable — playback is silent","error");
      }
    },

    noteOff(midi){
      const key = Math.round(midi);
      const stack = this.holds.get(key);
      if (!stack?.length) return;
      const token = stack.pop();
      token.cancelled = true;
      if (!stack.length) this.holds.delete(key);
      try{ if (typeof token.stop === "function") token.stop(); }catch{}
    },

    drumName(kind,instance){
      const preferred = {
        kick:["Kick","Bass Drum"],snare:["Snare"],clap:["Clap","Snare"],hat:["Hi-Hat Closed","Hihat Closed","Closed Hat","hhclosed","hihat-close","hihat","hat"],
        ride:["Ride","Cymbal"],crash:["Crash","Cymbal"],tom:["Tom Mid","Mid Tom","Tom"]
      }[kind] || [kind];
      const groups = typeof instance?.getGroupNames === "function" ? instance.getGroupNames() : [];
      const normalize = (value)=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
      const mapped = groups.map(raw=>({raw,key:normalize(raw)}));
      for (const name of preferred){ const match = mapped.find(item=>item.key === normalize(name)); if (match) return match.raw; }
      for (const name of preferred){ const key = normalize(name); const match = mapped.find(item=>item.key.includes(key)||key.includes(item.key)); if (match) return match.raw; }
      return ({kick:36,snare:38,clap:39,hat:42,ride:51,crash:49,tom:45})[kind] || 38;
    },

    async drum(kind,time,velocity,midiEpoch=null){
      try{
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        const instance = await this.load("drums",settings.drums);
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        const stop = instance.start({
          note:this.drumName(kind,instance),
          time:Math.max(this.context.currentTime+.006,Number(time)||this.context.currentTime+.006),
          velocity:Math.round(clamp(Number(velocity)||.8,.04,1)*127)
        });
        if (midiEpoch !== null) this.trackMidiSchedule(stop,midiEpoch);
      }catch{
        if (midiEpoch !== null && !this.isCurrentMidiSchedule(midiEpoch)) return;
        this.report("Drum samples unavailable — playback is silent","error");
      }
    },

    stopAll(){
      this.cancelMidiSchedules();
      this.holds.forEach((stack)=>stack.forEach((token)=>{ token.cancelled=true; try{ if (typeof token.stop === "function") token.stop(); }catch{} }));
      this.holds.clear();
      this.instruments.forEach((promise)=>Promise.resolve(promise).then((instance)=>{ try{ instance.stop?.(); }catch{} }).catch(()=>{}));
    },

    cleanupUnused(){
      const keep = new Set([
        this.instrumentKey("keys",settings.keys),
        this.instrumentKey("bass",settings.bass),
        this.instrumentKey("drums",settings.drums)
      ]);
      this.instruments.forEach((promise,key)=>{
        if (keep.has(key)) return;
        this.instruments.delete(key);
        Promise.resolve(promise).then((instance)=>{
          try{ instance.stop?.(); instance.dispose?.(); }catch{}
        }).catch(()=>{});
      });
    },

    async select(role,id){
      const previous = settings[role];
      settings[role] = id;
      saveSettings();
      this.preparePromise = null;
      try{
        await this.load(role,id);
        const oldKey = this.instrumentKey(role,previous);
        if (previous !== id && this.instruments.has(oldKey)){
          const old = this.instruments.get(oldKey);
          this.instruments.delete(oldKey);
          Promise.resolve(old).then((instance)=>{ try{ instance.stop?.(); instance.dispose?.(); }catch{} }).catch(()=>{});
        }
        this.report(`${role === "drums" ? "Drums" : role === "bass" ? "Bass" : "Keys"} ready`,"ready");
      }catch{
        settings[role] = previous;
        saveSettings();
        const select = document.getElementById(`miniSample${role === "keys" ? "Keys" : role === "bass" ? "Bass" : "Drums"}`);
        if (select) select.value = previous;
        this.report("Selected samples could not load","error");
        throw new Error("sample load failed");
      }
    },

    async randomizeSounds(){
      if (this.randomizePromise) return this.randomizePromise;
      const randomButton = document.getElementById("miniSampleRandom");
      if (randomButton) randomButton.disabled = true;
      this.randomizePromise = (async()=>{
      const previous = {keys:settings.keys,bass:settings.bass,drums:settings.drums};
      const pickDifferent = (items,current)=>{
        const choices = items.filter(item=>item.id !== current);
        return (choices[Math.floor(Math.random()*choices.length)] || items[0]).id;
      };
      settings.keys = pickDifferent(VOICES.filter(item=>item.role === "keys"),settings.keys);
      settings.bass = pickDifferent(VOICES.filter(item=>item.role === "bass"),settings.bass);
      settings.drums = pickDifferent(DRUMS,settings.drums);
      saveSettings();
      const values = {miniSampleKeys:settings.keys,miniSampleBass:settings.bass,miniSampleDrums:settings.drums};
      Object.entries(values).forEach(([id,value])=>{ const select = document.getElementById(id); if (select) select.value = value; });
      this.stopAll();
      this.preparePromise = null;
      this.report("Loading a new sound set…");
      try{
        await Promise.all([
          this.load("keys",settings.keys),
          this.load("bass",settings.bass),
          this.load("drums",settings.drums)
        ]);
        this.cleanupUnused();
        this.preparePromise = Promise.resolve();
        this.report("New sounds ready","ready");
      }catch(error){
        Object.assign(settings,previous);
        saveSettings();
        const restored = {miniSampleKeys:settings.keys,miniSampleBass:settings.bass,miniSampleDrums:settings.drums};
        Object.entries(restored).forEach(([id,value])=>{ const select = document.getElementById(id); if (select) select.value = value; });
        this.preparePromise = null;
        this.cleanupUnused();
        this.report("Could not load that sound set — previous sounds restored","error");
        throw error;
      }
      })();
      try{ return await this.randomizePromise; }
      finally{
        this.randomizePromise = null;
        if (randomButton) randomButton.disabled = false;
      }
    }
  };

  function bassMidi(rootPitchClass){
    let midi = 36 + ((Math.round(rootPitchClass)%12)+12)%12;
    while (midi > 52) midi -= 12;
    return midi;
  }

  function drumKindFromMidi(midi){
    const note = Math.round(midi);
    if ([35,36].includes(note)) return "kick";
    if ([37,38,39,40].includes(note)) return note === 39 ? "clap" : "snare";
    if ([41,43,45,47,48,50].includes(note)) return "tom";
    if ([42,44,46].includes(note)) return "hat";
    if ([49,52,55,57].includes(note)) return "crash";
    if ([51,53,59].includes(note)) return "ride";
    return "snare";
  }

  function patchAudio(){
    const audio = Engine.host;
    if (audio.__fakebotMiniSamples) return;
    const original = {
      resume:audio.resume.bind(audio),
      hardStop:audio.hardStop.bind(audio),
      setMasterVolume:audio.setMasterVolume.bind(audio)
    };
    audio.playChord = (ch,preset,time,duration,velocity=.7)=>{
      const notes = Engine.core.chordVoicingForPreset(ch,preset);
      notes.forEach((midi,index)=>Engine.play("keys",midi,time,duration,velocity*(index ? .84 : .94)));
    };
    audio.playNote = (midi,preset,time,duration,velocity=.7)=>Engine.play("keys",midi,time,duration,velocity);
    audio.noteOn = (midi,preset,velocity=.7)=>Engine.noteOn(midi,velocity);
    audio.noteOff = (midi)=>Engine.noteOff(midi);
    audio.playMidiNote = (midi,channel,time,duration,velocity=.7,roleHint="")=>{
      const resolved = Number.isFinite(channel) ? Math.round(channel) : 0;
      if (Engine.midiPlaybackActive){
        if (roleHint === "melody" && settings.muteMelody) return;
        if (roleHint === "solo" && settings.muteSolo) return;
        const midiEpoch = Engine.midiScheduleEpoch;
        if (resolved === 9 || roleHint === "drums") return Engine.drum(drumKindFromMidi(midi),time,velocity,midiEpoch);
        if (roleHint === "bass") return Engine.play("bass",midi,time,duration,velocity,midiEpoch);
        return Engine.play("keys",midi,time,duration,velocity,midiEpoch);
      }
      if (resolved === 9) return Engine.drum(drumKindFromMidi(midi),time,velocity);
      if (resolved === 1) return Engine.play("bass",midi,time,duration,velocity);
      return Engine.play("keys",midi,time,duration,velocity);
    };
    audio.playBass = (rootPitchClass,preset,time,duration,velocity=.8)=>Engine.play("bass",bassMidi(rootPitchClass),time,duration,velocity);
    audio.playDrumHit = (kind,preset,time,velocity=.8)=>Engine.drum(kind||"snare",time,velocity);
    audio.resume = async()=>{
      original.resume().catch(()=>{});
      if (Engine.context.state !== "running") Engine.context.resume().catch(()=>{});
      Engine.prepare().catch(()=>{});
    };
    audio.hardStop = ()=>{ Engine.stopAll(); original.hardStop(); };
    audio.setMasterVolume = (value)=>original.setMasterVolume(value);
    audio.__fakebotMiniSamples = Object.freeze({version:VERSION,engine:Engine});
  }

  function escapeMarkup(value){
    return String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  }

  function options(items,selected){
    const groups = new Map();
    items.forEach((item)=>{
      const group = item.group || "Samples";
      if (!groups.has(group)) groups.set(group,[]);
      groups.get(group).push(item);
    });
    return [...groups.entries()].map(([group,entries])=>{
      const choices = entries.map((item)=>`<option value="${escapeMarkup(item.id)}"${item.id===selected?" selected":""}>${escapeMarkup(item.label)}</option>`).join("");
      return `<optgroup label="${escapeMarkup(group)}">${choices}</optgroup>`;
    }).join("");
  }

  function mountControls(){
    const mount = document.getElementById("miniSampleSettings");
    if (!mount){ window.setTimeout(mountControls,100); return; }
    if (mount.dataset.ready) return;
    mount.dataset.ready = "true";
    mount.innerHTML = `<div class="miniSoundGrid">
      <label>Keys, chords &amp; MIDI<select id="miniSampleKeys">${options(VOICES.filter(item=>item.role==="keys"),settings.keys)}</select></label>
      <label>Bass<select id="miniSampleBass">${options(VOICES.filter(item=>item.role==="bass"),settings.bass)}</select></label>
      <label>Drums<select id="miniSampleDrums">${options(DRUMS,settings.drums)}</select></label>
      <div class="miniTrackMutes" role="group" aria-label="MIDI lead track sound"><button id="miniMuteMelody" type="button" aria-pressed="false">Melody: no track</button><button id="miniMuteSolo" type="button" aria-pressed="false">Solo: no track</button></div>
      <div class="miniSampleActions"><label>Sample mix<input id="miniSampleMix" type="range" min="0" max="1.1" step="0.01" value="${settings.mix}"></label><button id="miniSampleRandom" type="button">Randomize sounds</button><button id="miniSampleRetry" type="button">Retry</button></div>
      <div class="miniSampleStatus" id="miniSampleStatus">Preparing selected samples…</div>
    </div>`;
    Engine.statusElement = document.getElementById("miniSampleStatus");
    document.getElementById("miniSampleKeys").addEventListener("change",(event)=>Engine.select("keys",event.target.value).catch(()=>{}));
    document.getElementById("miniSampleBass").addEventListener("change",(event)=>Engine.select("bass",event.target.value).catch(()=>{}));
    document.getElementById("miniSampleDrums").addEventListener("change",(event)=>Engine.select("drums",event.target.value).catch(()=>{}));
    document.getElementById("miniMuteMelody").addEventListener("click",()=>Engine.toggleTrackMute("melody"));
    document.getElementById("miniMuteSolo").addEventListener("click",()=>Engine.toggleTrackMute("solo"));
    document.getElementById("miniSampleMix").addEventListener("input",(event)=>{
      settings.mix = clamp(Number(event.target.value)||0,0,1.1);
      Engine.input.gain.setTargetAtTime(settings.mix,Engine.context.currentTime,.012);
      saveSettings();
    });
    document.getElementById("miniSampleRandom").addEventListener("click",()=>Engine.randomizeSounds().catch(()=>{}));
    document.getElementById("miniSampleRetry").addEventListener("click",()=>{
      Engine.preparePromise = null;
      Engine.prepare().catch(()=>{});
    });
    const sheet = document.getElementById("sheet");
    Engine.setTrackAvailability({
      melody:Number(sheet?.dataset?.midiMelodyNotes || 0) > 0,
      solo:Number(sheet?.dataset?.midiSoloNotes || 0) > 0
    });
    Engine.prepare().catch(()=>{});
  }

  function boot(){
    try{
      Engine.initialize();
      patchAudio();
      mountControls();
      window.FakebotMiniSamples = Object.freeze({
        version:VERSION,
        ready:async()=>{ await Engine.resume(); await Engine.prepare(); },
        randomize:()=>Engine.randomizeSounds(),
        stop:()=>Engine.stopAll(),
        setMidiPlaybackActive:(active)=>Engine.setMidiPlaybackActive(active),
        setTrackAvailability:(availability)=>Engine.setTrackAvailability(availability)
      });
    }catch(error){
      Engine.report("Samples unavailable — playback is silent","error");
      console.error(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
