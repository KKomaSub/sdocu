# 스도쿠

Cloudflare Pages에 배포하는 스도쿠 게임입니다. 일반 모드, 타임어택, 친구 초대 P2P 대결과 랜덤 매칭을 지원합니다.

## 저장소 구조

```
index.html                 # 프론트엔드 메인 페이지 (최상위)
assets/matchmaking.js       # 브라우저 랜덤 매칭 연결
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
