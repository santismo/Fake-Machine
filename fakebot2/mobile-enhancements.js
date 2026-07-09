(() => {
  "use strict";
  const STYLE_ID = "fakebot2MobileEnhancementStyle";
  const BAR_ID = "fakebot2InAppJumpBar";

  function addStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.fakebot2-frame, html.fakebot2-frame body{scroll-behavior:smooth;overscroll-behavior-y:contain;}
      html.fakebot2-frame body{touch-action:pan-y manipulation;}
      html.fakebot2-frame .app{max-width:980px!important;padding:8px 8px 112px!important;}
      html.fakebot2-frame .card{border-radius:18px!important;margin-bottom:10px!important;overflow:clip;}
      html.fakebot2-frame .cardHead{padding:10px 10px!important;gap:8px!important;}
      html.fakebot2-frame .cardBody{padding:10px!important;}
      html.fakebot2-frame .btn,html.fakebot2-frame .iconBtn,html.fakebot2-frame .gearBtn,html.fakebot2-frame select,html.fakebot2-frame input[type=file],html.fakebot2-frame input[type=text]{min-height:44px!important;}
      html.fakebot2-frame .btn.tiny,html.fakebot2-frame .btn.small{min-height:40px!important;font-size:13px!important;}
      html.fakebot2-frame .btnRow{gap:7px!important;}
      html.fakebot2-frame .btnRow .btn{min-width:0!important;}
      html.fakebot2-frame .controls{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;gap:10px!important;}
      html.fakebot2-frame .control,.miniCtl{min-width:0!important;}
      html.fakebot2-frame details.group{border-radius:15px!important;overflow:hidden;}
      html.fakebot2-frame details.group>summary{min-height:48px!important;padding:10px!important;}
      html.fakebot2-frame .sumTitle{font-size:14px!important;}
      html.fakebot2-frame .sumSub,.msg,.hint{line-height:1.35!important;}
      html.fakebot2-frame #sheet{overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}
      html.fakebot2-frame #pianoSvg,html.fakebot2-frame #fretSvg{min-height:190px!important;}
      html.fakebot2-frame #pianoBox,html.fakebot2-frame #fretBox{touch-action:manipulation!important;}
      html.fakebot2-frame .songList{max-height:min(40vh,320px)!important;}
      html.fakebot2-frame .modal,.editModal{width:min(96vw,760px)!important;max-height:calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;}
      html.fakebot2-frame .modalBody,.editBody{max-height:calc(100dvh - 110px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow:auto!important;-webkit-overflow-scrolling:touch;}
      html.fakebot2-frame #fakebot2InAppJumpBar{position:sticky;top:0;z-index:9000;display:flex;gap:6px;overflow-x:auto;padding:6px 2px 8px;margin:0 0 8px;scrollbar-width:none;background:linear-gradient(180deg,rgba(11,15,20,.96),rgba(11,15,20,.72));backdrop-filter:blur(10px);}
      html.fakebot2-frame #fakebot2InAppJumpBar::-webkit-scrollbar{display:none;}
      html.fakebot2-frame #fakebot2InAppJumpBar button{flex:0 0 auto;min-height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);color:var(--pageInk,#e9eef6);font-weight:900;font-size:12px;padding:6px 10px;}
      html.fakebot2-frame #fakebot2InAppJumpBar button.primary{border-color:rgba(0,224,164,.38);background:rgba(0,224,164,.12);}
      html.fakebot2-frame #fakebot2SamplePanel{bottom:max(12px,env(safe-area-inset-bottom))!important;left:8px!important;right:8px!important;width:auto!important;max-width:520px!important;margin:auto!important;}
      @media (max-width:720px){
        html.fakebot2-frame .app{padding-left:6px!important;padding-right:6px!important;}
        html.fakebot2-frame .cardHead{position:sticky;top:0;z-index:50;background:rgba(8,11,18,.88)!important;backdrop-filter:blur(12px);}
        html.fakebot2-frame .row{gap:7px!important;}
        html.fakebot2-frame .grow{min-width:min(100%,220px)!important;}
        html.fakebot2-frame .headGrid{grid-template-columns:repeat(auto-fit,minmax(86px,1fr))!important;gap:6px!important;}
        html.fakebot2-frame .headSlider{min-width:0!important;}
        html.fakebot2-frame .miniStat{white-space:normal!important;}
        html.fakebot2-frame .sheet .bar{min-width:72px;}
        html.fakebot2-frame #pianoSvg,html.fakebot2-frame #fretSvg{min-height:210px!important;}
      }
      @media (max-width:420px){
        html.fakebot2-frame .btnRow .btn{font-size:12px!important;padding-left:6px!important;padding-right:6px!important;}
        html.fakebot2-frame .controls{grid-template-columns:1fr!important;}
        html.fakebot2-frame #fakebot2InAppJumpBar button{font-size:11px;padding-left:9px;padding-right:9px;}
      }
    `;
    document.head.appendChild(style);
  }

  function click(id){
    const el = document.getElementById(id);
    if (el) el.click();
  }

  function jump(id){
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function addJumpBar(){
    if (document.getElementById(BAR_ID)) return;
    const app = document.querySelector(".app");
    if (!app) return;
    const bar = document.createElement("nav");
    bar.id = BAR_ID;
    bar.setAttribute("aria-label", "Fakebot 2 quick navigation");
    bar.innerHTML = `
      <button class="primary" data-fb2-click="btnPlay">▶ Play</button>
      <button data-fb2-click="btnGenerate">🎰 Generate</button>
      <button data-fb2-jump="cardLead">🎼 Chart</button>
      <button data-fb2-jump="cardPiano">🎹 Keys</button>
      <button data-fb2-jump="cardControls">🎛 Controls</button>
      <button data-fb2-click="btnGear">⚙️ Settings</button>
    `;
    bar.addEventListener("click", (ev)=>{
      const btn = ev.target.closest("button");
      if (!btn) return;
      ev.preventDefault();
      if (btn.dataset.fb2Click) click(btn.dataset.fb2Click);
      if (btn.dataset.fb2Jump) jump(btn.dataset.fb2Jump);
    });
    app.insertBefore(bar, app.firstChild);
  }

  function tuneDetails(){
    const controls = document.getElementById("cardControls");
    if (!controls) return;
    const first = controls.querySelector("details.group");
    if (first && !sessionStorage.getItem("fakebot2.mobile.details.tuned")){
      first.open = true;
      sessionStorage.setItem("fakebot2.mobile.details.tuned", "1");
    }
  }

  function boot(){
    document.documentElement.classList.add("fakebot2-frame");
    addStyle();
    addJumpBar();
    tuneDetails();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
})();
