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
        totalPrice: 0
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
    try {
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
            img.className = 'lazy-image';
            img.onload = () => img.classList.add('loaded');
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
    } catch (error) {
        handleError(error);
    }
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

// Подтверждение заказа
async function confirmOrder() {
    if (state.loading) return;
    
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
        
        // Формируем данные для отправки
        const orderData = {
            product: state.order.product,
            size: state.order.size,
            shape: state.order.shape,
            material: state.order.material,
            color: state.order.color,
            options: state.order.options || [],
            customDescription: state.order.customDescription,
            photos: state.order.photos,
            totalPrice: state.order.totalPrice,
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
    } catch (error) {
        handleError(error);
    } finally {
        setLoading(false);
    }
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
function handleOptionsNext() {
    showSection('custom-order');
}

// Инициализация
updateProgress();

// Добавляем обработчик для кнопки "Далее" в секции опций
document.querySelector('#options-selection .next-button').addEventListener('click', handleOptionsNext); 