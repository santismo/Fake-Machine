(() => {
  "use strict";
  const VERSION = "20260709b";
  const frame = document.getElementById("fakebotFrame");
  const status = document.getElementById("frameStatus");
  let statusTimer = null;

  function setStatus(text, hold = 1500){
    if (!status) return;
    status.textContent = text;
    status.classList.add("show");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(()=>status.classList.remove("show"), hold);
  }

  function getDoc(){
    try { return frame && frame.contentDocument; }
    catch { return null; }
  }

  function frameUrl(path){
    const win = frame && frame.contentWindow;
    const base = (win && win.location && win.location.href) || "../index.html";
    return new URL(path, base).href;
  }

  function injectScript(doc, id, path){
    if (!doc || doc.getElementById(id)) return;
    const s = doc.createElement("script");
    s.id = id;
    s.src = frameUrl(`${path}?v=${VERSION}`);
    doc.documentElement.appendChild(s);
  }

  function injectAll(){
    const doc = getDoc();
    if (!doc) return false;
    injectScript(doc, "fakebot2FretStepSamples", "fakebot2/fretstep-sample-engine.js");
    injectScript(doc, "fakebot2MobileEnhancements", "fakebot2/mobile-enhancements.js");
    return true;
  }

  function withDoc(fn){
    const doc = getDoc();
    if (!doc){ setStatus("Fakebot is still loading…"); return; }
    try { fn(doc); }
    catch (err){ console.warn(err); setStatus("That control is not ready yet."); }
  }

  function clickInside(doc, id){
    const el = doc.getElementById(id);
    if (!el){ setStatus(`${id} not ready`); return; }
    el.click();
    const label = el.title || el.textContent || id;
    setStatus(label.trim().replace(/\s+/g, " ").slice(0, 60));
  }

  function scrollToInside(doc, id){
    const el = doc.getElementById(id);
    if (!el){ setStatus("Section not ready"); return; }
    el.scrollIntoView({ behavior:"smooth", block:"start" });
    setStatus(el.dataset.section ? `Jumped to ${el.dataset.section}` : "Jumped");
  }

  function setSelectInside(doc, id, value){
    const el = doc.getElementById(id);
    if (!el){ setStatus(`${id} not ready`); return; }
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles:true }));
    setStatus(value === "game" ? "Game mode selected" : "Mode changed");
  }

  function toggleSamples(doc){
    const panel = doc.getElementById("fakebot2SamplePanel");
    if (!panel){ setStatus("Sample panel is loading…"); injectAll(); return; }
    panel.open = !panel.open;
    if (panel.open) panel.scrollIntoView({ behavior:"smooth", block:"nearest" });
    setStatus(panel.open ? "FretStep sample controls open" : "FretStep sample controls closed");
  }

  function handleAction(btn){
    withDoc((doc)=>{
      if (btn.dataset.click) clickInside(doc, btn.dataset.click);
      else if (btn.dataset.section) scrollToInside(doc, btn.dataset.section);
      else if (btn.dataset.select) setSelectInside(doc, btn.dataset.select, btn.dataset.value || "");
      else if (btn.dataset.shell === "samples") toggleSamples(doc);
    });
  }

  document.addEventListener("click", (ev)=>{
    const btn = ev.target.closest("[data-click],[data-section],[data-select],[data-shell]");
    if (!btn) return;
    ev.preventDefault();
    handleAction(btn);
  });

  function onLoad(){
    setStatus("Loading Fakebot 2…", 1200);
    setTimeout(()=>{
      injectAll();
      setStatus("Fakebot 2 mobile shell ready", 1800);
    }, 90);
  }

  if (frame){
    frame.addEventListener("load", onLoad);
    setTimeout(injectAll, 500);
  }
})();
