import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Typography, Space, Alert, Input } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface ColorStepProps {
  onSelect: (value: string, colorPreference?: string) => void;
  onBack: () => void;
  onClose?: () => void;
}

const ContainerWrapper = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const StyledTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 0 !important;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  justify-items: center; /* Center items horizontally */
`;

interface ColorCircleButtonProps {
  color: string;
  selected: boolean;
}

const ColorCircleButton = styled.button<ColorCircleButtonProps>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: ${props => props.selected ? '3px solid #1890ff' : `1px solid ${props.color === '#FFFFFF' ? '#d9d9d9' : props.color}`};
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 0 3px rgba(24, 144, 255, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
  }
`;

const SelectedColorInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f2f5;
  border-radius: 4px;
  text-align: center;
`;

const PreferenceSection = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  width: 100%;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const BackButton = styled(Button)`
  min-width: 100px;
  background-color: #F2F2F7;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #E5E5EA;
  color: #000000;
  
  &:hover {
    border-color: #007AFF;
    color: #007AFF;
  }
`;

const SubmitButton = styled(Button)`
  min-width: 100px;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  background-color: #007AFF;
  border-color: #007AFF;
  
  &:hover, &:focus {
    background-color: #0066D6;
    border-color: #0066D6;
    box-shadow: none;
  }
  
  &:disabled {
    background-color: #E5E5EA;
    border-color: #E5E5EA;
  }
`;

// Updated colors array
const colors = [
  { id: 'black', name: 'Черный', hex: '#000000' },
  { id: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: 'darkred', name: 'Темно-красный', hex: '#8B0000' }, // Burgundy/Dark Red
  { id: 'darkblue', name: 'Темно-синий', hex: '#00008B' },
  { id: 'darkgreen', name: 'Темно-зеленый', hex: '#006400' },
  { id: 'pink', name: 'Розовый', hex: '#FFC0CB' }, // Light pink, not too bright
];

const ColorStep: React.FC<ColorStepProps> = ({ onSelect, onBack, onClose }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [colorPreference, setColorPreference] = useState<string>('');

  const handleColorSelect = (color: { id: string; name: string; hex: string }) => {
    setSelectedColor(color.id);
  };

  const handleSubmit = () => {
    if (selectedColor) {
      onSelect(selectedColor, colorPreference);
    }
  };

  const selectedColorData = colors.find(c => c.id === selectedColor);

  return (
    <ContainerWrapper>
      <Navigation>
        <StyledTitle level={3}>Выберите цвет</StyledTitle>
        <NavigationButtons>
          <BackButton size="large" onClick={onBack}>
            Назад
          </BackButton>
          <SubmitButton 
            type="primary" 
            onClick={handleSubmit}
            disabled={!selectedColor}
            size="large"
          >
            Далее
          </SubmitButton>
        </NavigationButtons>
      </Navigation>
      <ColorGrid>
        {colors.map((color) => (
          <ColorCircleButton
            key={color.id}
            color={color.hex}
            selected={selectedColor === color.id}
            onClick={() => handleColorSelect(color)}
            aria-label={`Выбрать цвет ${color.name}`}
          />
        ))}
      </ColorGrid>

      <SelectedColorInfo>
        <Title level={5} style={{ color: '#000000', marginBottom: '12px' }}>Выбранный цвет:</Title>
        {selectedColorData ? (
          <Space>
            <ColorCircleButton
              color={selectedColorData.hex}
              selected={true}
              aria-label={`Выбранный цвет ${selectedColorData.name}`}
            />
            <div>
              <Paragraph strong>{selectedColorData.name}</Paragraph>
              <Paragraph type="secondary">{selectedColorData.hex}</Paragraph>
            </div>
          </Space>
        ) : (
          <Paragraph>Цвет не выбран.</Paragraph>
        )}
      </SelectedColorInfo>

      <Alert
        type="info"
        showIcon
        message="Обратите внимание"
        description="Указанные цвета по договоренности могут быть светлее или темнее. Точный оттенок будет согласован с вами в процессе изготовления."
        style={{ marginBottom: '20px' }}
      />

      <PreferenceSection>
        <Title level={5} style={{ color: '#000000', marginBottom: '12px' }}>Ваши предпочтения по цвету:</Title>
        <TextArea
          placeholder="Укажите дополнительные пожелания по цвету (например, 'хочу более светлый оттенок розового' или 'приглушенный зеленый')"
          rows={4}
          value={colorPreference}
          onChange={(e) => setColorPreference(e.target.value)}
          style={{ marginBottom: '16px', width: '100%' }}
        />
      </PreferenceSection>
    </ContainerWrapper>
  );
};

export default ColorStep; 