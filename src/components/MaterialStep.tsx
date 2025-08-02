import React, { useState } from 'react';
import { Card, Typography, Row, Col } from 'antd';
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
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (materialId: string) => {
    setLoadingImages(prev => ({ ...prev, [materialId]: false }));
  };

  const handleImageError = (materialId: string) => {
    setLoadingImages(prev => ({ ...prev, [materialId]: false }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getMaterialIcon = (material: Material) => {
    switch (material.id) {
      case 'akril':
        return '💎';
      case 'hrustal':
        return '✨';
      case 'swarovski':
        return '💍';
      default:
        return '🔮';
    }
  };

  return (
    <div className="material-step">
      <div className="step-header">
        <Title level={3}>💎 Выберите материал</Title>
        <Text type="secondary">Выберите материал для вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="material-grid">
        {MATERIALS.map((material) => {
          const isLoading = loadingImages[material.id] !== false;
          
          return (
            <Col xs={24} sm={12} md={8} key={material.id}>
              <Card
                hoverable
                className={`material-card ${
                  selectedMaterial?.id === material.id ? 'selected' : ''
                }`}
                onClick={() => onMaterialSelect(material)}
                cover={
                  <div className="material-image-container">
                    {isLoading && <div className="skeleton-loader" />}
                    <img
                      alt={material.displayName}
                      src={material.image}
                      className="material-image"
                      style={{ display: isLoading ? 'none' : 'block' }}
                      onLoad={() => handleImageLoad(material.id)}
                      onError={() => handleImageError(material.id)}
                    />
                    <div 
                      className="image-placeholder" 
                      style={{ display: isLoading ? 'flex' : 'none' }}
                    >
                      <div className="image-placeholder-icon">
                        {getMaterialIcon(material)}
                      </div>
                      <div className="image-placeholder-text">
                        {material.displayName}
                      </div>
                    </div>
                    <div className="image-overlay">
                      <div className="overlay-title">{material.displayName}</div>
                      <div className="overlay-price">{formatPrice(material.price)}</div>
                    </div>
                  </div>
                }
              >
                <Card.Meta
                  description={
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginTop: '8px' }}>
                      {material.description}
                    </div>
                  }
                />
              </Card>
            </Col>
          );
        })}
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