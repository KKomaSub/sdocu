'use strict';
/* Friend multiplayer (3, 4, 2v2). Separate from legacy two-player and D1 queue. */
const multi={active:false,host:false,format:'solo2',seat:0,channels:new Map(),names:[],solution:null,pending:false,scheduled:false,saved:false,notes:{}};
const multiFormats={solo2:{count:2,team:false,ko:'2인 개인전',en:'2-player duel'},solo3:{count:3,team:false,ko:'3인 개인전',en:'3-player free-for-all'},solo4:{count:4,team:false,ko:'4인 개인전',en:'4-player free-for-all'},team4:{count:4,team:true,ko:'4인 2:2 팀전',en:'4-player 2v2 teams'}};
pvp.format=pvp.format||'solo2';
const multiT=(ko,en)=>window.SUDOKU_LANG==='en'?en:ko;
const multiFormatTitle=f=>multiFormats[f]?(window.SUDOKU_LANG==='en'?multiFormats[f].en:multiFormats[f].ko):f;
const multiWire=(dc,payload)=>{if(!dc?.open)return false;try{dc.send(JSON.stringify(payload));return true}catch(e){return false}};
const multiGroup=()=>pvp.match?.players[multi.seat]?.team;
const multiRand=n=>{if(n<2)return 0;const a=new Uint32Array(1),size=4294967296,cap=size-size%n;let v;do{crypto.getRandomValues(a);v=a[0]}while(v>=cap);return v%n};
function multiShuffle(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=multiRand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function multiCleanup(keep=false){
 for(const dc of multi.channels.values())try{dc.close()}catch(e){}
 multi.channels=new Map();multi.names=[];multi.solution=null;multi.pending=false;multi.scheduled=false;multi.notes={};multi.saved=false;
 if(!keep){multi.active=false;multi.host=false;multi.seat=0;multi.format='solo2'}
}
const multiOldClose=pvpConnectionClose;
pvpConnectionClose=function(){multiCleanup();multiOldClose()};
const multiOldStop=pvpStopTransport;
pvpStopTransport=function(keep=false){if(multi.active)multiCleanup(keep);multiOldStop(keep)};
const multiOldHostCreate=pvpHostCreate;
pvpHostCreate=function(){if(pvp.mode==='friend'&&pvp.format!=='solo2')return multiCreateRoom();return multiOldHostCreate()};
const multiOldInput=pvpInput;
pvpInput=function(e){if(e.target.id==='pvpFormat'){if(!pvp.role&&multiFormats[e.target.value])pvp.format=e.target.value;return}multiOldInput(e)};
function multiLobby(){
 if(!multi.active||!multi.host)return;
 const count=multi.names.filter(Boolean).length,capacity=multiFormats[multi.format].count;
 pvp.conn='waiting';pvp.status=multiT('참가자 대기','Waiting for players')+' '+count+'/'+capacity;
 for(const [seat,dc] of multi.channels){
  multiWire(dc,{type:'multi-lobby',format:multi.format,seat,players:multi.names,required:capacity});
 }
 pvpRender();
}
function multiHostChannel(dc){
 if(!multi.active||!multi.host){try{dc.close()}catch(e){}return}
 let seat=-1;
 dc.on('data',data=>{
  if(!multi.active||!multi.host)return;
  let msg;try{msg=typeof data==='string'?JSON.parse(data):data}catch(e){return}
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='hello'&&seat===-1){
   if(pvp.match){multiWire(dc,{type:'multi-error',text:multiT('이미 시작한 방입니다.','Match already started.')});dc.close();return}
   const open=Array.from({length:multiFormats[multi.format].count-1},(_,i)=>i+1).find(i=>!multi.channels.has(i));
   if(open===undefined){multiWire(dc,{type:'multi-error',text:multiT('방이 가득 찼습니다.','Room full.')});dc.close();return}
   seat=open;multi.channels.set(seat,dc);multi.names[seat]=String(msg.name||'Player').slice(0,20);
   multiLobby();
   if(multi.names.filter(Boolean).length===multiFormats[multi.format].count&&!multi.scheduled){
    multi.scheduled=true;setTimeout(()=>{
     multi.scheduled=false;
     if(multi.active&&multi.host&&!pvp.match&&multi.names.filter(Boolean).length===multiFormats[multi.format].count)multiStart();
    },300)
   }
   return;
  }
  if(seat<0||multi.channels.get(seat)!==dc||!pvp.match)return;
  if(msg.type==='multi-move')multiMove(seat,Number(msg.index),Number(msg.digit));
  if(msg.type==='multi-clear')multiClear(seat,Number(msg.index));
  if(msg.type==='multi-forfeit')multiDrop(seat);
 });
 dc.on('close',()=>{if(multi.active&&multi.host&&seat>=0&&multi.channels.get(seat)===dc){multi.channels.delete(seat);multiDrop(seat)}});
 dc.on('error',()=>{if(multi.active&&multi.host&&seat>=0&&multi.channels.get(seat)===dc){multi.channels.delete(seat);multiDrop(seat)}});
}
async function multiCreateRoom(){
 if(pvp.role||pvp.creating||!pvpReadHostSettings())return;
 pvpCaptureName();pvpConnectionClose();pvp.mode='friend';pvp.role='host';pvp.conn='connecting';pvp.creating=true;
 multi.active=true;multi.host=true;multi.format=pvp.format;multi.seat=0;multi.names=[pvp.name];
 pvpStatus(multiT('방 생성 중','Creating room...'));
 try{
  const Peer=await pvpLoadPeerJS();if(!multi.active||!multi.host||!pvp.creating)return;
  let count=0;
  const attempt=()=>{
   if(!multi.active||!multi.host||!pvp.creating)return;
   if(++count>8){pvp.creating=false;pvpStatus(multiT('방 생성 실패','Room creation failed'));return}
   const code=pvpNewCode(),peer=new Peer(PVP_ID_PREFIX+code,{config:{iceServers:PVP_ICE_SERVERS}});
   pvp.peer=peer;
   peer.on('open',()=>{if(pvp.peer!==peer)return;pvp.roomCode=code;pvp.creating=false;multiLobby()});
   peer.on('connection',dc=>{if(peer!==pvp.peer){dc.close();return}multiHostChannel(dc)});
   peer.on('error',e=>{if(peer!==pvp.peer)return;if(e.type==='unavailable-id'){peer.destroy();pvp.peer=null;attempt();return}pvp.creating=false;pvp.conn='disconnected';pvpStatus(multiT('방을 만들 수 없습니다.','Unable to create room.'))});
  };
  attempt();
 }catch(e){pvp.creating=false;pvp.conn='disconnected';pvpStatus(multiT('연결 준비에 실패했습니다.','Connection preparation failed.'))}
}
function multiSnapshot(event=''){
 const m=pvp.match;if(!m)return;
 for(const dc of multi.channels.values())multiWire(dc,{type:'multi-sync',match:m,hostNow:Date.now(),event});
 pvpRender();
}
function multiStart(){
 if(!multi.active||!multi.host||pvp.match)return;
 const n=multiFormats[multi.format].count,team=multi.format==='team4';
 const givens=randomPuzzle(pvp.level),sol=findSudokuSolution(givens)?.solution;
 if(!sol){notify(multiT('스도쿠 생성 실패','Could not generate Sudoku'));return}
 const now=Date.now(),start=now+5000,turn=Number(pvp.turnSeconds)*1000,limit=Number(pvp.matchMinutes)*60000,lives=Number(pvp.hearts);
 const places=team?multiShuffle([0,1,2,3]):[0,1,2,3];
 const players=Array.from({length:n},(_,i)=>({name:multi.names[i]||'Player',team:team?(places.indexOf(i)<2?0:1):i,left:false}));
 const groups=Array.from({length:team?2:n},()=>({answers:EMPTY,mistakes:EMPTY,score:0,lives,deadline:start+turn,correct:0,wrong:0,timeouts:0,done:false}));
 pvp.match={id:'mm'+now.toString(36)+multiRand(100000),format:multi.format,level:pvp.level,givens,startedAt:start,endAt:start+limit,turnMs:turn,maxLives:lives,players,groups,finished:false,winner:null,reason:''};
 multi.solution=sol;multi.notes={};multi.pending=false;multi.saved=false;multi.seat=0;
 pvp.selected=Math.max(0,givens.indexOf('0'));pvp.clockOffset=0;pvp.outcomeShown=null;
 for(const dc of multi.channels.values())multiWire(dc,{type:'multi-start',match:pvp.match,hostNow:now});
 pvpRender();
}
function multiValid(m){
 const f=multiFormats[m?.format];if(!f||m.format==='solo2')return false;
 if(typeof m.id!=='string'||m.id.length>50||!PVP_LEVELS[m.level]||!/^[0-9]{81}$/.test(m.givens||'')
 ||!Number.isFinite(m.startedAt)||!Number.isFinite(m.endAt)||m.endAt-m.startedAt<60000||m.endAt-m.startedAt>7200000
 ||!Number.isInteger(m.turnMs)||m.turnMs<5000||m.turnMs>120000||!Number.isInteger(m.maxLives)||m.maxLives<1||m.maxLives>10
 ||!Array.isArray(m.players)||m.players.length!==f.count||!Array.isArray(m.groups)||m.groups.length!==(f.team?2:f.count))return false;
 if(!m.players.every(p=>typeof p?.name==='string'&&p.name.length<=30&&Number.isInteger(p.team)&&p.team>=0&&p.team<m.groups.length))return false;
 if(!m.groups.every(g=>/^[0-9]{81}$/.test(g?.answers||'')&&/^[0-9]{81}$/.test(g.mistakes||'')&&Number.isInteger(g.lives)&&g.lives>=0&&g.lives<=m.maxLives&&Number.isFinite(g.score)&&Number.isFinite(g.deadline)&&Number.isInteger(g.correct)))return false;
 if(f.team)return m.groups.every((_,i)=>m.players.filter(p=>p.team===i).length===2);
 return m.players.every((p,i)=>p.team===i);
}
function multiEnd(reason,winner=null){
 const m=pvp.match;if(!multi.active||!multi.host||!m||m.finished)return;
 if(winner===null){const max=Math.max(...m.groups.map(g=>g.score)),leaders=m.groups.map((g,i)=>g.score===max?i:-1).filter(i=>i>=0);winner=leaders.length===1?leaders[0]:null}
 m.finished=true;m.reason=reason;m.winner=winner;multiSnapshot(reason);pvpSaveResult();pvpShowOutcome();
}
function multiTick(){
 const m=pvp.match;if(!multi.active||!multi.host||!m||m.finished||Date.now()<m.startedAt)return;
 const now=Date.now();if(now>=m.endAt){multiEnd(multiT('경기 시간 종료','Match time expired'));return}
 let changed=false;
 for(const g of m.groups)if(g.lives>0&&!g.done&&now>=g.deadline){
  const missed=Math.max(1,Math.floor((now-g.deadline)/m.turnMs)+1);
  g.timeouts+=missed;g.score-=missed*6;g.deadline+=missed*m.turnMs;changed=true;
 }
 if(changed)multiSnapshot(multiT('시간 초과','Move timed out'));
}
function multiMove(seat,index,digit){
 const m=pvp.match;if(!multi.active||!multi.host||!m||m.finished||Date.now()<m.startedAt
 ||!Number.isInteger(seat)||seat<0||seat>=m.players.length||m.players[seat].left
 ||!Number.isInteger(index)||index<0||index>80||!Number.isInteger(digit)||digit<1||digit>9)return;
 multiTick();if(m.finished)return;
 const g=m.groups[m.players[seat].team];if(!g||g.done||g.lives===0||m.givens[index]!=='0')return;
 // Both teammates may submit the same cell at almost the same time: acknowledge without scoring twice.
 if(g.answers[index]!=='0'){multiSnapshot();return}
 const now=Date.now(),speed=Math.max(0,Math.min(10,Math.floor(10*Math.max(0,g.deadline-now)/m.turnMs)));
 const correct=String(digit)===multi.solution[index];
 if(correct){g.answers=setAt(g.answers,index,String(digit));g.mistakes=setAt(g.mistakes,index,'0');g.score+=10+speed;g.correct++;if(g.correct>=m.givens.split('').filter(c=>c==='0').length){g.done=true;g.score+=30}}
 else{g.mistakes=setAt(g.mistakes,index,String(digit));g.wrong++;g.score-=17;g.lives=Math.max(0,g.lives-1)}
 g.deadline=now+m.turnMs;
 if(g.done){multiEnd(multiT('퍼즐 먼저 완성','First to finish'),m.players[seat].team);return}
 const alive=m.groups.map((x,i)=>x.lives>0?i:-1).filter(i=>i>=0);
 if(alive.length===1){multiEnd(multiT('하트 소진','Out of hearts'),alive[0]);return}
 if(alive.length===0){multiEnd(multiT('하트 소진','Out of hearts'));return}
 multiSnapshot(correct?m.players[seat].name+' ✓':m.players[seat].name+' ✕');
 if(!correct&&seat===0)pvpAnimateWrongCell(index);
}
function multiClear(seat,index){
 const m=pvp.match;if(!multi.active||!multi.host||!m||m.finished||Date.now()<m.startedAt
 ||!Number.isInteger(seat)||seat<0||seat>=m.players.length||m.players[seat].left||!Number.isInteger(index)||index<0||index>80)return;
 const g=m.groups[m.players[seat].team];if(!g||g.lives===0||g.done||m.givens[index]!=='0'||g.answers[index]!=='0'||g.mistakes[index]==='0')return;
 g.mistakes=setAt(g.mistakes,index,'0');multiSnapshot();
}
function multiDrop(seat){
 const m=pvp.match;if(!multi.active||!multi.host||seat<1)return;
 if(!m){multi.names[seat]=null;multiLobby();return}
 if(m.finished||m.players[seat].left)return;
 m.players[seat].left=true;const id=m.players[seat].team;
 if(m.format==='team4'){multiEnd(multiT('팀원 연결 종료','A teammate left'),1-id);return}
 m.groups[id].lives=0;
 const alive=m.groups.map((g,i)=>g.lives>0?i:-1).filter(i=>i>=0);
 if(alive.length===1)multiEnd(multiT('참가자 연결 종료','A player left'),alive[0]);else multiSnapshot(multiT('참가자 연결 종료','A player left'));
}
const multiOldFinishedLocal=pvpFinishedLocal;
pvpFinishedLocal=function(reason,winner){
 if(!multi.active||!pvp.match?.format)return multiOldFinishedLocal(reason,winner);
 const m=pvp.match;if(!m||m.finished)return;
 m.finished=true;m.reason=multiT('방장 연결 종료','Host disconnected');m.winner=null;
 pvpSaveResult();if(state.view==='pvp')pvpRender();pvpShowOutcome();
};
const multiOldReceived=pvpReceived;
pvpReceived=function(m){
 if((m?.type==='multi-lobby')&&pvp.role==='guest'){
  if(!multiFormats[m.format]||m.format==='solo2'||!Number.isInteger(m.seat)||m.seat<1||m.seat>=multiFormats[m.format].count)return;
  multi.active=true;multi.host=false;multi.format=m.format;multi.seat=m.seat;multi.names=Array.isArray(m.players)?m.players:[];
  pvp.mode='friend';pvp.conn='waiting';pvpRender();return;
 }
 if(m?.type==='multi-error'&&pvp.role==='guest'){notify(m.text||'Room error');return}
 if(m?.type==='multi-start'&&pvp.role==='guest'){
  if(!multiValid(m.match)||!multi.active||multi.seat>=m.match.players.length)return;
  pvp.match=m.match;multi.format=m.match.format;multi.pending=false;multi.saved=false;multi.notes={};
  pvp.clockOffset=(Number(m.hostNow)||Date.now())-Date.now();pvp.selected=Math.max(0,m.match.givens.indexOf('0'));pvp.outcomeShown=null;pvp.conn='connected';pvpRender();return;
 }
 if(m?.type==='multi-sync'&&pvp.role==='guest'&&multi.active){
  if(!multiValid(m.match)||!pvp.match||m.match.id!==pvp.match.id)return;
  const before=pvp.match.groups[multiGroup()];
  pvp.match=m.match;pvp.clockOffset=(Number(m.hostNow)||Date.now())-Date.now();multi.pending=false;
  if(pvp.match.finished)pvpSaveResult();
  pvpRender();if(before?.lives>pvp.match.groups[multiGroup()]?.lives)pvpAnimateWrongCell(pvp.selected);
  if(pvp.match.finished)pvpShowOutcome();return;
 }
 multiOldReceived(m);
};
const multiOldTick=pvpHostTick;
pvpHostTick=function(){if(multi.active)return multiTick();return multiOldTick()};
const multiOldSubmit=pvpSubmitDigit;
pvpSubmitDigit=function(digit){
 if(!multi.active||!pvp.match?.format)return multiOldSubmit(digit);
 const m=pvp.match,index=pvp.selected,g=m.groups[multiGroup()];
 if(!g||m.finished||pvpBeforeStart()||g.lives===0||g.done||!Number.isInteger(index)||index<0||index>80||m.givens[index]!=='0'||g.answers[index]!=='0'||!Number.isInteger(digit)||digit<1||digit>9)return;
 if(pvp.noteMode){multi.notes[index]=(multi.notes[index]||0)^(1<<(digit-1));pvpRender();return}
 if(multi.host)multiMove(0,index,digit);
 else if(!multi.pending&&multiWire(pvp.dc,{type:'multi-move',index,digit})){multi.pending=true;setTimeout(()=>{if(multi.pending){multi.pending=false;pvpRender()}},1300)}
};
const multiOldClear=pvpClearSelected;
pvpClearSelected=function(){
 if(!multi.active||!pvp.match?.format)return multiOldClear();
 const m=pvp.match,index=pvp.selected,g=m.groups[multiGroup()];
 if(!g||m.finished||pvpBeforeStart()||g.lives===0||g.done||m.givens[index]!=='0')return;
 if(pvp.noteMode){delete multi.notes[index];pvpRender();return}
 if(g.answers[index]!=='0'||g.mistakes[index]==='0')return;
 if(multi.host)multiClear(0,index);
 else if(!multi.pending&&multiWire(pvp.dc,{type:'multi-clear',index})){multi.pending=true;setTimeout(()=>{if(multi.pending){multi.pending=false;pvpRender()}},1300)}
};
window.addEventListener('pagehide',()=>{if(multi.active&&!multi.host&&pvp.match&&!pvp.match.finished)multiWire(pvp.dc,{type:'multi-forfeit'})});
