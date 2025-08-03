import React, { useState } from 'react';
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
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (productId: string) => {
    setLoadingImages(prev => ({ ...prev, [productId]: false }));
  };

  const handleImageError = (productId: string) => {
    setLoadingImages(prev => ({ ...prev, [productId]: false }));
  };

  const getProductIcon = (productType: ProductType) => {
    switch (productType.id) {
      case 'bag':
        return '👜';
      case 'coaster':
        return '☕';
      case 'individual':
        return '💎';
      default:
        return '📦';
    }
  };

  return (
    <div className="product-type-step">
      <div className="step-header">
        <Title level={3}>🎨 Выберите тип продукта</Title>
        <Text type="secondary">Выберите, что вы хотите заказать</Text>
      </div>

      <Row gutter={[16, 16]} className="product-grid">
        {PRODUCT_TYPES.map((productType) => {
          const isLoading = loadingImages[productType.id] !== false;
          
          return (
            <Col xs={24} sm={12} md={8} key={productType.id}>
              <Card
                hoverable
                className={`product-card ${
                  selectedProductType?.id === productType.id ? 'selected' : ''
                }`}
                onClick={() => onProductTypeSelect(productType)}
                cover={
                  <div className="product-image-container">
                    {isLoading && <div className="skeleton-loader" />}
                    <img
                      alt={productType.displayName}
                      src={productType.image}
                      className="product-image"
                      style={{ display: isLoading ? 'none' : 'block' }}
                      onLoad={() => handleImageLoad(productType.id)}
                      onError={() => handleImageError(productType.id)}
                    />
                    <div 
                      className="image-placeholder" 
                      style={{ display: isLoading ? 'flex' : 'none' }}
                    >
                      <div className="image-placeholder-icon">
                        {getProductIcon(productType)}
                      </div>
                      <div className="image-placeholder-text">
                        {productType.displayName}
                      </div>
                    </div>
                    <div className="image-overlay">
                      <div className="overlay-title">{productType.displayName}</div>
                    </div>
                  </div>
                }
              >
                <Card.Meta
                  description={
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginTop: '8px' }}>
                      {productType.description}
                    </div>
                  }
                />
              </Card>
            </Col>
          );
        })}
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