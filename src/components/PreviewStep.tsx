import React from 'react';
import { Typography, Card, Row, Col, Tag, Divider } from 'antd';
import { OrderForm as OrderFormType } from '../types';
import './PreviewStep.css';

const { Title, Text } = Typography;

interface PreviewStepProps {
  orderData: OrderFormType;
  onNext: () => void;
  onBack: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  orderData,
  onNext,
  onBack
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotalPrice = () => {
    let total = 0;
    
    // Базовая цена материала
    if (orderData.material) {
      total += orderData.material.price;
    }
    
    // Цена размера
    if (orderData.size) {
      total += orderData.size.price;
    }
    
    // Умножаем на количество
    total *= orderData.quantity;
    
    return total;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="preview-step">
      <div className="step-header">
        <Title level={3}>👀 Предварительный просмотр заказа</Title>
        <Text type="secondary">Проверьте детали вашего заказа</Text>
      </div>

      <div className="preview-content">
        <Card className="preview-card">
          <Title level={4}>Детали заказа</Title>
          
          <Row gutter={[16, 16]} className="preview-details">
            <Col xs={24} md={12}>
              <div className="detail-item">
                <Text strong>Тип продукта:</Text>
                <Text>{orderData.productType?.displayName}</Text>
              </div>
              
              <div className="detail-item">
                <Text strong>Форма:</Text>
                <Text>{orderData.shape?.displayName}</Text>
              </div>
              
              <div className="detail-item">
                <Text strong>Материал:</Text>
                <Text>{orderData.material?.displayName}</Text>
                {orderData.material && (
                  <Tag color="blue" className="price-tag">
                    {formatPrice(orderData.material.price)}
                  </Tag>
                )}
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="detail-item">
                <Text strong>Размер:</Text>
                <Text>{orderData.size?.displayName}</Text>
                {orderData.size && orderData.size.price > 0 && (
                  <Tag color="blue" className="price-tag">
                    +{formatPrice(orderData.size.price)}
                  </Tag>
                )}
              </div>
              
              <div className="detail-item">
                <Text strong>Цвет:</Text>
                <div className="color-preview">
                  <div 
                    className="color-sample"
                    style={{ backgroundColor: orderData.color?.hex }}
                  />
                  <Text>{orderData.color?.displayName}</Text>
                </div>
              </div>
              
              <div className="detail-item">
                <Text strong>Количество:</Text>
                <Text>{orderData.quantity} шт.</Text>
              </div>
            </Col>
          </Row>

          {orderData.additionalNotes && (
            <>
              <Divider />
              <div className="detail-item">
                <Text strong>Дополнительные пожелания:</Text>
                <Text className="notes-text">{orderData.additionalNotes}</Text>
              </div>
            </>
          )}

          <Divider />
          
          <div className="price-summary">
            <div className="total-price">
              <Text strong>Итого:</Text>
              <Text className="total-amount">{formatPrice(totalPrice)}</Text>
            </div>
            <Text type="secondary" className="price-note">
              * Цена может измениться в зависимости от сложности работы
            </Text>
          </div>
        </Card>
      </div>

      <div className="step-actions">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        <button className="next-button" onClick={onNext}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
};

export default PreviewStep; 