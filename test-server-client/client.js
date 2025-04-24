const { io } = require('socket.io-client');

// GameOptions 타입 정의
// TypeScript 타입은 런타임에 필요하지 않으므로 주석으로 남겨둘 수 있습니다
/**
 * @typedef {Object} GameOptions
 * @property {number} [timeLimit]
 * @property {number} [increment]
 * @property {string} [variant]
 */

/**
 * @typedef {Object} GameMove
 * @property {string} [from]
 * @property {string} [to]
 * @property {string} [promotion]
 * @property {string} [playerId]
 */

// 서버 연결
const socket = io('http://localhost:8080', {
    // 연결 옵션 (필요 시 추가)
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    // 디버깅 활성화
    debug: true,
    // 트랜스포트 방식 지정 (웹소켓만 사용)
    transports: ['websocket'],
});

// 소켓 연결 이벤트 리스너
socket.on('connect', () => {
    console.log('서버에 연결되었습니다. 소켓 ID:', socket.id);
});

// 오류 처리
socket.on('connect_error', (error) => {
    console.error('연결 오류:', error.message);
});

// 게임 이벤트 리스너
socket.on('gameEvent', (event) => {
    console.log('게임 이벤트 수신:', event);
});

// 추가 오류 정보 로깅
socket.io.on('error', (error) => {
    console.log('Socket.io 오류 상세 정보:', error);
});

// 게임 생성 함수
function createGame() {
    const options = {
        timeLimit: 600, // 10분
        increment: 5,
        variant: 'standard',
    };

    console.log('게임 생성 요청 보내는 중...');

    // 1. 이벤트 기반 응답 리스너 추가
    const responseHandler = (response) => {
        console.log('게임 생성 이벤트 응답:', response);
        if (response && response.gameId) {
            console.log(`게임 ID: ${response.gameId} 생성됨`);

            // 테스트: 새로 생성된 게임에 다시 참가 시도
            joinGame(response.gameId);

            // 사용이 끝나면 리스너 제거
            socket.off('gameCreated', responseHandler);
        }
    };

    // 'gameCreated' 이벤트 리스닝
    socket.on('gameCreated', responseHandler);

    // 2. 콜백 방식 (기존 방식)
    socket.emit('createGame', options, (response) => {
        console.log('게임 생성 콜백 응답:', response);

        if (response) {
            console.log('응답 전체 구조:', JSON.stringify(response, null, 2));

            if (response.event === 'gameCreated') {
                const gameId = response.data.gameId;
                console.log(`콜백: 게임 ID: ${gameId} 생성됨`);
            } else {
                console.log('예상한 응답 형식이 아닙니다:', response);
            }
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

// 게임 참가 함수
function joinGame(gameId) {
    // 이벤트 리스너 방식 추가
    const joinedGameHandler = (response) => {
        console.log('게임 참가 이벤트 응답:', response);
        if (response && response.data && response.data.gameState) {
            console.log('이벤트: 게임 상태:', response.data.gameState);

            // 사용이 끝나면 리스너 제거
            socket.off('joinedGame', joinedGameHandler);
        }
    };

    // 'joinedGame' 이벤트 리스닝
    socket.on('joinedGame', joinedGameHandler);

    // 콜백 방식 (기존)
    socket.emit('joinGame', { gameId }, (response) => {
        console.log('게임 참가 콜백 응답:', response);
        if (response && response.event === 'joinedGame') {
            console.log('콜백: 게임 상태:', response.data.gameState);
        } else if (response) {
            console.log('예상한 응답 형식이 아닙니다:', response);
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

// 게임에서 움직임 수행 함수
function makeMove(gameId, from, to, promotion) {
    const move = {
        from,
        to,
        promotion,
    };

    // 이벤트 리스너 방식 추가
    const moveMadeHandler = (response) => {
        console.log('움직임 이벤트 응답:', response);
        if (response && response.data && response.data.gameState) {
            console.log('이벤트: 업데이트된 게임 상태:', response.data.gameState);

            // 사용이 끝나면 리스너 제거
            socket.off('moveMade', moveMadeHandler);
        }
    };

    // 'moveMade' 이벤트 리스닝
    socket.on('moveMade', moveMadeHandler);

    // 게임 종료 이벤트 리스닝
    const gameOverHandler = (response) => {
        console.log('게임 종료 이벤트:', response);
        if (response && response.data && response.data.gameState) {
            console.log('이벤트: 최종 게임 상태:', response.data.gameState);

            // 사용이 끝나면 리스너 제거
            socket.off('gameOver', gameOverHandler);
        }
    };

    socket.on('gameOver', gameOverHandler);

    // 콜백 방식 (기존)
    socket.emit('makeMove', { gameId, move }, (response) => {
        console.log('움직임 콜백 응답:', response);
        if (response && response.event === 'moveMade') {
            console.log('콜백: 업데이트된 게임 상태:', response.data.gameState);
        } else if (response && response.event === 'error') {
            console.error('콜백: 움직임 오류:', response.data.message);
        } else if (response) {
            console.log('예상한 응답 형식이 아닙니다:', response);
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

// 게임 상태 조회 함수
function getGameState(gameId) {
    // 이벤트 리스너 방식 추가
    const gameStateHandler = (response) => {
        console.log('게임 상태 이벤트 응답:', response);
        if (response && response.data && response.data.gameState) {
            console.log('이벤트: 현재 게임 상태:', response.data.gameState);

            // 사용이 끝나면 리스너 제거
            socket.off('gameState', gameStateHandler);
        }
    };

    // 'gameState' 이벤트 리스닝
    socket.on('gameState', gameStateHandler);

    // 콜백 방식 (기존)
    socket.emit('getGameState', { gameId }, (response) => {
        console.log('게임 상태 콜백 응답:', response);
        if (response && response.event === 'gameState') {
            console.log('콜백: 현재 게임 상태:', response.data.gameState);
        } else if (response) {
            console.log('예상한 응답 형식이 아닙니다:', response);
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

// 게임 퇴장 함수
function leaveGame(gameId) {
    // 이벤트 리스너 방식 추가
    const leftGameHandler = (response) => {
        console.log('게임 퇴장 이벤트 응답:', response);
        if (response && response.data) {
            console.log(`이벤트: 게임 ID: ${response.data.gameId}에서 퇴장됨`);

            // 사용이 끝나면 리스너 제거
            socket.off('leftGame', leftGameHandler);
        }
    };

    // 'leftGame' 이벤트 리스닝
    socket.on('leftGame', leftGameHandler);

    // 콜백 방식 (기존)
    socket.emit('leaveGame', { gameId }, (response) => {
        console.log('게임 퇴장 콜백 응답:', response);
        if (response && response.event === 'leftGame') {
            console.log(`콜백: 게임 ID: ${response.data.gameId}에서 퇴장됨`);
        } else if (response) {
            console.log('예상한 응답 형식이 아닙니다:', response);
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

function getGameList() {
    // 이벤트 리스너 방식 추가
    const gameListHandler = (response) => {
        console.log('게임 목록 이벤트 응답:', response);
        if (response && response.gameList) {
            console.log('이벤트: 게임 목록:', response.gameList);

            // 게임 목록 출력
            if (Array.isArray(response.gameList)) {
                console.log(`총 ${response.gameList.length}개의 게임이 있습니다.`);
                response.gameList.forEach((game, index) => {
                    console.log(`${index + 1}. 게임 ID: ${game}`);
                });
            }

            // 사용이 끝나면 리스너 제거
            socket.off('gameList', gameListHandler);
        }
    };

    // 'gameList' 이벤트 리스닝 (서버가 이 이름으로 이벤트를 emit할 것임)
    socket.on('gameList', gameListHandler);

    // 콜백 방식 (기존)
    socket.emit('getGameList', (response) => {
        console.log('게임 목록 콜백 응답:', response);

        if (response) {
            console.log('응답 전체 구조:', JSON.stringify(response, null, 2));

            if (response.event === 'gameList' && response.data && response.data.gameList) {
                console.log('콜백: 게임 목록:', response.data.gameList);

                // 게임 목록 상세 출력
                const gameList = response.data.gameList;
                if (Array.isArray(gameList)) {
                    console.log(`총 ${gameList.length}개의 게임이 있습니다.`);
                    gameList.forEach((game, index) => {
                        console.log(`${index + 1}. 게임 ID: ${game.id}`);
                    });
                }
            } else {
                console.log('예상한 응답 형식이 아닙니다:', response);
            }
        } else {
            console.log('응답이 undefined 또는 null입니다');
        }
    });
}

// 연결 종료 함수
function disconnect() {
    socket.disconnect();
    console.log('서버 연결 종료');
}

// Node.js 환경에서 사용하기 위해 함수 내보내기
module.exports = {
    createGame,
    joinGame,
    makeMove,
    getGameState,
    leaveGame,
    disconnect,
};

// 테스트를 위한 함수 호출 예시
// createGame();

// 대화형 테스트를 위한 함수 노출 (Node.js REPL에서 사용할 수 있도록)
console.log('소켓 클라이언트가 준비되었습니다. 다음 함수를 사용할 수 있습니다:');
console.log('- createGame()');
console.log('- joinGame(gameId)');
console.log('- makeMove(gameId, from, to, promotion)');
console.log('- getGameState(gameId)');
console.log('- leaveGame(gameId)');
console.log('- disconnect()');

// 스크립트 종료 방지를 위한 코드 추가
process.stdin.resume(); // 프로세스 유지

console.log('프로그램이 실행 중입니다. 종료하려면 Ctrl+C를 누르세요.');

// 테스트 실행
setTimeout(() => {
    console.log('\n5초 후 게임 생성 시도...');
    // joinGame('297ea6f0-18d0-4027-8861-3c916d66c3be');
    getGameList();
    //createGame();
}, 5000);
