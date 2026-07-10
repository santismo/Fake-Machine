(() => {
  "use strict";
  const VERSION = "20260710j";
  const frame = document.getElementById("miniFrame");
  const loading = document.getElementById("miniLoading");
  const audioStatus = document.getElementById("miniAudioStatus");
  const playButton = document.getElementById("miniPlay");
  let loadingTimer = 0;
  let bootedDocument = null;

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
    playButton.textContent = playing ? "Pause" : "Play";
  }

  function watchPlayback(){
    const source = frameDocument()?.getElementById("btnPlay");
    if (!source) return;
    syncPlayLabel();
    new MutationObserver(syncPlayLabel).observe(source, {childList:true,subtree:true,characterData:true});
  }

  async function bootFrame(){
    const doc = frameDocument();
    if (!doc || doc === bootedDocument) return;
    bootedDocument = doc;
    showStatus("Building Fakebot Mini…", 1800);
    try{
      injectStyle(doc, "fakebotMiniFrameStyle", "mini-frame.css");
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
      try{
        if (!win.FakebotMiniSamples) throw new Error("Sample backend is not ready");
        showStatus("Preparing selected samples…", 2400);
        await win.FakebotMiniSamples.ready();
        doc.getElementById("btnPlay")?.click();
        window.setTimeout(syncPlayLabel, 40);
      }catch{
        showStatus("Samples unavailable. Open Settings to retry.", 3400);
      }
    }
  }

  document.addEventListener("click", (event)=>{
    const button = event.target.closest("[data-mini-action]");
    if (!button) return;
    event.preventDefault();
    runAction(button.dataset.miniAction);
  });

  window.addEventListener("message", (event)=>{
    if (event.source !== frameWindow() || !event.data || event.data.source !== "fakebot-mini") return;
    if (event.data.type === "audio-status" && audioStatus){
      audioStatus.textContent = event.data.message;
      audioStatus.dataset.state = event.data.state || "loading";
    }
    if (event.data.type === "ui-ready") showStatus("Fakebot Mini ready", 1000);
  });

  frame?.addEventListener("load", bootFrame);
  if (frameDocument()?.readyState === "complete") bootFrame();
})();
