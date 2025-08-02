import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, message } from 'antd';
import { OrderForm as OrderFormType } from '../types';
import './OrderFormStep.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderFormStepProps {
  orderData: OrderFormType;
  onBack: () => void;
  onSubmit: (formData: any) => void;
}

const OrderFormStep: React.FC<OrderFormStepProps> = ({
  orderData,
  onBack,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Здесь будет отправка данных в бот
      console.log('Order data:', { ...orderData, ...values });
      
      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Заказ успешно отправлен!');
      onSubmit({ ...orderData, ...values });
    } catch (error) {
      message.error('Ошибка при отправке заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form-step">
      <div className="step-header">
        <Title level={3}>Контактные данные</Title>
        <Text type="secondary">Укажите ваши контактные данные для оформления заказа</Text>
      </div>

      <div className="form-content">
        <Card className="form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              customerName: orderData.customerName,
              customerPhone: orderData.customerPhone,
              customerAddress: orderData.customerAddress
            }}
          >
            <Form.Item
              label="Имя"
              name="customerName"
              rules={[
                { required: true, message: 'Пожалуйста, введите ваше имя' },
                { min: 2, message: 'Имя должно содержать минимум 2 символа' }
              ]}
            >
              <Input 
                placeholder="Введите ваше имя"
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="Телефон"
              name="customerPhone"
              rules={[
                { required: true, message: 'Пожалуйста, введите номер телефона' },
                { 
                  pattern: /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
                  message: 'Введите корректный номер телефона'
                }
              ]}
            >
              <Input 
                placeholder="+7 (999) 123-45-67"
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="Адрес доставки"
              name="customerAddress"
              rules={[
                { required: true, message: 'Пожалуйста, введите адрес доставки' },
                { min: 10, message: 'Адрес должен содержать минимум 10 символов' }
              ]}
            >
              <TextArea 
                placeholder="Введите полный адрес доставки"
                rows={3}
                className="form-textarea"
              />
            </Form.Item>

            <Form.Item
              label="Дополнительные пожелания"
              name="additionalNotes"
              initialValue={orderData.additionalNotes}
            >
              <TextArea 
                placeholder="Особые требования к заказу, пожелания по доставке и т.д."
                rows={4}
                className="form-textarea"
              />
            </Form.Item>

            <div className="form-actions">
              <Button 
                type="default" 
                size="large" 
                onClick={onBack}
                className="back-button"
              >
                Назад
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={loading}
                className="submit-button"
              >
                Отправить заказ
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default OrderFormStep; 