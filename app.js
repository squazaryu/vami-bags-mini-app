// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
try {
    tg.expand();
} catch (error) {
    console.error('Error initializing Telegram Web App:', error);
    handleError(new Error('Ошибка инициализации приложения'));
}

// Инициализация изображений
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.onload = function() {
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
            };
        }
        img.onerror = function() {
            console.error('Error loading image:', img.src);
            img.src = 'images/placeholder.jpeg';
        };
        // Предзагрузка изображений
        const tempImage = new Image();
        tempImage.src = img.src;
    });
});

// Состояние приложения
const state = {
    selectedProduct: null,
    selectedSize: null,
    selectedShape: null,
    selectedMaterial: null,
    selectedColor: null,
    selectedOptions: [],
    customDescription: '',
    photos: []
};

// Обработка ошибок
function handleError(error) {
    console.error('Error:', error);
    state.error = error.message;
    showError(error.message);
}

// Показ ошибки пользователю
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Установка состояния загрузки
function setLoading(isLoading) {
    state.loading = isLoading;
    document.body.classList.toggle('loading', isLoading);
}

// Обновление индикатора прогресса
function updateProgress() {
    const sections = ['product-selection', 'size-selection', 'shape-selection', 
                     'material-selection', 'color-selection', 'options-selection', 
                     'custom-order', 'order-preview'];
    const currentIndex = sections.indexOf(state.currentSection);
    const progress = (currentIndex / (sections.length - 1)) * 100;
    document.getElementById('progress-bar').style.transform = `scaleX(${progress / 100})`;
}

// Функция для отображения секции
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Обновление предпросмотра заказа
function updatePreview() {
    const previewContainer = document.getElementById('order-preview');
    if (!previewContainer) return;

    let previewHTML = '<div class="preview-content">';
    
    // Основная информация о заказе
    previewHTML += `
        <div class="preview-section">
            <h3>Информация о заказе</h3>
            <div class="preview-item">
                <span class="preview-label">Продукт:</span>
                <span class="preview-value">${state.selectedProduct}</span>
            </div>`;

    if (state.selectedProduct === 'Сумка') {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Размер:</span>
                <span class="preview-value">${state.selectedSize}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Форма:</span>
                <span class="preview-value">${state.selectedShape}</span>
            </div>`;
    }

    previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Материал:</span>
                <span class="preview-value">${state.selectedMaterial}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Цвет:</span>
                <span class="preview-value">${state.selectedColor}</span>
            </div>`;

    if (state.selectedProduct === 'Сумка' && state.selectedOptions.length > 0) {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Дополнительные опции:</span>
                <span class="preview-value">${state.selectedOptions.join(', ')}</span>
            </div>`;
    }

    if (state.selectedProduct === 'Нестандартный заказ') {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Описание:</span>
                <span class="preview-value">${state.customDescription}</span>
            </div>`;
    }

    // Фотографии
    if (state.photos.length > 0) {
        previewHTML += `
            <div class="preview-section">
                <h3>Фотографии</h3>
                <div class="preview-photos">`;
        
        state.photos.forEach(photo => {
            previewHTML += `
                <div class="preview-photo">
                    <img src="${photo}" alt="Фото заказа">
                </div>`;
        });
        
        previewHTML += '</div></div>';
    }

    // Добавляем контактные данные
    previewHTML += `
        <div class="preview-section">
            <h3>Контактные данные</h3>
            <div class="preview-item">
                <span class="preview-label">Телефон:</span>
                <span class="preview-value">${state.contactInfo.phone}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Telegram:</span>
                <span class="preview-value">${state.contactInfo.telegramUsername}</span>
            </div>
        </div>`;

    // Итоговая стоимость
    previewHTML += `
        <div class="preview-section">
            <h3>Итоговая стоимость</h3>
            <div class="preview-total">
                <span class="preview-label">Сумма к оплате:</span>
                <span class="preview-value">${state.totalPrice} ₽</span>
            </div>
        </div>`;

    previewHTML += '</div>';
    previewContainer.innerHTML = previewHTML;
}

// Расчет итоговой стоимости
function calculateTotalPrice() {
    try {
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
    } catch (error) {
        handleError(error);
    }
}

// Обработчики событий для продуктов
function handleProductSelection(product) {
    state.selectedProduct = product;
    
    // Очищаем предыдущие выборы
    state.selectedSize = null;
    state.selectedShape = null;
    state.selectedMaterial = null;
    state.selectedColor = null;
    state.selectedOptions = [];
    state.customDescription = '';
    state.photos = [];
    
    // Определяем следующую секцию в зависимости от выбранного продукта
    switch (product) {
        case 'Сумка':
            showSection('size-selection');
            break;
        case 'Подстаканник':
            showSection('material-selection');
            break;
        case 'Нестандартный заказ':
            showSection('custom-order');
            break;
    }
}

// Обработчики событий для размеров
function initSizeCards() {
    const sizeCards = document.querySelectorAll('.size-card');
    sizeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Снимаем выделение со всех карточек
            sizeCards.forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Сохраняем выбранный размер
            state.selectedSize = card.dataset.size;
            // Показываем следующую секцию
            showSection('shape-selection');
        });
    });
}

// Обработчики событий для форм
function initShapeCards() {
    const shapeCards = document.querySelectorAll('.shape-card');
    shapeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Снимаем выделение со всех карточек
            shapeCards.forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Сохраняем выбранную форму
            state.selectedShape = card.dataset.shape;
            // Показываем следующую секцию
            showSection('material-selection');
        });
    });
}

// Обработчики событий для материалов
function initMaterialCards() {
    const materialCards = document.querySelectorAll('.material-card');
    materialCards.forEach(card => {
        card.addEventListener('click', () => {
            // Снимаем выделение со всех карточек
            materialCards.forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Сохраняем выбранный материал
            state.selectedMaterial = card.dataset.material;
            // Показываем следующую секцию
            showSection('color-selection');
        });
    });
}

// Обработчики событий для цветов
function initColorCards() {
    const colorCards = document.querySelectorAll('.color-card');
    colorCards.forEach(card => {
        card.addEventListener('click', () => {
            // Снимаем выделение со всех карточек
            colorCards.forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Сохраняем выбранный цвет
            state.selectedColor = card.dataset.color;
            // Показываем следующую секцию
            showSection('options-selection');
        });
    });
}

// Обработчики событий для опций
function initOptionCards() {
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            const option = card.dataset.option;
            if (card.classList.contains('selected')) {
                if (!state.selectedOptions.includes(option)) {
                    state.selectedOptions.push(option);
                }
            } else {
                state.selectedOptions = state.selectedOptions.filter(o => o !== option);
            }
        });
    });
}

// Обработчики событий для кнопок навигации
function handleBackNavigation() {
    const currentSection = document.querySelector('.section:not(.hidden)').id;
    
    switch (currentSection) {
        case 'size-selection':
            showSection('product-selection');
            break;
        case 'shape-selection':
            showSection('size-selection');
            break;
        case 'material-selection':
            if (state.selectedProduct === 'Сумка') {
                showSection('shape-selection');
            } else {
                showSection('product-selection');
            }
            break;
        case 'color-selection':
            showSection('material-selection');
            break;
        case 'options-selection':
            showSection('color-selection');
            break;
        case 'custom-order':
            showSection('product-selection');
            break;
        case 'preview':
            if (state.selectedProduct === 'Нестандартный заказ') {
                showSection('custom-order');
            } else {
                showSection('options-selection');
            }
            break;
    }
}

function handleNextNavigation() {
    const currentSection = document.querySelector('.section:not(.hidden)').id;
    
    switch (currentSection) {
        case 'size-selection':
            if (state.selectedSize) showSection('shape-selection');
            break;
        case 'shape-selection':
            if (state.selectedShape) showSection('material-selection');
            break;
        case 'material-selection':
            if (state.selectedMaterial) showSection('color-selection');
            break;
        case 'color-selection':
            if (state.selectedColor) showSection('options-selection');
            break;
        case 'options-selection':
            showPreview();
            break;
        case 'custom-order':
            if (state.customDescription) showPreview();
            break;
    }
}

function handleCustomOrder() {
    const description = document.getElementById('custom-description').value;
    const photos = document.getElementById('custom-photos').files;
    
    if (description.trim()) {
        state.customDescription = description;
        if (photos.length > 0) {
            // Обработка фотографий
            Array.from(photos).forEach(photo => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    state.photos.push(e.target.result);
                };
                reader.readAsDataURL(photo);
            });
        }
        showPreview();
    }
}

function showPreview() {
    const previewContent = document.getElementById('preview-content');
    let html = '';
    
    if (state.selectedProduct === 'Нестандартный заказ') {
        html = `
            <h3>Нестандартный заказ</h3>
            <p>Описание: ${state.customDescription}</p>
            ${state.photos.length ? '<h4>Приложенные фото:</h4>' : ''}
            <div class="preview-photos">
                ${state.photos.map(photo => `<img src="${photo}" alt="Фото заказа">`).join('')}
            </div>
        `;
    } else {
        html = `
            <h3>${state.selectedProduct}</h3>
            ${state.selectedSize ? `<p>Размер: ${state.selectedSize}</p>` : ''}
            ${state.selectedShape ? `<p>Форма: ${state.selectedShape}</p>` : ''}
            <p>Материал: ${state.selectedMaterial}</p>
            <p>Цвет: ${state.selectedColor}</p>
            ${state.selectedOptions.length ? `<p>Опции: ${state.selectedOptions.join(', ')}</p>` : ''}
        `;
    }
    
    previewContent.innerHTML = html;
    showSection('preview');
}

// Инициализация всех обработчиков событий
function initializeEventHandlers() {
    initSizeCards();
    initShapeCards();
    initMaterialCards();
    initColorCards();
    initOptionCards();
    initNavigationButtons();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Обработчики для продуктов
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const product = card.dataset.product;
            // Снимаем выделение со всех карточек
            document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Обрабатываем выбор продукта
            handleProductSelection(product);
        });
    });

    initializeEventHandlers();
});

// Функция подтверждения заказа
async function confirmOrder() {
    try {
        // Проверяем наличие всех необходимых данных
        if (!state.selectedProduct) {
            throw new Error('Пожалуйста, выберите продукт');
        }
        if (!state.selectedSize) {
            throw new Error('Пожалуйста, выберите размер');
        }
        if (!state.selectedShape) {
            throw new Error('Пожалуйста, выберите форму');
        }
        if (!state.selectedMaterial) {
            throw new Error('Пожалуйста, выберите материал');
        }
        if (!state.selectedColor) {
            throw new Error('Пожалуйста, выберите цвет');
        }
        if (!state.customDescription) {
            throw new Error('Пожалуйста, добавьте описание');
        }
        if (!state.photos || state.photos.length === 0) {
            throw new Error('Пожалуйста, добавьте фото');
        }

        // Формируем данные заказа
        const orderData = {
            product: state.selectedProduct,
            size: state.selectedSize,
            shape: state.selectedShape,
            material: state.selectedMaterial,
            color: state.selectedColor,
            customDescription: state.customDescription,
            photos: state.photos,
            user: {
                id: tg.initDataUnsafe.user.id,
                username: tg.initDataUnsafe.user.username,
                first_name: tg.initDataUnsafe.user.first_name,
                last_name: tg.initDataUnsafe.user.last_name,
                language_code: tg.initDataUnsafe.user.language_code,
                start_param: tg.initDataUnsafe.start_param
            }
        };

        // Отправляем данные в Telegram
        await tg.sendData(JSON.stringify(orderData));

        // Генерируем временный номер заказа
        const orderNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        // Показываем экран предпросмотра
        showSection('order-preview');
        updatePreview();

        // Показываем сообщение об успехе
        showMessage(`Заказ #${orderNumber} успешно оформлен! Мы свяжемся с вами в ближайшее время.`, 'success');

        // Очищаем состояние заказа
        state.selectedProduct = null;
        state.selectedSize = null;
        state.selectedShape = null;
        state.selectedMaterial = null;
        state.selectedColor = null;
        state.customDescription = '';
        state.photos = [];

        // Возвращаемся на главную через 3 секунды
        setTimeout(() => {
            showSection('products');
        }, 3000);

    } catch (error) {
        console.error('Ошибка при подтверждении заказа:', error);
        showMessage(error.message || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.', 'error');
    }
}

// Функция для отображения сообщения об успехе
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Обработка загрузки изображений
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    
    const promises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(promises)
        .then(results => {
            state.photos = results;
            updatePreview();
        })
        .catch(error => {
            handleError(new Error('Ошибка при загрузке изображений'));
        })
        .finally(() => {
            setLoading(false);
        });
}

// Обработчик кнопки "Далее" в секции опций
document.querySelector('#options-selection .next-button').addEventListener('click', handleOptionsNext);

// Обработчик кнопки подтверждения заказа
document.addEventListener('DOMContentLoaded', function() {
    const confirmButton = document.querySelector('#order-preview .confirm-button');
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            console.log('Confirm button clicked');
            submitOrder();
        });
    }
});

// Обработчик кнопки "Далее" в секции контактных данных
function handleContactInfoNext() {
    const phone = document.getElementById('phone').value;
    const telegramUsername = document.getElementById('telegram-username').value;

    // Валидация данных
    if (!phone || !telegramUsername) {
        showError('Пожалуйста, заполните все поля');
        return;
    }

    // Сохраняем контактные данные
    state.contactInfo = {
        phone: phone,
        telegramUsername: telegramUsername
    };

    // Показываем предпросмотр заказа
    showSection('order-preview');
    updatePreview();
}

function updateReview() {
    // Обновляем основную информацию
    document.getElementById('review-product').textContent = state.selectedProduct || 'Не выбрано';
    document.getElementById('review-size').textContent = state.selectedSize || 'Не выбрано';
    document.getElementById('review-shape').textContent = state.selectedShape || 'Не выбрано';
    document.getElementById('review-material').textContent = state.selectedMaterial || 'Не выбрано';
    document.getElementById('review-color').textContent = state.selectedColor || 'Не выбрано';
    document.getElementById('review-description').textContent = state.customDescription || 'Не указано';

    // Обновляем дополнительные опции
    const optionsContainer = document.getElementById('review-options');
    optionsContainer.innerHTML = '';
    if (state.selectedOptions && state.selectedOptions.length > 0) {
        state.selectedOptions.forEach(option => {
            const optionItem = document.createElement('div');
            optionItem.className = 'review-item';
            optionItem.innerHTML = `
                <span class="review-label">${option.name}:</span>
                <span class="review-value">${option.value}</span>
            `;
            optionsContainer.appendChild(optionItem);
        });
    } else {
        optionsContainer.innerHTML = '<div class="review-item"><span class="review-value">Дополнительные опции не выбраны</span></div>';
    }

    // Обновляем фотографии
    const photosContainer = document.getElementById('review-photos');
    photosContainer.innerHTML = '';
    if (state.photos && state.photos.length > 0) {
        state.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = 'Фото заказа';
            img.onclick = () => window.Telegram.WebApp.showImage(photo);
            photosContainer.appendChild(img);
        });
    } else {
        photosContainer.innerHTML = '<div class="review-item"><span class="review-value">Фотографии не добавлены</span></div>';
    }
}

function submitOrder() {
    if (!validateOrder()) {
        return;
    }

    const orderData = {
        product: state.selectedProduct,
        size: state.selectedSize,
        shape: state.selectedShape,
        material: state.selectedMaterial,
        color: state.selectedColor,
        options: state.selectedOptions,
        description: state.customDescription,
        photos: state.photos
    };

    window.Telegram.WebApp.sendData(JSON.stringify(orderData));
    window.Telegram.WebApp.close();
}

function validateOrder() {
    const requiredFields = {
        product: 'Продукт',
        size: 'Размер',
        shape: 'Форма',
        material: 'Материал',
        color: 'Цвет'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!state[field]) {
            window.Telegram.WebApp.showPopup({
                title: 'Ошибка',
                message: `Пожалуйста, выберите ${label.toLowerCase()}`
            });
            return false;
        }
    }

    return true;
}

// Обновляем функцию для перехода к проверке заказа
function confirmDescription() {
    const description = document.getElementById('custom-description').value.trim();
    state.customDescription = description;
    showSection('order-review', 'right');
    updateReview();
} 