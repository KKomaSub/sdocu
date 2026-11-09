'use strict';
// Cloudflare Pages Functions + D1 random matchmaking. Friend invites stay PeerJS-only.
// The game already defines pvpRandomStart(), pvpRandomStop(), pvpRenderLobby() and state.
const originalPvpRenderLobby = pvpRenderLobby;
pvpRandom.generation = 0;
pvpRandom.token = null;
function pagesMatchAPI(method, body, token) {
 const path = '/api/match' + (token ? '?token=' + encodeURIComponent(token) : '');
 return fetch(path, {
  method, cache: 'no-store',
  headers: body ? {'Content-Type':'application/json'} : {},
  body: body ? JSON.stringify(body) : undefined,
 }).then(async response => {
  let obj;
  try { obj = await response.json(); }
  catch { throw Error('매칭 서버 응답을 읽을 수 없습니다.'); }
  if(!response.ok) throw Error(obj.error || '매칭 서버 오류');
  return obj;
 });
}
pvpRandomStop = function(){
 const q=pvpRandom,token=q.token;
 q.generation++;
 q.token=null;
 clearInterval(q.heartbeat);clearTimeout(q.timeout);
 q.heartbeat=null;q.timeout=null;q.starting=false;
 if(token)pagesMatchAPI('POST',{action:'leave',token}).catch(()=>{});
};
function pagesMatched(result,peer,generation){
 if(generation!==pvpRandom.generation||pvp.peer!==peer||pvp.mode!=='random')return;
 if(result.role!=='host'&&result.role!=='guest')return;
 pvpRandom.token=null;
 pvpRandom.autoStart=true;
 pvp.role=result.role;
 pvp.peerName=String(result.name||'상대').slice(0,20);
 pvp.conn='connecting';
 pvpRandomStop();
 if(result.role==='guest'){
  const dc=peer.connect(result.peerId,{reliable:true,serialization:'json'});
  pvpBindChannel(dc);
 }
 pvpStatus('상대를 찾았습니다. 연결 중입니다.');
 pvpRandom.timeout=setTimeout(()=>{
  if(pvp.conn!=='connected'){
   pvpStatus('상대에게 연결할 수 없습니다. 다시 시도해 주세요.');
   pvpRandom.autoStart=false;
  }
 },18000);
}
async function pagesPoll(peer,generation){
 if(generation!==pvpRandom.generation||pvp.peer!==peer||!pvpRandom.token)return;
 try{
  const status=await pagesMatchAPI('GET',null,pvpRandom.token);
  if(generation!==pvpRandom.generation||pvp.peer!==peer)return;
  if(status.type==='pair'){pagesMatched(status,peer,generation);return;}
  if(status.type!=='waiting')throw Error('올바르지 않은 대기열 상태');
  pvp.conn='matching';pvpStatus('상대를 기다리는 중입니다.');
 }catch(err){
  if(generation!==pvpRandom.generation)return;
  pvpRandomStop();pvp.conn='disconnected';pvpStatus('매칭 오류: '+err.message);
 }
}
pvpRandomStart = async function(){
 if(pvp.creating||pvpRandom.starting)return;
 if(!/^https?:$/.test(location.protocol)){
  notify('랜덤 매칭은 HTTPS 웹사이트에서 사용할 수 있습니다.');return;
 }
 pvpCaptureName();pvpConnectionClose();
 pvp.mode='random';pvp.role='waiting';pvp.conn='connecting';
 pvpRandom.starting=true;
 const generation=pvpRandom.generation;
 pvpStatus('대기열에 연결 중입니다.');
 try{
  const Peer=await pvpLoadPeerJS();
  if(generation!==pvpRandom.generation||pvp.mode!=='random')return;
  const peer=new Peer({config:{iceServers:PVP_ICE_SERVERS}});
  pvp.peer=peer;
  peer.on('connection',conn=>{
   if(pvp.peer!==peer||pvp.role!=='host'){conn.close();return;}
   pvpBindChannel(conn);
  });
  peer.on('open',async()=>{
   if(generation!==pvpRandom.generation||pvp.peer!==peer)return;
   try{
    const joined=await pagesMatchAPI('POST',{action:'join',peerId:peer.id,name:pvp.name});
    if(generation!==pvpRandom.generation||pvp.peer!==peer){
     if(joined.token)pagesMatchAPI('POST',{action:'leave',token:joined.token}).catch(()=>{});
     return;
    }
    if(joined.type==='pair'){
     pvpRandom.token=joined.token;pagesMatched(joined,peer,generation);return;
    }
    if(joined.type!=='waiting'||!joined.token)throw Error('매칭 서버 응답이 잘못되었습니다.');
    pvpRandom.token=joined.token;pvp.conn='matching';
    pvpStatus('상대를 기다리는 중입니다.');
    pvpRandom.heartbeat=setInterval(()=>pagesPoll(peer,generation),2500);
   }catch(err){
    if(generation!==pvpRandom.generation)return;
    pvpRandomStop();pvp.conn='disconnected';pvpStatus('매칭 오류: '+err.message);
   }
  });
  peer.on('error',()=>{
   if(pvp.peer!==peer)return;
   pvpRandomStop();pvp.conn='disconnected';
   pvpStatus('연결 오류가 발생했습니다. 다시 시도해 주세요.');
  });
 }catch(err){
  if(generation!==pvpRandom.generation)return;
  pvpRandomStop();pvp.conn='disconnected';
  pvpStatus('P2P 연결 모듈을 불러오지 못했습니다.');
 }
};
pvpRenderLobby = function(){
 const original=originalPvpRenderLobby();
 if(pvp.mode!=='random')return original;
 return original.replace(/<label for="pvpRandomEndpoint">[\s\S]*?(?=<button class="primary" data-action="pvp-random-start")/, '');
};