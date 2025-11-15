// Система диалогов
let currentDialogIndex = 0;
let currentDialogArray = [];
let dialogCallback = null;

// Показать диалог
function showDialog(dialogs, callback) {
    console.log('=== showDialog вызван ===');
    console.log('Количество диалогов:', dialogs ? dialogs.length : 0);
    console.log('Есть callback:', !!callback);
    
    if (!dialogs || dialogs.length === 0) {
        console.log('Нет диалогов, сразу вызываем callback');
        if (callback) callback();
        return;
    }
    
    currentDialogArray = dialogs;
    currentDialogIndex = 0;
    dialogCallback = callback;
    
    console.log('Показываем экран диалога');
    showScreen('dialog-screen');
    displayDialog();
    
    // Убеждаемся, что кнопка имеет обработчик
    setTimeout(() => {
        initDialogButton();
    }, 150);
}

// Отобразить текущий диалог
function displayDialog() {
    if (currentDialogIndex >= currentDialogArray.length) {
        // Диалоги закончились
        if (dialogCallback) {
            dialogCallback();
        }
        return;
    }
    
    const dialog = currentDialogArray[currentDialogIndex];
    const portraitEl = document.getElementById('dialog-portrait');
    const nameEl = document.getElementById('dialog-name');
    const textEl = document.getElementById('dialog-text');
    
    // Установка портрета
    const avatarEl = portraitEl.querySelector('.character-avatar');
    if (avatarEl) {
        avatarEl.textContent = dialog.avatar || '👤';
    }
    
    // Установка имени
    nameEl.textContent = dialog.character || 'Персонаж';
    
    // Анимация текста
    textEl.textContent = '';
    typeText(textEl, dialog.text, 30);
}

// Печать текста по буквам
function typeText(element, text, speed = 30) {
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Следующий диалог
function nextDialog() {
    console.log('=== nextDialog вызван ===');
    console.log('Текущий индекс:', currentDialogIndex);
    console.log('Всего диалогов:', currentDialogArray.length);
    console.log('Есть callback:', !!dialogCallback);
    
    // Если текст еще печатается, пропускаем анимацию
    const textEl = document.getElementById('dialog-text');
    if (textEl && currentDialogIndex < currentDialogArray.length) {
        const dialog = currentDialogArray[currentDialogIndex];
        if (dialog && textEl.textContent.length < dialog.text.length) {
            // Пропускаем анимацию, показываем весь текст сразу
            console.log('Пропускаем анимацию печати текста');
            textEl.textContent = dialog.text;
            return;
        }
    }
    
    // Переходим к следующему диалогу
    currentDialogIndex++;
    console.log('Новый индекс после инкремента:', currentDialogIndex);
    
    if (currentDialogIndex < currentDialogArray.length) {
        console.log('Показываем следующий диалог');
        displayDialog();
    } else {
        // Все диалоги показаны
        console.log('=== Все диалоги завершены ===');
        console.log('Вызываем callback');
        
        if (dialogCallback) {
            const callback = dialogCallback;
            console.log('Callback найден, тип:', typeof callback);
            dialogCallback = null;
            currentDialogArray = [];
            currentDialogIndex = 0;
            
            // Скрываем экран диалога
            hideScreen('dialog-screen');
            
            // Небольшая задержка для плавного перехода
            setTimeout(() => {
                console.log('Выполняем callback...');
                try {
                    callback();
                    console.log('Callback выполнен успешно');
                } catch (error) {
                    console.error('Ошибка при выполнении callback:', error);
                }
            }, 200);
        } else {
            console.error('ОШИБКА: Нет callback для диалога!');
            // Попытка перейти к игре напрямую
            console.log('Пытаемся перейти к игре напрямую...');
            hideScreen('dialog-screen');
            setTimeout(() => {
                initGame(1);
            }, 200);
        }
    }
}

// Инициализация кнопки диалога
function initDialogButton() {
    const btnDialogNext = document.getElementById('btn-dialog-next');
    if (btnDialogNext) {
        // Удаляем все старые обработчики
        const newBtn = btnDialogNext.cloneNode(true);
        btnDialogNext.parentNode.replaceChild(newBtn, btnDialogNext);
        
        // Добавляем обработчики для разных событий
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка "Продолжить" в диалоге нажата');
            hapticFeedback('light');
            nextDialog();
            return false;
        };
        
        newBtn.addEventListener('click', handler);
        newBtn.addEventListener('touchend', handler);
        newBtn.onclick = handler;
        
        console.log('Обработчик кнопки диалога установлен');
    } else {
        console.error('Кнопка btn-dialog-next не найдена!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDialogButton();
});

