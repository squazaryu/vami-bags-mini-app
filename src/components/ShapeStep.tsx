import React, { useState } from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { Shape } from '../types';
import { SHAPES } from '../utils/data';
import './ShapeStep.css';

const { Title, Text } = Typography;

interface ShapeStepProps {
  selectedShape: Shape | null;
  onShapeSelect: (shape: Shape) => void;
  onNext: () => void;
  onBack: () => void;
}

const ShapeStep: React.FC<ShapeStepProps> = ({
  selectedShape,
  onShapeSelect,
  onNext,
  onBack
}) => {
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (shapeId: string) => {
    setLoadingImages(prev => ({ ...prev, [shapeId]: false }));
  };

  const handleImageError = (shapeId: string) => {
    setLoadingImages(prev => ({ ...prev, [shapeId]: false }));
  };

  const getShapeIcon = (shape: Shape) => {
    switch (shape.id) {
      case 'round':
        return '⭕';
      case 'square':
        return '⬜';
      case 'heart':
        return '❤️';
      case 'rectangle':
        return '⬜';
      case 'custom':
        return '🎨';
      default:
        return '📐';
    }
  };

  return (
    <div className="shape-step">
      <div className="step-header">
        <Title level={3}>📐 Выберите форму</Title>
        <Text type="secondary">Выберите форму вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="shape-grid">
        {SHAPES.map((shape) => {
          const isLoading = loadingImages[shape.id] !== false;
          
          return (
            <Col xs={24} sm={12} md={8} key={shape.id}>
              <Card
                hoverable
                className={`shape-card ${
                  selectedShape?.id === shape.id ? 'selected' : ''
                }`}
                onClick={() => onShapeSelect(shape)}
                cover={
                  <div className="shape-image-container">
                    {isLoading && <div className="skeleton-loader" />}
                    <img
                      alt={shape.displayName}
                      src={shape.image}
                      className="shape-image"
                      style={{ display: isLoading ? 'none' : 'block' }}
                      onLoad={() => handleImageLoad(shape.id)}
                      onError={() => handleImageError(shape.id)}
                    />
                    <div 
                      className="image-placeholder" 
                      style={{ display: isLoading ? 'flex' : 'none' }}
                    >
                      <div className="image-placeholder-icon">
                        {getShapeIcon(shape)}
                      </div>
                      <div className="image-placeholder-text">
                        {shape.displayName}
                      </div>
                    </div>
                    <div className="image-overlay">
                      <div className="overlay-title">{shape.displayName}</div>
                    </div>
                  </div>
                }
              >
                <Card.Meta
                  description={
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginTop: '8px' }}>
                      {shape.description}
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
        {selectedShape && (
          <button className="next-button" onClick={onNext}>
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
};

export default ShapeStep; 