// Система результатов и сохранений
let gameState = {
    currentLevel: 1,
    systems: {
        website: 100,
        accounts: 100,
        email: 100,
        turnstiles: 100,
        cameras: 100
    },
    levelResults: {},
    stats: {
        totalTime: 0,
        totalCombos: 0,
        levelsPassed: 0,
        perfectLevels: 0
    }
};

// Загрузка состояния игры
function loadGameState() {
    const saved = loadData('gameState');
    if (saved) {
        gameState = { ...gameState, ...saved };
    }
    return gameState;
}

// Сохранение состояния игры
function saveGameState() {
    saveData('gameState', gameState);
}

// Получить состояние игры
function getGameState() {
    return gameState;
}

// Сохранение результата уровня
function saveLevelResult(levelId, result) {
    gameState.levelResults[levelId] = result;
    
    // Обновление статистики
    if (result.success) {
        gameState.stats.levelsPassed++;
        if (result.grade === 'S') {
            gameState.stats.perfectLevels++;
        }
    }
    
    gameState.stats.totalTime += result.time;
    gameState.stats.totalCombos += result.combos;
    
    // Обновление состояния систем
    const level = getLevel(levelId);
    if (level && !result.success) {
        gameState.systems[level.targetSystem] = 0;
    }
    
    // Переход на следующий уровень
    if (result.success && levelId < 5) {
        gameState.currentLevel = levelId + 1;
    }
    
    saveGameState();
}

// Получить результат уровня
function getLevelResult(levelId) {
    return gameState.levelResults[levelId];
}

// Показать результаты уровня
function showLevelResult(result) {
    const screen = document.getElementById('level-result-screen');
    if (!screen) return;
    
    const level = currentLevel;
    if (!level) return;
    
    // Заголовок
    const title = document.getElementById('result-title');
    const grade = document.getElementById('result-grade');
    
    if (title) {
        title.textContent = result.success ? '✅ Уровень пройден!' : '❌ Уровень провален!';
    }
    
    if (grade) {
        grade.textContent = result.grade;
        grade.style.color = GRADES[result.grade === 'S' ? 'PERFECT' : 
                            result.grade === 'A' ? 'EXCELLENT' :
                            result.grade === 'B' ? 'GOOD' :
                            result.grade === 'C' ? 'SATISFACTORY' : 'FAIL'].color;
    }
    
    // Статистика
    const timeEl = document.getElementById('result-time');
    const combosEl = document.getElementById('result-combos');
    const accuracyEl = document.getElementById('result-accuracy');
    
    if (timeEl) timeEl.textContent = `${result.time} сек`;
    if (combosEl) combosEl.textContent = result.combos;
    if (accuracyEl) accuracyEl.textContent = `${result.accuracy}%`;
    
    // Состояние систем
    updateSystemsStatusList();
    
    // Кнопки
    const btnNext = document.getElementById('btn-next-level');
    const btnRetry = document.getElementById('btn-retry-level');
    const btnContinue = document.getElementById('btn-continue-after-fail');
    
    if (result.success) {
        if (btnNext) btnNext.style.display = 'block';
        if (btnRetry) btnRetry.style.display = 'none';
        if (btnContinue) btnContinue.style.display = 'none';
    } else {
        if (btnNext) btnNext.style.display = 'none';
        if (btnRetry) btnRetry.style.display = 'block';
        if (btnContinue) btnContinue.style.display = 'block';
    }
    
    showScreen('level-result-screen');
}

// Обновление списка состояния систем
function updateSystemsStatusList() {
    const list = document.getElementById('systems-status-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    Object.keys(SYSTEMS).forEach(key => {
        const system = SYSTEMS[key];
        const health = gameState.systems[key] || 100;
        const level = currentLevel;
        const failed = level && level.targetSystem === key && health === 0;
        
        const item = document.createElement('div');
        item.className = `system-status-item ${failed ? 'failed' : health < 50 ? 'warning' : ''}`;
        
        const info = document.createElement('div');
        info.className = 'system-status-info';
        
        const icon = document.createElement('span');
        icon.className = 'system-status-icon';
        icon.textContent = system.icon;
        
        const name = document.createElement('span');
        name.className = 'system-status-name';
        name.textContent = system.name;
        
        info.appendChild(icon);
        info.appendChild(name);
        
        const value = document.createElement('span');
        value.className = `system-status-value ${health === 100 ? 'success' : health >= 50 ? 'warning' : 'danger'}`;
        
        if (failed) {
            value.textContent = '0% (ПАДЕНИЕ)';
        } else {
            value.textContent = `${health}%`;
        }
        
        item.appendChild(info);
        item.appendChild(value);
        list.appendChild(item);
    });
}

// Показать финальные результаты
function showFinalResults() {
    const screen = document.getElementById('final-screen');
    if (!screen) return;
    
    // Расчет общей оценки
    const grades = Object.values(gameState.levelResults)
        .filter(r => r.success)
        .map(r => {
            const gradeMap = { S: 4, A: 3, B: 2, C: 1, F: 0 };
            return gradeMap[r.grade] || 0;
        });
    
    const avgGrade = grades.length > 0 
        ? grades.reduce((a, b) => a + b, 0) / grades.length 
        : 0;
    
    let overallGrade = 'F';
    if (avgGrade >= 3.5) overallGrade = 'S';
    else if (avgGrade >= 2.5) overallGrade = 'A';
    else if (avgGrade >= 1.5) overallGrade = 'B';
    else if (avgGrade >= 0.5) overallGrade = 'C';
    
    // Заголовок
    const title = document.getElementById('final-title');
    const grade = document.getElementById('final-grade');
    
    if (title) {
        const allSystemsDown = Object.values(gameState.systems).every(h => h === 0);
        title.textContent = allSystemsDown 
            ? '❌ Система компрометирована' 
            : '🏆 Итоговый отчет';
    }
    
    if (grade) {
        grade.textContent = overallGrade;
        const gradeConfig = GRADES[overallGrade === 'S' ? 'PERFECT' : 
                           overallGrade === 'A' ? 'EXCELLENT' :
                           overallGrade === 'B' ? 'GOOD' :
                           overallGrade === 'C' ? 'SATISFACTORY' : 'FAIL'];
        grade.style.color = gradeConfig.color;
    }
    
    // Общая статистика
    updateFinalStats();
    
    // Результаты по уровням
    updateLevelsResults();
    
    // Финальное состояние систем
    updateFinalSystems();
    
    // Комментарий Никлаевича
    updateFinalComment(overallGrade);
    
    showScreen('final-screen');
}

// Обновление общей статистики
function updateFinalStats() {
    const list = document.getElementById('final-stats-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const stats = [
        { label: 'Пройдено уровней', value: `${gameState.stats.levelsPassed}/5` },
        { label: 'Общая оценка', value: getOverallGrade() },
        { label: 'Среднее время', value: `${Math.round(gameState.stats.totalTime / Math.max(1, gameState.stats.levelsPassed))} сек` },
        { label: 'Всего комбо', value: gameState.stats.totalCombos },
        { label: 'Идеальных уровней', value: gameState.stats.perfectLevels }
    ];
    
    stats.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'final-stat-item';
        
        const label = document.createElement('span');
        label.textContent = stat.label;
        
        const value = document.createElement('span');
        value.textContent = stat.value;
        value.style.fontWeight = '700';
        
        item.appendChild(label);
        item.appendChild(value);
        list.appendChild(item);
    });
}

// Обновление результатов по уровням
function updateLevelsResults() {
    const list = document.getElementById('levels-results-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const level = getLevel(i);
        const result = gameState.levelResults[i];
        
        if (!level) continue;
        
        const item = document.createElement('div');
        item.className = 'level-result-item';
        
        const name = document.createElement('span');
        name.textContent = `Уровень ${i} - ${level.name}`;
        
        const grade = document.createElement('span');
        if (result) {
            grade.textContent = `${result.grade} ${result.success ? '✅' : '❌'}`;
            grade.style.fontWeight = '700';
            grade.style.color = GRADES[result.grade === 'S' ? 'PERFECT' : 
                                result.grade === 'A' ? 'EXCELLENT' :
                                result.grade === 'B' ? 'GOOD' :
                                result.grade === 'C' ? 'SATISFACTORY' : 'FAIL'].color;
        } else {
            grade.textContent = 'Не пройден';
            grade.style.color = '#cbd5e1';
        }
        
        item.appendChild(name);
        item.appendChild(grade);
        list.appendChild(item);
    }
}

// Обновление финального состояния систем
function updateFinalSystems() {
    const list = document.getElementById('final-systems-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    Object.keys(SYSTEMS).forEach(key => {
        const system = SYSTEMS[key];
        const health = gameState.systems[key] || 100;
        
        const item = document.createElement('div');
        item.className = `system-status-item ${health === 0 ? 'failed' : health < 50 ? 'warning' : ''}`;
        
        const info = document.createElement('div');
        info.className = 'system-status-info';
        
        const icon = document.createElement('span');
        icon.className = 'system-status-icon';
        icon.textContent = system.icon;
        
        const name = document.createElement('span');
        name.className = 'system-status-name';
        name.textContent = system.name;
        
        info.appendChild(icon);
        info.appendChild(name);
        
        const value = document.createElement('span');
        value.className = `system-status-value ${health === 100 ? 'success' : health >= 50 ? 'warning' : 'danger'}`;
        value.textContent = `${health}% ${health === 100 ? '✅' : health === 0 ? '❌' : '⚠️'}`;
        
        item.appendChild(info);
        item.appendChild(value);
        list.appendChild(item);
    });
}

// Обновление финального комментария
function updateFinalComment(grade) {
    const comment = document.getElementById('final-comment');
    if (!comment) return;
    
    const comments = {
        S: 'Превосходно! Все системы работают идеально. Хакер не оставил ни единого следа. Ты настоящий профессионал кибербезопасности!',
        A: 'Отличная работа! Небольшие повреждения есть, но мы справились. Системы восстановлены и работают стабильно.',
        B: 'Хорошая работа! Есть над чем поработать, но основная защита сработала. Системы требуют проверки.',
        C: 'Мы выжили, но это было близко. Некоторые системы серьезно пострадали. Нужно будет провести полную проверку безопасности.',
        F: 'Это тяжелый урок. Система полностью скомпрометирована. Но мы извлечем из этого опыт и станем сильнее. Не сдавайся!'
    };
    
    const p = comment.querySelector('p');
    if (p) {
        p.textContent = `"${comments[grade] || comments.F}"`;
    }
}

// Получить общую оценку
function getOverallGrade() {
    const grades = Object.values(gameState.levelResults)
        .filter(r => r.success)
        .map(r => {
            const gradeMap = { S: 4, A: 3, B: 2, C: 1, F: 0 };
            return gradeMap[r.grade] || 0;
        });
    
    if (grades.length === 0) return 'F';
    
    const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
    
    if (avgGrade >= 3.5) return 'S';
    if (avgGrade >= 2.5) return 'A';
    if (avgGrade >= 1.5) return 'B';
    if (avgGrade >= 0.5) return 'C';
    return 'F';
}

// Сброс игры
function resetGame() {
    gameState = {
        currentLevel: 1,
        systems: {
            website: 100,
            accounts: 100,
            email: 100,
            turnstiles: 100,
            cameras: 100
        },
        levelResults: {},
        stats: {
            totalTime: 0,
            totalCombos: 0,
            levelsPassed: 0,
            perfectLevels: 0
        }
    };
    saveGameState();
}

// Инициализация кнопок результатов
document.addEventListener('DOMContentLoaded', () => {
    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
        btnNextLevel.addEventListener('click', () => {
            const nextLevel = getNextLevel(currentLevel.id);
            if (nextLevel) {
                // Показ диалога перед следующим уровнем
                if (nextLevel.dialog && nextLevel.dialog.before) {
                    showDialog(nextLevel.dialog.before, () => {
                        initGame(nextLevel.id);
                    });
                } else {
                    initGame(nextLevel.id);
                }
            } else {
                // Игра завершена
                showFinalResults();
            }
        });
    }
    
    const btnRetry = document.getElementById('btn-retry-level');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            if (currentLevel) {
                initGame(currentLevel.id);
            }
        });
    }
    
    const btnContinue = document.getElementById('btn-continue-after-fail');
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            const nextLevel = getNextLevel(currentLevel.id);
            if (nextLevel) {
                // Показ диалога перед следующим уровнем
                if (nextLevel.dialog && nextLevel.dialog.before) {
                    showDialog(nextLevel.dialog.before, () => {
                        initGame(nextLevel.id);
                    });
                } else {
                    initGame(nextLevel.id);
                }
            } else {
                // Игра завершена
                showFinalResults();
            }
        });
    }
    
    const btnToMenu = document.getElementById('btn-to-menu');
    if (btnToMenu) {
        btnToMenu.addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
    
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            shareResults({
                levelsPassed: gameState.stats.levelsPassed,
                overallGrade: getOverallGrade(),
                totalTime: gameState.stats.totalTime
            });
        });
    }
    
    const btnRestartGame = document.getElementById('btn-restart-game');
    if (btnRestartGame) {
        btnRestartGame.addEventListener('click', () => {
            resetGame();
            startGame();
        });
    }
    
    const btnFinalMenu = document.getElementById('btn-final-menu');
    if (btnFinalMenu) {
        btnFinalMenu.addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
});

