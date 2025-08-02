import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

import { ProductType } from '../types';
import { PRODUCT_TYPES } from '../utils/data';
import './ProductTypeStep.css';

const { Title, Text } = Typography;

interface ProductTypeStepProps {
  selectedProductType: ProductType | null;
  onProductTypeSelect: (productType: ProductType) => void;
  onNext: () => void;
}

const ProductTypeStep: React.FC<ProductTypeStepProps> = ({
  selectedProductType,
  onProductTypeSelect,
  onNext
}) => {
  return (
    <div className="product-type-step">
      <div className="step-header">
        <Title level={3}>🎨 Выберите тип продукта</Title>
        <Text type="secondary">Выберите, что вы хотите заказать</Text>
      </div>

      <Row gutter={[16, 16]} className="product-grid">
        {PRODUCT_TYPES.map((productType) => (
          <Col xs={24} sm={12} md={8} key={productType.id}>
            <Card
              hoverable
              className={`product-card ${
                selectedProductType?.id === productType.id ? 'selected' : ''
              }`}
              onClick={() => onProductTypeSelect(productType)}
              cover={
                <div className="product-image-container">
                  <img
                    alt={productType.displayName}
                    src={productType.image}
                    className="product-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              }
            >
              <Card.Meta
                title={productType.displayName}
                description={productType.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {selectedProductType && (
        <div className="step-actions">
          <button
            className="next-button"
            onClick={onNext}
          >
            Продолжить
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductTypeStep; 