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
state.view='play';startTimeAttack();
const run=runOf(state.activeId);run.status='lost';run.lives=0;run.finalMs=45000;
showGameOver();
scene('.gameover-card','.heart-left','heart-crack-left');
check(document.querySelector('#gameOverTime').textContent.includes('45'),'elapsed time');
endGameOver();
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
