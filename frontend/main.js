// main.js - Общая логика и переключение вкладок

// Переключение вкладышей (Pages)
function openTab(tabName, event) {
    // Скрываем все страницы
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Убираем активность у всех кнопок
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Показываем нужную страницу и активируем кнопку
    document.getElementById(tabName).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Fallback для вызова без event
        const activeBtn = document.querySelector(`.tab-button[onclick*="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Обновляем данные при переключении
    if (tabName === 'home') updateHomePage();
    if (tabName === 'referrals') updateReferralPage();
}

// Обновление Главной страницы
function updateHomePage() {
    const userType = localStorage.getItem('userType') || 'Не выбран';
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';
    const friendsCount = localStorage.getItem('referralCount') || '0';

    const homeUserType = document.getElementById('homeUserType');
    const homeSubStatus = document.getElementById('homeSubStatus');
    const homeFriendsCount = document.getElementById('homeFriendsCount');

    if (homeUserType) homeUserType.textContent = userType;
    if (homeSubStatus) homeSubStatus.textContent = isSubscribed ? 'Активна' : 'Нет';
    if (homeFriendsCount) homeFriendsCount.textContent = friendsCount;
}

// Генерация реферального кода
function generateReferralCode() {
    let code = localStorage.getItem('referralCode');
    if (code) return code;
    
    const name = localStorage.getItem('userName') || 'USER';
    const random = Math.floor(Math.random() * 10000);
    code = name.substring(0, 4).toUpperCase() + random;
    localStorage.setItem('referralCode', code);
    return code;
}

// Обновление страницы "Друзья"
function updateReferralPage() {
    const code = generateReferralCode();
    const count = localStorage.getItem('referralCount') || '0';
    
    const referralCodeEl = document.getElementById('referralCode');
    const referralsCountEl = document.getElementById('referralsCount');
    
    if (referralCodeEl) referralCodeEl.textContent = code;
    if (referralsCountEl) referralsCountEl.textContent = count;
}

// Копирование реферальной ссылки
function copyReferral() {
    const code = generateReferralCode();
    const url = window.location.origin + '?ref=' + code;
    copyToClipboard(url);
}

// Копирование в буфер
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showNotification('Ссылка скопирована!'));
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Ссылка скопирована!');
    }
}

// Уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #27AE60; color: white; 
        padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 1000; font-family: 'Soyuz Grotesk', sans-serif; animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем стили анимации для уведомлений, если их нет
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    // Генерируем код, если его нет
    generateReferralCode();
    // Обновляем главную
    updateHomePage();
    // Инициализация курсов
    initCourses();
});

// Курсы (демо-данные)
function initCourses() {
    const courses = [
        { title: 'Химия ОГЭ 2026', type: 'badge-oge', typeText: 'ОГЭ', desc: 'Подготовка к экзамену', price: '4 900 ₽' },
        { title: 'Химия ЕГЭ 2026', type: 'badge-ege', typeText: 'ЕГЭ', desc: 'Максимальный балл', price: '6 900 ₽' },
        { title: 'Сессия без стресса', type: 'badge-session', typeText: 'Студентам', desc: 'Помощь с университетом', price: '8 900 ₽' }
    ];

    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    courses.forEach(c => {
        grid.innerHTML += `
            <div class="course-card">
                <span class="badge ${c.type}">${c.typeText}</span>
                <h3 style="margin-top: 10px;">${c.title}</h3>
                <p>${c.desc}</p>
                <div style="font-size: 1.8rem; font-weight: bold; margin: 15px 0;">${c.price}</div>
                <button class="btn-primary" style="width: 100%;" onclick="showNotification('Запись на курс ${c.title}!')">Записаться</button>
            </div>
        `;
    });
}
