(() => {
  "use strict";
  const VERSION = "1.0.0";
  const STORE_KEY = "fakebot-mini.samples.v1";
  const MODULE_URL = "https://unpkg.com/smplr@1.0.0/dist/index.mjs";

  const VOICES = [
    {id:"electric_piano_1",label:"Electric Piano",role:"keys"},
    {id:"acoustic_grand_piano",label:"Grand Piano",role:"keys"},
    {id:"music_box",label:"Music Box",role:"keys"},
    {id:"vibraphone",label:"Vibraphone",role:"keys"},
    {id:"marimba",label:"Marimba",role:"keys"},
    {id:"acoustic_guitar_steel",label:"Steel Guitar",role:"keys"},
    {id:"drawbar_organ",label:"Drawbar Organ",role:"keys"},
    {id:"string_ensemble_1",label:"String Ensemble",role:"keys"},
    {id:"fx_3_crystal",label:"Crystal",role:"keys"},
    {id:"electric_bass_finger",label:"Finger Bass",role:"bass"},
    {id:"acoustic_bass",label:"Acoustic Bass",role:"bass"},
    {id:"fretless_bass",label:"Fretless Bass",role:"bass"},
    {id:"slap_bass_1",label:"Slap Bass",role:"bass"},
    {id:"synth_bass_1",label:"Sampled Synth Bass",role:"bass"}
  ];
  const DRUMS = [
    {id:"LM-2",label:"Linn LM-2"},
    {id:"TR-808",label:"TR-808"},
    {id:"Casio-RZ1",label:"Casio RZ-1"},
    {id:"MFB-512",label:"MFB-512"},
    {id:"Roland CR-8000",label:"Roland CR-8000"}
  ];
  const DEFAULTS = {keys:"electric_piano_1",bass:"electric_bass_finger",drums:"LM-2",mix:.9};

  function readSettings(){
    try{ return {...DEFAULTS,...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")}; }
    catch{ return {...DEFAULTS}; }
  }
  const settings = readSettings();
  if (!VOICES.some(item=>item.role === "keys" && item.id === settings.keys)) settings.keys = DEFAULTS.keys;
  if (!VOICES.some(item=>item.role === "bass" && item.id === settings.bass)) settings.bass = DEFAULTS.bass;
  if (!DRUMS.some(item=>item.id === settings.drums)) settings.drums = DEFAULTS.drums;
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
        const label = role === "drums"
          ? (DRUMS.find(item=>item.id === id)?.label || id)
          : (VOICES.find(item=>item.id === id)?.label || id);
        this.report(`Loading ${label}…`);
        const common = {
          destination:this.input,
          storage:this.storage,
          volume:100,
          onLoadProgress:({loaded,total}={})=>{
            if (Number.isFinite(total) && total > 0) this.report(`${label} ${loaded || 0}/${total}`);
          }
        };
        const instance = role === "drums"
          ? runtime.DrumMachine(this.context,{...common,instrument:id})
          : runtime.Soundfont(this.context,{...common,kit:"FluidR3_GM",instrument:id});
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
        await this.load("keys",settings.keys);
        await this.load("bass",settings.bass);
        await this.load("drums",settings.drums);
        this.report("Samples ready","ready");
      })().catch((error)=>{
        this.preparePromise = null;
        this.report("Samples unavailable — tap Retry","error");
        throw error;
      });
      return this.preparePromise;
    },

    async resume(){
      this.host.resume().catch(()=>{});
      if (this.context.state === "suspended") this.context.resume().catch(()=>{});
    },

    async play(role,midi,time,duration,velocity){
      try{
        const id = settings[role];
        const instance = await this.load(role,id);
        instance.start({
          note:Math.round(midi),
          time:Math.max(this.context.currentTime+.006,Number(time)||this.context.currentTime+.006),
          duration:Math.max(.06,Number(duration)||.5),
          velocity:Math.round(clamp(Number(velocity)||.75,.04,1)*127)
        });
      }catch{
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
        kick:["Kick","Bass Drum"],snare:["Snare"],clap:["Clap","Snare"],hat:["Hi-Hat Closed","Hihat Closed","Closed Hat","hihat-close","hihat","hat"],
        ride:["Ride","Cymbal"],crash:["Crash","Cymbal"],tom:["Tom Mid","Mid Tom","Tom"]
      }[kind] || [kind];
      const groups = typeof instance?.getGroupNames === "function" ? instance.getGroupNames() : [];
      const normalize = (value)=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
      const mapped = groups.map(raw=>({raw,key:normalize(raw)}));
      for (const name of preferred){ const match = mapped.find(item=>item.key === normalize(name)); if (match) return match.raw; }
      for (const name of preferred){ const key = normalize(name); const match = mapped.find(item=>item.key.includes(key)||key.includes(item.key)); if (match) return match.raw; }
      return preferred[0];
    },

    async drum(kind,time,velocity){
      try{
        const instance = await this.load("drums",settings.drums);
        instance.start({
          note:this.drumName(kind,instance),
          time:Math.max(this.context.currentTime+.006,Number(time)||this.context.currentTime+.006),
          velocity:Math.round(clamp(Number(velocity)||.8,.04,1)*127)
        });
      }catch{
        this.report("Drum samples unavailable — playback is silent","error");
      }
    },

    stopAll(){
      this.holds.forEach((stack)=>stack.forEach((token)=>{ token.cancelled=true; try{ if (typeof token.stop === "function") token.stop(); }catch{} }));
      this.holds.clear();
      this.instruments.forEach((promise)=>Promise.resolve(promise).then((instance)=>{ try{ instance.stop?.(); }catch{} }).catch(()=>{}));
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
        this.report("Selected samples could not load","error");
        throw new Error("sample load failed");
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
    audio.playMidiNote = (midi,channel,time,duration,velocity=.7)=>{
      const resolved = Number.isFinite(channel) ? Math.round(channel) : 0;
      if (resolved === 9) return Engine.drum(drumKindFromMidi(midi),time,velocity);
      if (resolved === 1) return Engine.play("bass",midi,time,duration,velocity);
      return Engine.play("keys",midi,time,duration,velocity);
    };
    audio.playBass = (rootPitchClass,preset,time,duration,velocity=.8)=>Engine.play("bass",bassMidi(rootPitchClass),time,duration,velocity);
    audio.playDrumHit = (kind,preset,time,velocity=.8)=>Engine.drum(kind||"snare",time,velocity);
    audio.resume = async()=>{
      original.resume().catch(()=>{});
      if (Engine.context.state === "suspended") Engine.context.resume().catch(()=>{});
      Engine.prepare().catch(()=>{});
    };
    audio.hardStop = ()=>{ Engine.stopAll(); original.hardStop(); };
    audio.setMasterVolume = (value)=>original.setMasterVolume(value);
    audio.__fakebotMiniSamples = Object.freeze({version:VERSION,engine:Engine});
  }

  function options(items,selected){
    return items.map((item)=>`<option value="${item.id}"${item.id===selected?" selected":""}>${item.label}</option>`).join("");
  }

  function mountControls(){
    const mount = document.getElementById("miniSampleSettings");
    if (!mount){ window.setTimeout(mountControls,100); return; }
    if (mount.dataset.ready) return;
    mount.dataset.ready = "true";
    mount.innerHTML = `<div class="miniSoundGrid">
      <label>Keys and chords<select id="miniSampleKeys">${options(VOICES.filter(item=>item.role==="keys"),settings.keys)}</select></label>
      <label>Bass<select id="miniSampleBass">${options(VOICES.filter(item=>item.role==="bass"),settings.bass)}</select></label>
      <label>Drums<select id="miniSampleDrums">${options(DRUMS,settings.drums)}</select></label>
      <div class="miniSampleActions"><label>Sample mix<input id="miniSampleMix" type="range" min="0" max="1.1" step="0.01" value="${settings.mix}"></label><button id="miniSampleRetry" type="button">Retry</button></div>
      <div class="miniSampleStatus" id="miniSampleStatus">Preparing selected samples…</div>
    </div>`;
    Engine.statusElement = document.getElementById("miniSampleStatus");
    document.getElementById("miniSampleKeys").addEventListener("change",(event)=>Engine.select("keys",event.target.value).catch(()=>{}));
    document.getElementById("miniSampleBass").addEventListener("change",(event)=>Engine.select("bass",event.target.value).catch(()=>{}));
    document.getElementById("miniSampleDrums").addEventListener("change",(event)=>Engine.select("drums",event.target.value).catch(()=>{}));
    document.getElementById("miniSampleMix").addEventListener("input",(event)=>{
      settings.mix = clamp(Number(event.target.value)||0,0,1.1);
      Engine.input.gain.setTargetAtTime(settings.mix,Engine.context.currentTime,.012);
      saveSettings();
    });
    document.getElementById("miniSampleRetry").addEventListener("click",()=>{
      Engine.preparePromise = null;
      Engine.prepare().catch(()=>{});
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
        stop:()=>Engine.stopAll()
      });
    }catch(error){
      Engine.report("Samples unavailable — playback is silent","error");
      console.error(error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
