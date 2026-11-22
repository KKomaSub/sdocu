'use strict';

const appText=(ko,en)=>window.SUDOKU_LANG==='en'?en:ko;
const appIcons={
 home:'⌂', solo:'▦', friends:'♟', world:'◎', custom:'✎', history:'◷', join:'↳', create:'+',
};
const appIcon=(name)=>'<span class="app-glyph glyph-'+name+'" aria-hidden="true">'+appIcons[name]+'</span>';
const guideKey='sudoku-mate-guide-v1';
const nicknameKey='sudoku-mate-nickname';
const appRead=key=>{try{return localStorage.getItem(key)}catch{return null}};
const appWrite=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const friendSetup={players:2,team:false,level:'medium',hearts:3,turnSeconds:20,matchMinutes:11,advanced:false};
let appWaiting=null;
let waitingRequest=null;
let nearby=false;
let nearbyRequest=false;
let nearbyRoom=null;
let nearbyWriting=false;
let nearbyRefreshAt=0;
let guideStep=0;
let guideReturn=null;
let pendingInvite=null;
const appHeroDigits=[['','4','',''],['2','','6',''],['','8','3',''],['','','','7']];
const appModes=[
 {key:'solo',title:appText('혼자 풀기','Solo'),description:appText('난이도별 300문제 · 타임어택','300 puzzles · Time Attack')},
 {key:'friends',title:appText('친구 대결','Friends'),description:appText('방 번호로 최대 4명과 대결','Use a room code · Up to 4 players')},
 {key:'world',title:appText('월드 매칭','World Match'),description:appText('전 세계 플레이어와 1:1 대결','Play 1v1 with players worldwide')},
];

function appArt(){
 return '<div class="hero-art" aria-hidden="true"><div class="hero-orbit"></div><div class="hero-board">'+
  appHeroDigits.flat().map((digit,i)=>'<span class="'+(i===10?'hero-tile-focus':i===6?'hero-tile-light':'')+'">'+digit+'</span>').join('')+
  '</div></div>';
}
function renderHome(){
 $('#main').innerHTML='<section class="app-hero"><div class="hero-copy"><span class="hero-tag">SUDOKU MATE</span><h1>'+
  appText('한 칸씩,<br>더 재밌게.','One square<br>at a time.')+'</h1><p>'+
  appText('혼자 풀고, 친구와 겨뤄 보세요.','Solve at your pace or challenge a friend.')+'</p></div>'+appArt()+'</section>'+
  '<section class="app-modes" aria-labelledby="modesTitle"><h2 id="modesTitle">'+appText('플레이 모드','Play modes')+'</h2><div class="mode-grid">'+
  appModes.map(({key,title,description})=>'<button type="button" class="app-mode mode-'+key+'" data-app-action="'+key+'">'+
   '<span class="mode-symbol">'+appIcon(key)+'</span><span class="mode-copy"><strong>'+title+'</strong><small>'+description+'</small></span>'+
   (key==='world'?'<span class="queue-tag" data-queue-count></span>':'')+'<span class="mode-chevron" aria-hidden="true"></span></button>').join('')+
  '</div></section>';
 appUpdateLobby();
 appRefreshWaiting();
}
function appSetupNavigation(){
 $('#appBrand').textContent=appText('스도쿠 메이트','Sudoku Mate');
 $('#appHelp').ariaLabel=$('#appHelp').title=appText('플레이 방법','How to play');
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
 {icon:'solo',title:appText('빈칸을 골라 숫자를 입력','Tap a cell and enter a number'),body:appText('가로줄, 세로줄, 3×3 구역마다 1부터 9까지 한 번씩 들어갑니다.','Each row, column and 3×3 box contains each number from 1 to 9 once.')},
 {icon:'custom',title:appText('헷갈리면 메모','Make a note'),body:appText('메모를 켜고 후보 숫자를 적어 보세요. 지우개로 지울 수 있고, 막힐 땐 힌트를 쓸 수 있어요.','Turn on Notes to mark possible numbers. Use Erase to clear an entry or Hint when you’re stuck.')},
 {icon:'friends',title:appText('같은 퍼즐로 대결','Race on the same puzzle'),body:appText('친구와는 4자리 방 번호로 만나고, 월드 매칭에서는 상대를 자동으로 찾아요.','Use a 4-digit room code with friends, or let World Match find an opponent.')},
];
function appRenderGuide(){
 const step=guideSlides[guideStep];
 const next=guideStep===guideSlides.length-1?appText('시작하기','Start playing'):appText('다음','Next');
 $('#appGuide').innerHTML='<div class="guide-head"><div class="guide-orb">'+appIcon(step.icon)+'</div><button type="button" class="guide-skip" data-app-action="guide-close">'+
  appText('건너뛰기','Skip')+'</button></div><h2 id="appGuideTitle">'+step.title+'</h2><p>'+step.body+'</p>'+
  (guideStep===0?'<div class="guide-example" aria-hidden="true"><span>4</span><span>2</span><span>9</span><span>6</span><span>1</span><span>8</span><span>5</span><span>3</span><span class="example-selected">7</span></div>':'')+
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

function lobbyHeading(icon,title,text){
 return '<div class="lobby-heading lobby-'+icon+'"><div class="mode-symbol">'+appIcon(icon)+'</div><div><h1>'+title+'</h1><p>'+text+'</p></div></div>';
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
  '<span id="nearbyBadge" class="queue-tag" role="status" hidden>'+appText('주변 방 발견','Nearby room found')+'</span></div>'+
  '<div class="room-join-row"><label class="sr-only" for="pvpRoomCode">'+appText('4자리 방 번호','4-digit room code')+'</label>'+
  '<input class="text-input room-code-input" id="pvpRoomCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required placeholder="0000" value="'+escapeHtml(pvp.joinCode)+'">'+
  '<button class="primary app-primary" type="submit">'+appText('입장','Join')+'</button></div></form>';
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
   '</ul><p class="room-note">'+appText('정원이 모두 차면 자동으로 시작해요.','The match starts automatically when the room is full.')+'</p></div>':'')+
  lobbyStatus()+lobbyBackButton(isHost?appText('방 닫기','Close room'):appText('입장 취소','Cancel join'))+'</div>';
}
function lobbyStatus(){
 const status=pvp.status||appText('연결을 준비 중이에요.','Getting connected…');
 return '<p class="lobby-status" role="status">'+escapeHtml(status)+'</p>';
}
function lobbyBackButton(text){
 return '<button type="button" class="ghost app-primary" data-app-action="lobby-reset">'+text+'</button>';
}
function worldLobby(){
 const busy=pvp.conn==='matching'||pvp.conn==='connecting'||pvpRandom.starting;
 return lobbyHeading('world',appText('월드 매칭','World Match'),appText('전 세계 플레이어와 1:1로 겨뤄요.','Challenge a player from anywhere in the world.'))+
  '<div class="lobby-card world-room"><span class="world-orb">'+appIcon('world')+'</span><span class="queue-tag" data-queue-count></span>'+
  '<h2>'+(busy?appText('상대를 찾는 중','Looking for an opponent'):appText('1:1 빠른 대결','Quick 1v1 match'))+'</h2>'+
  (busy||pvp.conn==='disconnected'?lobbyStatus():'<p class="room-note">'+appText('보통 난이도 · 하트 3개','Medium difficulty · 3 hearts')+'</p>')+
  (busy?lobbyAction('pvp-random-cancel',appText('매칭 취소','Cancel search'),'ghost'):
    lobbyAction('pvp-random-start',appText('상대 찾기','Find an opponent')))+'</div>'+
  (!busy?'<div class="lobby-card lobby-profile">'+lobbyName()+'</div>':'');
}
function pvpRenderLobby(){
 if(pvp.mode==='random')return worldLobby();
 return lobbyHeading('friends',appText('친구 대결','Friends'),appText('4자리 방 번호로 모여 같은 퍼즐을 풀어요.','Join with a 4-digit code and solve the same puzzle.'))+
  (pvp.role?friendRoomWaiting():'<div class="friend-layout"><div>'+friendJoinForm()+
   '<div class="lobby-card lobby-profile">'+lobbyName()+'</div></div>'+friendSettings()+'</div>');
}

function appUpdateLobby(){
 const count=appWaiting;
 document.querySelectorAll('[data-queue-count]').forEach(el=>{
  const text=count===null?appText('대기 인원 확인 불가','Queue count unavailable'):
   appText('매칭 대기 '+count.toLocaleString('ko-KR')+'명',count.toLocaleString('en-US')+' waiting');
  if(el.textContent!==text)el.textContent=text;
  el.classList.toggle('is-live',count!==null);
 });
 const badge=$('#nearbyBadge');
 if(badge)badge.hidden=!nearby;
 $('.join-room')?.classList.toggle('nearby-room',nearby);
}
async function appRefreshWaiting(){
 if(document.hidden||!(state.view==='home'||state.view==='pvp'&&pvp.mode==='random')||!/^https?:$/.test(location.protocol))return;
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
function appNearbyAPI(body){
 const options={cache:'no-store',signal:AbortSignal.timeout(5000)};
 if(body)Object.assign(options,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:body.action==='close'});
 return fetch('/api/nearby',options);
}
async function appNearbyLease(){
 if(!/^https?:$/.test(location.protocol)||nearbyWriting)return;
 const hosting=state.view==='pvp'&&pvp.mode==='friend'&&pvp.role==='host'&&pvp.conn==='waiting'&&pvp.roomCode&&!pvp.match;
 const code=hosting?pvp.roomCode:'';
 if(nearbyRoom?.code===code&&Date.now()-nearbyRefreshAt<12000)return;
 nearbyWriting=true;
 try{
  if(nearbyRoom&&nearbyRoom.code!==code){
   const prior=nearbyRoom;
   nearbyRoom=null;
   await appNearbyAPI({action:'close',lease:prior.lease}).catch(()=>{});
  }
  if(code){
   if(!nearbyRoom)nearbyRoom={code,lease:crypto.randomUUID()};
   const response=await appNearbyAPI({action:'publish',lease:nearbyRoom.lease});
   if(response.ok)nearbyRefreshAt=Date.now();
  }
 }catch{}finally{nearbyWriting=false}
}
async function appCheckNearby(){
 if(nearbyRequest||document.hidden||!$('#appJoinRoom')||!/^https?:$/.test(location.protocol))return;
 nearbyRequest=true;
 try{
  const response=await appNearbyAPI();
  const data=response.ok?await response.json():null;
  nearby=data?.nearby===true;
 }catch{nearby=false}finally{nearbyRequest=false;appUpdateLobby()}
}
function appOpenLobby(mode){
 pvp.mode=mode;
 if(mode==='friend'){nearby=false;appFriendSettingsToGame()}
 finishAppNavigation('pvp');
 if(mode==='friend')appCheckNearby();
 else appRefreshWaiting();
}
function appResetLobby(){
 const mode=pvp.mode;
 pvpConnectionClose();
 pvp.mode=mode;
 appOpenLobby(mode);
 appNearbyLease();
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
 if(!document.hidden){appRefreshWaiting();appCheckNearby();appNearbyLease()}
});
window.addEventListener('pagehide',()=>{
 if(nearbyRoom)appNearbyAPI({action:'close',lease:nearbyRoom.lease}).catch(()=>{});
});
setInterval(appRefreshWaiting,12000);
setInterval(()=>{appNearbyLease();appCheckNearby()},3500);
const initialRenderPvp=pvpRender;
pvpRender=function(){
 initialRenderPvp();
 appNearbyLease();
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
