import React from 'react';
import { Card, Typography, Row, Col, Tag } from 'antd';
import { Material } from '../types';
import { MATERIALS } from '../utils/data';
import './MaterialStep.css';

const { Title, Text } = Typography;

interface MaterialStepProps {
  selectedMaterial: Material | null;
  onMaterialSelect: (material: Material) => void;
  onNext: () => void;
  onBack: () => void;
}

const MaterialStep: React.FC<MaterialStepProps> = ({
  selectedMaterial,
  onMaterialSelect,
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

  return (
    <div className="material-step">
      <div className="step-header">
        <Title level={3}>💎 Выберите материал</Title>
        <Text type="secondary">Выберите материал для вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="material-grid">
        {MATERIALS.map((material) => (
          <Col xs={24} sm={12} md={8} key={material.id}>
            <Card
              hoverable
              className={`material-card ${
                selectedMaterial?.id === material.id ? 'selected' : ''
              }`}
              onClick={() => onMaterialSelect(material)}
              cover={
                <div className="material-image-container">
                  <img
                    alt={material.displayName}
                    src={material.image}
                    className="material-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              }
            >
              <Card.Meta
                title={
                  <div className="material-title">
                    <span>{material.displayName}</span>
                    <Tag color="blue" className="price-tag">
                      {formatPrice(material.price)}
                    </Tag>
                  </div>
                }
                description={material.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div className="step-actions">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        {selectedMaterial && (
          <button className="next-button" onClick={onNext}>
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialStep; 