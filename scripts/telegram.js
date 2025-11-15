// Интеграция с Telegram Mini App
let tg = null;

// Инициализация Telegram Web App
function initTelegram() {
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Настройка цветовой схемы
        tg.setHeaderColor('#0f172a');
        tg.setBackgroundColor('#020617');
        
        // Включение вибрации
        tg.enableClosingConfirmation();
        
        console.log('Telegram Web App инициализирован');
        return true;
    } else {
        console.log('Telegram Web App не обнаружен, работаем в обычном режиме');
        return false;
    }
}

// Показать главную кнопку Telegram
function showMainButton(text, callback) {
    if (tg) {
        tg.MainButton.setText(text);
        tg.MainButton.onClick(callback);
        tg.MainButton.show();
    }
}

// Скрыть главную кнопку Telegram
function hideMainButton() {
    if (tg) {
        tg.MainButton.hide();
    }
}

// Показать всплывающее окно
function showAlert(message, callback) {
    if (tg) {
        tg.showAlert(message, callback);
    } else {
        alert(message);
        if (callback) callback();
    }
}

// Показать подтверждение
function showConfirm(message, callback) {
    if (tg) {
        tg.showConfirm(message, callback);
    } else {
        if (confirm(message)) {
            callback(true);
        } else {
            callback(false);
        }
    }
}

// Вибрация
function hapticFeedback(type = 'impact') {
    if (tg && tg.HapticFeedback) {
        switch(type) {
            case 'light':
                tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'error':
                tg.HapticFeedback.notificationOccurred('error');
                break;
            default:
                tg.HapticFeedback.impactOccurred('medium');
        }
    }
}

// Сохранение данных в облако Telegram
function saveData(key, data) {
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(key, JSON.stringify(data));
    } else {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// Загрузка данных из облака Telegram
function loadData(key, defaultValue = null) {
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.getItem(key, (err, value) => {
            if (!err && value) {
                return JSON.parse(value);
            }
            return defaultValue;
        });
    } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }
}

// Поделиться результатами
function shareResults(results) {
    if (tg) {
        const text = `🛡️ Киберзащита: Охранник\n\n` +
                    `Уровней пройдено: ${results.levelsPassed}/5\n` +
                    `Общая оценка: ${results.overallGrade}\n` +
                    `Время: ${results.totalTime} сек\n\n` +
                    `Защити компанию от хакерских атак!`;
        
        tg.sendData(JSON.stringify({
            type: 'share',
            text: text
        }));
    } else {
        // Для обычного браузера используем Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'Киберзащита: Охранник',
                text: `Я прошел ${results.levelsPassed} уровней с оценкой ${results.overallGrade}!`
            });
        }
    }
}

// Получить данные пользователя Telegram
function getUserData() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        return tg.initDataUnsafe.user;
    }
    return null;
}

