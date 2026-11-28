"""Open an Android share target and return to the same room after a signal interruption."""
from pathlib import Path
import os
import re
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from zipfile import ZipFile

pkg = 'com.kkomaweb.sudokumate'
receiver = 'com.kkomaweb.sharetest'
sdk = Path(os.environ['ANDROID_HOME'])
tools = sdk / 'build-tools/35.0.0'
# Only the emulator copy uses a deterministic signaling transport. The game
# lifecycle, host listeners, WebView, Android chooser and target are real.
fixture = """
<script>
class ShareTestPeer {
 constructor(id){
  this.id=id;this.handlers={};this.open=false;this.disconnected=false;
  setTimeout(()=>{this.open=true;this.handlers.open()},10);
 }
 on(name,fn){this.handlers[name]=fn}
 disconnect(){
  if(this.disconnected)return;
  this.open=false;this.disconnected=true;
  this.handlers.error({type:'network'});this.handlers.disconnected();
 }
 reconnect(){
  this.disconnected=false;this.open=true;this.handlers.open();
  console.log('MATE_QA_ROOM_RESTORED '+pvp.roomCode);
 }
}
window.Peer=ShareTestPeer;
const foregroundHandler=mateForeground;
mateForeground=function(active){
 if(!active && pvp.peer && !pvp.peer.disconnected)pvp.peer.disconnect();
 foregroundHandler(active);
};
localStorage.setItem(guideKey,'1');
setTimeout(()=>{appOpenLobby('friend');pvpHostCreate()},900);
</script>
"""
def run(*args):
    return subprocess.check_output([str(arg) for arg in args], text=True, stderr=subprocess.STDOUT)
def adb(*args):
    return run('adb', *args)
def wait_for_node(predicate, tap=False, expand=False):
    deadline = time.monotonic() + 40
    while time.monotonic() < deadline:
        adb('shell', 'uiautomator', 'dump', '/sdcard/share-ui.xml')
        nodes = ET.fromstring(adb('shell', 'cat', '/sdcard/share-ui.xml')).iter('node')
        for node in nodes:
            label = node.get('text') or node.get('content-desc') or ''
            if predicate(label):
                if tap:
                    x1,y1,x2,y2 = map(int,re.findall(r'\d+',node.get('bounds')))
                    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
                return label
        if expand:
            size=adb('shell','wm','size')
            w,h=map(int,re.findall(r'(\d+)x(\d+)',size)[-1])
            adb('shell','input','swipe',str(w//2),str(h*82//100),str(w//2),str(h//5),'350')
        time.sleep(.5)
    raise AssertionError('Expected share UI missing: '+adb('shell','cat','/sdcard/share-ui.xml')[:16000])

with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    manifest = root / 'AndroidManifest.xml'
    manifest.write_text(f'''<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{receiver}" android:versionCode="1">
      <uses-sdk android:minSdkVersion="26" android:targetSdkVersion="35"/>
      <application android:hasCode="false" android:label="Mate Share Test">
       <activity android:name="android.app.Activity" android:exported="true"><intent-filter>
        <action android:name="android.intent.action.SEND"/><category android:name="android.intent.category.DEFAULT"/>
        <data android:mimeType="text/plain"/></intent-filter></activity>
      </application></manifest>''')
    platform=next((sdk/'platforms').glob('android-*/android.jar'))
    run(tools/'aapt2','link','-I',platform,'--manifest',manifest,'-o',root/'receiver.apk')
    def install(path):
        aligned = root/'aligned.apk'
        run(tools/'zipalign','-f','-P','16','4',path,aligned)
        run(tools/'apksigner','sign','--ks',Path(os.environ['RUNNER_TEMP'])/'emulator.p12','--ks-pass','pass:android',aligned)
        adb('install','-r',str(aligned))
    install(root/'receiver.apk')
    with ZipFile(sys.argv[1]) as src, ZipFile(root/'game.apk','w') as dst:
        for entry in src.infolist():
            data=src.read(entry)
            if entry.filename=='assets/index.html':
                data=data.replace(b'</body>', fixture.encode()+b'</body>')
            dst.writestr(entry,data)
    install(root/'game.apk')
    adb('logcat','-c')
    adb('shell','am','force-stop',pkg)
    adb('shell','am','start','-W','-n',pkg+'/.GameActivity')
    code=wait_for_node(lambda text: re.fullmatch(r'\d{4}',text))
    wait_for_node(lambda text: text in ('Share link','링크 공유'),tap=True)
    # Some system images show only suggested apps in the collapsed sheet.
    target=wait_for_node(lambda text: text in ('Messages','Mate Share Test'),tap=True,expand=True)
    target_packages=(receiver,) if target=='Mate Share Test' else ('com.google.android.apps.messaging','com.android.mms')
    for _ in range(20):
        activities=adb('shell','dumpsys','activity','activities')
        if any(any(name in line for name in target_packages) for line in activities.splitlines() if 'resumedactivity' in line.lower()):
            break
        time.sleep(.3)
    else:
        raise AssertionError('Share target did not open: '+str([line for line in activities.splitlines() if 'resumed' in line.lower()][:8]))
    adb('shell','input','keyevent','KEYCODE_BACK')
    wait_for_node(lambda text: text==code)
    wait_for_node(lambda text: text in ('Share link','링크 공유'))
    assert 'MATE_QA_ROOM_RESTORED '+code in adb('logcat','-d'), 'Room signaling did not reopen'
    print('Returned from Android share target to the original room')
