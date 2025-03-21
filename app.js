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
        totalPrice: 0,
        contactInfo: {
            phone: '',
            telegramUsername: ''
        }
    },
    loading: false,
    error: null
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
function showSection(sectionId, direction = 'right') {
    const currentSection = document.getElementById(state.currentSection);
    const nextSection = document.getElementById(sectionId);
    
    if (!currentSection || !nextSection) {
        console.error('Section not found:', sectionId);
        return;
    }

    // Скрываем текущую секцию
    currentSection.classList.add('hidden');
    
    // Показываем следующую секцию
    nextSection.classList.remove('hidden');
    
    // Обновляем состояние
    state.currentSection = sectionId;
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
                <span class="preview-value">${state.order.product}</span>
            </div>`;

    if (state.order.product === 'Сумка') {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Размер:</span>
                <span class="preview-value">${state.order.size}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Форма:</span>
                <span class="preview-value">${state.order.shape}</span>
            </div>`;
    }

    previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Материал:</span>
                <span class="preview-value">${state.order.material}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Цвет:</span>
                <span class="preview-value">${state.order.color}</span>
            </div>`;

    if (state.order.product === 'Сумка' && state.order.options.length > 0) {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Дополнительные опции:</span>
                <span class="preview-value">${state.order.options.join(', ')}</span>
            </div>`;
    }

    if (state.order.product === 'Нестандартный заказ') {
        previewHTML += `
            <div class="preview-item">
                <span class="preview-label">Описание:</span>
                <span class="preview-value">${state.order.customDescription}</span>
            </div>`;
    }

    // Фотографии
    if (state.order.photos.length > 0) {
        previewHTML += `
            <div class="preview-section">
                <h3>Фотографии</h3>
                <div class="preview-photos">`;
        
        state.order.photos.forEach(photo => {
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
                <span class="preview-value">${state.order.contactInfo.phone}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Telegram:</span>
                <span class="preview-value">${state.order.contactInfo.telegramUsername}</span>
            </div>
        </div>`;

    // Итоговая стоимость
    previewHTML += `
        <div class="preview-section">
            <h3>Итоговая стоимость</h3>
            <div class="preview-total">
                <span class="preview-label">Сумма к оплате:</span>
                <span class="preview-value">${state.order.totalPrice} ₽</span>
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
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            // Снимаем выделение со всех карточек
            productCards.forEach(c => c.classList.remove('selected'));
            // Выделяем выбранную карточку
            card.classList.add('selected');
            // Сохраняем выбранный продукт
            state.order.product = card.dataset.product;
            // Показываем следующую секцию
            if (state.order.product === 'Сумка') {
                showSection('size-selection');
            } else if (state.order.product === 'Подстаканник') {
                showSection('material-selection');
            } else {
                showSection('custom-order');
            }
        });
    });
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
            state.order.size = card.dataset.size;
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
            state.order.shape = card.dataset.shape;
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
            state.order.material = card.dataset.material;
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
            state.order.color = card.dataset.color;
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
            const option = card.dataset.option;
            card.classList.toggle('selected');
            
            if (card.classList.contains('selected')) {
                if (!state.order.options.includes(option)) {
                    state.order.options.push(option);
                }
            } else {
                state.order.options = state.order.options.filter(opt => opt !== option);
            }
        });
    });
}

// Обработчик для кнопок навигации
function initNavigationButtons() {
    // Обработчики для кнопок "Назад"
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentSection = state.currentSection;
            let previousSection;
            
            switch (currentSection) {
                case 'size-selection':
                    previousSection = 'product-selection';
                    break;
                case 'shape-selection':
                    previousSection = 'size-selection';
                    break;
                case 'material-selection':
                    previousSection = state.order.product === 'Сумка' ? 'shape-selection' : 'product-selection';
                    break;
                case 'color-selection':
                    previousSection = 'material-selection';
                    break;
                case 'options-selection':
                    previousSection = 'color-selection';
                    break;
                case 'custom-order':
                    previousSection = 'options-selection';
                    break;
                default:
                    previousSection = 'product-selection';
            }
            
            showSection(previousSection, 'left');
        });
    });

    // Обработчики для кнопок "Далее"
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentSection = state.currentSection;
            let nextSection;
            
            switch (currentSection) {
                case 'options-selection':
                    nextSection = 'custom-order';
                    break;
                case 'custom-order':
                    submitOrder();
                    return;
                default:
                    return;
            }
            
            showSection(nextSection);
        });
    });
}

// Инициализация всех обработчиков событий
function initializeEventHandlers() {
    initProductCards();
    initSizeCards();
    initShapeCards();
    initMaterialCards();
    initColorCards();
    initOptionCards();
    initNavigationButtons();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initializeEventHandlers();
});

// Функция подтверждения заказа
async function confirmOrder() {
    try {
        // Проверяем наличие всех необходимых данных
        if (!state.order.product) {
            throw new Error('Пожалуйста, выберите продукт');
        }
        if (!state.order.size) {
            throw new Error('Пожалуйста, выберите размер');
        }
        if (!state.order.shape) {
            throw new Error('Пожалуйста, выберите форму');
        }
        if (!state.order.material) {
            throw new Error('Пожалуйста, выберите материал');
        }
        if (!state.order.color) {
            throw new Error('Пожалуйста, выберите цвет');
        }
        if (!state.order.customDescription) {
            throw new Error('Пожалуйста, добавьте описание');
        }
        if (!state.order.photos || state.order.photos.length === 0) {
            throw new Error('Пожалуйста, добавьте фото');
        }

        // Формируем данные заказа
        const orderData = {
            product: state.order.product,
            size: state.order.size,
            shape: state.order.shape,
            material: state.order.material,
            color: state.order.color,
            customDescription: state.order.customDescription,
            photos: state.order.photos,
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
        state.order = {
            product: null,
            size: null,
            shape: null,
            material: null,
            color: null,
            customDescription: '',
            photos: []
        };

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
            state.order.photos = results;
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
    state.order.contactInfo = {
        phone: phone,
        telegramUsername: telegramUsername
    };

    // Показываем предпросмотр заказа
    showSection('order-preview');
    updatePreview();
}

function updateReview() {
    // Обновляем основную информацию
    document.getElementById('review-product').textContent = state.order.product || 'Не выбрано';
    document.getElementById('review-size').textContent = state.order.size || 'Не выбрано';
    document.getElementById('review-shape').textContent = state.order.shape || 'Не выбрано';
    document.getElementById('review-material').textContent = state.order.material || 'Не выбрано';
    document.getElementById('review-color').textContent = state.order.color || 'Не выбрано';
    document.getElementById('review-description').textContent = state.order.description || 'Не указано';

    // Обновляем дополнительные опции
    const optionsContainer = document.getElementById('review-options');
    optionsContainer.innerHTML = '';
    if (state.order.options && state.order.options.length > 0) {
        state.order.options.forEach(option => {
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
    if (state.order.photos && state.order.photos.length > 0) {
        state.order.photos.forEach(photo => {
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
        product: state.order.product,
        size: state.order.size,
        shape: state.order.shape,
        material: state.order.material,
        color: state.order.color,
        options: state.order.options,
        description: state.order.description,
        photos: state.order.photos
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
        if (!state.order[field]) {
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
    state.order.description = description;
    showSection('order-review', 'right');
    updateReview();
} 