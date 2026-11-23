import pathlib
import re
import shutil
import sys

root = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
shutil.copytree(root / 'assets', out / 'assets', dirs_exist_ok=True)
shutil.copytree(root / 'android/vendor', out / 'assets', dirs_exist_ok=True)
shutil.copy(root / 'manifest.webmanifest', out)
p = out / 'index.html'
s = (root / 'index.html').read_text()
s,n=re.subn(r'<script async src="https://pagead2\.googlesyndication\.com/[^>]+></script>', '', s)
assert n==1
s=s.replace('https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js','./assets/peerjs.min.js')
csp="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src data: blob:; connect-src 'self' https://*.peerjs.com wss://*.peerjs.com; manifest-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
s=s.replace('<meta charset="utf-8">','<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>window.MATE_ANDROID=true</script>')
p.write_text(s)