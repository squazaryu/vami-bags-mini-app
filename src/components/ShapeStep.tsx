import React from 'react';
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
  return (
    <div className="shape-step">
      <div className="step-header">
        <Title level={3}>📐 Выберите форму</Title>
        <Text type="secondary">Выберите форму вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="shape-grid">
        {SHAPES.map((shape) => (
          <Col xs={24} sm={12} md={8} key={shape.id}>
            <Card
              hoverable
              className={`shape-card ${
                selectedShape?.id === shape.id ? 'selected' : ''
              }`}
              onClick={() => onShapeSelect(shape)}
              cover={
                <div className="shape-image-container">
                  <img
                    alt={shape.displayName}
                    src={shape.image}
                    className="shape-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              }
            >
              <Card.Meta
                title={shape.displayName}
                description={shape.description}
              />
            </Card>
          </Col>
        ))}
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