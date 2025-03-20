// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
try {
    tg.expand();
} catch (error) {
    console.error('Error initializing Telegram Web App:', error);
    handleError(new Error('Ошибка инициализации приложения'));
}

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

// Анимация перехода между секциями
function showSection(sectionId, direction = 'right') {
    if (state.loading) return;
    
    const currentSection = document.getElementById(state.currentSection);
    const nextSection = document.getElementById(sectionId);
    
    if (!currentSection || !nextSection) {
        handleError(new Error('Section not found'));
        return;
    }
    
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
document.getElementById('photo-input').addEventListener('change', handleImageUpload);

// Обработка текстового описания
document.getElementById('custom-description').addEventListener('input', (e) => {
    state.order.customDescription = e.target.value;
    updatePreview();
});

// Функция подтверждения заказа
async function confirmOrder() {
    try {
        setLoading(true);
        
        // Валидация данных
        if (!state.order.product) {
            throw new Error('Пожалуйста, выберите продукт');
        }
        
        if (state.order.product === 'Сумка') {
            if (!state.order.size) throw new Error('Пожалуйста, выберите размер');
            if (!state.order.shape) throw new Error('Пожалуйста, выберите форму');
        }
        
        if (!state.order.material) throw new Error('Пожалуйста, выберите материал');
        if (!state.order.color) throw new Error('Пожалуйста, выберите цвет');
        
        if (state.order.product === 'Нестандартный заказ' && !state.order.customDescription) {
            throw new Error('Пожалуйста, опишите ваш заказ');
        }
        
        // Сначала показываем предпросмотр
        showSection('order-preview');
        
        // Обновляем предпросмотр
        updatePreview();
        
    } catch (error) {
        console.error('Ошибка при подтверждении заказа:', error);
        showErrorMessage(error.message);
    } finally {
        setLoading(false);
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

// Функция отправки заказа
async function submitOrder() {
    try {
        console.log('Submitting order...');
        if (!state.order.product || !state.order.size || !state.order.shape || !state.order.material || !state.order.color) {
            showError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Собираем данные о пользователе
        const userData = {
            id: tg.initDataUnsafe.user.id,
            first_name: tg.initDataUnsafe.user.first_name,
            last_name: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username,
            language_code: tg.initDataUnsafe.user.language_code,
            platform: tg.platform,
            colorScheme: tg.colorScheme,
            isExpanded: tg.isExpanded,
            viewportHeight: tg.viewportHeight,
            viewportStableHeight: tg.viewportStableHeight,
            contact_phone: state.order.contactInfo.phone,
            contact_telegram: state.order.contactInfo.telegramUsername
        };

        const orderData = {
            product: state.order.product,
            size: state.order.size,
            shape: state.order.shape,
            material: state.order.material,
            color: state.order.color,
            options: state.order.options || [],
            customDescription: state.order.customDescription,
            photos: state.order.photos,
            totalPrice: calculateTotalPrice(),
            user: userData,
            timestamp: new Date().toISOString()
        };

        console.log('Sending order data:', orderData);

        // Отправляем данные в Telegram
        await tg.sendData(JSON.stringify(orderData));

        // Показываем сообщение об успехе
        showSuccessMessage('Заказ успешно отправлен!');

        // Очищаем состояние заказа
        state.order = {
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
        };

        // Возвращаемся на главную страницу
        setTimeout(() => {
            showSection('product-selection');
        }, 2000);

    } catch (error) {
        console.error('Error submitting order:', error);
        showError('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.');
    }
}

// Инициализация
updateProgress();

// Добавляем обработчик для кнопки "Далее" в секции опций
document.querySelector('#options-selection .next-button').addEventListener('click', handleOptionsNext);

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