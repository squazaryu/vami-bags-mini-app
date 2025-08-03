import React, { useState } from 'react';
import { PRODUCT_TYPES, SHAPES, MATERIALS, SIZES, COLORS } from './utils/data';
import ProgressBar from './components/ProgressBar';
import './App.css';

// Расширяем интерфейс Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
          secondary_bg_color: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        backButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        mainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isProgressVisible: boolean;
          isActive: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setText: (text: string) => void;
          setParams: (params: { text?: string; color?: string; textColor?: string; isVisible?: boolean; isProgressVisible?: boolean; isActive?: boolean }) => void;
        };
        expand: () => void;
        close: () => void;
        ready: () => void;
        sendData: (data: string) => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> }, callback?: (buttonId: string) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback: (data: string) => void) => void;
        requestWriteAccess: (callback: (access: boolean) => void) => void;
        requestContact: (callback?: (contact: { phone_number: string; first_name: string; last_name?: string; user_id?: number }) => void) => void;
        onEvent: (eventType: string, callback: (data: any) => void) => void;
        offEvent: (eventType: string, callback: (data: any) => void) => void;
        invokeCustomMethod: (method: string, params?: any, callback?: (result: any) => void) => void;
        isVersionAtLeast: (version: string) => boolean;
        platform: string;
        version: string;
      };
    };
  }
}

interface OrderData {
  productType: any;
  shape: any;
  material: any;
  size: any;
  color: any;
  quantity: number;
  giftWrap: boolean;
  notes: string;
  customerName: string;
  customerPhone: string;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [orderData, setOrderData] = React.useState<OrderData>({
    productType: null,
    shape: null,
    material: null,
    size: null,
    color: null,
    quantity: 1,
    giftWrap: false,
    notes: '',
    customerName: '',
    customerPhone: ''
  });

  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  // Сохраняем прогресс для каждого типа продукта
  const [productProgress, setProductProgress] = useState<{
    [key: string]: {
      step: number;
      data: Partial<OrderData>;
    }
  }>({});

  // Функции для управления прогрессом продуктов
  const saveProductProgress = (productId: string, step: number, data: Partial<OrderData>) => {
    setProductProgress(prev => ({
      ...prev,
      [productId]: { step, data }
    }));
  };

  const restoreProductProgress = (productId: string) => {
    const saved = productProgress[productId];
    if (saved) {
      console.log(`Восстанавливаем прогресс для ${productId}: шаг ${saved.step}`);
      setCurrentStep(saved.step);
      setOrderData(prevData => ({
        ...prevData,
        ...saved.data
      }));
      return true;
    }
    return false;
  };

  // Автосохранение прогресса при изменении orderData или currentStep
  React.useEffect(() => {
    if (orderData.productType && currentStep > 0) {
      saveProductProgress(orderData.productType.id, currentStep, orderData);
    }
  }, [orderData, currentStep]);

  // Функция для запроса контактных данных из Telegram
  const requestTelegramContact = () => {
    if (window.Telegram?.WebApp?.requestContact) {
      console.log('Запрашиваем контакт из Telegram...');
      
      // Запрашиваем контакт с callback функцией
      window.Telegram.WebApp.requestContact((contact) => {
        console.log('Получен контакт:', contact);
        
        if (contact) {
          // Заполняем поля данными из Telegram
          setOrderData(prevData => ({
            ...prevData,
            customerName: contact.first_name + (contact.last_name ? ` ${contact.last_name}` : ''),
            customerPhone: contact.phone_number || prevData.customerPhone
          }));

          // Показываем уведомление об успехе
          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert('Контактные данные успешно заполнены!');
          }
        }
      });
    } else {
      console.log('Функция requestContact недоступна');
      
      // Попробуем получить данные пользователя из initData
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        setOrderData(prevData => ({
          ...prevData,
          customerName: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
          customerPhone: prevData.customerPhone
        }));
        
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert('Имя заполнено из профиля Telegram!');
        }
      } else {
        // Fallback для случая, когда функция недоступна
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert('Функция недоступна. Пожалуйста, заполните данные вручную.');
        }
      }
    }
  };

  // Создаем интерактивные шаги для нового прогресс-бара
  const createInteractiveSteps = () => {
    // Создаем массив шагов в зависимости от типа продукта
    let stepsToShow: { realStep: number; title: string; icon: string; }[] = [];
    let stepMapping: { [key: number]: number } = {}; // Соответствие между индексом в прогресс-баре и реальным шагом
    
    if (orderData.productType?.id === 'individual') {
      // Для индивидуального: продукт → оформление
      stepsToShow = [
        { realStep: 0, title: 'Продукт', icon: '🎨' },
        { realStep: 6, title: 'Контакты', icon: '📝' }
      ];
    } else if (orderData.productType?.id === 'coaster') {
      // Для подстаканника: продукт → материал → цвет → опции → оформление
      stepsToShow = [
        { realStep: 0, title: 'Продукт', icon: '🎨' },
        { realStep: 2, title: 'Материал', icon: '💎' },
        { realStep: 4, title: 'Цвет', icon: '🌈' },
        { realStep: 5, title: 'Опции', icon: '⚙️' },
        { realStep: 6, title: 'Контакты', icon: '📝' }
      ];
    } else {
      // Для сумки: все шаги
      stepsToShow = [
        { realStep: 0, title: 'Продукт', icon: '🎨' },
        { realStep: 1, title: 'Форма', icon: '📐' },
        { realStep: 2, title: 'Материал', icon: '💎' },
        { realStep: 3, title: 'Размер', icon: '📏' },
        { realStep: 4, title: 'Цвет', icon: '🌈' },
        { realStep: 5, title: 'Опции', icon: '⚙️' },
        { realStep: 6, title: 'Контакты', icon: '📝' }
      ];
    }
    
    return stepsToShow.map((stepInfo, progressIndex) => {
      const { realStep, title, icon } = stepInfo;
      stepMapping[progressIndex] = realStep;
      
      // Определяем состояние шага
      const completed = realStep < currentStep;
      const active = realStep === currentStep;
      
      // Логика кликабельности
      let clickable = false;
      if (completed || active) {
        clickable = true;
      } else if (progressIndex === stepsToShow.findIndex(s => s.realStep === currentStep) + 1) {
        // Следующий шаг кликабелен если можем перейти
        clickable = canNavigateToNextStep();
      }
      
      return {
        id: realStep,
        title,
        icon,
        completed,
        active,
        clickable
      };
    });
  };

  // Проверяем, можно ли перейти к следующему шагу
  const canNavigateToNextStep = () => {
    switch (currentStep) {
      case 0: return !!orderData.productType;
      case 1: return !!orderData.shape;
      case 2: 
        // Для индивидуального заказа материал не обязателен
        if (orderData.productType?.id === 'individual') {
          return true;
        }
        return !!orderData.material;
      case 3: return !!orderData.size;
      case 4: return !!orderData.color;
      case 5: return true; // Опции не обязательны
      case 6: return true;
      default: return false;
    }
  };

  // Обработчик клика по шагу
  const handleStepClick = (stepId: number) => {
    console.log(`Клик по шагу ${stepId} с текущего ${currentStep}`);
    
    // Проверяем что шаг кликабельный
    const interactiveSteps = createInteractiveSteps();
    const clickedStep = interactiveSteps.find(step => step.id === stepId);
    
    if (clickedStep && clickedStep.clickable) {
      // Проверяем логику навигации для разных типов продуктов
      if (orderData.productType?.id === 'individual') {
        // Для индивидуального заказа только 2 шага: продукт (0) и оформление (6)
        if (stepId === 0 || stepId === 6) {
          setCurrentStep(stepId);
        }
      } else if (orderData.productType?.id === 'coaster') {
        // Для подстаканника: продукт (0) → материал (2) → цвет (4) → опции (5) → оформление (6)
        const allowedSteps = [0, 2, 4, 5, 6];
        if (allowedSteps.includes(stepId)) {
          setCurrentStep(stepId);
        }
      } else if (orderData.productType?.id === 'bag') {
        // Для сумки: полный путь продукт (0) → форма (1) → материал (2) → размер (3) → цвет (4) → опции (6) → оформление (5)
        if (stepId >= 0 && stepId <= 6) {
          setCurrentStep(stepId);
        }
      } else {
        // Стандартная логика
        if (stepId >= 0 && stepId <= 6) {
          setCurrentStep(stepId);
        }
      }
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoad = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: false }));
  };

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'bag': return '👜';
      case 'coaster': return '☕';
      case 'individual': return '💎';
      default: return '📦';
    }
  };

  const getShapeIcon = (shapeId: string) => {
    switch (shapeId) {
      case 'round': return '⭕';
      case 'square': return '⬜';
      case 'heart': return '❤️';
      case 'rectangle': return '⬜';
      case 'custom': return '🎨';
      default: return '📐';
    }
  };

  const getMaterialIcon = (materialId: string) => {
    switch (materialId) {
      case 'akril': return '💎';
      case 'hrustal': return '✨';
      case 'swarovski': return '💍';
      default: return '🔮';
    }
  };

  const renderProductStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">🎨 Выберите тип продукта</h2>
        <p className="section-subtitle">Выберите, что вы хотите заказать</p>
      </div>
      
      {PRODUCT_TYPES.map((product) => {
        const hasImageError = imageErrors[product.id];
        const hasSavedProgress = productProgress[product.id] && productProgress[product.id].step > 0;
        
        return (
          <div key={product.id} className="glass-card">
            <div className="card-content">
              <div className="card-icon">
                {hasImageError ? (
                  <div className="icon-fallback">
                    {getProductIcon(product.id)}
                  </div>
                ) : (
                  <img
                    src={product.image}
                    alt={product.displayName}
                    className="product-image"
                    onError={() => handleImageError(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                  />
                )}
              </div>
              <div className="card-info">
                <h3 className="card-title">
                  {product.displayName}
                  {hasSavedProgress && <span className="progress-badge">⚡</span>}
                </h3>
                <p className="card-description">
                  {product.description}
                  {hasSavedProgress && (
                    <span className="progress-hint"> • Есть сохраненный прогресс</span>
                  )}
                </p>
              </div>
              <button
                className={`card-button ${hasSavedProgress ? 'has-progress' : ''}`}
                onClick={() => {
                  // Проверяем, есть ли сохраненный прогресс для этого продукта
                  const hasProgress = restoreProductProgress(product.id);
                  
                  if (!hasProgress) {
                    // Если нет сохраненного прогресса, начинаем заново
                    setOrderData({ ...orderData, productType: product });
                    
                    if (product.id === 'individual') {
                      console.log(`Выбран индивидуальный заказ, переходим к оформлению`);
                      setCurrentStep(6); // Переходим сразу к оформлению
                    } else if (product.id === 'coaster') {
                      console.log(`Выбран подстаканник, переходим к материалу`);
                      setCurrentStep(2); // Переходим к материалу
                    } else {
                      console.log(`Выбран ${product.displayName}, переходим к форме`);
                      setCurrentStep(1); // Обычный путь через форму
                    }
                  } else {
                    console.log(`Восстановлен прогресс для ${product.displayName}`);
                  }
                }}
              >
                {hasSavedProgress ? 'Продолжить' : 'Выбрать'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderShapeStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">📐 Выберите форму</h2>
        <p className="section-subtitle">Выберите форму вашего продукта</p>
      </div>
      
      {SHAPES.map((shape) => {
        const hasImageError = imageErrors[shape.id];
        
        return (
          <div key={shape.id} className="glass-card">
            <div className="card-content">
              <div className="card-icon">
                {hasImageError ? (
                  <div className="icon-fallback">
                    {getShapeIcon(shape.id)}
                  </div>
                ) : (
                  <img
                    src={shape.image}
                    alt={shape.displayName}
                    className="product-image"
                    onError={() => handleImageError(shape.id)}
                    onLoad={() => handleImageLoad(shape.id)}
                  />
                )}
              </div>
              <div className="card-info">
                <h3 className="card-title">{shape.displayName}</h3>
                <p className="card-description">{shape.description}</p>
              </div>
              <button
                className="card-button"
                onClick={() => {
                  setOrderData({ ...orderData, shape });
                  setCurrentStep(2);
                }}
              >
                Выбрать
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMaterialStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">💎 Выберите материал</h2>
        <p className="section-subtitle">Выберите материал для вашего изделия</p>
      </div>
      
      {MATERIALS.map((material) => {
        const hasImageError = imageErrors[material.id];
        
        return (
          <div key={material.id} className="glass-card">
            <div className="card-content">
              <div className="card-icon">
                {hasImageError ? (
                  <div className="icon-fallback">
                    {getMaterialIcon(material.id)}
                  </div>
                ) : (
                  <img
                    src={material.image}
                    alt={material.displayName}
                    className="product-image"
                    onError={() => handleImageError(material.id)}
                    onLoad={() => handleImageLoad(material.id)}
                  />
                )}
              </div>
              <div className="card-info">
                <h3 className="card-title">{material.displayName}</h3>
                <p className="card-description">{material.description}</p>
              </div>
              <button
                className="card-button"
                onClick={() => {
                  setOrderData({ ...orderData, material });
                  // Для подстаканников идем к цвету, для индивидуального к описанию
                  if (orderData.productType?.id === 'coaster') {
                    console.log(`Выбран материал для подстаканника, переходим к цвету`);
                    setCurrentStep(4); // Переходим к цвету
                  } else if (orderData.productType?.id === 'individual') {
                    console.log(`Выбран материал для индивидуального заказа, переходим к оформлению`);
                    setCurrentStep(6); // Переходим к оформлению
                  } else {
                    console.log(`Выбран материал для сумки, переходим к размеру`);
                    setCurrentStep(3);
                  }
                }}
              >
                Выбрать
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSizeStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">📏 Выберите размер</h2>
        <p className="section-subtitle">Выберите размер вашего изделия</p>
      </div>
      
      {SIZES.map((size) => (
        <div key={size.id} className="glass-card">
          <div className="card-content">
            <div className="card-info">
              <h3 className="card-title">{size.displayName}</h3>
              <p className="card-description">{size.dimensions}</p>
            </div>
            <button
              className="card-button"
              onClick={() => {
                setOrderData({ ...orderData, size });
                setCurrentStep(4);
              }}
            >
              Выбрать
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderColorStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">🎨 Выберите цвет</h2>
        <p className="section-subtitle">Выберите цвет вашего изделия</p>
      </div>
      
      <div className="color-grid">
        {COLORS.map((color) => (
          <div key={color.id} className="color-card">
            <div 
              className="color-circle" 
              style={{ backgroundColor: color.hex }}
            />
            <span className="color-name">{color.displayName}</span>
            <button
              className="card-button"
              onClick={() => {
                setOrderData({ ...orderData, color });
                // Все продукты идут к доп. опциям
                if (orderData.productType?.id === 'coaster') {
                  console.log(`Выбран цвет для подстаканника, переходим к доп. опциям`);
                  setCurrentStep(5); // Переходим к доп. опциям
                } else if (orderData.productType?.id === 'bag') {
                  console.log(`Выбран цвет для сумки, переходим к доп. опциям`);
                  setCurrentStep(5); // Переходим к доп. опциям
                } else {
                  console.log(`Выбран цвет, переходим к опциям`);
                  setCurrentStep(5);
                }
              }}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionClick = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const renderOptionsStep = () => {
    const isCoaster = orderData.productType?.id === 'coaster';
    const isBag = orderData.productType?.id === 'bag';
    
    const options = [
      ...(isBag || isCoaster ? [{
        id: 'chain',
        name: isBag ? 'Ручка-цепочка' : 'Цепочка для ношения',
        description: isBag ? 'Элегантная ручка в виде цепочки' : 'Элегантная цепочка для удобного ношения подстаканника'
      }] : []),
      ...(isBag || isCoaster ? [{
        id: 'clasp',
        name: 'Застежка',
        description: isBag ? 'Надежная застежка для сумки' : 'Надежная застежка для подстаканника'
      }] : []),
      ...(isBag || isCoaster ? [{
        id: 'lining',
        name: 'Подклад',
        description: isBag ? 'Внутренний подклад для сумки' : 'Внутренний подклад для подстаканника'
      }] : []),
      ...(isBag ? [{
        id: 'short-handle',
        name: 'Короткая ручка',
        description: 'Короткая удобная ручка для сумки'
      }] : []),
      ...(isBag ? [{
        id: 'long-handle',
        name: 'Длинная ручка',
        description: 'Длинная ручка для ношения через плечо'
      }] : []),
      ...(isBag ? [{
        id: 'pocket',
        name: 'Внутренний карман',
        description: 'Дополнительный карман внутри сумки'
      }] : []),
      ...(isBag ? [{
        id: 'zipper',
        name: 'Молния',
        description: 'Молния для надежного закрытия'
      }] : []),
      ...(isBag ? [{
        id: 'embroidery',
        name: 'Вышивка',
        description: 'Персональная вышивка на сумке'
      }] : [])
    ];

    return (
      <div className="glass-container fade-in-up">
        <div className="section-header">
          <h2 className="section-title">⚙️ Дополнительные опции</h2>
          <p className="section-subtitle">Выберите дополнительные элементы для вашего заказа</p>
        </div>
        
        <div className="options-grid">
          {options.map(option => (
            <div key={option.id} className="glass-card">
              <div className="card-content">
                <div className="card-info">
                  <h3 className="card-title">{option.name}</h3>
                  <p className="card-description">{option.description}</p>
                </div>
                <button
                  className={`card-button ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(option.id)}
                >
                  {selectedOptions.includes(option.id) ? 'Убрать' : 'Добавить'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="navigation">
          <button
            className="nav-button primary"
            onClick={() => {
              // Сохраняем выбранные опции в notes
              const optionNames = selectedOptions.map(id => 
                options.find(opt => opt.id === id)?.name
              ).filter(Boolean).join(', ');
              
              setOrderData({ 
                ...orderData, 
                notes: optionNames ? `Доп. опции: ${optionNames}. ${orderData.notes}` : orderData.notes
              });
              setCurrentStep(6); // Переходим к оформлению
            }}
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  };

  const renderOrderStep = () => {
    // Для индивидуального заказа показываем специальную форму с описанием
    if (orderData.productType?.id === 'individual') {
      return (
        <div className="glass-container fade-in-up">
          <div className="section-header">
            <h2 className="section-title">📝 Индивидуальный заказ</h2>
            <p className="section-subtitle">Опишите ваше изделие подробно</p>
          </div>
          
          <div className="order-summary">
            <div className="summary-item">
              <span className="summary-label">Тип заказа</span>
              <span className="summary-value">Индивидуальный</span>
            </div>
          </div>
          
          <div className="contact-form">
            {/* Кнопка для автозаполнения контактов из Telegram */}
            <button
              type="button"
              className="telegram-contact-button"
              onClick={requestTelegramContact}
            >
              📱 Поделиться контактом
            </button>
            
            <input
              type="text"
              placeholder="Ваше имя"
              value={orderData.customerName}
              onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
              className="form-input"
            />
            <input
              type="tel"
              placeholder="Ваш телефон"
              value={orderData.customerPhone}
              onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Подробно опишите ваше изделие: размеры, цвета, особенности, пожелания..."
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              className="form-textarea"
              style={{ minHeight: '150px' }}
            />
          </div>
          
          <div className="navigation">
            <button
              className="nav-button primary"
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.sendData(JSON.stringify(orderData));
                  window.Telegram.WebApp.showAlert('Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                  window.Telegram.WebApp.close();
                }
              }}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      );
    }

    // Для подстаканников показываем упрощенную форму
    if (orderData.productType?.id === 'coaster') {
      return (
        <div className="glass-container fade-in-up">
          <div className="section-header">
            <h2 className="section-title">📝 Оформление заказа</h2>
            <p className="section-subtitle">Заполните контактные данные</p>
          </div>
          
          <div className="order-summary">
            <div className="summary-item">
              <span className="summary-label">Тип продукта</span>
              <span className="summary-value">{orderData.productType?.displayName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Материал</span>
              <span className="summary-value">{orderData.material?.displayName}</span>
            </div>

          </div>
          
          <div className="contact-form">
            {/* Кнопка для автозаполнения контактов из Telegram */}
            <button
              type="button"
              className="telegram-contact-button"
              onClick={requestTelegramContact}
            >
              📱 Поделиться контактом
            </button>
            
            <input
              type="text"
              placeholder="Ваше имя"
              value={orderData.customerName}
              onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
              className="form-input"
            />
            <input
              type="tel"
              placeholder="Ваш телефон"
              value={orderData.customerPhone}
              onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Дополнительные пожелания"
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              className="form-textarea"
            />
          </div>
          
          <div className="navigation">
            <button
              className="nav-button primary"
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.sendData(JSON.stringify(orderData));
                  window.Telegram.WebApp.showAlert('Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                  window.Telegram.WebApp.close();
                }
              }}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      );
    }

    // Для обычных заказов показываем полную форму
    
    return (
      <div className="glass-container fade-in-up">
        <div className="section-header">
          <h2 className="section-title">📝 Оформление заказа</h2>
          <p className="section-subtitle">Проверьте данные и заполните контактную информацию</p>
        </div>
        
        <div className="order-summary">
          <div className="summary-item">
            <span className="summary-label">Тип продукта</span>
            <span className="summary-value">{orderData.productType?.displayName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Форма</span>
            <span className="summary-value">{orderData.shape?.displayName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Материал</span>
            <span className="summary-value">{orderData.material?.displayName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Размер</span>
            <span className="summary-value">{orderData.size?.displayName}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Цвет</span>
            <span className="summary-value">{orderData.color?.displayName}</span>
          </div>

        </div>
        
        <div className="contact-form">
          {/* Кнопка для автозаполнения контактов из Telegram */}
          <button
            type="button"
            className="telegram-contact-button"
            onClick={requestTelegramContact}
          >
            📱 Поделиться контактом
          </button>
          
          <input
            type="text"
            placeholder="Ваше имя"
            value={orderData.customerName}
            onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
            className="form-input"
          />
          <input
            type="tel"
            placeholder="Ваш телефон"
            value={orderData.customerPhone}
            onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
            className="form-input"
          />
          <textarea
            placeholder="Дополнительные пожелания"
            value={orderData.notes}
            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
            className="form-textarea"
          />
        </div>
        
        <div className="navigation">
          <button
            className="nav-button primary"
            onClick={() => {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.sendData(JSON.stringify(orderData));
                window.Telegram.WebApp.showAlert('Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.');
                window.Telegram.WebApp.close();
              }
            }}
          >
            Оформить заказ
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderProductStep();
      case 1: return renderShapeStep();
      case 2: return renderMaterialStep();
      case 3: return renderSizeStep();
      case 4: return renderColorStep();
      case 5: return renderOptionsStep(); // Опции идут перед оформлением
      case 6: return renderOrderStep();   // Оформление финальный шаг
      default: return renderProductStep();
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <div className="app-header">
        <h1 className="app-title">Заказ изделий из бисера</h1>
        <p className="app-subtitle">Создайте уникальное изделие</p>
      </div>
      
      {/* Interactive Progress Bar - показываем только после выбора продукта */}
      {orderData.productType && (
        <ProgressBar 
          steps={createInteractiveSteps()} 
          onStepClick={handleStepClick}
        />
      )}
      
      {renderStep()}
      
      {/* Navigation */}
      {currentStep > 0 && (
        <div className="navigation">
          <button
            className="nav-button"
            onClick={() => {
              // Логика навигации "Назад" для разных типов заказов
              console.log(`Нажата кнопка "Назад" на шаге ${currentStep} для продукта ${orderData.productType?.displayName}`);
              
              if (orderData.productType?.id === 'individual') {
                // Для индивидуального: только 2 шага (продукт → оформление)
                if (currentStep === 6) {
                  console.log('Переходим от оформления к продукту');
                  setCurrentStep(0); // От оформления к продукту
                }
              } else if (orderData.productType?.id === 'coaster') {
                // Для подстаканника: продукт → материал → цвет → опции → оформление
                if (currentStep === 2) {
                  console.log('Переходим от материала к продукту');
                  setCurrentStep(0); // От материала к продукту
                } else if (currentStep === 4) {
                  console.log('Переходим от цвета к материалу');
                  setCurrentStep(2); // От цвета к материалу
                } else if (currentStep === 5) {
                  console.log('Переходим от опций к цвету');
                  setCurrentStep(4); // От опций к цвету
                } else if (currentStep === 6) {
                  console.log('Переходим от оформления к опциям');
                  setCurrentStep(5); // От оформления к опциям
                }
              } else if (orderData.productType?.id === 'bag') {
                // Для сумки: продукт → форма → материал → размер → цвет → опции → оформление
                if (currentStep === 1) { // Форма
                  console.log('Переходим от формы к продукту');
                  setCurrentStep(0);
                } else if (currentStep === 2) { // Материал
                  console.log('Переходим от материала к форме');
                  setCurrentStep(1);
                } else if (currentStep === 3) { // Размер
                  console.log('Переходим от размера к материалу');
                  setCurrentStep(2);
                } else if (currentStep === 4) { // Цвет
                  console.log('Переходим от цвета к размеру');
                  setCurrentStep(3);
                } else if (currentStep === 5) { // Опции
                  console.log('Переходим от опций к цвету');
                  setCurrentStep(4);
                } else if (currentStep === 6) { // Оформление
                  console.log('Переходим от оформления к опциям');
                  setCurrentStep(5);
                }
              } else {
                // Стандартная навигация для неизвестных типов
                console.log('Стандартная навигация назад');
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default App; 