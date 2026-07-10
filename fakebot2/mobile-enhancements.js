(() => {
  "use strict";
  const STYLE_ID = "fakebot2MobileEnhancementStyle";

  function addStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.fakebot2-frame,html.fakebot2-frame body{scroll-behavior:smooth;overscroll-behavior-y:contain;}
      html.fakebot2-frame body{touch-action:pan-y manipulation;}
      html.fakebot2-frame .app{max-width:880px!important;padding:7px 7px 96px!important;}
      html.fakebot2-frame .card{border-color:rgba(255,255,255,.075)!important;border-radius:16px!important;margin-bottom:8px!important;background:rgba(255,255,255,.035)!important;box-shadow:none!important;overflow:clip;}
      html.fakebot2-frame .cardHead{padding:9px!important;gap:7px!important;background:rgba(0,0,0,.13)!important;}
      html.fakebot2-frame .cardBody{padding:9px!important;}
      html.fakebot2-frame .btn,html.fakebot2-frame .iconBtn,html.fakebot2-frame .gearBtn,html.fakebot2-frame select,html.fakebot2-frame input[type=file],html.fakebot2-frame input[type=text]{min-height:44px!important;}
      html.fakebot2-frame .btn.tiny,html.fakebot2-frame .btn.small{min-height:42px!important;font-size:13px!important;}
      html.fakebot2-frame .btnRow{gap:6px!important;}
      html.fakebot2-frame .btnRow .btn{min-width:0!important;}
      html.fakebot2-frame .controls{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;}
      html.fakebot2-frame .control,html.fakebot2-frame .miniCtl{min-width:0!important;padding:9px!important;}
      html.fakebot2-frame details.group{border-radius:13px!important;margin-bottom:7px!important;overflow:hidden;}
      html.fakebot2-frame details.group>summary{min-height:48px!important;padding:9px 10px!important;}
      html.fakebot2-frame .sumTitle{font-size:14px!important;}
      html.fakebot2-frame .sumSub,html.fakebot2-frame .msg,html.fakebot2-frame .hint{line-height:1.35!important;}
      html.fakebot2-frame #sheet{overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
      html.fakebot2-frame #sheet::-webkit-scrollbar{display:none;}
      html.fakebot2-frame #pianoSvg,html.fakebot2-frame #fretSvg{height:clamp(138px,40vw,176px)!important;min-height:0!important;}
      html.fakebot2-frame #pianoBox,html.fakebot2-frame #fretBox{touch-action:manipulation!important;}
      html.fakebot2-frame .songList{max-height:min(40vh,320px)!important;}
      html.fakebot2-frame .modal,html.fakebot2-frame .editModal{width:min(96vw,760px)!important;max-height:calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;}
      html.fakebot2-frame .modalBody,html.fakebot2-frame .editBody{max-height:calc(100dvh - 110px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow:auto!important;-webkit-overflow-scrolling:touch;}
      html.fakebot2-frame #fakebot2SamplePanel{bottom:max(8px,env(safe-area-inset-bottom))!important;left:7px!important;right:7px!important;width:auto!important;max-width:480px!important;margin:auto!important;}
      html.fakebot2-frame #fakebot2SamplePanel:not([open]){display:none!important;}

      html.fakebot2-frame #cardHeader>.cardHead{display:block!important;}
      html.fakebot2-frame #cardHeader>.cardHead>.title{display:none!important;}
      html.fakebot2-frame #cardHeader .headTools{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;width:100%!important;}
      html.fakebot2-frame #cardHeader .headSelect{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;gap:6px!important;min-width:0!important;width:100%!important;}
      html.fakebot2-frame #cardHeader .headSelect:first-of-type{grid-column:1/-1;}
      html.fakebot2-frame #cardHeader .headSelect:has(select:disabled){display:none!important;}
      html.fakebot2-frame #cardHeader .headSelect select{min-width:0!important;max-width:none!important;width:100%!important;}
      html.fakebot2-frame #cardHeader .transposeGroup{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;}
      html.fakebot2-frame #cardHeader .transposeBtn{width:100%!important;min-width:0!important;}
      html.fakebot2-frame #cardHeader .headSlider{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;min-width:0!important;width:100%!important;}
      html.fakebot2-frame #cardHeader .headSlider input[type=range]{width:100%!important;min-width:0!important;}
      html.fakebot2-frame #cardHeader #btnGear{width:100%!important;justify-content:center!important;}
      html.fakebot2-frame #cardHeader .cardBody>.row>.grow:first-child{display:none!important;}
      html.fakebot2-frame #cardHeader .cardBody>.row>.grow:last-child{width:100%!important;min-width:0!important;max-width:none!important;}
      html.fakebot2-frame #cardHeader .btnRow{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;width:100%!important;}
      html.fakebot2-frame #cardHeader #rowMidiInput{grid-template-columns:minmax(110px,.8fr) minmax(0,1.2fr)!important;}
      html.fakebot2-frame #cardHeader .miniStat{white-space:normal!important;}
      html.fakebot2-frame #fakebot2MoreActions{border:1px solid rgba(255,255,255,.08);border-radius:12px!important;background:rgba(0,0,0,.14);overflow:hidden;}
      html.fakebot2-frame #fakebot2MoreActions>summary{list-style:none;min-height:44px;padding:9px 11px;display:flex;align-items:center;justify-content:space-between;color:var(--pageMuted);font-size:12px;font-weight:850;cursor:pointer;}
      html.fakebot2-frame #fakebot2MoreActions>summary::-webkit-details-marker{display:none;}
      html.fakebot2-frame #fakebot2MoreActions[open]>summary{border-bottom:1px solid rgba(255,255,255,.07);color:var(--pageInk);}
      html.fakebot2-frame #fakebot2MoreActions .fb2MoreBody{padding:8px;}
      html.fakebot2-frame #cardControls>.cardHead,html.fakebot2-frame #cardLimiters>.cardHead{display:none!important;}

      @media (max-width:720px){
        html.fakebot2-frame .app{padding-left:5px!important;padding-right:5px!important;}
        html.fakebot2-frame .row{gap:6px!important;}
        html.fakebot2-frame .grow{min-width:min(100%,210px)!important;}
        html.fakebot2-frame .sheet{gap:6px!important;}
        html.fakebot2-frame .sheet .bar{min-width:0!important;}
        html.fakebot2-frame #pianoTop{padding-left:78px!important;padding-right:12px!important;text-align:right!important;}
      }
      @media (max-width:370px){
        html.fakebot2-frame #cardHeader .headTools{grid-template-columns:1fr!important;}
        html.fakebot2-frame #cardHeader .headSelect:first-of-type{grid-column:auto;}
        html.fakebot2-frame .controls{grid-template-columns:1fr!important;}
        html.fakebot2-frame .btnRow .btn{font-size:12px!important;padding-left:5px!important;padding-right:5px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function collapseAdvancedGroups(){
    document.querySelectorAll("details.group[open]").forEach((group)=>{ group.open = false; });
  }

  function tuckAwaySecondaryActions(){
    const cardBody = document.querySelector("#cardHeader>.cardBody");
    if (!cardBody || document.getElementById("fakebot2MoreActions")) return;
    const details = document.createElement("details");
    details.id = "fakebot2MoreActions";
    const summary = document.createElement("summary");
    summary.innerHTML = "<span>More controls</span><span>•••</span>";
    const content = document.createElement("div");
    content.className = "fb2MoreBody";
    while (cardBody.firstChild) content.appendChild(cardBody.firstChild);
    details.append(summary, content);
    cardBody.appendChild(details);
  }

  function boot(){
    document.documentElement.classList.add("fakebot2-frame");
    addStyle();
    tuckAwaySecondaryActions();
    collapseAdvancedGroups();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
})();
