(function(){
"use strict";
const KEY="sudoku-keyboard-guide-v1";
function desktop(){
 if(navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent||""))return false;
 return !matchMedia("(pointer:coarse) and (hover:none)").matches;
}
function played(){
 try{
  if(typeof state!=="undefined"){
   if(state.history?.length||state.pvpHistory?.length||Object.keys(state.timeAttackRuns||{}).length)return true;
   if(Object.values(state.progress||{}).some(p=>/[1-9]/.test(p.answers||"")||Object.keys(p.notes||{}).length))return true;
  }
 }catch(e){}
 return false;
}
const style=document.createElement("style");style.textContent="\n.sudoku-guide[hidden]{display:none!important}.sudoku-guide{position:fixed;inset:0;z-index:510;display:grid;place-items:center;padding:20px;background:#17233dbf;backdrop-filter:blur(9px);animation:guideFade .2s ease}\n.sudoku-guide-card{position:relative;width:min(100%,610px);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border-radius:25px;padding:28px 24px 22px;box-shadow:0 28px 95px #0005;color:#283854}\n.sudoku-guide-tag{color:#4a70ca;font-size:11px;font-weight:900;letter-spacing:.13em}.sudoku-guide-title{font-size:25px;margin:6px 0;line-height:1.2;letter-spacing:-.6px}.sudoku-guide-desc{font-size:13px;color:#7c8ca6;margin:6px 0 23px}\n.sudoku-guide-panels{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.sudoku-guide-panel{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:13px;padding:15px 8px;background:#f4f7fc;border:1px solid #e2eafa;border-radius:17px}\n.sudoku-guide-keys{height:91px;display:grid;place-items:center}.sudoku-guide-arrows{display:grid;grid-template-columns:repeat(3,34px);grid-template-rows:repeat(2,36px);gap:3px}\n.sudoku-guide-key{min-width:33px;height:34px;display:grid;place-items:center;color:#3463c3;background:#fff;border:1px solid #cbd8ec;border-bottom:3px solid #a9bbd6;box-shadow:0 1px 0 #bac8e2;border-radius:8px;font-size:22px;font-weight:850;line-height:1}\n.sudoku-guide-arrows .up{grid-column:2;grid-row:1}.sudoku-guide-arrows .left{grid-column:1;grid-row:2}.sudoku-guide-arrows .down{grid-column:2;grid-row:2}.sudoku-guide-arrows .right{grid-column:3;grid-row:2}\n.sudoku-guide-nums{display:grid;grid-template-columns:repeat(3,30px);gap:5px}.sudoku-guide-nums .sudoku-guide-key{height:27px;min-width:30px;font-size:15px}\n.sudoku-guide-pencil{font-size:35px;color:#8055d2}.sudoku-guide-slash{display:flex;align-items:center;gap:9px}.sudoku-guide-slash .sudoku-guide-key{min-width:47px;height:46px;font-size:28px}\n.sudoku-guide-caption{text-align:center;font-size:13px;font-weight:900;color:#315182}.sudoku-guide-demo{display:flex;gap:7px;align-items:center;color:#8498b5;font-weight:800;font-size:17px}\n.sudoku-guide-mini{display:grid;grid-template-columns:repeat(3,13px);gap:2px}.sudoku-guide-mini i{height:13px;background:#dce7f9;border-radius:2px}.sudoku-guide-mini i:nth-child(5){background:#4a7de8;box-shadow:0 0 0 2px #a8c8fb}\n.sudoku-guide-play{width:100%;height:52px;border:0;border-radius:13px;margin-top:21px;background:#3668e2;color:white;font-size:15px;font-weight:850;box-shadow:0 6px 19px #3668e245;cursor:pointer}\n.sudoku-guide-close{position:absolute;top:14px;right:15px;background:#f0f3f9;color:#7c8da7;border:0;border-radius:50%;width:31px;height:31px;font-size:19px;cursor:pointer}\n@keyframes guideFade{from{opacity:0}to{opacity:1}}\n@media(max-width:590px){.sudoku-guide-card{padding:20px 15px}.sudoku-guide-panels{grid-template-columns:1fr}.sudoku-guide-panel{display:grid;grid-template-columns:130px 1fr;grid-template-rows:auto auto;gap:0 10px}.sudoku-guide-keys{grid-row:span 2}.sudoku-guide-caption{grid-column:2}.sudoku-guide-title{font-size:21px}}\n@media(prefers-reduced-motion:reduce){.sudoku-guide{animation:none}}\n";document.head.appendChild(style);
let handled=false;
function dismiss(){
 document.getElementById("sudokuKeyboardGuide")?.remove();handled=true;
 try{localStorage.setItem(KEY,"1")}catch(e){}
 document.querySelector("#main .board .cell:not([disabled])")?.focus({preventScroll:true});
}
function show(){
 const en=window.SUDOKU_I18N?.lang==="en";
 const key=(v,c="")=>'<span class="sudoku-guide-key '+c+'">'+v+'</span>';
 const arrows='<div class="sudoku-guide-arrows">'+key("↑","up")+key("←","left")+key("↓","down")+key("→","right")+'</div>';
 const nums='<div class="sudoku-guide-nums">'+Array.from({length:9},(_,i)=>key(i+1)).join("")+'</div>';
 const mini='<span class="sudoku-guide-mini">'+Array.from({length:9},()=>"<i></i>").join("")+'</span>';
 const root=document.createElement("div");root.id="sudokuKeyboardGuide";root.className="sudoku-guide";
 root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","sudokuGuideTitle");
 root.innerHTML='<div class="sudoku-guide-card"><div class="sudoku-guide-tag">'+(en?"QUICK CONTROLS":"키보드 조작")+'</div><h2 class="sudoku-guide-title" id="sudokuGuideTitle">'+(en?"Play with your keyboard":"키보드로 바로 플레이")+'</h2><p class="sudoku-guide-desc">'+(en?"Remember these three keys.":"이 세 가지만 알면 돼요.")+'</p><button type="button" class="sudoku-guide-close" data-close-guide aria-label="'+(en?"Close":"닫기")+'">×</button><div class="sudoku-guide-panels"><div class="sudoku-guide-panel"><div class="sudoku-guide-keys">'+arrows+'</div><div class="sudoku-guide-demo">'+mini+'</div><div class="sudoku-guide-caption">'+(en?"Move":"칸 이동")+'</div></div><div class="sudoku-guide-panel"><div class="sudoku-guide-keys">'+nums+'</div><div class="sudoku-guide-demo">'+key("5")+' → 5</div><div class="sudoku-guide-caption">'+(en?"Numbers":"숫자 입력")+'</div></div><div class="sudoku-guide-panel"><div class="sudoku-guide-keys"><div class="sudoku-guide-slash">'+key("/")+'<span class="sudoku-guide-pencil">✎</span></div></div><div class="sudoku-guide-demo">5 ⇄ <span style="color:#8356c5">₅</span></div><div class="sudoku-guide-caption">'+(en?"Fill / Notes":"숫자 / 메모")+'</div></div></div><button type="button" class="sudoku-guide-play" data-close-guide>'+(en?"Got it — play!":"확인하고 시작하기")+'</button></div>';
 root.addEventListener("click",e=>{if(e.target.closest("[data-close-guide]"))dismiss()});
 document.addEventListener("keydown",e=>{if(root.isConnected&&e.key==="Escape"){e.preventDefault();e.stopPropagation();dismiss()}},true);
 document.body.appendChild(root);root.querySelector(".sudoku-guide-play").focus();
}
function check(){
 if(handled||!desktop()||!document.body)return;
 try{if(localStorage.getItem(KEY)==="1"){handled=true;return}}catch(e){}
 if(!document.querySelector("#main .board .cell"))return;
 if(typeof state!=="undefined" && state.view==="pvp" && typeof pvp!=="undefined" && pvp.match) return;
 if(document.querySelector("#pvpCountdown:not([hidden]),#gameOver:not([hidden]),#pvpOutcome:not([hidden]),dialog[open]"))return;
 if(played()){handled=true;try{localStorage.setItem(KEY,"1")}catch(e){}return}
 handled=true;show();
}
function init(){
 check();
 if(!handled){
  const target=document.getElementById("main");
  if(target){const watcher=new MutationObserver(()=>{check();if(handled)watcher.disconnect()});watcher.observe(target,{childList:true,subtree:true})}
 }
}
window.SUDOKU_KEYBOARD_GUIDE = {check};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();