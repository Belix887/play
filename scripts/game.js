// Игровая логика
let gameBoard = [];
let selectedCells = [];
let currentLevel = null;
let gameTimer = null;
let timeLeft = 0;
let isPaused = false;
let isGameOver = false;
let comboCount = 0;
let currentCombo = 0;
let levelObjectives = {};
let levelProgress = {};

// Инициализация игры
function initGame(levelId) {
    console.log('initGame вызван для уровня:', levelId);
    const level = getLevel(levelId);
    if (!level) {
        console.error('Уровень не найден:', levelId);
        return;
    }
    
    console.log('Уровень найден:', level.name);
    currentLevel = level;
    timeLeft = level.timeLimit;
    selectedCells = [];
    comboCount = 0;
    currentCombo = 0;
    isPaused = false;
    isGameOver = false;
    
    // Инициализация целей уровня
    levelObjectives = {};
    levelProgress = {};
    level.objectives.forEach(obj => {
        levelObjectives[obj.type] = obj.count;
        levelProgress[obj.type] = 0;
    });
    
    console.log('Цели уровня:', levelObjectives);
    
    // Создание игрового поля
    createBoard();
    console.log('Игровое поле создано');
    
    // Обновление UI
    updateUI();
    console.log('UI обновлен');
    
    // Запуск таймера
    startTimer();
    console.log('Таймер запущен');
    
    // Показ экрана игры
    console.log('Показываем игровой экран');
    
    // Убеждаемся, что все другие экраны скрыты
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем игровой экран
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.classList.add('active');
        console.log('Игровой экран найден и активирован');
        
        // Проверяем видимость
        const isVisible = window.getComputedStyle(gameScreen).display !== 'none';
        console.log('Игровой экран виден:', isVisible);
    } else {
        console.error('Игровой экран не найден в DOM!');
    }
    
    // Дополнительная проверка через showScreen
    if (typeof showScreen === 'function') {
        showScreen('game-screen');
    }
    
    console.log('Игровой экран должен быть виден');
}

// Создание игрового поля
function createBoard() {
    console.log('=== createBoard вызван ===');
    const board = document.getElementById('game-board');
    if (!board) {
        console.error('Игровое поле (game-board) не найдено в DOM!');
        return;
    }
    
    console.log('Игровое поле найдено, очищаем...');
    board.innerHTML = '';
    gameBoard = [];
    
    console.log('Создаем ячейки, размер поля:', CONFIG.BOARD_SIZE, 'x', CONFIG.BOARD_SIZE);
    
    // Создание двумерного массива
    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        gameBoard[row] = [];
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            const cell = createCell(row, col);
            gameBoard[row][col] = cell;
            board.appendChild(cell.element);
        }
    }
    
    console.log('Ячейки созданы, всего:', CONFIG.BOARD_SIZE * CONFIG.BOARD_SIZE);
    
    // Удаление начальных совпадений
    let attempts = 0;
    while (findMatches().length > 0 && attempts < 10) {
        refillBoard();
        attempts++;
    }
    
    console.log('Игровое поле готово');
}

// Создание ячейки
function createCell(row, col) {
    const element = document.createElement('div');
    element.className = 'game-cell';
    element.dataset.row = row;
    element.dataset.col = col;
    
    const type = getRandomElementType();
    element.classList.add(`element-${type}`);
    element.textContent = CONFIG.ELEMENT_EMOJIS[type];
    element.dataset.type = type;
    
    element.addEventListener('click', () => handleCellClick(row, col));
    
    return {
        element,
        row,
        col,
        type
    };
}

// Получить случайный тип элемента
function getRandomElementType() {
    const types = Object.values(CONFIG.ELEMENT_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// Обработка клика по ячейке
function handleCellClick(row, col) {
    if (isPaused || isGameOver) return;
    
    const cell = gameBoard[row][col];
    if (!cell) return;
    
    // Если ячейка уже выбрана, снимаем выделение
    const index = selectedCells.findIndex(c => c.row === row && c.col === col);
    if (index !== -1) {
        selectedCells.splice(index, 1);
        cell.element.classList.remove('selected');
        return;
    }
    
    // Проверка соседства
    if (selectedCells.length > 0) {
        const lastCell = selectedCells[selectedCells.length - 1];
        const isNeighbor = Math.abs(lastCell.row - row) <= 1 && 
                          Math.abs(lastCell.col - col) <= 1 &&
                          !(lastCell.row === row && lastCell.col === col);
        
        if (!isNeighbor) {
            // Сброс выбора
            selectedCells.forEach(c => c.element.classList.remove('selected'));
            selectedCells = [];
        }
    }
    
    // Добавление ячейки в выбор
    selectedCells.push(cell);
    cell.element.classList.add('selected');
    
    // Проверка на совпадение
    if (selectedCells.length >= CONFIG.MIN_MATCH) {
        const types = selectedCells.map(c => c.type);
        if (types.every(t => t === types[0])) {
            // Все элементы одного типа - совпадение!
            processMatch(selectedCells);
            selectedCells = [];
        }
    }
}

// Обработка совпадения
function processMatch(cells) {
    if (cells.length < CONFIG.MIN_MATCH) return;
    
    const type = cells[0].type;
    const count = cells.length;
    
    // Обновление прогресса
    if (levelObjectives[type]) {
        levelProgress[type] = Math.min(
            levelProgress[type] + count,
            levelObjectives[type]
        );
    }
    
    // Подсчет комбо
    if (count > CONFIG.MIN_MATCH) {
        currentCombo += count - CONFIG.MIN_MATCH;
        comboCount++;
        showComboIndicator(currentCombo);
        hapticFeedback('medium');
    }
    
    // Удаление ячеек
    cells.forEach(cell => {
        cell.element.classList.add('matched');
        setTimeout(() => {
            cell.element.remove();
            gameBoard[cell.row][cell.col] = null;
        }, CONFIG.ANIMATION_DURATION);
    });
    
    // Падение элементов
    setTimeout(() => {
        fallElements();
        refillBoard();
        checkMatches();
        updateUI();
        checkLevelComplete();
    }, CONFIG.ANIMATION_DURATION + 100);
}

// Падение элементов
function fallElements() {
    for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        let writeIndex = CONFIG.BOARD_SIZE - 1;
        
        for (let row = CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
            if (gameBoard[row][col]) {
                if (writeIndex !== row) {
                    const cell = gameBoard[row][col];
                    gameBoard[writeIndex][col] = cell;
                    gameBoard[row][col] = null;
                    
                    cell.row = writeIndex;
                    cell.element.dataset.row = writeIndex;
                    cell.element.classList.add('falling');
                }
                writeIndex--;
            }
        }
        
        // Заполнение пустых ячеек сверху
        while (writeIndex >= 0) {
            const newCell = createCell(writeIndex, col);
            gameBoard[writeIndex][col] = newCell;
            const board = document.getElementById('game-board');
            board.insertBefore(newCell.element, board.children[writeIndex * CONFIG.BOARD_SIZE + col]);
            newCell.element.classList.add('falling');
            writeIndex--;
        }
    }
}

// Заполнение пустых ячеек
function refillBoard() {
    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            if (!gameBoard[row][col]) {
                const cell = createCell(row, col);
                gameBoard[row][col] = cell;
                const board = document.getElementById('game-board');
                const index = row * CONFIG.BOARD_SIZE + col;
                if (board.children[index]) {
                    board.insertBefore(cell.element, board.children[index]);
                } else {
                    board.appendChild(cell.element);
                }
            }
        }
    }
}

// Поиск совпадений
function findMatches() {
    const matches = [];
    
    // Горизонтальные совпадения
    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
        let count = 1;
        let type = gameBoard[row][0]?.type;
        
        for (let col = 1; col < CONFIG.BOARD_SIZE; col++) {
            const cell = gameBoard[row][col];
            if (cell && cell.type === type) {
                count++;
            } else {
                if (count >= CONFIG.MIN_MATCH && type) {
                    for (let i = col - count; i < col; i++) {
                        matches.push(gameBoard[row][i]);
                    }
                }
                count = 1;
                type = cell?.type;
            }
        }
        
        if (count >= CONFIG.MIN_MATCH && type) {
            for (let i = CONFIG.BOARD_SIZE - count; i < CONFIG.BOARD_SIZE; i++) {
                matches.push(gameBoard[row][i]);
            }
        }
    }
    
    // Вертикальные совпадения
    for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        let count = 1;
        let type = gameBoard[0][col]?.type;
        
        for (let row = 1; row < CONFIG.BOARD_SIZE; row++) {
            const cell = gameBoard[row][col];
            if (cell && cell.type === type) {
                count++;
            } else {
                if (count >= CONFIG.MIN_MATCH && type) {
                    for (let i = row - count; i < row; i++) {
                        matches.push(gameBoard[i][col]);
                    }
                }
                count = 1;
                type = cell?.type;
            }
        }
        
        if (count >= CONFIG.MIN_MATCH && type) {
            for (let i = CONFIG.BOARD_SIZE - count; i < CONFIG.BOARD_SIZE; i++) {
                matches.push(gameBoard[i][col]);
            }
        }
    }
    
    return matches;
}

// Проверка совпадений после заполнения
function checkMatches() {
    const matches = findMatches();
    if (matches.length > 0) {
        // Группировка по типу
        const groups = {};
        matches.forEach(cell => {
            if (!groups[cell.type]) {
                groups[cell.type] = [];
            }
            groups[cell.type].push(cell);
        });
        
        // Обработка каждой группы
        Object.values(groups).forEach(group => {
            if (group.length >= CONFIG.MIN_MATCH) {
                processMatch(group);
            }
        });
        
        // Рекурсивная проверка
        setTimeout(() => {
            fallElements();
            refillBoard();
            checkMatches();
        }, CONFIG.FALL_DURATION);
    }
}

// Проверка завершения уровня
function checkLevelComplete() {
    let allComplete = true;
    Object.keys(levelObjectives).forEach(type => {
        if (levelProgress[type] < levelObjectives[type]) {
            allComplete = false;
        }
    });
    
    if (allComplete) {
        levelComplete(true);
    }
}

// Завершение уровня
function levelComplete(success) {
    if (isGameOver) return;
    
    isGameOver = true;
    stopTimer();
    
    if (success) {
        hapticFeedback('success');
    } else {
        hapticFeedback('error');
    }
    
    // Сохранение результатов уровня
    const levelResult = calculateLevelResult(success);
    saveLevelResult(currentLevel.id, levelResult);
    
    // Показ результатов
    setTimeout(() => {
        showLevelResult(levelResult);
    }, 500);
}

// Расчет результата уровня
function calculateLevelResult(success) {
    const timeUsed = currentLevel.timeLimit - timeLeft;
    const timeScore = Math.max(0, 100 - (timeUsed / currentLevel.timeLimit) * 100);
    const comboScore = Math.min(100, comboCount * 10);
    const progressScore = success ? 100 : 0;
    
    const totalScore = (timeScore * 0.4 + comboScore * 0.3 + progressScore * 0.3);
    
    let grade = GRADES.FAIL;
    if (totalScore >= GRADES.PERFECT.minScore) grade = GRADES.PERFECT;
    else if (totalScore >= GRADES.EXCELLENT.minScore) grade = GRADES.EXCELLENT;
    else if (totalScore >= GRADES.GOOD.minScore) grade = GRADES.GOOD;
    else if (totalScore >= GRADES.SATISFACTORY.minScore) grade = GRADES.SATISFACTORY;
    
    return {
        success,
        grade: grade.name,
        time: timeUsed,
        combos: comboCount,
        accuracy: Math.round(totalScore),
        score: Math.round(totalScore)
    };
}

// Таймер
function startTimer() {
    if (gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
        if (!isPaused && !isGameOver) {
            timeLeft--;
            updateTimer();
            
            if (timeLeft <= 0) {
                levelComplete(false);
            } else if (timeLeft <= 10) {
                hapticFeedback('light');
            }
        }
    }, 1000);
}

function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimer() {
    const timerEl = document.getElementById('timer');
    if (timerEl) {
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.classList.add('warning');
        } else {
            timerEl.classList.remove('warning');
        }
    }
}

// Обновление UI
function updateUI() {
    // Обновление уровня
    const levelEl = document.getElementById('current-level');
    if (levelEl && currentLevel) {
        levelEl.textContent = currentLevel.id;
    }
    
    // Обновление целей
    updateObjectives();
    
    // Обновление состояния систем
    updateSystemsHealth();
}

// Обновление целей
function updateObjectives() {
    if (!currentLevel) return;
    
    const objectiveText = document.getElementById('objective-text');
    const objectiveCount = document.getElementById('objective-count');
    const progressBar = document.getElementById('objective-progress-bar');
    
    if (!objectiveText || !objectiveCount || !progressBar) return;
    
    // Формирование текста целей
    const objectivesList = currentLevel.objectives.map(obj => {
        const progress = levelProgress[obj.type] || 0;
        const total = obj.count;
        const emoji = CONFIG.ELEMENT_EMOJIS[obj.type];
        return `${emoji} ${progress}/${total}`;
    });
    
    objectiveText.textContent = objectivesList.join(' | ');
    
    // Расчет общего прогресса
    let totalNeeded = 0;
    let totalProgress = 0;
    
    Object.keys(levelObjectives).forEach(type => {
        totalNeeded += levelObjectives[type];
        totalProgress += levelProgress[type] || 0;
    });
    
    const progressPercent = totalNeeded > 0 ? (totalProgress / totalNeeded) * 100 : 0;
    progressBar.style.width = `${Math.min(100, progressPercent)}%`;
    
    objectiveCount.textContent = `${totalProgress} / ${totalNeeded}`;
}

// Обновление здоровья систем
function updateSystemsHealth() {
    if (!currentLevel) return;
    
    const targetSystem = currentLevel.targetSystem;
    const systemItems = document.querySelectorAll('.system-item');
    
    systemItems.forEach(item => {
        const systemKey = item.dataset.system;
        const healthBar = item.querySelector('.health-fill');
        
        if (!healthBar) return;
        
        let health = 100;
        
        // Получаем сохраненное состояние системы
        const gameState = getGameState();
        if (gameState && gameState.systems) {
            health = gameState.systems[systemKey] || 100;
        }
        
        // Если это текущая система под атакой и уровень не пройден
        if (systemKey === targetSystem && isGameOver) {
            const levelResult = getLevelResult(currentLevel.id);
            if (levelResult && !levelResult.success) {
                health = 0;
            }
        }
        
        healthBar.style.width = `${health}%`;
        
        // Обновление классов
        healthBar.classList.remove('warning', 'danger');
        item.classList.remove('warning', 'critical');
        
        if (health <= 0) {
            healthBar.classList.add('danger');
            item.classList.add('critical');
        } else if (health < 50) {
            healthBar.classList.add('warning');
            item.classList.add('warning');
        }
    });
}

// Показать индикатор комбо
function showComboIndicator(combo) {
    const indicator = document.getElementById('combo-indicator');
    const count = document.getElementById('combo-count');
    
    if (indicator && count) {
        count.textContent = combo;
        indicator.classList.add('active');
        
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1000);
    }
}

// Пауза
function pauseGame() {
    if (isGameOver) return;
    isPaused = true;
    showScreen('pause-screen');
}

function resumeGame() {
    isPaused = false;
    hideScreen('pause-screen');
    startTimer();
}

// Инициализация кнопок игры
document.addEventListener('DOMContentLoaded', () => {
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('click', pauseGame);
    }
    
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
        btnResume.addEventListener('click', resumeGame);
    }
    
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            isPaused = false;
            isGameOver = false;
            hideScreen('pause-screen');
            if (currentLevel) {
                initGame(currentLevel.id);
            } else {
                startGame();
            }
        });
    }
    
    const btnQuit = document.getElementById('btn-quit');
    if (btnQuit) {
        btnQuit.addEventListener('click', () => {
            isPaused = false;
            isGameOver = false;
            stopTimer();
            hideScreen('pause-screen');
            showScreen('main-menu');
        });
    }
});

