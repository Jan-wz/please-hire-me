const app = {
    currentGame: null,
    score: 0,

    // Focus Trainer State
    focusState: {
        startTime: 0,
        clickCount: 0,
        maxClicks: 10,
        reactionTimes: [],
        gameActive: false
    },

    init() {
        console.log('Skill Drills Initialized. Insert Coin...');
    },

    loadGame(gameId) {
        console.log(`Loading game: ${gameId}`);
        if (gameId === 'focus') {
            this.startFocusGame();
        }
    },

    // --- FOCUS TRAINER ---
    startFocusGame() {
        const mainContent = document.getElementById('main-content');
        this.focusState = {
            startTime: 0,
            clickCount: 0,
            maxClicks: 10,
            reactionTimes: [],
            gameActive: false
        };

        const bestScore = localStorage.getItem('focus_best') || '--';

        mainContent.innerHTML = `
            <div class="game-container">
                <h2 style="color: var(--neon-cyan)">FOCUS TRAINER</h2>
                <div class="focus-stats">
                    <span>BEST: ${bestScore}ms</span>
                    <span id="click-counter">CLICKS: 0/10</span>
                </div>
                
                <div id="focus-area" class="focus-game-container" onclick="app.handleAreaClick(event)">
                    <div id="start-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
                        <p>CLICK TO START</p>
                        <p style="font-size:0.8rem; color:#aaa; margin-top:10px;">HIT THE TARGETS AS FAST AS YOU CAN</p>
                    </div>
                </div>

                <button class="back-btn" onclick="location.reload()">[ ESCAPE TO MENU ]</button>
            </div>
        `;
    },

    handleAreaClick(event) {
        // Initial click to start
        if (!this.focusState.gameActive && this.focusState.clickCount === 0) {
            const startMsg = document.getElementById('start-msg');
            if (startMsg) startMsg.style.display = 'none';

            this.focusState.gameActive = true;
            this.spawnTarget();
        }
    },

    spawnTarget() {
        const area = document.getElementById('focus-area');
        if (!area) return;

        // Remove existing target if any
        const existing = document.querySelector('.focus-target');
        if (existing) existing.remove();

        // Calculate random position
        // Padding of 30px to keep away from edges
        const maxX = area.clientWidth - 60;
        const maxY = area.clientHeight - 60;

        const x = Math.floor(Math.random() * maxX) + 30;
        const y = Math.floor(Math.random() * maxY) + 30;

        const target = document.createElement('div');
        target.className = 'focus-target';
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;

        // Use arrow function to preserve 'this' context or bind it
        target.onmousedown = (e) => {
            e.stopPropagation(); // Prevent area click
            this.handleTargetClick(e);
        };

        area.appendChild(target);

        this.focusState.startTime = performance.now();
    },

    handleTargetClick(event) {
        if (!this.focusState.gameActive) return;

        const endTime = performance.now();
        const reactionTime = endTime - this.focusState.startTime;

        this.focusState.reactionTimes.push(reactionTime);
        this.focusState.clickCount++;

        // Update counter
        document.getElementById('click-counter').innerText = `CLICKS: ${this.focusState.clickCount}/10`;

        if (this.focusState.clickCount >= this.focusState.maxClicks) {
            this.endFocusGame();
        } else {
            this.spawnTarget();
        }
    },

    endFocusGame() {
        this.focusState.gameActive = false;
        const avg = Math.round(this.focusState.reactionTimes.reduce((a, b) => a + b, 0) / this.focusState.reactionTimes.length);

        // Rank Logic
        let rank = '';
        let rankColor = '';
        if (avg < 250) { rank = 'ELITE FOCUS'; rankColor = 'var(--neon-green)'; }
        else if (avg < 350) { rank = 'SHARP'; rankColor = 'var(--neon-cyan)'; }
        else { rank = 'NEED COFFEE'; rankColor = '#888'; }

        // Save High Score
        const currentBest = parseInt(localStorage.getItem('focus_best')) || 9999;
        if (avg < currentBest) {
            localStorage.setItem('focus_best', avg);
        }

        const container = document.querySelector('.game-container');
        container.innerHTML = `
            <div class="game-container focus-results">
                <h2 style="color: var(--neon-cyan)">MISSION COMPLETE</h2>
                
                <div style="font-size: 4rem; margin: 1rem 0; color: #fff;">
                    ${avg}<span style="font-size:1.5rem">ms</span>
                </div>
                
                <div class="rank-badge" style="color: ${rankColor}">${rank}</div>
                
                <p>AVERAGE REACTION TIME</p>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-direction: column;">
                    <button class="arcade-btn" onclick="app.startFocusGame()">RETRY MISSION</button>
                    <button class="action-btn" onclick="app.shareScore(${avg})">SHARE SCORE 📋</button>
                    <button class="back-btn" onclick="location.reload()">[ MAIN MENU ]</button>
                </div>
            </div>
        `;
    },

    shareScore(score) {
        const text = `My average reaction time is ${score}ms! Can you beat me at Focus Trainer? 🎯`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
};

window.app = app;
app.init();
