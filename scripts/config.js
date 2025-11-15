// Конфигурация игры
const CONFIG = {
    BOARD_SIZE: 8,
    ELEMENT_TYPES: {
        FIREWALL: 'firewall',      // 🔴
        ANTIVIRUS: 'antivirus',    // 🔵
        ENCRYPTION: 'encryption',  // 🟢
        BACKUP: 'backup',          // 🟡
        TOKEN: 'token'             // 🟣
    },
    ELEMENT_EMOJIS: {
        firewall: '🔴',
        antivirus: '🔵',
        encryption: '🟢',
        backup: '🟡',
        token: '🟣'
    },
    MIN_MATCH: 3,
    COMBO_MULTIPLIER: 1.5,
    TIME_PENALTY: 2, // секунды за плохой ход
    TIME_BONUS: 5,   // секунды за комбо
    ANIMATION_DURATION: 300,
    FALL_DURATION: 500
};

// Системы компании
const SYSTEMS = {
    website: {
        name: 'Сайт',
        icon: '🌐',
        health: 100
    },
    accounts: {
        name: 'Личные кабинеты',
        icon: '👤',
        health: 100
    },
    email: {
        name: 'Почта',
        icon: '📧',
        health: 100
    },
    turnstiles: {
        name: 'Турникеты',
        icon: '🚪',
        health: 100
    },
    cameras: {
        name: 'Камеры',
        icon: '📹',
        health: 100
    }
};

// Оценки
const GRADES = {
    PERFECT: { name: 'S', minScore: 90, color: '#60a5fa' },
    EXCELLENT: { name: 'A', minScore: 75, color: '#34d399' },
    GOOD: { name: 'B', minScore: 60, color: '#f59e0b' },
    SATISFACTORY: { name: 'C', minScore: 40, color: '#f87171' },
    FAIL: { name: 'F', minScore: 0, color: '#ef4444' }
};

