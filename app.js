// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Состояние приложения
let state = {
    currentSection: 'product-selection',
    order: {
        product: null,
        size: null,
        shape: null,
        material: null,
        color: null,
        options: [],
        customDescription: '',
        photos: [],
        totalPrice: 0
    }
};

// Обновление индикатора прогресса
function updateProgress() {
    const sections = ['product-selection', 'size-selection', 'shape-selection', 
                     'material-selection', 'color-selection', 'options-selection', 
                     'custom-order', 'order-preview'];
    const currentIndex = sections.indexOf(state.currentSection);
    const progress = (currentIndex / (sections.length - 1)) * 100;
    document.getElementById('progress-bar').style.transform = `scaleX(${progress / 100})`;
}

// Анимация перехода между секциями
function showSection(sectionId, direction = 'right') {
    const currentSection = document.getElementById(state.currentSection);
    const nextSection = document.getElementById(sectionId);
    
    if (!currentSection || !nextSection) return;
    
    // Удаляем классы анимации
    currentSection.classList.remove('slide-left', 'slide-right');
    nextSection.classList.remove('slide-left', 'slide-right');
    
    // Добавляем классы анимации
    currentSection.classList.add(direction === 'right' ? 'slide-left' : 'slide-right');
    nextSection.classList.add(direction === 'right' ? 'slide-right' : 'slide-left');
    
    // Скрываем текущую секцию и показываем следующую
    setTimeout(() => {
        currentSection.classList.add('hidden');
        nextSection.classList.remove('hidden');
        state.currentSection = sectionId;
        updateProgress();
    }, 500);
}

// Обновление предпросмотра заказа
function updatePreview() {
    const order = state.order;
    
    // Обновляем основные поля
    document.getElementById('preview-product').textContent = order.product || 'Не выбрано';
    document.getElementById('preview-size').textContent = order.size || 'Не выбрано';
    document.getElementById('preview-shape').textContent = order.shape || 'Не выбрано';
    document.getElementById('preview-material').textContent = order.material || 'Не выбрано';
    document.getElementById('preview-color').textContent = order.color || 'Не выбрано';
    document.getElementById('preview-options').textContent = order.options.length > 0 ? order.options.join(', ') : 'Нет';
    document.getElementById('preview-custom').textContent = order.customDescription || 'Нет';
    
    // Обновляем фотографии
    const previewPhotos = document.getElementById('preview-photos');
    previewPhotos.innerHTML = '';
    order.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Фото заказа';
        previewPhotos.appendChild(img);
    });
    
    // Показываем/скрываем контейнеры в зависимости от типа продукта
    const containers = {
        'preview-size-container': order.product === 'Сумка',
        'preview-shape-container': order.product === 'Сумка',
        'preview-material-container': true,
        'preview-color-container': true,
        'preview-options-container': order.product === 'Сумка',
        'preview-custom-container': order.product === 'Нестандартный заказ'
    };
    
    Object.entries(containers).forEach(([id, show]) => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = show ? 'flex' : 'none';
        }
    });
    
    // Обновляем итоговую стоимость
    calculateTotalPrice();
}

// Расчет итоговой стоимости
function calculateTotalPrice() {
    let total = 0;
    const order = state.order;
    
    // Базовые цены
    const basePrices = {
        'Сумка': {
            'S': 2000,
            'M': 2500,
            'L': 3000
        },
        'Подстаканник': 1500,
        'Нестандартный заказ': 3000
    };
    
    // Добавляем базовую цену
    if (order.product === 'Сумка' && order.size) {
        total += basePrices['Сумка'][order.size];
    } else {
        total += basePrices[order.product];
    }
    
    // Дополнительные опции
    if (order.options.includes('Застёжка')) total += 500;
    if (order.options.includes('Подклад')) total += 800;
    if (order.options.includes('Ручка-цепочка')) total += 1000;
    
    // Обновляем отображение
    const totalElement = document.getElementById('preview-total');
    if (totalElement) {
        totalElement.textContent = `${total} ₽`;
    }
    state.order.totalPrice = total;
}

// Обработчики событий
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
        state.order.product = card.dataset.product;
        if (state.order.product === 'Сумка') {
            showSection('size-selection');
        } else if (state.order.product === 'Подстаканник') {
            showSection('material-selection');
        } else {
            showSection('custom-order');
        }
    });
});

document.querySelectorAll('.size-card').forEach(card => {
    card.addEventListener('click', () => {
        state.order.size = card.dataset.size;
        showSection('shape-selection');
    });
});

document.querySelectorAll('.shape-card').forEach(card => {
    card.addEventListener('click', () => {
        state.order.shape = card.dataset.shape;
        showSection('material-selection');
    });
});

document.querySelectorAll('.material-card').forEach(card => {
    card.addEventListener('click', () => {
        state.order.material = card.dataset.material;
        showSection('color-selection');
    });
});

document.querySelectorAll('.color-card').forEach(card => {
    card.addEventListener('click', () => {
        state.order.color = card.dataset.color;
        showSection('options-selection');
    });
});

document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
        const option = card.dataset.option;
        const index = state.order.options.indexOf(option);
        if (index === -1) {
            state.order.options.push(option);
        } else {
            state.order.options.splice(index, 1);
        }
        card.classList.toggle('selected');
        updatePreview();
    });
});

// Обработка загрузки фотографий
document.getElementById('photo-input').addEventListener('change', (e) => {
    const files = e.target.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.order.photos.push(e.target.result);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
});

// Обработка текстового описания
document.getElementById('custom-description').addEventListener('input', (e) => {
    state.order.customDescription = e.target.value;
    updatePreview();
});

// Подтверждение заказа
function confirmOrder() {
    // Сначала показываем предпросмотр
    showSection('order-preview');
    
    // Обновляем предпросмотр
    updatePreview();
    
    // Формируем данные для отправки
    const orderData = {
        ...state.order,
        user_id: tg.initDataUnsafe.user?.id,
        username: tg.initDataUnsafe.user?.username,
        first_name: tg.initDataUnsafe.user?.first_name,
        last_name: tg.initDataUnsafe.user?.last_name,
        language_code: tg.initDataUnsafe.user?.language_code,
        start_param: tg.initDataUnsafe.start_param,
        hash: tg.initDataUnsafe.hash
    };
    
    // Отправляем данные в Telegram
    tg.sendData(JSON.stringify(orderData));
}

// Обработчик кнопки "Далее" в секции опций
function handleOptionsNext() {
    showSection('custom-order');
}

// Инициализация
updateProgress();

// Добавляем обработчик для кнопки "Далее" в секции опций
document.querySelector('#options-selection .next-button').addEventListener('click', handleOptionsNext); 