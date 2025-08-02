import React, { useState, useEffect, useRef } from 'react';
import { PRODUCT_TYPES, SHAPES, MATERIALS, SIZES, COLORS } from './utils/data';
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
        requestContact: (callback: (contact: { phone_number: string; first_name: string; last_name?: string; user_id?: number }) => void) => void;
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
  const [visibleImages, setVisibleImages] = useState<{[key: string]: boolean}>({});
  const imageRefs = useRef<{[key: string]: HTMLImageElement | null}>({});

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgId = entry.target.getAttribute('data-img-id');
            if (imgId) {
              setVisibleImages(prev => ({ ...prev, [imgId]: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(imageRefs.current).forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => observer.disconnect();
  }, [currentStep]);

  const steps = [
    { id: 'product', title: 'Тип продукта', icon: '👜' },
    { id: 'shape', title: 'Форма', icon: '📐' },
    { id: 'material', title: 'Материал', icon: '💎' },
    { id: 'size', title: 'Размер', icon: '📏' },
    { id: 'color', title: 'Цвет', icon: '🎨' },
    { id: 'order', title: 'Заказ', icon: '📋' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = (itemId: string) => {
    console.log(`Image failed to load for ${itemId}`);
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoad = (itemId: string) => {
    console.log(`Image loaded successfully for ${itemId}`);
    setImageErrors(prev => ({ ...prev, [itemId]: false }));
  };

  const getProductIcon = (productId: string) => {
    switch (productId) {
      case 'bag': return '👜';
      case 'coaster': return '☕';
      case 'earrings': return '💎';
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
        const isVisible = visibleImages[product.id];
        
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
                    ref={(el) => { imageRefs.current[product.id] = el; }}
                    data-img-id={product.id}
                    src={isVisible ? product.image : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                    alt={product.displayName}
                    className="product-image"
                    onError={() => handleImageError(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="card-info">
                <h3 className="card-title">{product.displayName}</h3>
                <p className="card-description">{product.description}</p>
              </div>
              <button
                className="card-button"
                onClick={() => {
                  setOrderData({ ...orderData, productType: product });
                  setCurrentStep(1);
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

  const renderShapeStep = () => (
    <div className="glass-container fade-in-up">
      <div className="section-header">
        <h2 className="section-title">📐 Выберите форму</h2>
        <p className="section-subtitle">Выберите форму вашего продукта</p>
      </div>
      
      {SHAPES.map((shape) => {
        const hasImageError = imageErrors[shape.id];
        const isVisible = visibleImages[shape.id];
        
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
                    ref={(el) => { imageRefs.current[shape.id] = el; }}
                    data-img-id={shape.id}
                    src={isVisible ? shape.image : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                    alt={shape.displayName}
                    className="product-image"
                    onError={() => handleImageError(shape.id)}
                    onLoad={() => handleImageLoad(shape.id)}
                    loading="lazy"
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
        <p className="section-subtitle">Выберите материал для вашего продукта</p>
      </div>
      
      {MATERIALS.map((material) => {
        const hasImageError = imageErrors[material.id];
        const isVisible = visibleImages[material.id];
        
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
                    ref={(el) => { imageRefs.current[material.id] = el; }}
                    data-img-id={material.id}
                    src={isVisible ? material.image : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                    alt={material.displayName}
                    className="product-image"
                    onError={() => handleImageError(material.id)}
                    onLoad={() => handleImageLoad(material.id)}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="card-info">
                <h3 className="card-title">{material.displayName}</h3>
                <p className="card-description">{material.description}</p>
                <p className="card-price">{formatPrice(material.price)}</p>
              </div>
              <button
                className="card-button"
                onClick={() => {
                  setOrderData({ ...orderData, material });
                  setCurrentStep(3);
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
        <p className="section-subtitle">Выберите размер вашего продукта</p>
      </div>
      
      {SIZES.map((size) => (
        <div key={size.id} className="glass-card">
          <div className="card-content">
            <div className="card-icon">
              <div className="icon-fallback">📏</div>
            </div>
            <div className="card-info">
              <h3 className="card-title">{size.displayName}</h3>
              <p className="card-description">{size.dimensions}</p>
              <p className="card-price">{formatPrice(size.price)}</p>
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
        <p className="section-subtitle">Выберите цвет вашего продукта</p>
      </div>
      
      <div className="color-grid">
        {COLORS.map((color) => (
          <div key={color.id} className="color-card">
            <div 
              className="color-circle"
              style={{ backgroundColor: color.hex }}
            />
            <h3 className="color-name">{color.displayName}</h3>
            <button
              className="card-button"
              onClick={() => {
                setOrderData({ ...orderData, color });
                setCurrentStep(5);
              }}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderStep = () => {
    const totalPrice = (orderData.material?.price || 0) + (orderData.size?.price || 0);
    
    return (
      <div className="glass-container fade-in-up">
        <div className="section-header">
          <h2 className="section-title">📋 Ваш заказ</h2>
        </div>
        
        <div className="order-summary">
          <div className="summary-item">
            <span className="summary-label">Продукт</span>
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
          <div className="summary-item">
            <span className="summary-label">Количество</span>
            <span className="summary-value">{orderData.quantity}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Итого</span>
            <span className="summary-total">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        
        <div className="navigation">
          <button
            className="nav-button primary"
            onClick={() => {
              // Отправляем данные в Telegram
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
      case 5: return renderOrderStep();
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
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`progress-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="progress-step-icon">
                {step.icon}
              </div>
              <div className="progress-step-label">{step.title}</div>
            </div>
          ))}
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {renderStep()}
      
      {/* Navigation */}
      {currentStep > 0 && (
        <div className="navigation">
          <button
            className="nav-button"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Назад
          </button>
        </div>
      )}
    </div>
  );
};

export default App; 