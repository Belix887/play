// Главный файл приложения
let currentScreen = 'main-menu';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram
    initTelegram();
    
    // Загрузка состояния игры
    loadGameState();
    
    // Инициализация экранов
    initScreens();
    
    // Инициализация меню
    initMenu();
    
    // Показ главного меню
    showScreen('main-menu');
    
    // Проверка на продолжение игры
    checkContinueGame();
});

// Инициализация экранов
function initScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
}

// Показать экран
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
    }
}

// Скрыть экран
function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('active');
    }
}

// Инициализация меню
function initMenu() {
    const btnStart = document.getElementById('btn-start');
    const btnContinue = document.getElementById('btn-continue');
    const btnTutorial = document.getElementById('btn-tutorial');
    const btnStats = document.getElementById('btn-stats');
    const btnBackMenu = document.getElementById('btn-back-menu');
    const btnBackStats = document.getElementById('btn-back-stats');
    
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            resetGame();
            startGame();
        });
    }
    
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            continueGame();
        });
    }
    
    if (btnTutorial) {
        btnTutorial.addEventListener('click', () => {
            showScreen('tutorial-screen');
        });
    }
    
    if (btnStats) {
        btnStats.addEventListener('click', () => {
            showStats();
        });
    }
    
    if (btnBackMenu) {
        btnBackMenu.addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
    
    if (btnBackStats) {
        btnBackStats.addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
}

// Начать игру
function startGame() {
    const gameState = getGameState();
    const firstLevel = getLevel(1);
    
    if (firstLevel && firstLevel.dialog && firstLevel.dialog.before) {
        showDialog(firstLevel.dialog.before, () => {
            initGame(1);
        });
    } else {
        initGame(1);
    }
}

// Продолжить игру
function continueGame() {
    const gameState = getGameState();
    const currentLevelId = gameState.currentLevel;
    const level = getLevel(currentLevelId);
    
    if (level) {
        if (level.dialog && level.dialog.before) {
            showDialog(level.dialog.before, () => {
                initGame(currentLevelId);
            });
        } else {
            initGame(currentLevelId);
        }
    } else {
        startGame();
    }
}

// Проверка на продолжение игры
function checkContinueGame() {
    const gameState = getGameState();
    const btnContinue = document.getElementById('btn-continue');
    
    if (btnContinue && gameState.currentLevel > 1) {
        btnContinue.style.display = 'block';
    }
}

// Показать статистику
function showStats() {
    const statsContent = document.getElementById('stats-content');
    if (!statsContent) return;
    
    const gameState = getGameState();
    
    if (Object.keys(gameState.levelResults).length === 0) {
        statsContent.innerHTML = '<p class="no-stats">Пока нет статистики. Начните игру!</p>';
    } else {
        let html = '<div class="stats-grid">';
        
        html += `<div class="stat-card">
            <h3>Общая статистика</h3>
            <p>Пройдено уровней: <strong>${gameState.stats.levelsPassed}/5</strong></p>
            <p>Общая оценка: <strong>${getOverallGrade()}</strong></p>
            <p>Среднее время: <strong>${Math.round(gameState.stats.totalTime / Math.max(1, gameState.stats.levelsPassed))} сек</strong></p>
            <p>Всего комбо: <strong>${gameState.stats.totalCombos}</strong></p>
            <p>Идеальных уровней: <strong>${gameState.stats.perfectLevels}</strong></p>
        </div>`;
        
        html += '<div class="stat-card"><h3>Результаты по уровням</h3>';
        for (let i = 1; i <= 5; i++) {
            const level = getLevel(i);
            const result = gameState.levelResults[i];
            if (level) {
                html += `<p>Уровень ${i} - ${level.name}: `;
                if (result) {
                    html += `<strong>${result.grade}</strong> ${result.success ? '✅' : '❌'}`;
                } else {
                    html += '<em>Не пройден</em>';
                }
                html += '</p>';
            }
        }
        html += '</div>';
        
        html += '<div class="stat-card"><h3>Состояние систем</h3>';
        Object.keys(SYSTEMS).forEach(key => {
            const system = SYSTEMS[key];
            const health = gameState.systems[key] || 100;
            html += `<p>${system.icon} ${system.name}: <strong>${health}%</strong></p>`;
        });
        html += '</div>';
        
        html += '</div>';
        statsContent.innerHTML = html;
    }
    
    showScreen('stats-screen');
}

// Добавление стилей для статистики
const style = document.createElement('style');
style.textContent = `
    .stats-grid {
        display: grid;
        gap: 20px;
    }
    
    .stat-card {
        padding: 20px;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    
    .stat-card h3 {
        margin-bottom: 15px;
        color: var(--text-primary);
        font-size: 20px;
    }
    
    .stat-card p {
        margin: 10px 0;
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    .stat-card strong {
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

