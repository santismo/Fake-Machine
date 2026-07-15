(() => {
  "use strict";

  const VERSION = "1.0.0-offline";
  const STORE_KEY = "fakebot-mini-offline.audio.v1";
  const settings = readSettings();
  let midiPlaybackActive = false;
  let trackAvailability = {melody:false,solo:false};

  function readSettings(){
    try{
      return {
        muteMelody:false,
        muteSolo:false,
        ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")
      };
    }catch{
      return {muteMelody:false,muteSolo:false};
    }
  }

  function saveSettings(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(settings)); }catch{}
  }

  function report(message,state="ready"){
    const status = document.getElementById("miniOfflineStatus");
    if (status){
      status.textContent = message;
      status.dataset.state = state;
    }
    window.parent.postMessage({source:"fakebot-mini",type:"audio-status",message,state}, "*");
  }

  function drumKindFromMidi(midi){
    const note = Math.round(Number(midi) || 0);
    if ([35,36].includes(note)) return "kick";
    if ([42,44,46].includes(note)) return "hat";
    if ([49,52,55,57].includes(note)) return "crash";
    if ([51,53,59].includes(note)) return "ride";
    if ([41,43,45,47,48,50].includes(note)) return "tom";
    return "snare";
  }

  function preset(id,fallback){
    return document.getElementById(id)?.value || fallback;
  }

  function updateTrackMuteControls(){
    [["melody","miniMuteMelody"],["solo","miniMuteSolo"]].forEach(([role,id])=>{
      const button = document.getElementById(id);
      if (!button) return;
      const available = trackAvailability[role] === true;
      const key = role === "melody" ? "muteMelody" : "muteSolo";
      const muted = settings[key] === true;
      button.disabled = !available;
      button.classList.toggle("isMuted", available && muted);
      button.setAttribute("aria-pressed", String(available && muted));
      button.textContent = available
        ? (muted ? `Unmute ${role}` : `Mute ${role}`)
        : `${role === "melody" ? "Melody" : "Solo"}: no track`;
    });
  }

  function setTrackAvailability(availability={}){
    trackAvailability = {
      melody:availability.melody === true,
      solo:availability.solo === true
    };
    updateTrackMuteControls();
    return {...trackAvailability};
  }

  function toggleTrackMute(role){
    if (role !== "melody" && role !== "solo") return false;
    const key = role === "melody" ? "muteMelody" : "muteSolo";
    settings[key] = !settings[key];
    saveSettings();
    updateTrackMuteControls();
    window.dispatchEvent(new CustomEvent("fakebot-midi-track-mute",{detail:{role,muted:settings[key]}}));
    return settings[key];
  }

  function patchMidiRouting(audio){
    if (!audio || audio.__fakebotMiniOffline) return;
    const originalPlayMidiNote = audio.playMidiNote.bind(audio);
    audio.playMidiNote = (midi,channel,time,duration,velocity=.7,roleHint="")=>{
      if (midiPlaybackActive){
        if (roleHint === "melody" && settings.muteMelody) return;
        if (roleHint === "solo" && settings.muteSolo) return;
      }
      const resolvedChannel = Number.isFinite(channel) ? Math.round(channel) : 0;
      if (resolvedChannel === 9 || roleHint === "drums"){
        return audio.playDrumHit(drumKindFromMidi(midi),preset("drumsPreset","jazz"),time,velocity);
      }
      if (roleHint === "bass" || resolvedChannel === 1){
        return audio.playBass(((Math.round(midi)%12)+12)%12,preset("bassPreset","upright"),time,duration,velocity);
      }
      return originalPlayMidiNote(midi,resolvedChannel,time,duration,velocity);
    };
    audio.__fakebotMiniOffline = Object.freeze({version:VERSION});
  }

  function movePresetControl(mount,id,label){
    const select = document.getElementById(id);
    const control = select?.closest(".control");
    if (!select || !control) return;
    const controlLabel = control.querySelector(":scope > label");
    if (controlLabel) controlLabel.textContent = label;
    mount.appendChild(control);
  }

  function configureLocalMidi(){
    const library = document.getElementById("songLibraryKind");
    if (library){
      library.value = "midi";
      library.querySelectorAll('option:not([value="midi"])').forEach(option=>option.remove());
      const control = library.closest(".control");
      if (control) control.hidden = true;
    }
    const title = document.querySelector("#grpSongs .sumTitle");
    if (title) title.textContent = "Local MIDI files";
    const status = document.getElementById("songStatus");
    if (status) status.textContent = "Import .mid or .midi files stored on this iPhone.";
  }

  function mountControls(){
    const mount = document.getElementById("miniSampleSettings");
    if (!mount){ window.setTimeout(mountControls,100); return; }
    if (mount.dataset.ready) return;
    mount.dataset.ready = "true";
    mount.classList.add("miniSoundGrid");

    movePresetControl(mount,"keysPreset","Keys and chords");
    movePresetControl(mount,"bassPreset","Bass");
    movePresetControl(mount,"drumsPreset","Drums");

    const mutes = document.createElement("div");
    mutes.className = "miniTrackMutes";
    mutes.setAttribute("role","group");
    mutes.setAttribute("aria-label","Imported MIDI lead tracks");
    mutes.innerHTML = '<button id="miniMuteMelody" type="button" aria-pressed="false">Melody: no track</button><button id="miniMuteSolo" type="button" aria-pressed="false">Solo: no track</button>';

    const actions = document.createElement("div");
    actions.className = "miniSampleActions";
    actions.innerHTML = '<button id="miniOfflineRandom" type="button">Randomize sounds</button>';

    const status = document.createElement("div");
    status.className = "miniSampleStatus";
    status.id = "miniOfflineStatus";
    status.dataset.state = "ready";
    status.textContent = "Built-in synth ready — no downloads required.";

    mount.append(mutes,actions,status);
    document.getElementById("miniMuteMelody")?.addEventListener("click",()=>toggleTrackMute("melody"));
    document.getElementById("miniMuteSolo")?.addEventListener("click",()=>toggleTrackMute("solo"));
    document.getElementById("miniOfflineRandom")?.addEventListener("click",()=>{
      document.getElementById("btnRandSounds")?.click();
      report("New offline sounds selected","ready");
    });
    updateTrackMuteControls();
    configureLocalMidi();
    report("Offline synth ready","ready");
  }

  function boot(){
    const audio = window.FakebotAudioKit;
    if (!audio){ window.setTimeout(boot,100); return; }
    patchMidiRouting(audio);
    mountControls();
    window.FakebotMiniSamples = Object.freeze({
      version:VERSION,
      ready:async()=>{
        await audio.resume();
        report("Offline synth ready","ready");
      },
      randomize:()=>document.getElementById("btnRandSounds")?.click(),
      stop:()=>audio.hardStop(),
      setMidiPlaybackActive:(active)=>{ midiPlaybackActive = active === true; return midiPlaybackActive; },
      setTrackAvailability
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
