(() => {
  "use strict";
  const VERSION = "20260710z";
  const frame = document.getElementById("miniFrame");
  const loading = document.getElementById("miniLoading");
  const audioStatus = document.getElementById("miniAudioStatus");
  const playButton = document.getElementById("miniPlay");
  const settingsButton = document.getElementById("miniSettings");
  const dock = document.querySelector(".miniDock");
  const shell = document.querySelector(".miniShell");
  let loadingTimer = 0;
  let bootedDocument = null;
  let playPending = false;
  let stateSyncTimer = 0;

  function showStatus(message, hold=1400){
    if (!loading) return;
    loading.textContent = message;
    loading.classList.add("show");
    window.clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(()=>loading.classList.remove("show"), hold);
  }

  function frameDocument(){
    try{ return frame?.contentDocument || null; }
    catch{ return null; }
  }

  function frameWindow(){
    try{ return frame?.contentWindow || null; }
    catch{ return null; }
  }

  function assetUrl(path){
    return new URL(path, window.location.href).href;
  }

  function injectStyle(doc, id, path){
    if (doc.getElementById(id)) return;
    const link = doc.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${assetUrl(path)}?v=${VERSION}`;
    doc.head.appendChild(link);
  }

  function injectScript(doc, id, path){
    const existing = doc.getElementById(id);
    if (existing) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const script = doc.createElement("script");
      script.id = id;
      script.src = `${assetUrl(path)}?v=${VERSION}`;
      script.onload = ()=>resolve();
      script.onerror = ()=>reject(new Error(`Could not load ${path}`));
      doc.documentElement.appendChild(script);
    });
  }

  function syncPlayLabel(){
    const source = frameDocument()?.getElementById("btnPlay");
    if (!source || !playButton) return;
    const playing = String(source.textContent || "").includes("⏸");
    playButton.dataset.playing = String(playing);
    playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
    playButton.title = playing ? "Pause" : "Play";
  }

  function syncSettingsState(){
    if (!settingsButton) return;
    const open = frameDocument()?.body?.classList.contains("mini-settings-open") || false;
    settingsButton.setAttribute("aria-expanded", String(open));
    settingsButton.setAttribute("aria-label", open ? "Close settings" : "Open settings");
    settingsButton.title = open ? "Close settings" : "Open settings";
  }

  function watchPlayback(){
    const source = frameDocument()?.getElementById("btnPlay");
    if (!source) return;
    syncPlayLabel();
    syncSettingsState();
    window.clearInterval(stateSyncTimer);
    stateSyncTimer = window.setInterval(()=>{
      syncPlayLabel();
      syncSettingsState();
    }, 250);
  }

  async function bootFrame(){
    const doc = frameDocument();
    if (!doc || doc === bootedDocument) return;
    bootedDocument = doc;
    showStatus("Building Fakebot Mini…", 1800);
    try{
      injectStyle(doc, "fakebotMiniFrameStyle", "mini-frame.css");
      await injectScript(doc, "fakebotMiditarMidi", "miditar-midi.js");
      await injectScript(doc, "fakebotMiniUi", "mini-ui.js");
      await injectScript(doc, "fakebotMiniSamples", "sample-engine.js");
      watchPlayback();
      showStatus("Fakebot Mini ready", 1100);
    }catch(err){
      console.error(err);
      showStatus("Fakebot Mini could not finish loading", 3200);
    }
  }

  async function runAction(action){
    const doc = frameDocument();
    const win = frameWindow();
    if (!doc || !win){ showStatus("Still loading…"); return; }
    if (action === "settings"){
      win.FakebotMiniUI?.toggleSettings();
      window.setTimeout(syncSettingsState, 30);
      return;
    }
    if (action === "generate"){
      const source = doc.getElementById("progSourceTop");
      if (source && source.value !== "generate"){
        source.value = "generate";
        source.dispatchEvent(new Event("change", {bubbles:true}));
      }
      doc.getElementById("btnGenerate")?.click();
      showStatus("New progression generated", 900);
      return;
    }
    if (action === "play"){
      const innerPlay = doc.getElementById("btnPlay");
      const alreadyPlaying = String(innerPlay?.textContent || "").includes("⏸");
      if (alreadyPlaying){
        innerPlay?.click();
        window.setTimeout(syncPlayLabel, 40);
        return;
      }
      if (playPending) return;
      playPending = true;
      if (playButton){ playButton.disabled = true; playButton.dataset.loading = "true"; }
      try{
        if (!win.FakebotMiniSamples) throw new Error("Sample backend is not ready");
        showStatus("Preparing selected samples…", 2400);
        await win.FakebotMiniSamples.ready();
        innerPlay?.click();
        window.setTimeout(syncPlayLabel, 40);
      }catch(error){
        showStatus(
          String(error?.message || "").includes("user gesture")
            ? "Tap Play again to enable audio."
            : "Samples unavailable. Open Settings to retry.",
          3400
        );
      }finally{
        playPending = false;
        if (playButton){ playButton.disabled = false; playButton.dataset.loading = "false"; }
      }
    }
  }

  document.addEventListener("click", (event)=>{
    const button = event.target.closest("[data-mini-action]");
    if (!button) return;
    event.preventDefault();
    runAction(button.dataset.miniAction);
  });

  document.addEventListener("pointerdown",(event)=>{
    const button = event.target.closest("[data-mini-action='play']");
    if (!button) return;
    frameWindow()?.FakebotAudioKit?.resume?.().catch(()=>{});
  },{passive:true});

  window.addEventListener("message", (event)=>{
    if (event.source !== frameWindow() || !event.data || event.data.source !== "fakebot-mini") return;
    if (event.data.type === "audio-status" && audioStatus){
      audioStatus.textContent = event.data.message;
      audioStatus.dataset.state = event.data.state || "loading";
    }
    if (event.data.type === "ui-ready") showStatus("Fakebot Mini ready", 1000);
    if (event.data.type === "settings-state"){
      const open = !!event.data.open;
      shell?.classList.toggle("has-open-settings", open);
      if (open){ dock?.setAttribute("inert", ""); dock?.setAttribute("aria-hidden", "true"); }
      else{ dock?.removeAttribute("inert"); dock?.removeAttribute("aria-hidden"); }
    }
    if (event.data.type === "settings-closed") settingsButton?.focus();
  });

  frame?.addEventListener("load", bootFrame);
  if (frameDocument()?.readyState === "complete") bootFrame();
})();
