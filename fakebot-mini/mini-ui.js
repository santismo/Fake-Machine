(() => {
  "use strict";
  const UI_VERSION = "20260710o";

  const byId = (id)=>document.getElementById(id);
  const make = (tag, className, text)=>{
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  function moveIfPresent(parent, node){
    if (parent && node) parent.appendChild(node);
    return node;
  }

  function settingsSection(title, body, extraClass=""){
    const section = make("section", `miniSettingsSection ${extraClass}`.trim());
    section.append(make("h2", "", title), body);
    return section;
  }

  function hideControlFor(id){
    const target = byId(id);
    const control = target?.closest(".control,.miniCtl");
    if (control) control.classList.add("mini-hidden");
  }

  function renameControls(){
    const names = {
      btnPianoToggle:"Piano",
      btnFretToggle:"Fret",
      btnEdit:"Edit",
      btnRandomAll:"Randomize everything",
      btnStyleRand:"Randomize style",
      btnDefaults:"Reset defaults",
      btnUndo:"Undo",
      btnRedo:"Redo",
      btnCopy:"Copy progression",
      btnRandGen:"Randomize",
      btnRandTime:"Randomize",
      btnRandFeel:"Randomize",
      btnRandSounds:"Randomize",
      btnRandLimit:"Randomize",
      btnEditApply:"Apply",
      btnEditClear:"Clear",
      btnEditCancel:"Cancel"
    };
    Object.entries(names).forEach(([id,label])=>{
      const button = byId(id);
      if (!button) return;
      button.textContent = label;
      button.setAttribute("aria-label", label);
    });
    const leadTitle = byId("cardLead")?.querySelector(".cardHead .title");
    if (leadTitle) leadTitle.textContent = "Progression";
  }

  function normalizeMiniSurface(){
    const source = byId("progSourceTop");
    if (source && source.value !== "generate"){
      source.value = "generate";
      source.dispatchEvent(new Event("change", {bubbles:true}));
    }
    const markerStyle = byId("markerStyle");
    if (markerStyle && markerStyle.value !== "dots"){
      markerStyle.value = "dots";
      markerStyle.dispatchEvent(new Event("change", {bubbles:true}));
    }
    const morph = byId("morphBg");
    if (morph && morph.checked){
      morph.checked = false;
      morph.dispatchEvent(new Event("change", {bubbles:true}));
    }
    byId("btnPianoToggle")?.click();
  }

  function buildOverview(){
    const overview = make("section", "miniCard miniOverview");
    overview.append(make("p", "miniEyebrow", "Current progression"));

    const stats = make("div", "miniStats");
    moveIfPresent(stats, byId("pillLine"));
    moveIfPresent(stats, byId("focusLine")?.closest(".miniStat"));
    overview.appendChild(stats);

    const quick = make("div", "miniQuickControls");
    moveIfPresent(quick, byId("masterVolTop")?.closest(".headSlider"));
    moveIfPresent(quick, byId("masterTempoTop")?.closest(".headSlider"));
    moveIfPresent(quick, byId("btnTransposeDown")?.closest(".transposeGroup"));
    overview.appendChild(quick);
    moveIfPresent(overview, byId("msg"));
    return overview;
  }

  function buildSettings(){
    hideControlFor("biabFile");
    hideControlFor("biabStatus");

    const backdrop = make("div", "miniSettingsBackdrop");
    backdrop.setAttribute("aria-hidden", "true");

    const panel = make("aside", "");
    panel.id = "miniSettingsPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Fakebot Mini settings");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("inert", "");

    const header = make("header", "miniSettingsHeader");
    const heading = make("div");
    heading.append(make("strong", "", "Settings"), make("span", "", "Generation, modes, sound and utilities"));
    const close = make("button", "", "Done");
    close.type = "button";
    close.dataset.miniCloseSettings = "true";
    header.append(heading, close);

    const body = make("div", "miniSettingsBody");

    const soundBody = make("div", "miniSettingsSectionBody");
    const soundMount = make("div", "");
    soundMount.id = "miniSampleSettings";
    soundBody.appendChild(soundMount);
    body.appendChild(settingsSection("Sampled instruments", soundBody));

    const modeBody = make("div", "miniSettingsSectionBody miniModeGrid");
    ["progSourceTop","progExampleTop","progModeTop","exampleReharmTop","gameDiffTop"].forEach((id)=>{
      moveIfPresent(modeBody, byId(id)?.closest(".headSelect"));
    });
    body.appendChild(settingsSection("Modes", modeBody));

    const generationBody = make("div", "miniSettingsSectionBody");
    moveIfPresent(generationBody, byId("cardControls"));
    byId("cardControls")?.querySelectorAll("details.group").forEach((details)=>{ details.open = false; });
    body.appendChild(settingsSection("Generation, feel and form", generationBody));

    const limiterBody = make("div", "miniSettingsSectionBody");
    moveIfPresent(limiterBody, byId("cardLimiters"));
    byId("cardLimiters")?.querySelectorAll("details.group").forEach((details)=>{ details.open = false; });
    body.appendChild(settingsSection("Chord rules", limiterBody));

    const toolsBody = make("div", "miniSettingsSectionBody");
    const toolsGrid = make("div", "miniToolsGrid");
    ["btnRandomAll","btnStyleRand","btnDefaults","btnUndo","btnRedo","btnCopy"].forEach((id)=>moveIfPresent(toolsGrid, byId(id)));
    toolsBody.appendChild(toolsGrid);

    const complexity = byId("complexity");
    if (complexity){
      const field = make("div", "miniUtilityField");
      field.append(make("label", "", "Complexity"), complexity);
      toolsBody.appendChild(field);
    }
    moveIfPresent(toolsBody, byId("rowMidiInput"));
    body.appendChild(settingsSection("Utilities", toolsBody));

    panel.append(header, body);
    document.body.append(backdrop, panel);

    const engineControls = make("div", "mini-hidden");
    engineControls.id = "miniEngineControls";
    moveIfPresent(engineControls, byId("btnGenerate"));
    moveIfPresent(engineControls, byId("btnPlay"));
    document.body.appendChild(engineControls);

    return {panel,backdrop,close};
  }

  function buildMini(){
    if (document.getElementById("miniContent")) return;
    const app = document.querySelector(".app");
    const piano = byId("cardPiano");
    const lead = byId("cardLead");
    if (!app || !piano || !lead){ window.setTimeout(buildMini, 100); return; }

    document.documentElement.classList.add("fakebot-mini-frame");
    renameControls();
    normalizeMiniSurface();

    const content = make("main", "");
    content.id = "miniContent";
    content.append(buildOverview(), piano, lead);
    app.insertBefore(content, app.firstChild);

    const settings = buildSettings();
    const setSettingsOpen = (open)=>{
      document.body.classList.toggle("mini-settings-open", !!open);
      settings.panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) settings.panel.removeAttribute("inert");
      else settings.panel.setAttribute("inert", "");
      const content = byId("miniContent");
      if (content){
        if (open) content.setAttribute("inert", "");
        else content.removeAttribute("inert");
      }
      settings.backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) window.setTimeout(()=>settings.close.focus(), 30);
      window.parent.postMessage({source:"fakebot-mini",type:"settings-state",open:!!open}, "*");
      if (!open) window.parent.postMessage({source:"fakebot-mini",type:"settings-closed"}, "*");
    };

    settings.close.addEventListener("click", ()=>setSettingsOpen(false));
    settings.backdrop.addEventListener("click", ()=>setSettingsOpen(false));
    document.addEventListener("keydown", (event)=>{ if (event.key === "Escape") setSettingsOpen(false); });

    window.FakebotMiniUI = Object.freeze({
      version:UI_VERSION,
      openSettings:()=>setSettingsOpen(true),
      closeSettings:()=>setSettingsOpen(false),
      toggleSettings:()=>setSettingsOpen(!document.body.classList.contains("mini-settings-open"))
    });

    window.dispatchEvent(new CustomEvent("fakebot-mini-ui-ready"));
    window.parent.postMessage({source:"fakebot-mini",type:"ui-ready"}, "*");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildMini, {once:true});
  else buildMini();
})();
