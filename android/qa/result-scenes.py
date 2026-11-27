"""Exercise the packaged results and their motion settings at a narrow viewport."""
from pathlib import Path
import re
import subprocess
import tempfile
from zipfile import ZipFile

checks = """
const check=(value,message)=>{if(!value)throw Error(message)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
check(reduced===REDUCED,'motion preference');
state.history=[{id:'b001'},{id:'b001'},{id:'b002'}];
window.SUDOKU_LANG='ko';
renderHome();
check(document.querySelector('.solo-stats small').textContent==='2문제 완료','home count');
state.view='catalog';render();
check(document.querySelector('.catalog-completed').textContent==='2문제 완료','catalog count');
function scene(id,symbol,animation){
 const card=document.querySelector(id);
 const art=card.querySelector(symbol);
 const rect=card.getBoundingClientRect();
 check(rect.height>0 && rect.top>=0 && rect.bottom<=innerHeight+1,'card bounds '+id);
 check(getComputedStyle(art).animationName===(reduced?'none':animation),'symbol motion '+symbol);
}
check(timeMode(),'fresh install starts in Time Attack');
check(normalizeState({}).playMode==='time','default for saves without a mode');
const previous=normalizeState({playMode:'normal',progress:{b001:{answers:EMPTY,notes:{3:64}}}});
check(previous.playMode==='time','upgrade defaults to Time Attack');
check(previous.progress.b001.notes[3]===64,'upgrade preserves practice notes');
openGame('b001');
check(document.querySelector('.mode-btn.active').textContent==='타임어택','first puzzle opens in Time Attack');
document.querySelector('[data-action="mode-normal"]').click();
check(document.querySelector('.mode-btn.active').textContent==='연습 모드','practice tab label and selection');
check(loadState().playMode==='time','relaunch defaults to Time Attack');
openGame('b002');
check(document.querySelector('.mode-btn.active').textContent==='타임어택','new puzzle defaults to Time Attack');
state.progress.b002={answers:EMPTY,notes:{3:64}};
state.view='home';renderHome();
document.querySelector('.home-resume').click();
check(!timeMode() && state.progress.b002.notes[3]===64,'continue saved practice from home');
startTimeAttack();
const run=runOf(state.activeId);
let now=performance.now();
Object.defineProperty(performance,'now',{configurable:true,value:()=>now});
now+=1200;
switchView('catalog');
const paused=elapsedAttack(run);
now+=60000;
check(elapsedAttack(run)===paused,'catalog pauses active puzzle');
check(document.querySelector('[data-id="b002"].number-card').classList.contains('in-progress'),'timed puzzle in progress');
openGame('b003');startTimeAttack();
now+=3000;
check(elapsedAttack(run)===paused,'other puzzle does not advance first clock');
openGame('b002');
now+=900;
check(elapsedAttack(run)===paused+900,'resume exact puzzle clock');
const tab=()=>document.querySelector('[data-action="mode-normal"]').click();
const dialog=document.querySelector('#appDialog');
tab();
check(dialog.open && timeMode(),'ask before discarding an active run');
document.querySelector('[data-action="dialog-cancel"]').click();
now+=1300;
check(!dialog.open && timeMode() && runOf('b002')===run && elapsedAttack(run)===paused+2200,'cancel keeps running');
tab();
document.querySelector('[data-action="dialog-confirm"]').click();
check(!timeMode() && !runOf('b002') && !loadState().timeAttackRuns.b002,'confirm discards persisted attempt');
check(runOf('b003').status==='running' && state.progress.b002.notes[3]===64,'other attempts and practice remain');
switchPlayMode('time');
check(!runOf('b002') && document.querySelector('[data-action="time-start"]'),'fresh start after discard');
startTimeAttack();
now+=45000;
for(let i=0;i<3;i++)loseTimeAttackLife(3);
check(loadState().timeAttackRuns.b002.status==='lost','zero hearts persists failure');
const cards=document.createElement('div');cards.innerHTML=catalogCardsHtml();
const card=id=>cards.querySelector('[data-id="'+id+'"]');
check(card('b002').querySelector('small').textContent==='시작 전' && !card('b002').classList.contains('in-progress'),'lost run gets a fresh catalog card');
check(customProgressLabel({id:'b002'})==='시작 전','custom list handles a lost attempt');
check(state.progress.b002.notes[3]===64,'practice notes survive the loss');
check(!document.querySelector('#toast').classList.contains('visible'),'no wrong-answer toast');
check(card('b003').classList.contains('in-progress') && card('b004').querySelector('small').textContent==='시작 전','running and unstarted remain distinct');
delete performance.now;
showGameOver();
scene('.gameover-card','.heart-left','heart-crack-left');
check(document.querySelector('#gameOverTime').textContent.includes('45'),'elapsed time');
const rewardButton=document.querySelector('#reviveAdBtn');
const inlineReward=document.querySelector('[data-ad-slot="board"]');
window.prompt=(msg)=>msg==='sudoku:reward'?'ok':'';
function centeredLoader(button){
 const middle=(r,axis)=>axis==='y'?r.top+r.height/2:r.left+r.width/2;
 const box=button.getBoundingClientRect(),icon=button.querySelector('.ad-spinner').getBoundingClientRect(),label=button.querySelector('span').getBoundingClientRect();
 check(box.height>0 && Math.abs(middle(box,'y')-middle(icon,'y'))<1.5 && Math.abs(middle(label,'y')-middle(icon,'y'))<1.5,'vertical spinner alignment '+button.dataset.adSlot);
 check(Math.abs((icon.left+label.right)/2-middle(box,'x'))<1.5,'horizontal loader alignment '+button.dataset.adSlot);
}
rewardButton.click();
centeredLoader(rewardButton);
check(rewardButton.disabled && rewardButton.querySelector('.ad-spinner') && !inlineReward.disabled,'load on tapped modal button');
mateAdResult(nativeAd.token,'closed');
check(!rewardButton.disabled && !rewardButton.querySelector('.ad-spinner'),'restore cancelled reward');
endGameOver();
inlineReward.click();
renderPlay();
centeredLoader(document.querySelector('[data-ad-slot="board"]'));
check(document.querySelector('[data-ad-slot="board"]').disabled && !rewardButton.disabled,'inline reward survives re-render');
mateAdResult(nativeAd.token,'earned');
check(runOf('b002').lives===1,'revive rewarded');
runOf('b002').hintsUsed=MAX_HINTS;renderPlay();
const hint=document.querySelector('[data-action="ad-hint"]');
hint.click();centeredLoader(hint);check(hint.disabled && hint.querySelector('.ad-spinner'),'hint loading on tapped button');
mateAdResult(nativeAd.token,'unavailable');check(!hint.disabled,'hint re-enabled on failure');
loseTimeAttackLife(3);
switchView('catalog');openGame('b002');
check(!runOf('b002') && document.querySelector('[data-action="time-start"]') && !document.querySelector('[data-ad-slot="board"]'),'reopen lost attempt at start');
check(state.progress.b002.notes[3]===64,'new time attack preserves practice');
pvp.role='host';
for(const [winner,kind,part,animation] of [[1,'lose','.flag-cloth','finish-unfurl'],[0,'win','.medal-face','medal-land'],[null,'tie','.tie-first','rings-meet']]){
 pvp.match={id:kind,finished:true,winner,players:[{lives:1,score:6},{lives:1,score:4}]};
 pvpShowOutcome();
 const visible=[...document.querySelectorAll('#pvpOutcomeCard .result-art > g')].filter(g=>getComputedStyle(g).display!=='none');
 check(visible.length===1 && visible[0].querySelector(part),'outcome illustration '+kind);
 scene('#pvpOutcomeCard',part,animation);
 pvpHideOutcome();
}
launchVictory('1');
scene('.celebration-card','.medal-face','medal-land');
endVictory();
pvp.match=null;pvp.role=null;
let joined='';
pvpGuestJoin=()=>{joined=pvp.joinCode};
inviteReady=true;
receiveRoomInvite('0007');
check(state.view==='pvp' && pvp.mode==='friend' && joined==='0007','received invitation joins exact room');
receiveRoomInvite('abcd');check(joined==='0007','ignore malformed invite');
pvp.role='host';pvp.roomCode='0007';pvp.conn='waiting';pvpRender();
let shared='';
window.prompt=(msg,value)=>{if(msg==='sudoku:share')shared=value;return 'ok'};
document.querySelector('[data-action="pvp-share"]').click();
check(shared==='0007' && pvpShareURL().endsWith('/invite?room=0007'),'open native share with hosted room');
"""
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    apk = next(Path('android/build/outputs/apk/release').glob('*-unsigned.apk'))
    with ZipFile(apk) as archive:
        for name in archive.namelist():
            if name.startswith('assets/'):
                archive.extract(name, root)
    assets = root / 'assets'
    index = (assets / 'index.html').read_text()
    # Desktop Chrome has no native Android prompt handler. Keep network and
    # onboarding independent from the result scenes exercised here.
    stub = "<script>window.prompt=()=>'';window.fetch=()=>Promise.reject(Error('offline'));localStorage.setItem('sudoku-mate-guide-v1','1')</script>"
    index = index.replace('<script>window.MATE_ANDROID=true</script>',
                          '<script>window.MATE_ANDROID=true</script>'+stub)
    for reduced in (False, True):
        script = checks.replace('REDUCED', str(reduced).lower())
        script = "try{" + script + "document.body.dataset.qa='pass'}catch(e){document.body.dataset.qa=e.message}"
        test = assets / 'qa.html'
        test.write_text(index.replace('</body>', '<script>'+script+'</script></body>'))
        flags = ['--force-prefers-reduced-motion'] if reduced else []
        out = subprocess.check_output(['google-chrome', '--headless', '--no-sandbox',
            '--no-first-run', '--disable-background-networking',
            f'--user-data-dir={root / str(reduced)}', '--disable-gpu', '--window-size=390,600', '--dump-dom', *flags,
            test.as_uri()], text=True, timeout=45)
        status = re.search(r'<body[^>]* data-qa="([^"]*)"', out)
        assert status and status[1] == 'pass', status[1] if status else 'Test did not run'
        print(f'Result scenes passed (reduced motion: {reduced})')
