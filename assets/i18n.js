(function () {
  "use strict";
  const lang = document.documentElement.dataset.siteLang || "ko";
  const translations = {"스도쿠":"Sudoku","스도쿠 완성":"Sudoku solved","300문제  대결":"300 puzzles  Duels","풀기":"Play","문제 선택":"Choose puzzle","내 스도쿠":"My Sudoku","완료 기록":"Records","2인 대결":"2-player duel","주요 메뉴":"Main navigation","취소":"Cancel","확인":"Confirm","이름":"Name","계속 플레이하기":"Keep playing","정답입니다. 완료 기록에 저장했어요.":"Perfect! Saved to your records.","정답입니다":"Correct!","게임 오버":"Game over","목숨 3개를 모두 잃었습니다":"You lost all 3 hearts","홍보 영상 보고 하트 1개 받기":"Watch video for 1 heart","다시 도전하기":"Try again","일반 모드로 돌아가기":"Back to normal mode","회 사용":" uses","자체 홍보 영상":"Promotional video","영상 닫기":"Close video","스도쿠 홍보 영상":"Sudoku promotional video","대결 시작 카운트다운":"Match start countdown","대결 준비":"Get ready","일반 모드로 이어 풀기":"Continue in normal mode","결과 보기":"View results","쉬움":"Easy","보통":"Medium","어려움":"Hard","익스트림":"Extreme","기본 스도쿠":"Built-in Sudoku","기본 문제":"Built-in puzzle","직접 만든 스도쿠":"Custom Sudoku","직접 만든 문제":"Custom puzzle","대결 이어 풀기":"Continue duel puzzle","대결 퍼즐":"Duel puzzle","문제 번호 검색":"Search puzzle number","다른 문제 선택":"Choose another puzzle","일반 모드":"Normal mode","타임어택":"Time attack","게임 모드":"Game mode","시간 제한 없음   도전 진행 중":"No time limit. Challenge active","목숨 소진   게임 종료":"Out of hearts. Game over","도전 성공":"Challenge complete","도전을 시작하세요":"Start a challenge","최고 기록":"Personal best","아직 없음":"No record yet","힌트":"Hint","목숨":"Hearts","완주 성공":"Completed!","완주 시간":"Completion time","광고 시청으로 부활하거나 새로운 도전을 시작할 수 있습니다":"Watch a video to revive, or try again","시간 제한은 없습니다. 틀린 숫자를 누르면 목숨이 1개씩 줄어듭니다":"No time limit. Each incorrect entry costs a heart","준비되면 시작하세요":"Start when ready","새 기록에 도전하기":"Beat your record","타임어택 시작":"Start time attack","홍보 영상 보고 하트":"Watch video for a heart","번 부활할 수 있습니다":" revives remaining","다시 도전":"Retry","초기화":"Reset","오류 표시":"Show errors","꺼짐":"Off","켜짐":"On","메모":"Notes","정답 보기":"Show solution","입력 내용과 메모는 자동 저장됩니다":"Entries and notes save automatically","오답을 입력하면 목숨이 줄어듭니다":"Wrong answers cost hearts","시간 제한은 없고":"There is no time limit, and","기록이 저장됩니다":"your best time is saved","칸을 누른 뒤 숫자를 선택하세요":"Choose a cell, then enter a number","메모 모드에서는 후보 숫자를 여러 개 표시할 수 있습니다":"In notes mode you can add pencil marks","정답을 보여주고 있습니다":"Showing the solution","정답 미리보기":"Solution preview","정답 미리보기 격자":"Solution preview grid","내 풀이로 돌아가기":"Back to my puzzle","애니메이션 다시 보기":"Replay animation","빈칸이 차례대로 채워집니다":"Empty cells fill one by one","완료 기록에 추가되지 않으며":"This does not count as a completed puzzle, and","입력 내용은 바뀌지 않았어요":"Your entries have not changed","보라색 칸에 정답을 표시했습니다":"The answer is highlighted in purple","남은 힌트":"Hints left","기본 숫자":"Given cells","빈칸":"Empty cells","완료됨":"Completed","진행 상황":"Progress","해결 완료":"Solved","정답":"Correct","가로 세로":"Rows, columns and","칸에 정답을 표시했습니다":"cell shows the answer","행":"row","열":"column","기본 숫자는 바꿀 수 없습니다":"Given numbers cannot be changed","정답을 계산할 수 없습니다":"Unable to calculate the solution","이 문제의 정답을 찾지 못했습니다":"No solution found for this puzzle","이 문제의 힌트를 모두 사용했습니다":"All hints used for this puzzle","보라색 칸":"Purple cell","정답 개수 확인":"Check solution count","이 문제는":"This puzzle","메모 있음":"Has notes","최근 풀던 문제":"Recently played","완료한 문제":"Completed puzzles","대결 기록":"Duel records","진행 중인 문제와 모드별 결과":"Your progress and results","진행 중인 문제가 없습니다":"No puzzles in progress","새 문제를 시작하면 여기에 표시됩니다":"Start a puzzle to see it here","아직 완료한 문제가 없습니다":"No completed puzzles yet","문제를 모두 맞히면 기록됩니다":"Solve a puzzle to add it here","타임어택 완료":"Time attack cleared","타임어택 완료 기록이 없습니다":"No completed time attacks","타임어택을 완주하면 여기에 표시됩니다":"Complete a time attack to see it here","대결 기록이 없습니다":"No duel records yet","대결이 종료되면 여기에 표시됩니다":"Your duel results will appear here","대결이 종료되었습니다":"The duel has ended","다시 보기":"View again","이어 풀기":"Continue","더보기":"Show more","접기":"Show less","승리":"Victory","패배":"Defeat","무승부":"Draw","상대":"Opponent","나":"Me","플레이어":"Player","난이도":"Difficulty","내 문제":"My puzzle","내 문제 목록":"My puzzles","마지막 수정":"Last edited","이름 변경":"Rename","문제 수정":"Edit puzzle","만들기":"Create","새 문제 만들기":"Create puzzle","직접 만들기":"Make your own","이름을 붙여 여러 문제를 보관하고":"Save multiple named puzzles and","언제든 수정하거나 다시 풀 수 있어요":"edit or replay them anytime","작성 중인 문제가 있습니다":"You have an unfinished puzzle","편집 이어하기":"Continue editing","아직 만든 문제가 없어요":"You haven't created a puzzle yet","고정 숫자":"Given number","고정 숫자를 추가하거나 수정해 보세요":"Add or edit the given numbers","고정 숫자를 더 넣어보세요":"Add more given numbers","고정 숫자를 더 추가하세요":"Add more given cells","문제 이름":"Puzzle name","문제 이름을 입력하세요":"Enter a puzzle name","문제 이름 변경":"Rename puzzle","새 이름을 입력하세요":"Enter a new name","이름을 입력하세요":"Enter a name","이름 저장":"Save name","이름이 변경되었습니다":"Name updated","문제 편집":"Puzzle editor","기존 문제 수정":"Edit existing puzzle","자동 생성 난이도":"Generation difficulty","자동 생성":"Generate","새로 생성":"Generate new","자동 생성 후 숫자를 수정할 수도 있습니다":"You can edit numbers after generating","전체 지우기":"Clear all","수정 저장":"Save changes","저장하고 풀기":"Save and play","수정 저장하고 풀기":"Save changes and play","숫자 선택":"Choose a number","숫자":"Number","지우기":"Erase","입력":"Enter","시작 전":"Not started","진행 중":"In progress","완료":"Completed","진행상황":"Progress","일치하는 번호가 없습니다":"No matching puzzle number","총":"Total","문제":"puzzles","번 퍼즐":"Puzzle","완벽하게 해결했어요":"Perfectly solved!","새 스도쿠 생성에 실패했습니다":"Could not generate a new puzzle","새 퍼즐을 생성했습니다":"New puzzle generated","입력 내용 자동 저장":"Auto-saved","저장 데이터 백업":"Backup your data","백업 내보내기":"Export backup","백업 복원":"Restore backup","백업 불러오기":"Import backup","백업 파일을 저장했습니다":"Backup file saved","백업을 복원했습니다":"Backup restored","백업을 불러올까요":"Import this backup?","올바른 스도쿠 백업 파일이 아닙니다":"Not a valid Sudoku backup","파일 형식 오류":"Invalid file format","저장은 현재 브라우저에 자동으로 이루어집니다":"Progress is automatically saved in this browser","기기를 바꾸거나 브라우저 데이터를 삭제할 경우를 대비해 백업 파일을 보관할 수 있어요":"Keep a backup before changing devices or clearing browser data","이 작업은 되돌릴 수 없습니다":"This cannot be undone","삭제":"Delete","삭제됨":"Deleted","문제를 삭제할까요":"Delete this puzzle?","문제를 삭제했습니다":"Puzzle deleted","고정 숫자를 모두 지울까요":"Clear all given cells?","현재 편집 중인 보드가 빈칸으로 초기화됩니다":"The current editor board will be cleared","아직 저장하지 않은 수정 내용은 사라집니다":"Unsaved changes will be lost","풀이가 초기화되었습니다":"Puzzle reset","이 문제를 처음부터 풀까요":"Restart this puzzle?","입력한 숫자와 메모를 지웁니다":"Clear your numbers and notes","다른 문제의 기록은 유지됩니다":"Other puzzle records are preserved","복사할 코드가 없습니다":"There is no code to copy","친구에게 보낼 링크를 복사했습니다":"Invite link copied","공유 링크를 선택했습니다":"Invite link selected","공유 링크는":"The invite link","웹사이트에 게임을 게시한 후 복사할 수 있습니다":"is available after publishing online","친구와 대결":"Play a friend","랜덤 매칭":"Random match","대기 중인 플레이어 연결":"Find a waiting player","친구와 대결하거나 대기 중인 상대를 찾아보세요":"Challenge a friend or find an opponent","자리 코드 또는 링크":"digit code or link","4자리 코드 또는 링크":"4-digit code or link","친구 초대":"Friend invite","방 만들기 전 게임 설정":"Configure your room","방 만들기":"Create room","이 설정으로 방 만들기":"Create room with these settings","방장 설정":"Host settings","확정된 경기 규칙":"Match rules","친구가 입장했습니다":"Your friend has joined","자동으로 시작합니다":"Starting automatically","내 방":"My room","코드로 입장":"Join by code","입장하기":"Join room","초대 링크":"Invite link","링크 복사":"Copy link","코드 복사":"Copy code","코드를 선택했습니다":"Code selected","코드를 선택해 복사하세요":"Select and copy the code","자리 숫자 코드를 입력하세요":"Enter a 4-digit code","자리 초대 코드 등록 중":"Creating your 4-digit code","자리 코드를 친구에게 알려주세요":"Share the 4-digit code with a friend","자리 초대 코드를 복사했습니다":"Room code copied","방이 준비되었습니다":"Room ready","친구가 입장한 뒤 대결을 시작할 수 있습니다":"A friend must join first","입장 실패":"Unable to join","방 개설 실패":"Unable to create room","해당 방을 찾지 못했습니다":"Room not found","코드를 확인하세요":"Check the code","서버 연결 오류":"Server connection error","연결을 준비 중입니다":"Preparing connection","연결되었습니다":"Connected","상대와 연결되었습니다":"Connected to opponent","상대와 연결하지 못했습니다":"Could not connect to opponent","상대 연결 종료":"Opponent disconnected","연결 종료":"Disconnected","연결 중입니다":"Connecting","연결 오류":"Connection error","연결 오류가 발생했습니다":"Connection error occurred","연결이 불안정합니다":"Connection unstable","연결이 지연되고 있습니다":"Connection delayed","연결이 끊어졌습니다":"Disconnected","방 연결 서버와 통신이 끊겼습니다":"Lost contact with the room server","랜덤 매칭 시작":"Find opponent","랜덤 매칭 대기 중입니다":"Waiting for a random opponent","랜덤 대기열에 연결 중입니다":"Joining the match queue","대기 중인 상대를 찾고 있습니다":"Searching for an opponent","대기열 연결이 끊어졌습니다":"Match queue disconnected","대기열 서버에 연결하지 못했습니다":"Could not connect to match server","랜덤 매칭 서버 주소가 필요합니다":"Match server URL required","랜덤 매칭 서버가 저장되었습니다":"Match server saved","매칭 서버 주소":"Match server URL","주소 저장":"Save URL","대기 취소":"Cancel search","다른 매칭 선택":"Change match type","다시 매칭을 시도하세요":"Try matchmaking again","다시 시도하세요":"Try again","다시 시도해 주세요":"Please try again","준비 중":"Preparing","상대를 기다리는 중":"Waiting for opponent","대결":"Duel","대결 시작":"Match start","대결이 자동으로 시작됩니다":"The match will begin automatically","실시간":"Live","경기":"Match","경기 시간 종료":"Time expired","경기 종료":"Match ended","대결 종료":"Duel ended","입력 제한시간":"Time per move","전체 경기":"Match duration","입력 제한":"Move time","입력 시간":"Input time","남은 경기 시간":"Match time left","숫자 입력까지":"Next move deadline","하트":"Hearts","남은 하트":"Hearts left","남은 목숨":"Hearts left","퍼즐 먼저 완성":"First to finish","하트 소진":"Out of hearts","상대 하트 소진":"Opponent ran out of hearts","상대가 나갔습니다":"Opponent left","대결에서 나갔습니다":"You left the match","게임을 시작합니다":"Match starting","대결이 진행 중입니다":"Match in progress","상대가 퍼즐의":"Opponent completed","을 채웠어요":"of the puzzle","절반":"half","3분의 2":"two-thirds","경기가 종료되었습니다":"The match ended","시간 초과":"Time out","오답":"Wrong","오답 하트":"Wrong answer. Hearts","오답 입력 지우기":"Erase wrong entry","입력 결과를 확인하는 중입니다":"Checking move","목숨 소진":"Out of hearts","점수":"Score","내 점수":"My score","점":"pts","정답을 찾는 데 시간이 많이 걸립니다":"Finding the answer is taking longer than expected","해답 검사가 복잡합니다":"Puzzle validation is complex","최소 한 칸에 고정 숫자를 입력하세요":"Add at least one given number","빈칸은 비워 두면 됩니다":"Leave unused cells empty","정답이 없는 문제입니다":"This puzzle has no solution","정답이 여러 개 존재하는 문제도 저장할 수 있으며":"Puzzles with multiple solutions can be saved","복수의 해답이 가능한 문제입니다":"This puzzle has multiple solutions","해답이 하나뿐인 문제입니다":"This puzzle has a unique solution","정답 검색 범위를 초과했습니다":"Solution search limit exceeded","중복 숫자 확인":"Check duplicate numbers","박스에서 중복된 숫자를 수정하세요":"Fix duplicate numbers in the box","고정 숫자에 충돌이 있거나 정답이 없는 문제입니다":"Conflicting givens or no solution","수정한 문제를 저장할까요":"Save edited puzzle?","기존 풀이와 메모는 유지됩니다":"Your entries and notes are preserved","기존 풀이와 메모도 그대로 유지됩니다":"Your entries and notes are preserved","기존 데이터는 사라질 수 있습니다":"Previous data may be lost","최고 기록 경신":"New personal best","타임어택 도전을 시작하세요":"Start the time attack first","타임어택 도전을 시작하거나 재도전하세요":"Start or retry the time attack","타임어택 도전 중에는 정답을 볼 수 없습니다":"Solutions are unavailable during time attack","타임어택은 정답이 하나뿐인 내 문제에서만 시작할 수 있습니다":"Time attack requires a puzzle with a unique solution","유일한 정답을 가진 문제만 타임어택에 도전할 수 있습니다":"Only uniquely solvable puzzles support time attack","완료 기록은 유지됩니다":"Completed records are preserved","중단 후 전환":"Quit and switch","타임어택을 중단할까요":"Leave this time attack?","일반 모드로 전환하면 진행 중인 타임어택":"Switching to normal mode ends","일반 모드의 기존 풀이는 유지됩니다":"Your normal-mode progress is preserved","이전 도전을 중단했습니다":"Previous attempt abandoned","이미 진행 중인 대결이 있습니다":"A duel is already in progress","상대에게 시작 신호를 전달하지 못했습니다":"Unable to notify the opponent","입력 숫자":"Entered number","오답 숫자":"Wrong number","칸":"cell","분":"minute","초":"sec","개":"","전체":"All","닫기":"Close","닉네임":"Nickname","나가기":"Leave","예":"e.g.","목숨이 모두 사라졌습니다":"You have no hearts left","최고":"Best","규칙을 모두 만족하면":"If you follow all the rules","으로 인정합니다":"is accepted","다른 문제로 이동해도 기존 진행 상황은 유지됩니다":"Your progress is saved when switching puzzles","다른":"Other","로 이동해도 기존":" remains when switching to another","은 유지됩니다":"is kept","를 눌러 고정 숫자를 배치하거나 자동으로 새 문제를 생성해 보세요":"to place givens or generate a new puzzle","를 눌러":"tap to","를 배치하거":"place or","자동으로 새":"automatically create a new","를 생성해 보세요":"try creating one","내가 만든 어려운":"My hard","원하는 칸을 선택하고 아래 숫자 버튼으로":"Select a cell and use the number buttons","원하는":"Desired","을 선택하고 아래":"select and use the","버튼으로":"buttons to","를 넣으세요":"to enter","는":"","는 고정 숫자끼리 충돌하면 저장할 수 없습니다":"Cannot save a puzzle with conflicting givens","그런 문제는 스도쿠 규칙에 맞는 모든 완성판을 정답으로 처리합니다":"For such puzzles, any valid Sudoku solution counts","그런":"Such","규칙에 맞는 모든 완성판을":"every board that follows the rules","으로 처리합니다":"is treated as","화면에서 기다리는 사람끼리만 연결합니다":"Only players waiting in random matchmaking are paired","대기실과는 섞이지 않습니다":"Friend invite lobbies are separate","위에서 규칙을 정한 뒤 방을 만들어 주세요":"Set the rules above before creating a room","동안 도전했어요":"of play","을 모두 잃었습니다":"were all lost","광고 보상으로 최대":"Revive up to","문제 번호 검색 (예: 125)":"Search puzzle number (e.g. 125)","시작하기":"Start","홍보 영상":"Promo video","기본":"Given"};

  Object.assign(translations, {"타임어택을 중단할까요?":"Quit time attack?","일반 모드로 전환하면 진행 중인 타임어택이 종료되며 기록되지 않습니다. 일반 모드의 기존 풀이는 유지됩니다.":"Switching to Normal mode ends the current time attack without saving its result. Your Normal mode progress is kept.","중단 후 전환":"Quit and switch","타임어택을 다시 시작할까요?":"Restart Time Attack?","현재 도전과 입력한 숫자 메모는 초기화되며 기록되지 않습니다.":"Your current attempt, entries and notes will be erased without saving a result.","처음부터 도전":"Restart challenge","이 문제를 처음부터 풀까요?":"Restart this puzzle?","입력한 숫자와 메모를 지웁니다. 완료 기록은 유지됩니다.":"This erases your entries and notes. Completed records are kept.","수정한 문제를 저장할까요?":"Save changes to this puzzle?","고정 숫자가 바뀌어 이 문제의 기존 풀이 메모 완료 기록이 초기화됩니다. 다른 문제의 기록은 유지됩니다.":"Because the given numbers changed, this puzzle's entries, notes and completion record will be reset. Other puzzles are unaffected.","문제 이름 변경":"Rename puzzle","새 이름을 입력하세요. 기존 풀이와 메모는 유지됩니다.":"Enter a new name. Your entries and notes will be kept.","문제를 삭제할까요?":"Delete this puzzle?","새 문제를 자동 생성할까요?":"Generate a new puzzle?","현재 편집 중인 고정 숫자가 자동 생성된 숫자로 바뀝니다. 아직 저장하지 않은 수정 내용은 사라집니다.":"The current givens will be replaced by a generated puzzle. Unsaved edits will be lost.","백업을 불러올까요?":"Import this backup?","현재 저장된 진행 상황과 내 문제를 백업 내용으로 교체합니다. 기존 데이터는 사라질 수 있습니다.":"Your current progress and custom puzzles will be replaced with the backup. Existing data may be lost.","고정 숫자를 모두 지울까요?":"Clear all given numbers?","현재 편집 중인 보드가 빈칸으로 초기화됩니다. 이미 저장한 문제는 아직 바뀌지 않습니다.":"The editor grid will be cleared. Your saved puzzle will not change until you save.","문제를 찾을 수 없습니다.":"Puzzle not found.","해답 검사가 복잡합니다. 고정 숫자를 더 추가하세요.":"This puzzle is too complex to check. Add more given numbers.","정답을 계산할 수 없습니다.":"Unable to calculate the solution.","타임어택 시작! 오답 3번이면 종료됩니다.":"Time attack started! You have 3 hearts.","영상 시청을 끝내지 않아 보상이 지급되지 않았습니다.":"No reward was granted because the video was not completed.","광고 영상을 재생하는 중입니다.":"The video is already playing.","타임어택에서만 영상 보상을 받을 수 있습니다.":"Video rewards are available only in Time Attack.","이번 도전에서 부활 횟수를 모두 사용했습니다.":"You've used all revives for this attempt.","영상을 재생하지 못했습니다. 영상 주소를 확인해 주세요.":"The video could not be played.","타임어택 도전을 시작하거나 재도전하세요.":"Start or restart the Time Attack challenge.","이 문제의 힌트를 모두 사용했습니다.":"You've used all hints for this puzzle.","이미 완성한 문제입니다.":"You've already completed this puzzle.","힌트를 표시할 칸이 없습니다.":"No eligible cell is available for a hint.","타임어택 도전 중에는 정답을 볼 수 없습니다.":"You cannot view the solution during Time Attack.","기본 숫자는 바꿀 수 없습니다.":"Given numbers cannot be changed.","타임어택 도전을 시작하세요.":"Start Time Attack before entering numbers.","풀이가 초기화되었습니다.":"Puzzle progress has been reset.","문제 이름을 입력하세요.":"Enter a puzzle name.","최소 한 칸에 고정 숫자를 입력하세요.":"Enter at least one given number.","가로 세로 3×3 박스에서 중복된 숫자를 수정하세요.":"Fix repeated numbers in rows, columns or 3×3 boxes.","내 스도쿠에 저장했습니다.":"Saved to My Sudoku.","이름을 입력하세요.":"Enter a name.","이름이 변경되었습니다.":"Name updated.","문제를 삭제했습니다.":"Puzzle deleted.","검사가 너무 복잡합니다. 고정 숫자를 추가하거나 수정해 보세요.":"This puzzle is too complex to check. Add or change the given numbers.","완성할 수 없는 문제입니다. 숫자를 수정하세요.":"This puzzle cannot be solved. Fix the numbers.","✓ 해답이 하나뿐인 문제입니다.":"✓ This puzzle has exactly one solution.","복수의 해답이 가능한 문제입니다. 저장 플레이는 가능합니다.":"This puzzle has multiple solutions. You can still save and play it.","새 퍼즐을 생성했습니다. 숫자를 수정한 뒤 저장하세요.":"New puzzle generated. Edit any numbers, then save.","백업 파일을 저장했습니다.":"Backup file saved.","백업을 복원했습니다.":"Backup restored.","올바른 스도쿠 백업 파일이 아닙니다.":"This is not a valid Sudoku backup file.","이어 풀 문제를 찾을 수 없습니다.":"The puzzle to continue was not found.","HTTPS로 시작하는 매칭 서버 주소를 입력하세요.":"Enter a matchmaking server URL beginning with HTTPS.","설정을 저장했습니다.":"Settings saved.","랜덤 매칭 서버 주소가 필요합니다.":"The random matchmaking server URL is required.","랜덤 매칭은 인터넷의 HTTPS 페이지에서 실행해야 합니다.":"Random matchmaking requires an HTTPS website.","공유 링크는 HTTPS 웹사이트에 게임을 게시한 후 복사할 수 있습니다.":"Invite links are available after the game is published to an HTTPS website.","친구에게 보낼 링크를 복사했습니다.":"Invite link copied. Send it to your friend.","공유 링크를 선택했습니다.":"Invite link selected.","링크를 복사하지 못했습니다.":"Could not copy the link.","입력 시간 5~120초, 전체 경기 1~120분, 하트 1~10개로 설정하세요.":"Set move time to 5–120 seconds, match time to 1–120 minutes, and hearts to 1–10.","4자리 숫자 코드를 입력하세요.":"Enter a four-digit room code.","복사할 코드가 없습니다.":"There is no code to copy.","4자리 초대 코드를 복사했습니다.":"Four-digit invitation code copied.","코드를 선택했습니다. 복사해 친구에게 보내세요.":"Code selected. Copy and send it to your friend.","코드를 선택해 복사하세요.":"Select the code to copy it.","친구가 입장한 뒤 대결을 시작할 수 있습니다.":"The match will start when your friend joins.","이미 진행 중인 대결이 있습니다.":"A match is already in progress.","입력 제한 5~120초, 경기 1~120분, 하트 1~10개로 설정하세요.":"Set the move limit to 5–120 seconds, match duration to 1–120 minutes, and hearts to 1–10.","새 스도쿠 생성에 실패했습니다. 다시 시도해 주세요.":"Could not create a puzzle. Please try again.","상대에게 시작 신호를 전달하지 못했습니다.":"Could not send the start signal to your opponent.","맞게 입력한 숫자는 지울 수 없습니다.":"Correct entries cannot be erased.","타임어택 도전을 시작하세요":"Start the Time Attack challenge","정답을 찾는 데 시간이 많이 걸립니다. 고정 숫자를 더 넣어보세요.":"Searching for a solution is taking too long. Add more given numbers.","이 문제의 정답을 찾지 못했습니다. 고정 숫자를 확인하세요.":"No solution was found. Check the given numbers.","문제를 모두 맞히면 기록됩니다.":"Your puzzle is recorded when you solve it.","이 문제의 정답을 찾지 못했습니다.":"No solution was found.","대결이 진행 중입니다":"Match in progress","대결이 자동으로 시작됩니다.":"The match starts automatically.","방이 준비되었습니다. 4자리 코드를 친구에게 알려주세요.":"Room ready. Share its four-digit code with a friend.","연결이 끊겼습니다. 방을 다시 만들고 연결하세요.":"Connection lost. Create a room and reconnect.","메시지 전송에 실패했습니다.":"Failed to send the message.","실시간 연결에 문제가 생겼습니다. 다시 연결해 보세요.":"Live connection error. Please reconnect.","숫자 입력 제한시간을 설정하세요.":"Set the time limit for each move.","닉네임":"Nickname","2인 대결":"Two-player duel","남은 경기 시간":"Match time remaining","숫자 입력까지":"Time until next move","기본 숫자":"Given numbers","빈칸":"Empty cells","진행 상황":"Progress","입력 내용과 메모는 자동 저장됩니다.":"Your entries and notes are saved automatically.","시간 제한 없음   도전 진행 중":"No time limit. Time Attack in progress","목숨 소진   게임 종료":"No hearts left. Game over","기록이 저장됩니다.":"Your best time is saved.","광고 시청으로 부활하거나 새로운 도전을 시작할 수 있습니다.":"Watch a video to revive or start a new attempt.","시간 제한은 없습니다. 틀린 숫자를 누르면 목숨이 1개씩 줄어듭니다.":"There is no time limit. Each wrong answer costs one heart.","칸을 누른 뒤 숫자를 선택하세요. 메모 모드에서는 후보 숫자를 여러 개 표시할 수 있습니다.":"Select a cell, then choose a number. Notes mode lets you mark possible numbers.","오답을 입력하면 목숨이 줄어듭니다. 시간 제한은 없고, 기록이 저장됩니다.":"Wrong answers cost hearts. There is no time limit, and your best time is saved.","정답을 표시했습니다. 입력 내용은 바뀌지 않았어요.":"The solution was highlighted without changing your entries.","직접 만든 문제는":"Custom puzzles","가로 세로 3×3 규칙을 모두 만족하면 정답으로 인정합니다.":"Any answer satisfying all Sudoku row, column and 3×3-box rules is accepted.","유일한 정답을 가진 문제만 타임어택에 도전할 수 있습니다.":"Only puzzles with one unique solution can be played in Time Attack.","내가 만든 어려운 스도쿠":"My hard Sudoku","시간 제한은 없습니다":"There is no time limit","대결 시작 카운트다운":"Match countdown","동일한 새 퍼즐":"the same new puzzle","확정된 경기 규칙":"Locked match rules","방 만들기 전 게임 설정":"Configure the match before creating a room","친구가 입장했습니다. 자동으로 시작합니다.":"Your friend joined. The match will start automatically.","연결되었습니다. 대결이 자동으로 시작됩니다.":"Connected. Your match starts automatically.","상대에게 승리 판정":"Opponent wins","퍼즐 먼저 완성":"First to finish","무승부":"Draw","승리!":"Victory!","패배":"Defeat","완료한 문제":"Completed puzzles","최근 풀던 문제":"Recently played","게임 모드":"Game mode","힌트":"Hint","새 대결":"New duel","직접 만든 스도쿠":"Custom Sudoku","300문제  대결  내 스도쿠":"300 puzzles  Duels  My Sudoku","스도쿠 완성!":"Sudoku solved!","목숨 3개를 모두 잃었습니다.":"You've lost all three hearts.","이 작업은 되돌릴 수 없습니다.":"This action cannot be undone.","마지막 수정":"Last edited","최고 기록:":"Personal best:","전체":"All","완료됨":"Completed","오류 표시":"Show errors","정답 보기":"Show solution","이어 풀기":"Continue","완주 시간":"Completion time","정답 미리보기":"Solution preview","진행 중":"In progress","준비되면 시작하세요!":"Start when you're ready!","입력 내용 자동 저장":"Auto-save","인증 코드":"Room code","연결을 준비 중입니다.":"Preparing connection.","연결이 끊어졌습니다. 방을 다시 만들고 연결하세요.":"Connection lost. Create a new room to reconnect.","상대를 찾았습니다. 연결 중입니다.":"Opponent found. Connecting...","상대에게 연결할 수 없습니다. 다시 시도해 주세요.":"Unable to connect to your opponent. Try again.","상대가 퍼즐의 절반을 채웠어요":"Your opponent has filled half the puzzle.","상대가 퍼즐의 3분의 2을 채웠어요":"Your opponent has filled two-thirds of the puzzle.","상대가 퍼즐의 3분의 2를 채웠어요":"Your opponent has filled two-thirds of the puzzle.","상대가 나갔습니다.":"Your opponent left the match.","상대와 연결되었습니다.":"Connected to your opponent.","아직 만든 문제가 없어요":"You haven't created any puzzles yet.","나가기":"Leave match","대기 취소":"Cancel matchmaking","대결 종료":"Match ended","원하는 칸을 선택하고 아래 숫자 버튼으로 고정 숫자를 넣으세요.":"Choose a cell and enter a given number using the keypad.","진행 중인 문제와 모드별 결과":"Your active puzzles and game records","다른 문제로 이동해도 기존 진행 상황은 유지됩니다.":"Your progress is saved when changing puzzles.","완주 성공!":"Challenge completed!","게임 오버":"Game over","타임어택 성공":"Time Attack completed!","자동 생성 후 숫자를 수정할 수도 있습니다.":"You can edit the numbers after generating the puzzle.","수정 저장하고 풀기":"Save and play","새로 생성":"Generate another","게임을 시작합니다.":"Starting match.","진행상황":"Progress","한 번 더 시도하세요.":"Try again.","문제 번호 검색 (예: 125)":"Search puzzle number (e.g. 125)","제한 시간":"Time limit"});
  const normalizedLookup = new Map(Object.entries(translations).map(([k,v])=>[k.replace(/\s+/g," ").trim(),v]));
  const dynamicRules = [

    [/^오류 표시 (ON|OFF)$/,m=>"Show errors: "+m[1]],
    [/^메모 (켜짐|꺼짐)$/,m=>"Notes "+(m[1]==="켜짐"?"On":"Off")],
    [/^남은 경기 시간$/,()=>"Match time remaining"],
    [/^대결 준비$/,()=>"Get ready"],
    [/^전체 경기 \(분\)$/,()=>"Total match time (min)"],
    [/^입력 제한시간 \(초\)$/,()=>"Time per move (sec)"],
    [/^하트 (\d+)개$/,m=>m[1]+" hearts"],
    [/^(.+) 퍼즐 (\d+)번$/,m=>m[1]+" puzzle "+m[2]],
    [/^(\d+)번 퍼즐$/,m=>"Puzzle "+m[1]],
    [/^(\d+)번$/,m=>"No. "+m[1]],
    [/^(\d+)개$/,m=>m[1]],
    [/^고정 숫자 (\d+)개.*$/,m=>m[1]+" given numbers"],
    [/^([^-]+) (\d+)개 도전이 종료되며 기록되지 않습니다\.$/,m=>m[1]+": "+m[2]+" attempts end without a saved result."],

    [/^일반 모드로 전환하면 진행 중인 타임어택 (\d+)개 도전이 종료되며 기록되지 않습니다\. 일반 모드의 기존 풀이는 유지됩니다\.$/, m=> "Switching to Normal mode ends "+m[1]+" active Time Attack "+(m[1]==="1"?"attempt":"attempts")+" without recording results. Your existing Normal mode progress will be kept."],
    [/^(\d+(?:\.\d+)?) 동안 도전했어요\. 목숨을 모두 잃었습니다\. 광고 보상으로 최대 (\d+)번 부활할 수 있습니다\.$/,m=>"You played for "+m[1]+". All hearts are gone. You can revive up to "+m[2]+" times by watching a video."],
    [/^([0-9:.]+) 동안 도전했어요\. 목숨을 모두 잃었습니다\. 광고 보상으로 최대 (\d+)번 부활할 수 있습니다\.$/,m=>"You played for "+m[1]+". All hearts are gone. You can revive up to "+m[2]+" times by watching a video."],
    [/^오답! 목숨이 하나 줄었습니다\. 남은 목숨 (\d+)개\.$/,m=>"Wrong answer! One heart lost. "+m[1]+" hearts remaining."],
    [/^홍보 영상 시청 보상: 하트 \+1 \(부활 (\d+)\/(\d+)\)$/,m=>"Video reward: +1 heart ("+m[1]+"/"+m[2]+" revives used)"],
    [/^(\d+)\/(\d+)회 사용$/,m=>m[1]+"/"+m[2]+" used"],
    [/^(.+)회 사용$/,m=>m[1]+" used"],
    [/^(\d+)개 도전이 종료되며 기록되지 않습니다\.$/,m=>m[1]+" attempts will end without saving results."],
    [/^‘(.+)’ 문제와 해당 풀이 메모 완료 기록이 삭제됩니다\. 이 작업은 되돌릴 수 없습니다\.$/,m=>"Delete “"+m[1]+"” and all of its entries, notes and completion records? This cannot be undone."],
    [/^(.+) 문제와 해당 풀이 메모 완료 기록이 삭제됩니다\.$/,m=>"Delete "+m[1]+" and its entries, notes and completion record?"],
    [/^‘(.+)’ 문제와 해당 풀이 메모 완료 기록이 삭제됩니다\.$/,m=>"Delete “"+m[1]+"” and its entries, notes and completion record?"],
    [/^완주 시간 ([0-9:.]+) 최고 ([0-9:.]+)$/,m=>"Completion time: "+m[1]+". Personal best: "+m[2]],
    [/^힌트 (\d+)\/(\d+) 목숨 (\d+)\/(\d+)$/,m=>"Hints "+m[1]+"/"+m[2]+"   Hearts "+m[3]+"/"+m[4]],
    [/^힌트 (\d+)\/(\d+)$/,m=>"Hints "+m[1]+"/"+m[2]],
    [/^남은 힌트 (\d+)개$/,m=>m[1]+" hints left"],
    [/^기본 숫자 (\d+)개 빈칸 (\d+)개(?: 완료됨)?$/,m=>"Given numbers: "+m[1]+". Empty cells: "+m[2]+( /완료됨$/.test(m[0])?". Completed.":"")],
    [/^기본 숫자 (\d+)개$/,m=>"Given numbers: "+m[1]],
    [/^빈칸 (\d+)개$/,m=>"Empty cells: "+m[1]],
    [/^총 (\d+)문제 완료 (\d+)문제$/,m=>m[1]+" puzzles. "+m[2]+" completed."],
    [/^(\d+)행 (\d+)열 정답 (\d+)$/,m=>"Row "+m[1]+", column "+m[2]+": "+m[3]],
    [/^(\d+)행 (\d+)열$/,m=>"Row "+m[1]+", column "+m[2]],
    [/^고정 숫자 (\d+)개$/,m=>m[1]+" given numbers"],
    [/^남은 목숨 (\d+)개$/,m=>m[1]+" hearts left"],
    [/^(.+) 정답 (\d+)점$/,m=>m[1]+" scored "+m[2]+" points"],
    [/^(.+) 오답 하트 (\d+)개$/,m=>m[1]+" made a mistake. "+m[2]+" hearts left"],
    [/^(.+) 시간 초과$/,m=>m[1]+" ran out of time"],
    [/^상대가 퍼즐의 (절반|3분의 2)을 채웠어요$/,m=>"Your opponent has filled "+(m[1]==="절반"?"half":"two thirds")+" of the puzzle."],
    [/^(.+)을 채웠어요$/,m=>m[1]+" completed"],
    [/^상대가 (.+)$/,m=>"Opponent "+m[1]],
    [/^내 점수 (-?\d+)점 상대 (-?\d+)점$/,m=>"My score: "+m[1]+". Opponent: "+m[2]],
    [/^(\d+)초 경기 (\d+)분$/,m=>"Move limit: "+m[1]+" sec. Match: "+m[2]+" min."],
    [/^입력 (\d+)초 전체 (\d+)분 하트 (\d+)개$/,m=>"Move time "+m[1]+" sec. Match "+m[2]+" min. Hearts "+m[3]],
    [/^(.+) \/ 입력 (\d+)초 \/ 전체 (\d+)분 \/ 하트 (\d+)개$/,m=>m[1]+" / Move time "+m[2]+" sec / Match "+m[3]+" min / "+m[4]+" hearts"],
    [/^방 (\d{4})에 연결 중…$/,m=>"Connecting to room "+m[1]+"…"],
    [/^방 개설 실패: (.+)$/,m=>"Could not create room: "+m[1]],
    [/^입장 실패: (.+)$/,m=>"Could not join: "+m[1]],
    [/^연결 실패: (.+)$/,m=>"Connection failed: "+m[1]],
    [/^매칭 오류: (.+)$/,m=>"Matchmaking error: "+m[1]],
    [/^(.+)점 상대 (.+)점$/,m=>m[1]+" points. Opponent "+m[2]+" points"]
  ];
  const beforeAfter = /^(\s*)([\s\S]*?)(\s*)$/;
  function translate(text) {
    if(lang!=="en" || typeof text!=="string" || !/[가-힣]/.test(text))return text;
    const parts=text.match(beforeAfter);if(!parts)return text;
    const lead=parts[1],original=parts[2],trail=parts[3],normal=original.replace(/\s+/g," ").trim();
    if(!normal)return text;
    // Preserve decorative icons without breaking the underlying full sentence.
    const decorated=normal.match(/^([✎⏱↻✓●★💔🏆💡\s]+)(.+)$/u);
    const target=decorated?decorated[2].trim():normal;
    let result=normalizedLookup.get(normal);
    if(result===undefined)result=normalizedLookup.get(target);
    if(result===undefined) {
      for(const [pattern,formatter] of dynamicRules){
        const match=target.match(pattern);
        if(match){result=formatter(match);break}
      }
    }
    if(result!==undefined && decorated)result=decorated[1]+result;
    if(result===undefined) {
      // Translate a paragraph only if *every* sentence has a full translation.
      const sentences=normal.match(/[^.!?]+[.!?]*/g);
      if(sentences && sentences.length>1){
        const translated=sentences.map(v=>normalizedLookup.get(v.trim()));
        if(translated.every(x=>x!==undefined))result=translated.join(" ");
      }
    }
    // Unknown UI strings stay intact instead of becoming broken Korean-English hybrids.
    return result===undefined?text:lead+result+trail;
  }
  function processNode(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      const el = node.parentElement;
      if (!el || el.closest("script,style,textarea,code,[data-no-translate]")) return;
      if (/[가-힣]/.test(node.data)) {
        const changed = translate(node.data);
        if (changed !== node.data) node.data = changed;
      }
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node;
    if (el.matches("script,style,textarea,code,[data-no-translate]")) return;
    for (const attr of ["placeholder","aria-label","title","alt"]) {
      const before = el.getAttribute(attr);
      if (before && /[가-힣]/.test(before)) {
        const after = translate(before);
        if (after !== before) el.setAttribute(attr,after);
      }
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let child;
    while((child=walker.nextNode())) {
      if(child.nodeType === 1) {
        const c=child;
        if (c.matches("script,style,textarea,code,[data-no-translate]")) {
          walker.currentNode = c;
          continue;
        }
        for (const attr of ["placeholder","aria-label","title","alt"]) {
          const before = c.getAttribute(attr);
          if(before && /[가-힣]/.test(before)) {
            const after=translate(before);
            if(after!==before)c.setAttribute(attr,after);
          }
        }
      } else if (child.nodeType===3) {
        const p=child.parentElement;
        if(p && !p.closest("script,style,textarea,code,[data-no-translate]") && /[가-힣]/.test(child.data)) {
          const after=translate(child.data);
          if(after!==child.data)child.data=after;
        }
      }
    }
  }
  let initialized = false;
  function initialize() {
    if (initialized) return;
    initialized = true;
    if (lang === "en" && document.body) {
      processNode(document.body);
      const observer = new MutationObserver(records=>{
        for(const record of records){
          if(record.type==="characterData")processNode(record.target);
          else if(record.type==="attributes")processNode(record.target);
          else for(const node of record.addedNodes) processNode(node);
        }
      });
      observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title","alt"]});
    }
    document.documentElement.dataset.siteReady = "1";
  }
  window.SUDOKU_I18N = {lang,translate,initialize};
  document.addEventListener("DOMContentLoaded", initialize, {once:true});
})();
