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
    currentDialogIndex++;
    if (currentDialogIndex < currentDialogArray.length) {
        displayDialog();
    } else {
        // Все диалоги показаны
        if (dialogCallback) {
            const callback = dialogCallback;
            dialogCallback = null;
            callback();
        }
    }
}

// Инициализация кнопки диалога
document.addEventListener('DOMContentLoaded', () => {
    const btnDialogNext = document.getElementById('btn-dialog-next');
    if (btnDialogNext) {
        btnDialogNext.addEventListener('click', nextDialog);
    }
});

