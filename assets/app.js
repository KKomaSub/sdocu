'use strict';

const appText=(ko,en)=>window.SUDOKU_LANG==='en'?en:ko;
const appIcons={
 plus:'<path d="M12 5v14M5 12h14"/>',
 home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
 solo:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18m6-18v18M3 9h18M3 15h18"/>',
 friends:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
 world:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 custom:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12h7m-3.5-3.5v7"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4.1 2.8c-.7.3-1.1.8-1.1 1.7m0 3.2h.01"/>',
 back:'<path d="m11 6-6 6 6 6M5 12h14"/>',
 next:'<path d="m9 6 6 6-6 6"/>',
 play:'<path d="m9 5 11 7-11 7z"/>',
 note:'<path d="m14.5 5.5 4 4M5 19l1-5 9-9a2.8 2.8 0 0 1 4 4l-9 9z"/>',
 erase:'<path d="m8 19-4-4a2 2 0 0 1 0-3l8-8a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-7 7zm-1-9 8 8m-7 1h13"/>',
 hint:'<path d="M9 18h6m-5 3h4m-5-6v-.6a3.5 3.5 0 0 0-1.1-2.2 6 6 0 1 1 8.2 0 3.5 3.5 0 0 0-1.1 2.2v.6z"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 reset:'<path d="M4 12a8 8 0 1 1 2.3 5.7M4 5v7h7"/>',
};
const appIcon=name=>'<span class="app-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">'+appIcons[name]+'</svg></span>';
const guideKey='sudoku-mate-guide-v1';
const nicknameKey='sudoku-mate-nickname';
const appRead=key=>{try{return localStorage.getItem(key)}catch{return null}};
const appWrite=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const friendSetup={players:2,team:false,level:'medium',hearts:3,turnSeconds:20,matchMinutes:11,advanced:false};
let appWaiting;
let waitingRequest=null;
let tapMode='';
let tapFilledCode='';
let guideStep=0;
let guideReturn=null;
let pendingInvite=null;
function homeMode(key,title,detail){
 return `<button type="button" class="app-mode mode-${key}" data-app-action="${key}">
  <span class="mode-symbol">${appIcon(key)}</span>
  <span class="mode-chevron">${appIcon('next')}</span>
  <span class="mode-copy"><strong>${title}</strong>${detail}</span>
 </button>`;
}
function homeBoard(puzzle){
 const cells=puzzle.givens;
 const focus=cells.indexOf('0');
 return '<span class="home-board" aria-hidden="true">'+Array.from(cells,(value,i)=>{
  const sameRow=Math.floor(i/9)===Math.floor(focus/9);
  const sameCol=i%9===focus%9;
  const style=i===focus?'board-cursor':sameRow||sameCol?'board-peer':'';
  return '<span class="'+style+'">'+(value==='0'?'':value)+'</span>';
 }).join('')+'</span>';
}
function guideButton(){
 const label=appText('플레이 방법','How to play');
 return `<button type="button" class="icon-button help-button" data-app-action="guide" aria-label="${label}" title="${label}">${appIcon('help')}</button>`;
}
function completedBuiltinCount(){
 return new Set(state.history.filter(item=>getPuzzle(item.id)?.builtin).map(item=>item.id)).size;
}
function completedCaption(count){
 return appText(`${count}문제 완료`,`${count} ${count===1?'puzzle':'puzzles'} completed`);
}
function renderHome(){
 const activePuzzle=getPuzzle(state.activeId);
 const run=timeMode()?runOf(state.activeId):state.progress[state.activeId];
 const started=run&&(timeMode()?run.status==='running':!run.done&&(run.answers!==EMPTY||Object.keys(run.notes||{}).length));
 const resume=activePuzzle&&started?activePuzzle:null;
 const total=BUILTINS.length;
 const completed=completedBuiltinCount();
 const stats=completedCaption(completed);
 $('#main').innerHTML=`<section class="home-screen">
  <section class="solo-card" aria-labelledby="soloTitle">
   <div class="solo-overview">
    <div class="board-stage">${homeBoard(resume||getPuzzle('b001'))}${guideButton()}</div>
    <div class="solo-intro">
     <h1 id="soloTitle">${appText('혼자 풀기','Solo play')}</h1>
     <p>${appText('쉬움부터 익스트림까지','From easy to extreme')}</p>
    </div>
    <div class="solo-stats" role="progressbar" aria-label="${stats}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completed}">
     <small aria-hidden="true">${stats}</small>
     <span class="solo-track" aria-hidden="true"><span style="width:${completed/total*100}%"></span></span>
    </div>
   </div>
   <button type="button" class="solo-start" data-app-action="solo">${appText('문제 고르기','Choose a puzzle')}${appIcon('next')}</button>
  </section>
  <div class="mode-list">
   ${homeMode('friends',appText('친구 대결','Friends'),'<small>'+appText('방 번호로 참가','Join by room code')+'</small>')}
   ${homeMode('world',appText('월드 매칭','World Match'),'<small data-queue-count></small>')}
  </div>
  ${resume?`<button type="button" class="home-resume" data-action="return-play"><span class="resume-icon">${appIcon('play')}</span>
   <span><strong>${appText('이어 풀기','Continue')}</strong><small>${escapeHtml(resume.title)}</small></span>${appIcon('next')}</button>`:''}
 </section>`;
 appUpdateLobby();
 appRefreshWaiting();
}
function appSetupNavigation(){
 $('#detailBar').insertAdjacentHTML('beforeend',guideButton());
 $('#appBack').ariaLabel=appText('뒤로','Back');
 $('#appBack').innerHTML=appIcon('back');
 const nav=$('#appNav');
 nav.ariaLabel=appText('주요 메뉴','Main navigation');
 nav.innerHTML=[
  ['home','home',appText('홈','Home')],
  ['catalog','solo',appText('문제','Puzzles')],
  ['custom','custom',appText('내 문제','My puzzles')],
  ['history','history',appText('기록','History')]
 ].map(([view,icon,label])=>'<button type="button" class="nav-btn" data-action="view" data-view="'+view+'">'+appIcon(icon)+'<span>'+label+'</span></button>').join('');
}

const guideSlides=[
 {icon:'solo',title:appText('빈칸에 숫자를 넣어 보세요','Tap a cell and enter a number'),body:appText('가로줄, 세로줄, 3×3 구역마다 1부터 9까지 한 번씩 들어갑니다.','Each row, column and 3×3 box contains each number from 1 to 9 once.')},
 {icon:'note',title:appText('후보 숫자는 메모에 적어요','Make a note'),body:appText('메모를 켜고 후보 숫자를 적어 보세요. 지우개로 지울 수 있고, 막힐 땐 힌트를 쓸 수 있어요.','Turn on Notes to mark possible numbers. Use Erase to clear an entry or Hint when you’re stuck.')},
 {icon:'friends',title:appText('같은 문제로 겨뤄 보세요','Race on the same puzzle'),body:appText('친구와는 4자리 방 번호로 만나고, 월드 매칭에서는 상대를 자동으로 찾아요.','Use a 4-digit room code with friends, or let World Match find an opponent.')},
];
function appRenderGuide(){
 const privacy=window.MATE_ANDROID && window.prompt('sudoku:privacy','status')==='required'
  ?'<button type="button" class="guide-skip" data-app-action="privacy">'+appText('광고 개인정보 설정','Ad privacy options')+'</button>':'';
 const step=guideSlides[guideStep];
 const next=guideStep===guideSlides.length-1?appText('시작하기','Start playing'):appText('다음','Next');
 $('#appGuide').innerHTML='<div class="guide-handle" aria-hidden="true"></div><div class="guide-head"><div class="guide-orb">'+appIcon(step.icon)+'</div><button type="button" class="guide-skip" data-app-action="guide-close">'+
  appText('건너뛰기','Skip')+'</button></div>'+privacy+'<h2 id="appGuideTitle">'+step.title+'</h2><p>'+step.body+'</p>'+
  '<div class="guide-progress" aria-label="'+(guideStep+1)+' / '+guideSlides.length+'">'+guideSlides.map((_,i)=>'<i class="'+(i===guideStep?'current':'')+'"></i>').join('')+
  '</div><button type="button" class="primary app-primary guide-next" data-app-action="guide-next">'+next+'</button>';
}
function appOpenGuide(){
 guideStep=0;
 guideReturn=document.activeElement;
 appRenderGuide();
 $('#appGuide').showModal();
 $('.guide-next').focus();
}
function appCloseGuide(){
 $('#appGuide').close();
 appWrite(guideKey,'1');
 if(guideReturn instanceof HTMLElement&&guideReturn!==document.body)guideReturn.focus({preventScroll:true});
 else $('#main button')?.focus({preventScroll:true});
 if(pendingInvite){
  pendingInvite=null;
  pvpInviteFromURL();
 }
}

function lobbyHeading(title){
 return '<h1 class="lobby-heading">'+title+'</h1>';
}
function lobbyAction(name,text,kind='primary',extra=''){
 return '<button type="button" class="'+kind+' app-primary" data-action="'+name+'" '+extra+'>'+text+'</button>';
}
function lobbyName(){
 return '<label class="field-label" for="pvpNickname">'+appText('내 닉네임','Your nickname')+'</label><input id="pvpNickname" class="text-input" maxlength="20" autocomplete="nickname" value="'+escapeHtml(pvp.name)+'">';
}
function roomStepper(id,label,value,min,max){
 return '<div class="room-row"><span id="label-'+id+'">'+label+'</span><div class="room-stepper" role="group" aria-labelledby="label-'+id+'">'+
  '<button type="button" class="step-button" data-app-action="step" data-target="'+id+'" data-delta="-1" aria-label="'+label+' −" '+(value<=min?'disabled':'')+'>−</button>'+
  '<output id="'+id+'" aria-live="polite">'+value+'</output><button type="button" class="step-button" data-app-action="step" data-target="'+id+'" data-delta="1" aria-label="'+label+' +" '+(value>=max?'disabled':'')+'>+</button></div></div>';
}
function friendSettings(){
 const team=friendSetup.players===4&&friendSetup.team;
 return '<div class="lobby-card create-room"><h2>'+appText('새 방 만들기','Create a room')+'</h2><div class="room-options">'+
  roomStepper('roomPlayers',appText('인원','Players'),friendSetup.players,2,4)+
  '<div id="roomTeamRow" class="room-row" '+(friendSetup.players===4?'':'hidden')+'><span>'+appText('대결 방식','Match type')+'</span><div class="team-toggle" role="group" aria-label="'+appText('대결 방식','Match type')+'">'+
  '<button type="button" data-app-action="team" data-team="false" aria-pressed="'+!team+'">'+appText('개인전','Solo')+'</button>'+
  '<button type="button" data-app-action="team" data-team="true" aria-pressed="'+team+'">'+appText('2:2 팀전','2v2 teams')+'</button></div></div>'+
  '<div class="room-row"><label for="pvpLevel">'+appText('난이도','Difficulty')+'</label><select class="text-input" id="pvpLevel">'+
   LEVELS.map(({key,name})=>'<option value="'+key+'" '+(friendSetup.level===key?'selected':'')+'>'+(window.SUDOKU_LANG==='en'?window.SUDOKU_I18N?.translate(name)??name:name)+'</option>').join('')+
  '</select></div>'+roomStepper('roomHearts',appText('하트','Hearts'),friendSetup.hearts,1,10)+'</div>'+
  '<p id="roomTeamNote" class="room-note" '+(team?'':'hidden')+'>'+appText('4명이 모이면 팀을 무작위로 나눠요.','Teams are assigned randomly when all four players join.')+'</p>'+
  '<details class="room-advanced" '+(friendSetup.advanced?'open':'')+'><summary>'+appText('시간 설정','Time limits')+'</summary>'+
  '<div class="room-times"><div><label class="field-label" for="pvpTurnSeconds">'+appText('한 칸 입력 (초)','Per move (seconds)')+'</label><input type="number" class="text-input" id="pvpTurnSeconds" min="5" max="120" value="'+friendSetup.turnSeconds+'"></div>'+
  '<div><label class="field-label" for="pvpMatchMinutes">'+appText('전체 경기 (분)','Match (minutes)')+'</label><input type="number" class="text-input" id="pvpMatchMinutes" min="1" max="120" value="'+friendSetup.matchMinutes+'"></div></div></details>'+
  lobbyAction('pvp-create',appText('방 만들기','Create room'))+'</div>';
}
function friendJoinForm(){
 return '<form class="lobby-card join-room" id="appJoinRoom"><div class="join-title"><h2>'+appText('방 참가','Join a room')+'</h2>'+
  '<span id="nearbyBadge" class="queue-tag" role="status" hidden>'+appText('방 번호를 받았어요','Room code received')+'</span></div>'+
  '<div class="room-join-row"><label class="sr-only" for="pvpRoomCode">'+appText('4자리 방 번호','4-digit room code')+'</label>'+
  '<input class="text-input room-code-input" id="pvpRoomCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required placeholder="0000" value="'+escapeHtml(pvp.joinCode)+'">'+
  '<button class="primary app-primary" type="submit">'+appText('입장','Join')+'</button></div><small class="room-note" data-tap-tip hidden>'+appText('휴대폰 뒷면을 맞대면 방 번호가 입력돼요.','Touch the backs of your phones to fill in the code.')+'</small></form>';
}
function friendRoomWaiting(){
 const isHost=pvp.role==='host';
 if(pvp.conn==='disconnected')return lobbyStatus()+lobbyBackButton(appText('친구 대결로 돌아가기','Back to friends'));
 const capacity=multi.active?multiFormats[multi.format].count:2;
 const players=multi.active?[...multi.names]:[pvp.name,pvp.dc?.open?pvp.peerName:null];
 const hasRoster=isHost||multi.active||pvp.dc?.open;
 return '<div class="lobby-card waiting-room">'+
  (isHost&&pvp.roomCode?'<span class="room-code-label">'+appText('방 번호','Room code')+'</span><strong id="pvpRoomDisplay" class="room-code">'+escapeHtml(pvp.roomCode)+'</strong>'+
   '<div class="invite-actions">'+lobbyAction('pvp-copy-offer',appText('번호 복사','Copy code'),'secondary')+
   lobbyAction('pvp-share',appText('초대 링크 복사','Copy invite link'),'ghost')+'</div>'+
   '<input id="pvpShareURL" class="sr-only" tabindex="-1" aria-label="'+appText('초대 링크','Invite link')+'" value="'+escapeHtml(pvpShareURL())+'" readonly>':'')+
  (hasRoster?'<div class="room-roster"><h2>'+appText('참가자','Players')+' <span>'+players.filter(Boolean).length+' / '+capacity+'</span></h2><ul>'+
   Array.from({length:capacity},(_,i)=>'<li class="'+(players[i]?'joined':'')+'">'+appIcon('friends')+'<span>'+escapeHtml(players[i]||appText('입장 대기','Waiting to join'))+'</span></li>').join('')+
   '</ul><p class="room-note">'+appText('모두 모이면 대결이 시작돼요.','The match starts automatically when the room is full.')+'</p></div>':'')+
  lobbyStatus()+lobbyBackButton(isHost?appText('방 닫기','Close room'):appText('입장 취소','Cancel join'))+'</div>';
}
function lobbyStatus(){
 const status=pvp.status||appText('연결하는 중이에요.','Getting connected…');
 return '<p class="lobby-status" role="status">'+escapeHtml(status)+'</p>';
}
function lobbyBackButton(text){
 return '<button type="button" class="ghost app-primary" data-app-action="lobby-reset">'+text+'</button>';
}
function worldLobby(){
 const busy=pvp.conn==='matching'||pvp.conn==='connecting'||pvpRandom.starting;
 return lobbyHeading(appText('월드 매칭','World Match'))+
  '<div class="lobby-card world-room"><span class="world-orb '+(busy?'is-searching':'')+'">'+appIcon('world')+'</span><span class="queue-tag" data-queue-count></span>'+
  '<h2>'+(busy?appText('상대를 찾는 중','Looking for an opponent'):appText('1:1 빠른 대결','Quick 1v1 match'))+'</h2>'+
  (busy||pvp.conn==='disconnected'?lobbyStatus():'<p class="room-note">'+appText('보통 난이도 · 하트 3개','Medium difficulty · 3 hearts')+'</p>')+
  (busy?lobbyAction('pvp-random-cancel',appText('매칭 취소','Cancel search'),'ghost'):
    lobbyAction('pvp-random-start',appText('상대 찾기','Find an opponent')))+'</div>'+
  (!busy?'<div class="lobby-card lobby-profile">'+lobbyName()+'</div>':'');
}
function pvpRenderLobby(){
 if(pvp.mode==='random')return worldLobby();
 return lobbyHeading(appText('친구 대결','Friends'))+
  (pvp.role?friendRoomWaiting():'<div class="friend-layout"><div>'+friendJoinForm()+
   '<div class="lobby-card lobby-profile">'+lobbyName()+'</div></div>'+friendSettings()+'</div>');
}

function appUpdateLobby(){
 const count=appWaiting;
 document.querySelectorAll('[data-queue-count]').forEach(el=>{
  const text=count===undefined?appText('대기 인원 확인 중','Checking queue'):
   count===null?appText('대기 인원 미확인','Queue unavailable'):
    appText(count.toLocaleString('ko-KR')+'명 대기 중',count.toLocaleString('en-US')+' waiting');
  if(el.textContent!==text)el.textContent=text;
  el.classList.toggle('is-live',Number.isInteger(count)&&count>0);
 });
 const badge=$('#nearbyBadge');
 if(badge)badge.hidden=!tapFilledCode;
 $('.join-room')?.classList.toggle('nearby-room',Boolean(tapFilledCode));
}
async function appRefreshWaiting(){
 if(document.hidden||!(state.view==='home'||state.view==='pvp'&&pvp.mode==='random'))return;
 if(!/^https?:$/.test(location.protocol)){appWaiting=null;appUpdateLobby();return}
 if(waitingRequest)return waitingRequest;
 waitingRequest=(async()=>{
  try{
   const response=await fetch('/api/match?count=1',{cache:'no-store',signal:AbortSignal.timeout(5000)});
   if(!response.ok)throw new Error('Queue unavailable');
   const result=await response.json();
   if(!Number.isSafeInteger(result.waiting)||result.waiting<0)throw new Error('Invalid queue count');
   appWaiting=result.waiting;
  }catch{appWaiting=null}
  finally{waitingRequest=null;appUpdateLobby()}
 })();
 return waitingRequest;
}
function syncTapRoom(){
 if(!window.MATE_ANDROID)return;
 const lobby=!document.hidden && state.view==='pvp' && pvp.mode==='friend' && !pvp.match;
 let mode='off';
 if(lobby && !pvp.role && $('#appJoinRoom'))mode='read';
 if(lobby && pvp.role==='host' && pvp.conn==='waiting' && pvp.peer?.open && !pvp.peer.disconnected && /^\d{4}$/.test(pvp.roomCode))mode=pvp.roomCode;
 if(mode!==tapMode){
  tapMode=mode;
  window.MATE_NFC=window.prompt('sudoku:nfc',mode)==='on';
 }
 const tip=$('[data-tap-tip]');
 if(tip)tip.hidden=!window.MATE_NFC || !!tapFilledCode;
}
function receiveTapRoom(code){
 const field=$('#pvpRoomCode');
 if(!window.MATE_ANDROID || tapMode!=='read' || document.hidden || !field || !/^\d{4}$/.test(code))return;
 if(field.value && field.value!==tapFilledCode)return;
 tapFilledCode=code;
 pvp.joinCode=code;
 field.value=code;
 appUpdateLobby();
 syncTapRoom();
}
function mateBack(){
 if($('#appGuide').open){appCloseGuide();return true}
 if($('#appDialog').open){closeDialog();return true}
 if(!$('#selfAdOverlay').hidden){stopSelfVideoAd();return true}
 if(!$('#gameOver').hidden){endGameOver();return true}
 if(!$('#celebration').hidden){$('#celebration [data-action="celebration-close"]').click();return true}
 if(!$('#pvpOutcome').hidden){pvpHideOutcome();return true}
 if(state.view==='home')return false;
 const back=$('#appBack');
 switchView($('#detailBar').hidden?'home':back.dataset.view);
 return true;
}
function appOpenLobby(mode){
 pvp.mode=mode;
 if(mode==='friend'){tapFilledCode='';appFriendSettingsToGame()}
 finishAppNavigation('pvp');
 if(mode==='random')appRefreshWaiting();
}
function appResetLobby(){
 const mode=pvp.mode;
 pvpConnectionClose();
 pvp.mode=mode;
 appOpenLobby(mode);
 syncTapRoom();
}
function appFriendSettingsToGame(){
 pvp.format=friendSetup.players===4&&friendSetup.team?'team4':'solo'+friendSetup.players;
 for(const key of ['level','hearts','turnSeconds','matchMinutes'])pvp[key]=friendSetup[key];
}
function appStep(button){
 const {target,delta}=button.dataset;
 const isPlayers=target==='roomPlayers';
 const field=isPlayers?'players':'hearts';
 const min=isPlayers?2:1,max=isPlayers?4:10;
 friendSetup[field]=Math.min(max,Math.max(min,friendSetup[field]+Number(delta)));
 appFriendSettingsToGame();
 const output=document.getElementById(target);
 output.value=friendSetup[field];
 const minus=output.previousElementSibling,plus=output.nextElementSibling;
 minus.disabled=friendSetup[field]===min;
 plus.disabled=friendSetup[field]===max;
 if(button.disabled)(button===minus?plus:minus).focus({preventScroll:true});
 $('#roomTeamRow').hidden=friendSetup.players!==4;
 $('#roomTeamNote').hidden=friendSetup.players!==4||!friendSetup.team;
}

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-app-action]');
 if(!button||button.disabled)return;
 switch(button.dataset.appAction){
  case 'solo':switchView('catalog');break;
  case 'friends':appOpenLobby('friend');break;
  case 'world':appOpenLobby('random');break;
  case 'privacy':window.prompt('sudoku:privacy','show');break;
  case 'guide':appOpenGuide();break;
  case 'guide-next':
   if(++guideStep===guideSlides.length)appCloseGuide();
   else{appRenderGuide();$('.guide-next').focus()}
   break;
  case 'guide-close':appCloseGuide();break;
  case 'lobby-reset':appResetLobby();break;
  case 'step':appStep(button);break;
  case 'team':
   friendSetup.team=button.dataset.team==='true';
   appFriendSettingsToGame();
   $('#roomTeamNote').hidden=!friendSetup.team;
   button.parentElement.querySelectorAll('button').forEach(b=>b.ariaPressed=String(b===button));
   break;
 }
});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='pvpRoomCode'){tapFilledCode='';appUpdateLobby();syncTapRoom()}
 if(el.id==='pvpNickname')appWrite(nicknameKey,pvp.name);
 if(pvp.mode!=='friend')return;
 if(el.id==='pvpLevel'){
  friendSetup.level=pvp.level;friendSetup.turnSeconds=pvp.turnSeconds;friendSetup.matchMinutes=pvp.matchMinutes;
 }else if(el.id==='pvpTurnSeconds')friendSetup.turnSeconds=el.value;
 else if(el.id==='pvpMatchMinutes')friendSetup.matchMinutes=el.value;
});
document.addEventListener('toggle',event=>{
 if(event.target.matches('.room-advanced'))friendSetup.advanced=event.target.open;
},true);
document.addEventListener('submit',event=>{
 if(event.target.id!=='appJoinRoom')return;
 event.preventDefault();
 pvpGuestJoin();
});
$('#appGuide').addEventListener('cancel',event=>{event.preventDefault();appCloseGuide()});
document.addEventListener('visibilitychange',()=>{
 syncTapRoom();
 if(!document.hidden)appRefreshWaiting();
});
setInterval(appRefreshWaiting,12000);
const initialRenderPvp=pvpRender;
pvpRender=function(){
 initialRenderPvp();
 syncTapRoom();
};

const storedName=appRead(nicknameKey)?.trim().slice(0,20);
if(storedName)pvp.name=storedName;
appSetupNavigation();
render();
window.SUDOKU_I18N?.initialize();
const appInvite=new URLSearchParams(location.search).get('room');
if(/^\d{4}$/.test(appInvite||'')&&/^https?:$/.test(location.protocol))pendingInvite=appInvite;
requestAnimationFrame(()=>setTimeout(()=>{
 $('#appSplash').hidden=true;
 if(!appRead(guideKey))appOpenGuide();
 else if(pendingInvite){pendingInvite=null;pvpInviteFromURL()}
},matchMedia('(prefers-reduced-motion: reduce)').matches?0:400));
