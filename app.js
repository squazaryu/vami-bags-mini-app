// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Состояние приложения
let state = {
    product: null,
    size: null,
    shape: null,
    material: null,
    color: null,
    options: [],
    customDescription: '',
    photos: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Настройка темы Telegram
    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;

    // Добавление обработчиков событий
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчики выбора продукта
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const product = card.dataset.product;
            state.product = product;
            
            // Скрываем все секции
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });

            // Показываем следующую секцию в зависимости от выбранного продукта
            if (product === 'Сумка') {
                document.getElementById('size-selection').classList.remove('hidden');
            } else if (product === 'Подстаканник') {
                document.getElementById('material-selection').classList.remove('hidden');
            } else {
                document.getElementById('custom-order').classList.remove('hidden');
            }
        });
    });

    // Обработчики выбора размера
    document.querySelectorAll('.size-card').forEach(card => {
        card.addEventListener('click', () => {
            state.size = card.dataset.size;
            showNextSection('shape-selection');
        });
    });

    // Обработчики выбора формы
    document.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', () => {
            state.shape = card.dataset.shape;
            showNextSection('material-selection');
        });
    });

    // Обработчики выбора материала
    document.querySelectorAll('.material-card').forEach(card => {
        card.addEventListener('click', () => {
            state.material = card.dataset.material;
            showNextSection('color-selection');
        });
    });

    // Обработчики выбора цвета
    document.querySelectorAll('.color-card').forEach(card => {
        card.addEventListener('click', () => {
            state.color = card.dataset.color;
            showNextSection('options-selection');
        });
    });

    // Обработчики выбора опций
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const option = card.dataset.option;
            if (state.options.includes(option)) {
                state.options = state.options.filter(opt => opt !== option);
                card.classList.remove('selected');
            } else {
                state.options.push(option);
                card.classList.add('selected');
            }
        });
    });

    // Обработчик загрузки фото
    document.getElementById('photo-input').addEventListener('change', handlePhotoUpload);
}

// Показать следующую секцию
function showNextSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Обработка загрузки фото
function handlePhotoUpload(event) {
    const files = event.target.files;
    const photoPreview = document.getElementById('photo-preview');
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                photoPreview.appendChild(img);
                state.photos.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Обновление предпросмотра заказа
function updateOrderPreview() {
    const previewContent = document.getElementById('preview-content');
    let previewHtml = '';

    if (state.product === 'Сумка') {
        previewHtml = `
            <h3>Ваш заказ:</h3>
            <p>Продукт: ${state.product}</p>
            <p>Размер: ${state.size}</p>
            <p>Форма: ${state.shape}</p>
            <p>Материал: ${state.material}</p>
            <p>Цвет: ${state.color}</p>
            <p>Дополнительные опции: ${state.options.join(', ') || 'Нет'}</p>
        `;
    } else if (state.product === 'Подстаканник') {
        previewHtml = `
            <h3>Ваш заказ:</h3>
            <p>Продукт: ${state.product}</p>
            <p>Материал: ${state.material}</p>
            <p>Цвет: ${state.color}</p>
        `;
    } else {
        previewHtml = `
            <h3>Ваш заказ:</h3>
            <p>Тип: Нестандартный заказ</p>
            <p>Описание: ${state.customDescription}</p>
            ${state.photos.length > 0 ? `<p>Количество фото: ${state.photos.length}</p>` : ''}
        `;
    }

    previewContent.innerHTML = previewHtml;
    document.getElementById('order-preview').classList.remove('hidden');
}

// Подтверждение заказа
function confirmOrder() {
    // Отправка данных в Telegram
    tg.sendData(JSON.stringify({
        ...state,
        customDescription: document.getElementById('custom-description')?.value || ''
    }));
} 