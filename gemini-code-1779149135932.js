document.addEventListener('DOMContentLoaded', () => {
    const gameBoardContainer = document.querySelector('.game-board-container');
    const rollDiceButton = document.getElementById('roll-dice-button');
    const diceResultDisplay = document.getElementById('dice-result');
    const currentPlayerDisplay = document.getElementById('current-player');
    const eventMessageDisplay = document.getElementById('event-message');
    const numPlayersInput = document.getElementById('num-players');
    const startGameButton = document.getElementById('start-game-button');
    const playerSetupArea = document.getElementById('player-setup');
    const gameArea = document.getElementById('game-area');

    let numPlayers = 1;
    let currentPlayer = 1;
    let evented = 0;
    let playerPositions = [];
    let playerPieces = [];
    let playerNames = [];

    // マスの座標(x,y%)とイベント定義
    const squares = [
        // 0: スタート (右上)
        { name: "スタート", x: 80, y: 18, event: "最初に入手した限定S級エージェント（キャラ）は？" },
        // 1: 街の雰囲気
        { name: "街の雰囲気", x: 80, y: 41, event: "街の雰囲気で一番好きな場所は？" },
        // 2: ビジュアル
        { name: "ビジュアル", x: 80, y: 55, event: "ビジュアル（見た目や衣装）が一番好きなキャラは？" },
        // 3: よく使うパーティ
        { name: "よく使うパーティ", x: 80, y: 70, event: "よく使うパーティ編成は？" },
        // 4: チャレンジ5秒
        { name: "チャレンジ5秒", x: 80, y: 85, event: "チャレンジ！他の人が指定した「属性・特性」のキャラを5秒で答える！" },
        // 5: 好きなストーリー
        { name: "好きなストーリー", x: 62, y: 85, event: "好きなストーリーや同行任務は？" },
        // 6: 次に実装
        { name: "次に実装", x: 48, y: 85, event: "次に実装・復刻されたら絶対に引きたいキャラは？" },
        // 7: 始めたきっかけ
        { name: "始めたきっかけ", x: 34, y: 85, event: "ゼンゼロを始めたきっかけや、惹かれたポイントは？" },
        // 8: チャレンジ撮影
        { name: "チャレンジ撮影", x: 21, y: 85, event: "チャレンジ！30秒以内に街や拠点で「ボンプ」を見つけてツーショット撮影！" },
        // 9: 一番好きな陣営
        { name: "一番好きな陣営", x: 21, y: 70, event: "一番好きな陣営は？" },
        // 10: 自慢の神ディスク
        { name: "自慢の神ディスク", x: 21, y: 55, event: "自慢の神ディスク、または大爆死したディスクを見せて！" },
        // 11: 一番好きなボンプ
        { name: "一番好きなボンプ", x: 21, y: 41, event: "一番好きなボンプはどの子？" },
        // 12: チャレンジ（TVギミック、成功で15へ）
        { name: "チャレンジ（TV）", x: 21, y: 18, event: "＜チャレンジ！＞ 初期ドライバを+3強化！\\n「会心・異常・貫通」のどれかが伸びたら次のチャレンジマス（15マス目）へ進む！", special: "conditional_warp", target_index: 15 },
        // 13: どのビデオ
        { name: "どのビデオ", x: 38, y: 18, event: "どのビデオをレンタルしてみたい？" },
        // 14: 麺屋うま味
        { name: "麺屋うま味", x: 51, y: 18, event: "「麺屋うま味」で一番食べてみたいラーメンは？" },
        // 15: チャレンジ（スクラッチ、成功で2マス進む）
        { name: "チャレンジ（スクラッチ）", x: 65, y: 18, event: "＜チャレンジ！＞ スクラッチか占いをする！\\n何らかの当たりが出れば成功！(2マス進む)", special: "conditional_move", condition_value: 2 },
        // 16: 敵キャラデザイン
        { name: "敵キャラデザイン", x: 65, y: 36, event: "エーテリアスや反乱軍など、敵キャラの中でデザインが一番好きなのは？" },
        // 17: ゼンゼロ好きな曲
        { name: "ゼンゼロ好きな曲", x: 65, y: 52, event: "ゼンゼロで一番好きな曲は？" },
        // 18: 二人の組み合わせ
        { name: "二人の組み合わせ", x: 65, y: 70, event: "ゲーム内の性能・ストーリー問わず、個人的に「この2人の組み合わせが好き！」というペアは？" },
        // 19: 自分の家族
        { name: "自分の家族", x: 51, y: 70, event: "自分の家族（兄・姉など）にするなら誰がいい？" },
        // 20: ステータス画面
        { name: "ステータス画面", x: 38, y: 70, event: "キャラクターのステータス画面で、一番ポーズや表情が好きなのは誰？" },
        // 21: ゴール
        { name: "ゴール", x: 38, y: 47, event: "ゴール！おめでとう！\\n💬「よくやった。見事な結果だ。」", goal: true }
    ];

    // ゲーム開始
    startGameButton.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers > 4) numPlayers = 4;
        if (numPlayers < 1) numPlayers = 1;

        playerNames = [];
        for (let i = 1; i <= numPlayers; i++) {
            const nameInput = document.getElementById(`player-${i}-name`);
            playerNames.push(nameInput.value || `プレイヤー${i}`);
        }

        initializeGame();
        playerSetupArea.style.display = 'none'; // 設定エリアを隠す
        gameArea.style.display = 'block';     // ゲームエリアを表示
        rollDiceButton.disabled = false;
    });
    
    function initializeGame() {
        currentPlayer = 1;
        playerPositions = Array(numPlayers).fill(0);
        playerPieces.forEach(piece => piece.remove());
        playerPieces = [];

        for (let i = 0; i < numPlayers; i++) {
            const piece = document.createElement('div');
            piece.classList.add('player-piece', `player-${i + 1}`);
            gameBoardContainer.appendChild(piece);
            playerPieces.push(piece);
            updatePlayerPiecePosition(i);
        }
        updateGameInfo();
        eventMessageDisplay.textContent = `ゲームスタート！\\nまずは全員、「${squares[0].event}」`;
    }

    // サイコロを振る
    rollDiceButton.addEventListener('click', () => {
        const diceRoll = Math.floor(Math.random() * 5) + 1; // 1d5 (1〜5面ダイス)
        diceResultDisplay.textContent = diceRoll;
        evented = 0;
        movePlayer(diceRoll);
    });

    function movePlayer(steps) {
        let currentPositionIndex = playerPositions[currentPlayer - 1];
        let newPositionIndex = currentPositionIndex + steps;

        // ゴール判定
        if (newPositionIndex >= squares.length - 1) {
            newPositionIndex = squares.length - 1; // ゴールマス
            playerPositions[currentPlayer - 1] = newPositionIndex;
            updatePlayerPiecePosition(currentPlayer - 1);
            updateGameInfo();
            eventMessageDisplay.textContent = `🎉 ${playerNames[currentPlayer - 1]} が到着！ 🎉\\n${squares[newPositionIndex].event}`;
            rollDiceButton.disabled = true; // ゲーム終了
            alert(`${playerNames[currentPlayer - 1]}の勝利です！おめでとうございます！`);
            return;
        }

        playerPositions[currentPlayer - 1] = newPositionIndex;
        updatePlayerPiecePosition(currentPlayer - 1);
        updateGameInfo();
        handleSquareEvent(newPositionIndex);

        // 特殊イベントで移動（evented=1）した場合はターンを進めない（handleSquareEvent内で処理済み）
        if (evented === 0) {
            currentPlayer = (currentPlayer % numPlayers) + 1;
            updateGameInfo();
        }
    }

    // マスのイベント処理
    function handleSquareEvent(squareIndex) {
        const square = squares[squareIndex];
        eventMessageDisplay.textContent = `${playerNames[currentPlayer - 1]} が止まりました。\\n💬「${square.event}」`;

        // 特殊イベントの処理
        if (square.special === "conditional_warp") {
            // 12マス目（TVギミック）
            evented = 1;
            setTimeout(() => {
                const success = confirm("初期ドライバ強化！「会心・異常・貫通」のどれかが伸びましたか？\\n(OK = 成功 / キャンセル = 失敗)");
                if (success) {
                    eventMessageDisplay.textContent += ` \\n✨ 大成功！一気に ${square.target_index} マス目までワープします！ ✨`;
                    playerPositions[currentPlayer - 1] = square.target_index;
                    updatePlayerPiecePosition(currentPlayer - 1);
                    // ワープ先のマスのイベントも処理
                    setTimeout(() => {
                         handleSquareEvent(square.target_index);
                    }, 500);
                } else {
                    eventMessageDisplay.textContent += " \\n💦 惜しくも失敗...通常通りターンを終了します。";
                    // ターンを進める
                    currentPlayer = (currentPlayer % numPlayers) + 1;
                    updateGameInfo();
                }
            }, 500);
        } else if (square.special === "conditional_move") {
            // 15マス目（スクラッチ）
            evented = 1;
            setTimeout(() => {
                const criticalHit = confirm("スクラッチ、何らかの当たりが出ましたか？ (OK = はい / キャンセル = いいえ)");
                if (criticalHit) {
                    eventMessageDisplay.textContent += ` 🎉 当たり！ボーナスでさらに ${square.condition_value} マス進みます。`;
                    // 再度移動処理を呼び出す
                    setTimeout(() => {
                        evented = 0; // conditional_move内でのmovePlayer呼び出しのためにフラグをリセット
                        movePlayer(square.condition_value);
                    }, 500);
                } else {
                    eventMessageDisplay.textContent += " 💦 ハズレ...通常通りターンを終了します。";
                    // ターンを進める
                    currentPlayer = (currentPlayer % numPlayers) + 1;
                    updateGameInfo();
                }
            }, 500);
        }
    }

    // コマの位置更新
    function updatePlayerPiecePosition(playerIndex) {
        const squareIndex = playerPositions[playerIndex];
        const square = squares[squareIndex];
        const piece = playerPieces[playerIndex];

        if (square && piece) {
            const pieceWidth = 30; // CSSと合わせる
            const pieceHeight = 30;

            piece.style.left = `calc(${square.x}% - ${pieceWidth / 2}px)`;
            piece.style.top = `calc(${square.y}% - ${pieceHeight / 2}px)`;

            // 複数のコマが重なる場合のオフセット
            let offsetMagnitude = window.innerWidth < 600 ? 3 : 5;
            let overlapCount = 0;
            let transformX = 0;
            let transformY = 0;

            for (let i = 0; i < numPlayers; i++) {
                if (i !== playerIndex && playerPositions[i] === squareIndex) {
                    overlapCount++;
                    switch((playerIndex + overlapCount) % 4) { 
                        case 0: transformX += offsetMagnitude; transformY += offsetMagnitude; break;
                        case 1: transformX -= offsetMagnitude; transformY += offsetMagnitude; break;
                        case 2: transformX += offsetMagnitude; transformY -= offsetMagnitude; break;
                        case 3: transformX -= offsetMagnitude; transformY -= offsetMagnitude; break;
                    }
                }
            }
            piece.style.transform = `translate(${transformX}px, ${transformY}px)`;
        }
    }

    function updateGameInfo() {
        currentPlayerDisplay.textContent = playerNames[currentPlayer - 1];
    }

    rollDiceButton.disabled = true;
});