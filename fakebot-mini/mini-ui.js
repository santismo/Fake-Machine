(() => {
  "use strict";
  const UI_VERSION = "20260728-playstyles";

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

  function setInputValue(input, value){
    if (!input) return;
    input.value = String(value);
    input.dispatchEvent(new Event("input", {bubbles:true}));
  }

  function makeRotaryKnob(id, symbol, label){
    const input = byId(id);
    const host = input?.closest(".headSlider");
    if (!input || !host || host.dataset.miniKnobReady) return host;
    host.dataset.miniKnobReady = "true";
    host.classList.add("miniKnobControl");
    const textLabel = host.querySelector("label");
    if (textLabel){
      textLabel.textContent = symbol;
      textLabel.title = label;
      textLabel.setAttribute("aria-label", label);
    }

    const knob = make("button", "miniKnob");
    knob.type = "button";
    knob.setAttribute("role", "slider");
    knob.setAttribute("aria-label", label);
    knob.setAttribute("aria-valuemin", input.min);
    knob.setAttribute("aria-valuemax", input.max);
    knob.title = `${label}: drag up or down`;
    const readout = make("span", "miniKnobValue");
    knob.appendChild(readout);
    const externalReadout = host.querySelector(".val");
    if (externalReadout) externalReadout.setAttribute("aria-hidden", "true");
    const sync = ()=>{
      const min = Number(input.min);
      const max = Number(input.max);
      const value = Number(input.value);
      const ratio = (value - min) / Math.max(1, max - min);
      knob.style.setProperty("--mini-knob-angle", `${-135 + ratio * 270}deg`);
      knob.setAttribute("aria-valuenow", String(value));
      knob.setAttribute("aria-valuetext", `${value}${id === "masterVolTop" ? "%" : " BPM"}`);
      readout.textContent = `${value}${id === "masterVolTop" ? "%" : ""}`;
    };
    input.classList.add("miniKnobInput");
    host.insertBefore(knob, input);
    input.addEventListener("input", sync);
    input.addEventListener("fakebot-sync", sync);
    sync();

    let startY = 0;
    let startValue = 0;
    let moved = false;
    knob.addEventListener("pointerdown", (event)=>{
      event.preventDefault();
      knob.setPointerCapture?.(event.pointerId);
      startY = event.clientY;
      startValue = Number(input.value);
      moved = false;
    });
    knob.addEventListener("pointermove", (event)=>{
      if (!knob.hasPointerCapture?.(event.pointerId)) return;
      const min = Number(input.min);
      const max = Number(input.max);
      const delta = startY - event.clientY;
      if (Math.abs(delta) > 3) moved = true;
      const travel = id === "masterTempoTop" ? 520 : 440;
      const next = Math.round(Math.max(min, Math.min(max, startValue + delta * ((max-min) / travel))));
      if (next !== Number(input.value)) setInputValue(input, next);
    });
    knob.addEventListener("pointerup", (event)=>{
      if (knob.hasPointerCapture?.(event.pointerId)) knob.releasePointerCapture?.(event.pointerId);
      if (!moved) knob.focus();
    });
    knob.addEventListener("keydown", (event)=>{
      const min = Number(input.min);
      const max = Number(input.max);
      const base = Number(input.value);
      const step = id === "masterTempoTop" ? 2 : 1;
      let next = base;
      if (event.key === "ArrowUp" || event.key === "ArrowRight") next += step;
      else if (event.key === "ArrowDown" || event.key === "ArrowLeft") next -= step;
      else if (event.key === "Home") next = min;
      else if (event.key === "End") next = max;
      else return;
      event.preventDefault();
      setInputValue(input, Math.max(min, Math.min(max, next)));
    });
    return host;
  }

  function makeQuickStyle(){
    const source = byId("genrePreset");
    const field = make("label", "miniQuickStyle");
    field.append(make("span", "", "Play style"));
    const select = document.createElement("select");
    select.id = "miniQuickStyle";
    select.setAttribute("aria-label", "Quick play style");
    const preferred = ["lofiJazz","modernJazz","bebop","jazzBallad","neoSoulJazz","bossa","funk","jazzRockFusion","ambient"];
    preferred.forEach((id)=>{
      const original = source?.querySelector(`option[value="${id}"]`);
      if (!original) return;
      const option = document.createElement("option");
      option.value = id;
      option.textContent = original.textContent;
      select.appendChild(option);
    });
    const sync = (next)=>{
      const value = next?.genrePreset || source?.value || "lofiJazz";
      if (select.querySelector(`option[value="${value}"]`)) select.value = value;
    };
    source?.addEventListener("change", ()=>sync());
    window.addEventListener("fakebot-play-style", (event)=>sync(event.detail));
    select.addEventListener("change", ()=>{
      if (!source) return;
      source.value = select.value;
      source.dispatchEvent(new Event("change", {bubbles:true}));
    });
    sync();
    field.appendChild(select);
    return field;
  }

  function makePerformanceSettings(){
    const body = make("div", "miniSettingsSectionBody miniPerformanceGrid");
    const api = ()=>window.FakebotPlayStyle;
    const current = ()=>api()?.getState?.() || {rakeAmount:72, compComplexity:58};
    const makeRange = (label, key)=>{
      const field = make("label", "miniPerformanceField");
      const heading = make("span", "", label);
      const output = make("output", "", "");
      const input = document.createElement("input");
      input.type = "range";
      input.min = "0";
      input.max = "100";
      input.step = "1";
      input.setAttribute("aria-label", label);
      const sync = (next=current())=>{
        const value = Math.round(Number(next[key]) || 0);
        input.value = String(value);
        output.textContent = String(value);
      };
      input.addEventListener("input", ()=>api()?.configure?.({[key]:Number(input.value)}));
      field.append(heading, output, input);
      sync();
      return {field,sync};
    };
    const density = makeRange("Comp density", "compComplexity");
    const rake = makeRange("Chord rake", "rakeAmount");
    const hint = make("p", "miniPerformanceHint", "Density shapes the band; rake spreads chord tones from low to high.");
    const sync = (next)=>{ density.sync(next); rake.sync(next); };
    window.addEventListener("fakebot-play-style", (event)=>sync(event.detail));
    body.append(density.field, rake.field, hint);
    return settingsSection("Performance", body);
  }

  function makeInfiniteSettings(){
    const sectionBody = make("div", "miniSettingsSectionBody miniInfiniteSettings");
    const api = ()=>window.FakebotInfinite;
    const current = ()=>api()?.getState?.() || {enabled:false,visibleChords:4,feelEvery:0,styleEvery:0};

    const toggle = make("label", "miniInfiniteToggle");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "miniInfiniteEnabled";
    const copy = make("span", "");
    copy.append(make("strong", "", "Infinite progression"), make("small", "", "Play a rolling chord queue that never ends."));
    toggle.append(checkbox, copy);

    const fields = make("div", "miniInfiniteGrid");
    const makeSelect = (label, id, choices, suffix="")=>{
      const field = make("label", "");
      field.append(make("span", "", label));
      const select = document.createElement("select");
      select.id = id;
      choices.forEach(([value,text])=>{
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = text || `${value}${suffix}`;
        select.appendChild(option);
      });
      field.appendChild(select);
      fields.appendChild(field);
      return select;
    };
    const visible = makeSelect("Visible chords", "miniInfiniteVisible", [[2,"2"],[3,"3"],[4,"4"],[5,"5"],[6,"6"],[8,"8"]]);
    const changes = [[0,"Never"],[4,"Every 4"],[8,"Every 8"],[12,"Every 12"],[16,"Every 16"],[24,"Every 24"]];
    const feel = makeSelect("Feel changes", "miniInfiniteFeel", changes);
    const style = makeSelect("Style changes", "miniInfiniteStyle", changes);
    const hint = make("p", "miniInfiniteHint", "The leftmost card plays next; each new chord enters from the right.");
    sectionBody.append(toggle, fields, hint);

    const sync = (next=current())=>{
      checkbox.checked = !!next.enabled;
      visible.value = String(next.visibleChords ?? 4);
      feel.value = String(next.feelEvery ?? 0);
      style.value = String(next.styleEvery ?? 0);
      sectionBody.classList.toggle("isEnabled", !!next.enabled);
    };
    const configure = ()=>api()?.configure?.({
      visibleChords:Number(visible.value),
      feelEvery:Number(feel.value),
      styleEvery:Number(style.value)
    });
    checkbox.addEventListener("change", ()=>api()?.setEnabled?.(checkbox.checked));
    [visible, feel, style].forEach((select)=>select.addEventListener("change", configure));
    window.addEventListener("fakebot-infinite-state", (event)=>sync(event.detail));
    sync();
    return settingsSection("Infinite loop", sectionBody);
  }

  function renameControls(){
    const names = {
      btnPianoToggle:"Piano",
      btnFretToggle:"Fret",
      btnEdit:"Edit",
      btnRandomAll:"Randomize everything",
      btnStyleRand:"Randomize style",
      btnDefaults:"Reset all",
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
    const overview = make("section", "miniCard miniOverview miniQuickOverview");

    const quick = make("div", "miniQuickControls");
    moveIfPresent(quick, makeRotaryKnob("masterVolTop", "🔊", "Master volume"));
    moveIfPresent(quick, makeRotaryKnob("masterTempoTop", "♩", "Tempo"));
    moveIfPresent(quick, byId("btnTransposeDown")?.closest(".transposeGroup"));
    overview.append(makeQuickStyle(), quick);
    moveIfPresent(overview, byId("msg"));
    return overview;
  }

  function buildSettings(){
    hideControlFor("biabFile");
    hideControlFor("biabStatus");
    byId("rowMidiInput")?.remove();

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
    const headerActions = make("div", "miniSettingsHeaderActions");
    const reset = byId("btnDefaults");
    if (reset){
      reset.setAttribute("aria-label", "Reset all settings to defaults");
      headerActions.appendChild(reset);
    }
    headerActions.appendChild(close);
    header.append(heading, headerActions);

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

    body.appendChild(makeInfiniteSettings());
    body.appendChild(makePerformanceSettings());

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
    ["btnRandomAll","btnStyleRand","btnUndo","btnRedo","btnCopy"].forEach((id)=>moveIfPresent(toolsGrid, byId(id)));
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
