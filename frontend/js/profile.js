// profile.js - Логика профиля

document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const photoInput = document.getElementById('photoInput');
    const avatarContainer = document.getElementById('avatarContainer');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const profilePhoto = document.getElementById('profilePhoto');
    const classSelect = document.getElementById('classNumber');
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const profileTypeDisplay = document.getElementById('profileTypeDisplay');
    const subscriptionBadge = document.getElementById('subscriptionBadge');
    const subscribeBtn = document.getElementById('subscribeBtn');

    // Загрузка фото
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    if (profilePhoto) {
                        profilePhoto.src = event.target.result;
                        profilePhoto.style.display = 'block';
                    }
                    if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
                    localStorage.setItem('profilePhoto', event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Восстановление фото
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        if (profilePhoto) {
            profilePhoto.src = savedPhoto;
            profilePhoto.style.display = 'block';
        }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    }

    // Определение типа обучения по классу
    function updateUserType(value) {
        let type = 'Тип не выбран';
        
        if (value === 'student') {
            type = 'Студент (Сессия)';
        } else if (value === '9') {
            type = 'Школьник (ОГЭ)';
        } else if (value === '11') {
            type = 'Школьник (ЕГЭ)';
        } else if (value >= 5 && value <= 11) {
            type = 'Школьник';
        }
        
        if (profileTypeDisplay) profileTypeDisplay.textContent = type;
        if (type !== 'Тип не выбран') localStorage.setItem('userType', type);
    }

    if (classSelect) {
        classSelect.addEventListener('change', function() {
            updateUserType(this.value);
        });
    }

    // Восстановление данных профиля
    const savedName = localStorage.getItem('userName');
    const savedClass = localStorage.getItem('userClass');
    const savedBirthDate = localStorage.getItem('userBirthDate');

    if (savedName) {
        if (profileNameDisplay) profileNameDisplay.textContent = savedName;
        const fullNameInput = document.getElementById('fullName');
        if (fullNameInput) fullNameInput.value = savedName;
    }
    if (savedClass && classSelect) {
        classSelect.value = savedClass;
        updateUserType(savedClass); // Сразу обновляем текст типа
    }
    if (savedBirthDate) {
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) birthDateInput.value = savedBirthDate;
    }

    // Сохранение профиля
    window.saveProfile = function() {
        const name = document.getElementById('fullName').value;
        const classNum = classSelect ? classSelect.value : '';
        
        if (!name.trim()) { alert('Введи имя и фамилию'); return; }
        if (!classNum) { alert('Выбери класс или статус'); return; }
        
        localStorage.setItem('userName', name);
        localStorage.setItem('userClass', classNum);
        localStorage.setItem('userBirthDate', document.getElementById('birthDate').value);
        
        if (profileNameDisplay) profileNameDisplay.textContent = name;
        alert('Профиль сохранен!');
    };

    // Статус подписки
    let isSubscribed = localStorage.getItem('isSubscribed') === 'true';
    
    function updateSubscriptionStatus() {
        if (!subscriptionBadge || !subscribeBtn) return;
        if (isSubscribed) {
            subscriptionBadge.textContent = '✅ Активна';
            subscriptionBadge.style.background = '#27AE60';
            subscribeBtn.textContent = 'Продлить';
        } else {
            subscriptionBadge.textContent = '📉 Нет подписки';
            subscriptionBadge.style.background = '#E74C3C';
            subscribeBtn.textContent = 'Оформить подписку';
        }
    }

    updateSubscriptionStatus();

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            if (!isSubscribed) {
                if (confirm('Симуляция: Оплатить подписку за 4900 ₽?')) {
                    isSubscribed = true;
                    localStorage.setItem('isSubscribed', 'true');
                    updateSubscriptionStatus();
                    showNotification('Подписка оформлена!');
                }
            } else {
                showNotification('Переход на страницу продления...');
            }
        });
    }
});
