import React, { useState } from 'react';
import { Typography, Checkbox, InputNumber, Card } from 'antd';
import './OptionsStep.css';

const { Title, Text } = Typography;

interface OptionsStepProps {
  quantity: number;
  additionalNotes: string;
  onQuantityChange: (quantity: number) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const OptionsStep: React.FC<OptionsStepProps> = ({
  quantity,
  additionalNotes,
  onQuantityChange,
  onNotesChange,
  onNext,
  onBack
}) => {
  const [options, setOptions] = useState({
    giftWrap: false,
    expressDelivery: false,
    personalization: false
  });

  const handleOptionChange = (option: string, checked: boolean) => {
    setOptions(prev => ({ ...prev, [option]: checked }));
  };

  return (
    <div className="options-step">
      <div className="step-header">
        <Title level={3}>⚙️ Дополнительные опции</Title>
        <Text type="secondary">Настройте дополнительные параметры заказа</Text>
      </div>

      <div className="options-content">
        <Card className="option-card">
          <div className="option-item">
            <div className="option-info">
              <h4>Количество</h4>
              <Text type="secondary">Выберите количество товаров</Text>
            </div>
            <InputNumber
              min={1}
              max={10}
              value={quantity}
              onChange={(value) => onQuantityChange(value || 1)}
              className="quantity-input"
            />
          </div>
        </Card>

        <Card className="option-card">
          <div className="option-item">
            <div className="option-info">
              <h4>Подарочная упаковка</h4>
              <Text type="secondary">Красивая упаковка для подарка (+200₽)</Text>
            </div>
            <Checkbox
              checked={options.giftWrap}
              onChange={(e) => handleOptionChange('giftWrap', e.target.checked)}
            />
          </div>
        </Card>

        <Card className="option-card">
          <div className="option-item">
            <div className="option-info">
              <h4>Экспресс доставка</h4>
              <Text type="secondary">Быстрая доставка в течение 24 часов (+500₽)</Text>
            </div>
            <Checkbox
              checked={options.expressDelivery}
              onChange={(e) => handleOptionChange('expressDelivery', e.target.checked)}
            />
          </div>
        </Card>

        <Card className="option-card">
          <div className="option-item">
            <div className="option-info">
              <h4>Персонализация</h4>
              <Text type="secondary">Добавить имя или текст (+300₽)</Text>
            </div>
            <Checkbox
              checked={options.personalization}
              onChange={(e) => handleOptionChange('personalization', e.target.checked)}
            />
          </div>
        </Card>

        <Card className="option-card">
          <div className="option-item">
            <div className="option-info">
              <h4>Дополнительные пожелания</h4>
              <Text type="secondary">Укажите особые требования к заказу</Text>
            </div>
            <textarea
              value={additionalNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Например: особые требования к дизайну, цвету или размеру..."
              className="notes-textarea"
              rows={3}
            />
          </div>
        </Card>
      </div>

      <div className="step-actions">
        <button className="back-button" onClick={onBack}>
          Назад
        </button>
        <button className="next-button" onClick={onNext}>
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default OptionsStep; 