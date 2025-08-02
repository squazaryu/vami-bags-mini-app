import React from 'react';
import { Card, Typography, Row, Col, Tag } from 'antd';
import { Size } from '../types';
import { SIZES } from '../utils/data';
import './SizeStep.css';

const { Title, Text } = Typography;

interface SizeStepProps {
  selectedSize: Size | null;
  onSizeSelect: (size: Size) => void;
  onNext: () => void;
  onBack: () => void;
}

const SizeStep: React.FC<SizeStepProps> = ({
  selectedSize,
  onSizeSelect,
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

  const formatDimensions = (width: number, height: number) => {
    return `${width}×${height} см`;
  };

  return (
    <div className="size-step">
      <div className="step-header">
        <Title level={3}>Выберите размер</Title>
        <Text type="secondary">Выберите размер вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="size-grid">
        {SIZES.map((size) => (
          <Col xs={24} sm={12} md={8} key={size.id}>
            <Card
              hoverable
              className={`size-card ${
                selectedSize?.id === size.id ? 'selected' : ''
              }`}
              onClick={() => onSizeSelect(size)}
            >
              <div className="size-content">
                <div className="size-icon">
                  <div 
                    className="size-preview"
                    style={{
                      width: `${Math.min(size.width * 3, 80)}px`,
                      height: `${Math.min(size.height * 3, 80)}px`
                    }}
                  />
                </div>
                <div className="size-info">
                  <h4 className="size-name">{size.displayName}</h4>
                  <p className="size-dimensions">
                    {formatDimensions(size.width, size.height)}
                  </p>
                  {size.price > 0 && (
                    <Tag color="blue" className="price-tag">
                      +{formatPrice(size.price)}
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="step-actions">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        {selectedSize && (
          <button className="next-button" onClick={onNext}>
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
};

export default SizeStep; 