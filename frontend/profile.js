document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const photoInput = document.getElementById('photoInput');
    const photoContainer = document.getElementById('photoContainer');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const profilePhoto = document.getElementById('profilePhoto');
    const classSelect = document.getElementById('classNumber');
    const userTypeDiv = document.getElementById('userType');
    const referralCountDiv = document.getElementById('referralCount');
    const subscriptionStatus = document.getElementById('subscriptionStatus');

    // Загрузка фото
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePhoto.src = event.target.result;
                profilePhoto.style.display = 'block';
                photoPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Определение типа обучения
    classSelect.addEventListener('change', function() {
        const value = this.value;
        let type = '';
        
        if (value === 'student') {
            type = 'Студент (Сессия)';
        } else if (value === '9') {
            type = 'Школьник (ОГЭ)';
        } else if (value === '11') {
            type = 'Школьник (ЕГЭ)';
        } else if (value >= 5 && value <= 11) {
            type = 'Школьник';
        } else {
            type = 'Выберите класс для определения типа';
        }
        
        userTypeDiv.textContent = type;
    });

    // Сохранение профиля
    window.saveProfile = function() {
        const name = document.getElementById('fullName').value;
        const classNum = classSelect.value;
        
        if (!name.trim()) {
            alert('Пожалуйста, введите имя и фамилию');
            return;
        }
        
        if (!classNum) {
            alert('Пожалуйста, выберите класс');
            return;
        }
        
        alert('Профиль сохранен!');
        // Здесь можно добавить отправку данных на сервер
    };

    // Симуляция данных (в реальном приложении будут запросы к API)
    let referralCount = 0;
    const referralBtn = document.querySelector('button[onclick*="пригласить"]');
    if (referralBtn) {
        referralBtn.addEventListener('click', function() {
            referralCount++;
            referralCountDiv.textContent = referralCount;
        });
    }

    // Статус подписки (симуляция)
    const subscribeBtn = document.querySelector('button[onclick*="Оформить"]');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            subscriptionStatus.textContent = 'Активна';
            subscriptionStatus.style.color = '#4CAF50';
            this.textContent = 'Продлить подписку';
        });
    }
});
