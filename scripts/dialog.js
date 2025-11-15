// Система диалогов
let currentDialogIndex = 0;
let currentDialogArray = [];
let dialogCallback = null;

// Показать диалог
function showDialog(dialogs, callback) {
    if (!dialogs || dialogs.length === 0) {
        if (callback) callback();
        return;
    }
    
    currentDialogArray = dialogs;
    currentDialogIndex = 0;
    dialogCallback = callback;
    
    showScreen('dialog-screen');
    displayDialog();
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
    console.log('nextDialog вызван, текущий индекс:', currentDialogIndex, 'всего диалогов:', currentDialogArray.length);
    
    // Если текст еще печатается, пропускаем анимацию
    const textEl = document.getElementById('dialog-text');
    if (textEl) {
        const dialog = currentDialogArray[currentDialogIndex];
        if (dialog && textEl.textContent.length < dialog.text.length) {
            // Пропускаем анимацию, показываем весь текст сразу
            textEl.textContent = dialog.text;
            return;
        }
    }
    
    currentDialogIndex++;
    if (currentDialogIndex < currentDialogArray.length) {
        displayDialog();
    } else {
        // Все диалоги показаны
        console.log('Все диалоги завершены, вызываем callback');
        if (dialogCallback) {
            const callback = dialogCallback;
            dialogCallback = null;
            currentDialogArray = [];
            currentDialogIndex = 0;
            // Небольшая задержка для плавного перехода
            setTimeout(() => {
                callback();
            }, 100);
        } else {
            console.error('Нет callback для диалога!');
        }
    }
}

// Инициализация кнопки диалога
document.addEventListener('DOMContentLoaded', () => {
    const btnDialogNext = document.getElementById('btn-dialog-next');
    if (btnDialogNext) {
        btnDialogNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка "Продолжить" в диалоге нажата');
            hapticFeedback('light');
            nextDialog();
        });
    } else {
        console.error('Кнопка btn-dialog-next не найдена!');
    }
});

