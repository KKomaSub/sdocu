# 스도쿠

Cloudflare Pages에 배포하는 스도쿠 게임입니다. 일반 모드, 타임어택, 친구 초대 P2P 대결과 랜덤 매칭을 지원합니다.

## 저장소 구조

```
index.html                 # 프론트엔드 메인 페이지 (최상위)
assets/matchmaking.js       # P2P matchmaking
assets/i18n.js              # Automatic browser-language localization
assets/keyboard-guide.js    # First desktop keyboard tutorial
assets/multiplayer-core.js  # 3/4-player friend rooms and real-time shared team state
assets/multiplayer-ui.js    # Multiplayer lobby, board and results
_headers                    # 정적 자산 헤더
functions/api/match.js      # Cloudflare Pages Functions 백엔드
build.sh                    # 배포용 정적 파일을 dist에 복사
```

`public` 폴더는 사용하지 않습니다. 프론트엔드 소스는 저장소 최상위에 있습니다. 배포 결과물만 `dist`에 생성합니다. Pages Functions는 정적 배포 폴더 밖의 최상위 `functions`에 둡니다.

## Cloudflare Pages 배포 설정

GitHub 저장소 `KKomaSub/sdocu`를 Cloudflare Pages의 Git 연동으로 연결합니다.

- Production branch: `main`
- Framework preset: `None`
- Root directory: 저장소 최상위 (기본값)
- Build command: `sh build.sh`
- Build output directory: `dist`

기존 Pages 프로젝트의 빌드 출력 디렉터리가 `public`으로 되어 있다면 **`dist`로 변경**합니다.

## 랜덤 매칭을 위한 D1 연결

1. Cloudflare 계정에서 D1 데이터베이스 `sdocu_match`를 생성합니다.
2. Pages 프로젝트의 Settings → Bindings에서 D1 바인딩을 추가합니다.
3. 바인딩 변수 이름을 정확히 `MATCH_DB`로 설정하고 해당 D1을 선택합니다.
4. 변경 내용을 적용해 Pages를 다시 배포합니다.
5. `https://<프로젝트>.pages.dev/api/match?health=1`에서 연결 상태를 확인합니다.

별도 Workers 프로젝트는 필요하지 않습니다. `functions/api/match.js`가 대기열을 D1에 저장하는 Pages Functions API입니다. 데이터베이스 테이블은 최초 요청 시 자동 생성됩니다.

친구 초대 및 랜덤 매칭 후 게임 데이터는 PeerJS를 통한 WebRTC로 전송합니다. 공개 신호 서버와 jsDelivr에 연결하기 때문에 인터넷이 필요하며, 네트워크 상황에 따라 TURN 서버가 필요할 수 있습니다.

## API

- `GET /api/match?health=1` : API 및 D1 바인딩 확인
- `POST /api/match` : 대기열 참가 및 취소
- `GET /api/match?token=...` : 대기 및 연결 준비 상태 확인

D1 데이터베이스 생성과 바인딩은 Cloudflare 계정에서 직접 설정해야 합니다.

## Language and desktop keyboard controls

The first page render uses the browser's preferred language. Korean browsers display Korean; English and other languages fall back to English. The page is localized before becoming visible, so Korean text does not flash on English browsers.

On a desktop or laptop, the first Sudoku board displays an illustrated, one-time tutorial for arrow keys, number keys and the / notes toggle. Its dismissal is stored locally. Mobile devices skip the tutorial.

## 친구 대결: 다인전

방 생성 전 대결 형식에서 2인 개인전(기존), 3인 개인전, 4인 개인전, 4인 2:2 팀전을 선택할 수 있습니다. 3~4인 대결은 모두 4자리 코드/초대 링크로 참가합니다. 2:2 팀은 4명이 모두 입장하면 자동으로 무작위 편성되며, 팀원 두 명이 동일한 스도쿠 판·정답·오답·점수·하트를 공유하고 동시에 풉니다. 모든 인원이 입장하면 3·2·1·START 카운트다운으로 자동 시작합니다. 먼저 완성하면 해당 개인 또는 팀이 승리합니다.

**랜덤 매칭 대기열**(`/api/match`)은 기존처럼 2인 대결만 지원합니다. 다인전의 **팀 무작위 배정**은 친구 대결 모드에서 작동하며, 인터넷 자동 팀 매칭과는 다릅니다.
