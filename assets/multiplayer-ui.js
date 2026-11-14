'use strict';
/* Multiplayer UI and results. The original 2-player presentation is untouched. */
const multiOldLobby=pvpRenderLobby;
pvpRenderLobby=function(){
 let html=multiOldLobby();
 if(pvp.mode!=='friend')return html;
 if(!pvp.role){
  const options=Object.entries(multiFormats).map(([id,f])=>'<option value="'+id+'" '+(pvp.format===id?'selected':'')+'>'+multiFormatTitle(id)+'</option>').join('');
  const selector='<div class="multi-format"><label class="field-label" for="pvpFormat">'+multiT('대결 인원 및 방식','Players and mode')+'</label><select class="text-input" id="pvpFormat">'+options+'</select><small>'+multiT('팀전은 4명이 입장하면 팀을 무작위로 배정합니다.','2v2 teams are randomly assigned once all four players join.')+'</small></div>';
  html=html.replace('<div class="pvp-settings">',selector+'<div class="pvp-settings">');
 }
 if(multi.active){
  html=html.replace('<h2>2인 대결</h2>','<h2>'+multiFormatTitle(multi.format)+'</h2>');
  const max=multiFormats[multi.format].count,people=multi.names.filter(Boolean).length;
  const roster='<div class="multi-lobby-roster"><strong>'+multiT('참가자','Players')+' '+people+'/'+max+'</strong><div class="multi-roster-grid">'+Array.from({length:max},(_,i)=>'<span>'+(i+1)+'. '+escapeHtml(multi.names[i]||multiT('입장 대기','Waiting...'))+'</span>').join('')+'</div><p>'+multiT('모두 입장하면 3 · 2 · 1 · START 후 자동으로 시작합니다.','When all players join, the 3 · 2 · 1 · START countdown begins automatically.')+'</p></div>';
  html+=roster;
  if(multi.host)html=html.replace('확정된 경기 규칙</h3>','확정된 경기 규칙</h3><p><strong>'+multiFormatTitle(multi.format)+'</strong></p>');
 }
 return html;
};
const multiOldBoard=pvpBoardHtml;
pvpBoardHtml=function(){
 if(!multi.active||!pvp.match?.format)return multiOldBoard();
 const m=pvp.match,g=m.groups[multiGroup()],selected=pvp.selected,sr=Math.floor(selected/9),sc=selected%9;
 const disabled=m.finished||pvpBeforeStart()||g.lives===0||g.done;
 return '<div class="board" role="group" aria-label="'+multiT('다인전 스도쿠','Multiplayer Sudoku')+'">'+Array.from({length:81},(_,i)=>{
  const row=Math.floor(i/9),col=i%9,given=m.givens[i]!=='0',wrong=!given&&g.answers[i]==='0'&&g.mistakes[i]!=='0';
  const v=given?m.givens[i]:g.answers[i]!=='0'?g.answers[i]:g.mistakes[i];
  const selectedCls=i===selected?' pvp-selected':row===sr||col===sc||Math.floor(row/3)===Math.floor(sr/3)&&Math.floor(col/3)===Math.floor(sc/3)?' pvp-peer':'';
  const note=v==='0'&&multi.notes[i]?'<span class="notes-grid">'+Array.from({length:9},(_,j)=>'<i>'+(multi.notes[i]&(1<<j)?j+1:'')+'</i>').join('')+'</span>':'';
  const classes='cell'+(given?' given':'')+selectedCls+(wrong?' pvp-wrong-entry':!given&&v!=='0'?' pvp-correct':'');
  return '<button type="button" data-action="pvp-cell" data-index="'+i+'" class="'+classes+'" '+(disabled?'disabled':'')+' aria-label="'+multiT('칸','Cell')+' '+(row+1)+'-'+(col+1)+'">'+(v==='0'?note:'<span class="digit">'+v+'</span>')+'</button>';
 }).join('')+'</div>';
};
const multiOldOutcomeCalc=pvpGameOutcome;
pvpGameOutcome=function(){
 if(!multi.active||!pvp.match?.format)return multiOldOutcomeCalc();
 const m=pvp.match;
 return !m.finished?null:m.winner===null?'tie':m.winner===multiGroup()?'win':'lose';
};
const multiOldArchive=pvpArchiveMatch;
pvpArchiveMatch=function(){
 if(!multi.active||!pvp.match?.format)return multiOldArchive();
 const m=pvp.match;if(!m.finished)return null;
 const id='cduel_'+m.id,team=multiGroup(),my=m.groups[team],op=m.groups.filter((g,i)=>i!==team).reduce((a,b)=>!a||b.score>a.score?b:a,null);
 state.duelPuzzles=state.duelPuzzles||[];
 let puzzle=state.duelPuzzles.find(v=>v.id===id);
 if(!puzzle){puzzle={id,name:multiFormatTitle(m.format)+' '+(PVP_LEVELS[m.level]?.name||''),givens:m.givens,createdAt:Date.now(),updatedAt:Date.now()};state.duelPuzzles.unshift(puzzle)}
 if(!state.progress[id])state.progress[id]={answers:my.answers,notes:{...multi.notes},done:my.done,completedAt:my.done?Date.now():0,updatedAt:Date.now(),hintsUsed:0};
 if(my.done&&!state.history.some(v=>v.id===id))state.history.unshift({id,title:puzzle.name,at:Date.now(),level:'pvp'});
 state.pvpHistory=state.pvpHistory||[];
 if(!state.pvpHistory.some(v=>v.id===m.id))state.pvpHistory.unshift({
  id:m.id,at:Date.now(),opponent:m.format==='team4'?multiT('상대 팀','Opposing team'):m.players.filter(p=>p.team!==team).map(p=>p.name).join(', '),
  level:m.level,score:my.score,otherScore:op?.score||0,result:pvpGameOutcome()==='win'?'승리':pvpGameOutcome()==='tie'?'무승부':'패배',
  soloId:id,reason:m.reason||'',filled:my.correct,total:m.givens.split('').filter(v=>v==='0').length
 });
 state.pvpHistory=state.pvpHistory.slice(0,60);persist();return id;
};
const multiOldSave=pvpSaveResult;
pvpSaveResult=function(){
 if(!multi.active||!pvp.match?.format)return multiOldSave();
 if(multi.saved||!pvp.match.finished)return;
 multi.saved=true;pvpArchiveMatch();
};
const multiOldShowOutcome=pvpShowOutcome;
pvpShowOutcome=function(){
 if(!multi.active||!pvp.match?.format)return multiOldShowOutcome();
 const m=pvp.match;if(!m.finished||pvp.outcomeShown===m.id)return;
 pvp.outcomeShown=m.id;pvpHideCountdown();
 const result=pvpGameOutcome(),my=m.groups[multiGroup()];
 const el=$('#pvpOutcome'),card=$('#pvpOutcomeCard');if(!el||!card)return;
 card.className='pvp-outcome-card '+result;
 $('#pvpOutcomeIcon').textContent=result==='win'?'🏆':result==='lose'?'💔':'🤝';
 $('#pvpOutcomeTitle').textContent=result==='win'?multiT('승리!','Victory!'):result==='lose'?multiT('패배','Defeat'):multiT('무승부','Draw');
 $('#pvpOutcomeDetail').textContent=multiFormatTitle(m.format)+'\n'+multiT('내 점수 ','My score ')+my.score+'\n'+m.reason;
 $('#pvpConfetti').innerHTML='';el.hidden=false;
};
const multiOldResult=pvpResultHtml;
pvpResultHtml=function(){
 if(!multi.active||!pvp.match?.format)return multiOldResult();
 const m=pvp.match;if(!m.finished)return '';
 const g=m.groups[multiGroup()],result=pvpGameOutcome(),word=result==='win'?multiT('승리','Victory'):result==='lose'?multiT('패배','Defeat'):multiT('무승부','Draw');
 return '<div class="pvp-finished"><strong>'+word+'</strong><div>'+multiT('점수','Score')+' '+g.score+'</div></div><div class="pvp-continue"><button class="primary" data-action="pvp-solo">'+multiT('일반 모드에서 이어 풀기','Continue in Normal mode')+'</button><button class="secondary" data-action="pvp-new">'+multiT('새 대결','New match')+'</button></div>';
};
const multiOldRenderMatch=pvpRenderMatch;
pvpRenderMatch=function(){
 if(!multi.active||!pvp.match?.format)return multiOldRenderMatch();
 const m=pvp.match,team=multiGroup(),me=m.groups[team],ready=!m.finished&&!pvpBeforeStart()&&me.lives>0&&!me.done;
 const total=m.givens.split('').filter(v=>v==='0').length;
 const scorecards=m.groups.map((g,i)=>{
  const names=m.players.filter(p=>p.team===i).map(p=>escapeHtml(p.name)).join(' + ');
  const label=m.format==='team4'?multiT('팀 ','Team ')+(i+1):names;
  return '<div class="multi-card '+(team===i?'mine':'')+' '+(m.format==='team4'?(i?'red':'blue'):'')+'"><div class="multi-card-top"><strong>'+label+'</strong><b>'+g.score.toLocaleString(window.SUDOKU_LANG==='en'?'en-US':'ko-KR')+' '+multiT('점','pts')+'</b></div>'+(m.format==='team4'?'<small>'+names+'</small>':'')+'<div class="multi-card-hearts">'+Array.from({length:m.maxLives},(_,j)=>j<g.lives?'❤️':'♡').join('')+'</div><span class="multi-card-progress">'+g.correct+'/'+total+'</span></div>';
 }).join('');
 const teamInfo=m.format==='team4'?'<p class="multi-team-info">'+multiT('팀원 두 명이 같은 판과 정답·점수·하트를 공유하며 동시에 풀 수 있습니다.','Both teammates solve the same board at once, sharing answers, points and hearts.')+'</p>':'';
 const digits=Array.from({length:9},(_,i)=>'<button class="key" type="button" data-action="pvp-digit" data-digit="'+(i+1)+'" '+(ready?'':'disabled')+'>'+(i+1)+'</button>').join('');
 return '<div class="pvp-match-heading"><div><span class="minititle">'+multiFormatTitle(m.format)+'</span><h2>'+escapeHtml(PVP_LEVELS[m.level]?.name||m.level)+' '+multiT('스도쿠','Sudoku')+'</h2></div><span class="chip">'+(m.finished?multiT('대결 종료','Match over'):multiT('진행 중','In progress'))+'</span></div>'+
 '<div class="pvp-timers"><div class="pvp-timer-card"><span>'+multiT('남은 경기 시간','Match time left')+'</span><strong id="pvpMatchTime">00:00</strong></div><div class="pvp-timer-card move"><span>'+multiT('입력 제한','Move deadline')+'</span><strong id="pvpTurnTime">00:00</strong><div class="pvp-turnbar"><div id="pvpTurnProgress"></div></div></div></div>'+
 '<div class="multi-cards">'+scorecards+'</div>'+teamInfo+'<div class="pvp-board-wrap">'+pvpBoardHtml()+'</div>'+pvpResultHtml()+
 '<div class="pvp-numberpad">'+digits+'</div><div class="pvp-btnrow"><button class="tool" data-action="pvp-erase" '+(ready?'':'disabled')+'>'+multiT('지우기','Erase')+'</button><button class="tool '+(pvp.noteMode?'active':'')+'" data-action="pvp-note" '+(ready?'':'disabled')+'>'+multiT('메모','Notes')+' '+(pvp.noteMode?multiT('켜짐','On'):multiT('꺼짐','Off'))+'</button><button class="tool" data-action="pvp-leave">'+(m.finished?multiT('연결 종료','Disconnect'):multiT('나가기','Leave'))+'</button></div>';
};
const multiOldClocks=pvpClocks;
pvpClocks=function(){
 if(!multi.active||!pvp.match?.format)return multiOldClocks();
 if(state.view!=='pvp')return pvpHideCountdown();
 const m=pvp.match,g=m.groups[multiGroup()];if(!g)return;
 const now=pvpMatchNow(),pre=now<m.startedAt,left=m.finished?0:pre?m.endAt-m.startedAt:m.endAt-now;
 const turn=m.finished||g.done||g.lives===0?0:pre?m.turnMs:g.deadline-now;
 const a=$('#pvpMatchTime'),b=$('#pvpTurnTime'),bar=$('#pvpTurnProgress');
 if(a)a.textContent=pvpFmtTime(left);if(b)b.textContent=pvpFmtTime(turn);
 if(bar)bar.style.width=Math.max(0,Math.min(100,100*turn/m.turnMs))+'%';
 pvpUpdateCountdown();
};
const multiOldLeave=pvpLeaveMatch;
pvpLeaveMatch=function(){
 if(!multi.active||!pvp.match?.format)return multiOldLeave();
 const m=pvp.match;
 if(!m.finished){
  if(multi.host){
   const opponent=m.groups.map((g,i)=>i!==multiGroup()?i:-1).filter(i=>i>=0);
   const top=opponent.length?Math.max(...opponent.map(i=>m.groups[i].score)):-Infinity;
   const leaders=opponent.filter(i=>m.groups[i].score===top);
   multiEnd(multiT('방장이 나갔습니다.','Host left.'),leaders.length===1?leaders[0]:null);
  }else{
   multiWire(pvp.dc,{type:'multi-forfeit'});m.finished=true;m.reason=multiT('대결에서 나갔습니다.','You left.');m.winner=null;pvpSaveResult();pvpRender();pvpShowOutcome();
  }
 }
 setTimeout(()=>pvpStopTransport(true),350);
};
const multiOldSolo=pvpSoloContinue;
pvpSoloContinue=function(id=null){
 if(!multi.active||!pvp.match?.format)return multiOldSolo(id);
 const solo=id||(pvp.match?.finished?pvpArchiveMatch():null);
 if(!solo||!getPuzzle(solo)){notify(multiT('이어 풀 문제를 찾을 수 없습니다.','Cannot find the duel puzzle.'));return}
 pvpHideOutcome();state.playMode='normal';openGame(solo);
};
const multiStyle=document.createElement('style');
multiStyle.textContent='.multi-format{margin:0 0 14px}.multi-format small{display:block;margin:6px 0 0;color:#8490a4}.multi-lobby-roster{margin-top:14px;padding:15px;border:1px solid #d9e5f5;border-radius:14px;background:#f5f8fe}.multi-roster-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:7px;margin:10px 0}.multi-roster-grid span{padding:10px;background:#fff;border:1px solid #dde6f6;border-radius:9px;font-size:12px;font-weight:750}.multi-lobby-roster p{font-size:12px;color:#6881a4}.multi-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:8px;margin:14px 0}.multi-card{min-width:0;background:#f7faff;border:1px solid #dce5f5;padding:11px;border-radius:12px}.multi-card.mine{box-shadow:inset 0 0 0 2px #8baafb;background:#f0f5ff}.multi-card.blue{border-left:4px solid #427eef}.multi-card.red{border-left:4px solid #f07272}.multi-card-top{display:flex;justify-content:space-between;gap:6px;font-size:12px}.multi-card-top strong{overflow-wrap:anywhere}.multi-card-top b{white-space:nowrap;color:#4b6eb7}.multi-card small{display:block;font-size:11px;color:#798ba5;margin-top:6px;overflow-wrap:anywhere}.multi-card-hearts{font-size:16px;margin:9px 0 4px}.multi-card-progress{font-size:11px;color:#7184a4}.multi-team-info{font-size:12px;color:#4973b5;margin:6px 0 13px}@media(max-width:460px){.multi-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.multi-card{padding:8px}.multi-card-top{display:block}.multi-card-top b{display:block;margin-top:4px}}';
document.head.appendChild(multiStyle);
