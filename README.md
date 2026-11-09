# 스도쿠

Cloudflare Pages로 배포하는 스도쿠 게임입니다. 일반 모드와 타임어택, 친구 초대 P2P, 랜덤 매칭을 지원합니다.

## 배포

1. Cloudflare Workers & Pages에서 **Create application → Pages → Connect to Git**을 선택합니다.
2. GitHub 저장소 `KKomaSub/sdocu`를 연결하고 배포 브랜치는 `main`으로 지정합니다.
3. 프레임워크 프리셋은 `None`, 빌드 명령은 **비워 둡니다**. **빌드 출력 디렉터리는 `.`** 입니다.
4. Cloudflare 계정에서 D1 데이터베이스 `sdocu_match`를 한 개 생성합니다.
5. Pages 프로젝트 **Settings → Bindings → Add → D1 database**에서 바인딩 이름을 반드시 `MATCH_DB`로 지정하고 `sdocu_match`를 선택합니다.
6. 프로젝트를 **다시 배포**합니다. API는 `https://<프로젝트>.pages.dev/api/match?health=1`에서 확인할 수 있습니다.

배포 후 별도의 Workers 프로젝트나 WebSocket 대기열 서버는 필요하지 않습니다. `functions/api/match.js`는 랜덤 대기자 목록을 D1에 저장해 매칭시키는 Pages Functions API입니다. 데이터베이스 테이블은 첫 요청 시 자동 생성됩니다.

친구 초대는 PeerJS를 통한 WebRTC 연결이며, 랜덤 매칭도 짝을 찾은 후 실제 게임 데이터는 P2P로 전송합니다. 두 사용자는 같은 Pages URL을 열어야 하며, 인앱 파일 뷰어가 아니라 HTTPS 웹 주소에서 실행해야 합니다. PeerJS 공개 신호 서버 및 jsDelivr를 이용하므로 인터넷이 필요하고, 일부 NAT 환경에서는 TURN 서버를 추가해야 실제 접속이 가능합니다.

## 주요 경로

- `index.html` : 스도쿠 웹 게임
- `functions/api/match.js` : Pages Functions 랜덤 매칭 백엔드
- `GET /api/match?health=1` : D1 바인딩 및 API 점검
- `POST /api/match` : 참가 및 취소 (`{ "action":"join", "peerId":"...", "name":"..." }`, `{ "action":"leave", "token":"..." }`)
- `GET /api/match?token=...` : 매칭 대기 상태 확인

## 주의

Cloudflare D1 데이터베이스의 생성과 바인딩은 Cloudflare 계정 권한이 필요하며 GitHub 저장소만 수정해서 자동 완료되지는 않습니다. Pages Functions는 상태를 메모리만으로 공유할 수 없어 D1이 필요합니다.