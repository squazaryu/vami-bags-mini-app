import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { OrderForm as OrderFormType, ProductType, Shape, Material, Size, Color } from '../types';
import ProductTypeStep from './ProductTypeStep';
import ShapeStep from './ShapeStep';
import MaterialStep from './MaterialStep';
import SizeStep from './SizeStep';
import ColorStep from './ColorStep';
import OptionsStep from './OptionsStep';
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

  const handleMaterialSelect = (material: Material) => {
    setOrderData(prev => ({ ...prev, material }));
  };

  const handleSizeSelect = (size: Size) => {
    setOrderData(prev => ({ ...prev, size }));
  };

  const handleColorSelect = (color: Color) => {
    setOrderData(prev => ({ ...prev, color }));
  };

  const handleQuantityChange = (quantity: number) => {
    setOrderData(prev => ({ ...prev, quantity }));
  };

  const handleNotesChange = (notes: string) => {
    setOrderData(prev => ({ ...prev, additionalNotes: notes }));
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
      case 2:
        return (
          <MaterialStep
            selectedMaterial={orderData.material}
            onMaterialSelect={handleMaterialSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <SizeStep
            selectedSize={orderData.size}
            onSizeSelect={handleSizeSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ColorStep
            selectedColor={orderData.color}
            onColorSelect={handleColorSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <OptionsStep
            quantity={orderData.quantity}
            additionalNotes={orderData.additionalNotes}
            onQuantityChange={handleQuantityChange}
            onNotesChange={handleNotesChange}
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