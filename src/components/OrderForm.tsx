import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { OrderForm as OrderFormType, ProductType, Shape } from '../types';
import ProductTypeStep from './ProductTypeStep';
import ShapeStep from './ShapeStep';
import './OrderForm.css';

const OrderForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<OrderFormType>({
    productType: null,
    shape: null,
    material: null,
    size: null,
    color: null,
    quantity: 1,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    additionalNotes: ''
  });

  // Инициализация Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleProductTypeSelect = (productType: ProductType) => {
    setOrderData(prev => ({ ...prev, productType }));
  };

  const handleShapeSelect = (shape: Shape) => {
    setOrderData(prev => ({ ...prev, shape }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductTypeStep
            selectedProductType={orderData.productType}
            onProductTypeSelect={handleProductTypeSelect}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <ShapeStep
            selectedShape={orderData.shape}
            onShapeSelect={handleShapeSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return (
          <div className="step-placeholder">
            <h3>Шаг {currentStep + 1}</h3>
            <p>Этот шаг будет добавлен позже</p>
            <button onClick={handleBack}>Назад</button>
          </div>
        );
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className="order-form">
        <div className="progress-indicator">
          <div className="step-indicators">
            <div className={`step ${currentStep >= 0 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Тип продукта</span>
            </div>
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Форма</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Материал</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Размер</span>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <span className="step-number">5</span>
              <span className="step-label">Цвет</span>
            </div>
            <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
              <span className="step-number">6</span>
              <span className="step-label">Заказ</span>
            </div>
          </div>
        </div>

        <div className="step-content">
          {renderCurrentStep()}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default OrderForm; 