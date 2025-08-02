import React from 'react';
import { Typography, Row, Col } from 'antd';
import { Color } from '../types';
import { COLORS } from '../utils/data';
import './ColorStep.css';

const { Title, Text } = Typography;

interface ColorStepProps {
  selectedColor: Color | null;
  onColorSelect: (color: Color) => void;
  onNext: () => void;
  onBack: () => void;
}

const ColorStep: React.FC<ColorStepProps> = ({
  selectedColor,
  onColorSelect,
  onNext,
  onBack
}) => {
  return (
    <div className="color-step">
      <div className="step-header">
        <Title level={3}>🎨 Выберите цвет</Title>
        <Text type="secondary">Выберите цвет вашего продукта</Text>
      </div>

      <Row gutter={[16, 16]} className="color-grid">
        {COLORS.map((color) => (
          <Col xs={12} sm={8} md={6} key={color.id}>
            <div
              className={`color-card ${
                selectedColor?.id === color.id ? 'selected' : ''
              }`}
              onClick={() => onColorSelect(color)}
            >
              <div 
                className="color-preview"
                style={{ backgroundColor: color.hex }}
              />
              <div className="color-info">
                <span className="color-name">{color.displayName}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="step-actions">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        {selectedColor && (
          <button className="next-button" onClick={onNext}>
            Продолжить
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorStep; 