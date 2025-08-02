import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Table, Alert, Spin, Result, message, Input } from 'antd/lib/index';
import styled from 'styled-components';
import { PreviewStepProps, TelegramUser } from '../types';
import { testProxyConnection, axiosInstance } from '../utils/proxyTest';

const { Title } = Typography;

// Стилизованные компоненты для мобильного интерфейса со светлой темой
const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 20px !important;
  color: #000000 !important;
  font-size: 22px !important;
  
  @media (max-width: 320px) {
    font-size: 20px !important;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-thead > tr > th {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 500;
  }
  
  .ant-table-tbody > tr > td {
    color: #000000;
  }
  
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  @media (max-width: 576px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 10px 12px;
      font-size: 13px;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const ActionButton = styled(Button)`
  min-width: 100px;
  height: 36px;
  border-radius: 10px;
  font-weight: 500;
  
  &.submit-button {
    background-color: #1890ff;
    border-color: #1890ff;
    color: #ffffff;
  }
`;

const CloseButton = styled(Button)`
  min-width: 100px;
  background-color: #F2F2F7;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #E5E5EA;
  color: #000000;
  
  &:hover {
    border-color: #FF3B30;
    color: #FF3B30;
  }
`;

const PreviewStep: React.FC<PreviewStepProps> = ({ orderDetails, onBack, onClose }) => {
  // Инициализация Telegram Web App
  const tgWebApp = window.Telegram?.WebApp;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<TelegramUser | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [contactRequested, setContactRequested] = useState(false); // Флаг, что контакт запрошен
  const [showContactRequest, setShowContactRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [editableUserInfo, setEditableUserInfo] = useState<{
    name: string;
    username: string;
    phone: string | null;
  }>(() => {
    // Пытаемся получить сохраненное состояние из localStorage
    const savedState = localStorage.getItem('editableUserInfo');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log("[DEBUG] Restored state from localStorage:", parsedState);
        return parsedState;
      } catch (e) {
        console.error('Error parsing saved state:', e);
      }
    }
    
    // Если нет сохраненного состояния, используем данные пользователя
    if (userInfo) {
      const fullName = `${userInfo.first_name} ${userInfo.last_name || ''}`.trim();
      return {
        name: fullName,
        username: userInfo.username || '',
        phone: null
      };
    }
    
    return {
      name: '',
      username: '',
      phone: null
    };
  });
  
  // Сервер с прокси для отправки сообщений
  const SERVER_URL = "https://telegram-bot-webhook-proxy.vercel.app/api/send-message";
  
  // ID продавца и токен бота
  const SELLER_CHAT_ID = "50122963";
  const BOT_TOKEN = "7408506728:AAGK9d5kddSnMQDwgIYOiEK-6nPFFwgYP-M";
  
  // Перевод цветов на русский
  const colorTranslations: {[key: string]: string} = {
    'pink': 'Розовый',
    'red': 'Красный',
    'blue': 'Синий',
    'green': 'Зеленый',
    'yellow': 'Желтый',
    'black': 'Черный',
    'white': 'Белый',
    'purple': 'Фиолетовый',
    'orange': 'Оранжевый',
    'gray': 'Серый',
    'brown': 'Коричневый',
    'gold': 'Золотой',
    'silver': 'Серебряный',
    'darkred': 'Темно-красный',
    'darkblue': 'Темно-синий',
    'darkgreen': 'Темно-зеленый',
    '#f5222d': 'Красный',
    '#eb2f96': 'Розовый',
    '#722ed1': 'Фиолетовый',
    '#1890ff': 'Синий',
    '#13c2c2': 'Голубой',
    '#52c41a': 'Зеленый',
    '#fadb14': 'Желтый',
    '#fa8c16': 'Оранжевый',
    '#000000': 'Черный',
    '#8c8c8c': 'Серый',
    '#ffffff': 'Белый',
    '#8B0000': 'Темно-красный',
    '#00008B': 'Темно-синий',
    '#006400': 'Темно-зеленый',
    '#FFC0CB': 'Розовый'
  };
  
  // Перевод опций на русский
  const optionTranslations: {[key: string]: string} = {
    'clasp': 'Застежка',
    'lining': 'Подкладка',
    'chain': 'Цепочка',
    'short_handle': 'Короткая ручка',
    'long_handle': 'Длинная ручка',
    'pocket': 'Карман',
    'zipper': 'Молния',
    'embroidery': 'Вышивка',
    'custom_color': 'Индивидуальный цвет'
  };
  
  // Перевод форм на русский
  const shapeTranslations: {[key: string]: string} = {
    'kruglaya': 'Круглая',
    'pryamougolnaya': 'Прямоугольная',
    'kvadratnaya': 'Квадратная',
    'trapeciya': 'Трапеция',
    'mesyac': 'Месяц',
    'serdce': 'Сердце',
    'round': 'Круглая',
    'rectangular': 'Прямоугольная',
    'square': 'Квадратная',
    'trapezoid': 'Трапеция',
    'crescent': 'Месяц',
    'heart': 'Сердце'
  };
  
  // Перевод материалов на русский
  const materialTranslations: {[key: string]: string} = {
    'akril': 'Акрил',
    'hrustal': 'Хрусталь',
    'swarovski': 'Swarovski',
    'acrylic': 'Акрил',
    'crystal': 'Хрусталь'
  };
  
  // Загружаем информацию о пользователе при монтировании компонента
  useEffect(() => {
    let mainButtonClickHandler: (() => void) | null = null;
    try {
      // Тестируем подключение к прокси-серверу
      testProxyConnection().then(success => {
        if (!success) {
          console.error("Не удалось подключиться к прокси-серверу");
          setError("Ошибка: Не удалось подключиться к серверу отправки сообщений");
        }
      });

      if (tgWebApp?.initDataUnsafe?.user) {
        console.log("User data available:", tgWebApp.initDataUnsafe.user);
        setUserInfo(tgWebApp.initDataUnsafe.user as TelegramUser);
        setDebugInfo(prev => prev + `\nUser data: ${JSON.stringify(tgWebApp.initDataUnsafe.user)}`);
      } else {
        console.log("No user data available");
        setDebugInfo(prev => prev + '\nNo user data available');
      }
      
      console.log("Full WebApp data:", tgWebApp);
      setDebugInfo(prev => prev + `\nTelegram WebApp available: ${!!tgWebApp}`);
      
      if (tgWebApp) {
        setDebugInfo(prev => prev + `\nVersion: ${tgWebApp.version}`);
        setDebugInfo(prev => prev + `\nPlatform: ${tgWebApp.platform}`);
        
        // Настраиваем MainButton - всегда показываем независимо от userInfo
        if (tgWebApp.MainButton) {
          tgWebApp.MainButton.setText('Подтвердить заказ');
          tgWebApp.MainButton.show();
          tgWebApp.MainButton.color = '#1890ff';
          tgWebApp.MainButton.textColor = '#ffffff';
          
          mainButtonClickHandler = handleSubmit;
          tgWebApp.MainButton.onClick(mainButtonClickHandler);
          console.log("MainButton configured with handleSubmit");
          setDebugInfo(prev => prev + "\nMainButton configured with handleSubmit");
        }
      }
    } catch (e) {
      console.error("Error initializing component or accessing user data", e);
      setDebugInfo(prev => prev + `\nError initializing: ${e}`);
      setError("Произошла ошибка при инициализации. Попробуйте перезапустить приложение.");
    }
    
    // Очистка обработчика при размонтировании
    return () => {
      if (tgWebApp?.MainButton && mainButtonClickHandler) {
          tgWebApp.MainButton.offClick(mainButtonClickHandler);
      }
    };
  }, [tgWebApp]); // Убираем userInfo из зависимостей, чтобы кнопка настраивалась независимо от наличия данных

  // Сохраняем состояние в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('editableUserInfo', JSON.stringify(editableUserInfo));
  }, [editableUserInfo]);

  // Обновляем editableUserInfo при изменении phoneNumber
  useEffect(() => {
    if (phoneNumber) {
      console.log("[DEBUG] Updating editableUserInfo with phoneNumber:", phoneNumber);
      setEditableUserInfo(prev => {
        const newState = {
          ...prev,
          phone: phoneNumber
        };
        console.log("[DEBUG] New editableUserInfo state after phone update:", newState);
        localStorage.setItem('editableUserInfo', JSON.stringify(newState));
        return newState;
      });
    }
  }, [phoneNumber]);

  // Обновляем editableUserInfo при получении userInfo
  useEffect(() => {
    if (userInfo) {
      console.log("[DEBUG] Updating editableUserInfo with userInfo:", userInfo);
      const fullName = `${userInfo.first_name} ${userInfo.last_name || ''}`.trim();
      console.log("[DEBUG] Full name:", fullName);
      setEditableUserInfo(prev => {
        const newState = {
          name: fullName,
          username: userInfo.username || '',
          phone: prev.phone || phoneNumber
        };
        console.log("[DEBUG] New editableUserInfo state after userInfo update:", newState);
        localStorage.setItem('editableUserInfo', JSON.stringify(newState));
        return newState;
      });
    }
  }, [userInfo, phoneNumber]);

  // Обработчик изменения полей
  const handleFieldChange = (field: string, value: string) => {
    console.log("[DEBUG] handleFieldChange called with field:", field, "value:", value);
    setEditableUserInfo(prev => {
      const newState = {
        ...prev,
        [field]: value
      };
      console.log("[DEBUG] New editableUserInfo state:", newState);
      localStorage.setItem('editableUserInfo', JSON.stringify(newState));
      return newState;
    });
  };

  // Функция форматирования для отображения данных заказа
  const formatOrderData = () => {
    console.log('Formatting order data from:', orderDetails);
    
    const formattedProduct = orderDetails.product === 'bag' ? 'Сумка' : 
                            orderDetails.product === 'coaster' ? 'Подстаканник' : 
                            orderDetails.product === 'custom' ? 'Индивидуальный заказ' : 
                            orderDetails.product || '';
    
    const formattedShape = orderDetails.shape ? (shapeTranslations[orderDetails.shape] || orderDetails.shape) : '';
    
    const formattedMaterial = orderDetails.material ? 
                             (materialTranslations[orderDetails.material] || orderDetails.material) : '';
    
    const formattedColor = orderDetails.color ? 
                          (colorTranslations[orderDetails.color] || orderDetails.color) : '';
    
    let formattedOptions = '';
    if (orderDetails.options && orderDetails.options.length > 0) {
      const translatedOptions = orderDetails.options.map(option => 
        optionTranslations[option] || option
      );
      formattedOptions = translatedOptions.join(', ');
    }
    
    const formattedDescription = orderDetails.customDescription || '';
    
    return {
      product: formattedProduct,
      size: orderDetails.size || '',
      shape: formattedShape,
      material: formattedMaterial,
      color: formattedColor,
      colorPreference: orderDetails.colorPreference || '',
      options: formattedOptions,
      customDescription: formattedDescription
    };
  };
  
  // Подготовка данных для таблицы
  const formattedOrderData = formatOrderData();
  const dataSource = [];
  
  // Тип изделия (обязательное поле)
  dataSource.push({
    key: 'product',
    parameter: 'Тип изделия',
    value: formattedOrderData.product
  });
  
  // Размер (только для сумок)
  if (orderDetails.product === 'bag' && formattedOrderData.size) {
    dataSource.push({
      key: 'size',
      parameter: 'Размер',
      value: formattedOrderData.size
    });
  }
  
  // Форма (только для сумок)
  if (orderDetails.product === 'bag' && formattedOrderData.shape) {
    dataSource.push({
      key: 'shape',
      parameter: 'Форма',
      value: formattedOrderData.shape
    });
  }
  
  // Материал
  if (formattedOrderData.material) {
    dataSource.push({
      key: 'material',
      parameter: 'Материал',
      value: formattedOrderData.material
    });
  }
  
  // Цвет
  if (formattedOrderData.color) {
    dataSource.push({
      key: 'color',
      parameter: 'Цвет',
      value: formattedOrderData.color + (formattedOrderData.colorPreference ? `\nДополнительные пожелания: ${formattedOrderData.colorPreference}` : '')
    });
  }
  
  // Опции
  if (formattedOrderData.options) {
    dataSource.push({
      key: 'options',
      parameter: 'Дополнительные опции',
      value: formattedOrderData.options
    });
  }
  
  // Описание пользовательского заказа
  if (formattedOrderData.customDescription) {
    dataSource.push({
      key: 'customDescription',
      parameter: 'Описание',
      value: formattedOrderData.customDescription
    });
  }
  
  // Определение колонок таблицы
  const columns = [
    {
      title: '',
      dataIndex: 'parameter',
      key: 'parameter',
      width: '40%',
    },
    {
      title: '',
      dataIndex: 'value',
      key: 'value',
      width: '60%',
    }
  ];

  // Функция для генерации текста заказа при отправке  
  const generateOrderText = (orderData: any, contactInfo: TelegramUser | null, sharedPhoneNumber?: string) => {
    console.log("[DEBUG] Generating order text with data:", orderData);
    console.log("[DEBUG] Contact info:", contactInfo);
    console.log("[DEBUG] Editable user info:", editableUserInfo);
    
    const colorName = colorTranslations[orderData.color] || orderData.color;
    const colorPreferenceText = orderData.colorPreference ? `\nДополнительные пожелания по цвету: ${orderData.colorPreference}` : '';
    
    const orderText = `
🛍 Новый заказ!

Изделие: ${orderData.product === 'custom' ? 'Индивидуальный заказ' : orderData.product === 'coaster' ? 'Подставка' : 'Сумка'}
${orderData.product !== 'custom' ? `Размер: ${orderData.size}` : ''}
${orderData.product !== 'custom' ? `Форма: ${shapeTranslations[orderData.shape] || orderData.shape}` : ''}
${orderData.product !== 'custom' ? `Материал: ${materialTranslations[orderData.material] || orderData.material}` : ''}
${orderData.product !== 'custom' ? `Цвет: ${colorName}${colorPreferenceText}` : ''}
${orderData.options && orderData.options.length > 0 ? `Дополнительные опции:\n${orderData.options.map((opt: string) => `- ${optionTranslations[opt] || opt}`).join('\n')}` : ''}
${orderData.customDescription ? `\nОписание индивидуального заказа:\n${orderData.customDescription}` : ''}

Контактная информация:
Имя: ${editableUserInfo.name || 'Не указано'}
Username: ${editableUserInfo.username ? `@${editableUserInfo.username}` : 'Не указан'}
Телефон: ${sharedPhoneNumber || 'Не указан'}
`;

    console.log("[DEBUG] Generated order text:", orderText);
    return orderText;
  };

  const handleSubmit = async () => {
    console.log("[DEBUG] handleSubmit called");
    
    // Получаем актуальное состояние из localStorage перед проверкой
    const savedState = localStorage.getItem('editableUserInfo');
    console.log("[DEBUG] Saved state from localStorage:", savedState);
    
    let currentState = editableUserInfo;
    if (savedState) {
      try {
        currentState = JSON.parse(savedState);
        console.log("[DEBUG] Using state from localStorage:", currentState);
      } catch (e) {
        console.error('Error parsing saved state in handleSubmit:', e);
      }
    }
    
    console.log("[DEBUG] Current state for validation:", currentState);
    setDebugInfo(prev => prev + "\nhandleSubmit triggered");

    if (!tgWebApp) {
      const errorMessage = "Ошибка: Не удалось получить доступ к Telegram WebApp.";
      console.error(errorMessage);
      setError(errorMessage);
      setDebugInfo(prev => prev + "\nError: Telegram WebApp not initialized");
      
      // Отправляем информацию об ошибке продавцу
      try {
        await axiosInstance.post('/sendMessage', {
          chat_id: SELLER_CHAT_ID,
          text: `⚠️ Ошибка при оформлении заказа:\n${errorMessage}\n\nПользователь: ${currentState.name || 'Не указано'}\nUsername: ${currentState.username || 'Не указан'}`,
          parse_mode: 'Markdown'
        });
      } catch (e) {
        console.error("Error sending error notification to seller:", e);
      }
      return;
    }

    // Проверяем только наличие телефона
    if (!currentState.phone) {
      const errorMessage = 'Пожалуйста, укажите номер телефона';
      console.log("[DEBUG] Phone validation failed. Current phone:", currentState.phone);
      message.error(errorMessage);
      
      // Отправляем информацию об ошибке продавцу
      try {
        await axiosInstance.post('/sendMessage', {
          chat_id: SELLER_CHAT_ID,
          text: `⚠️ Ошибка валидации при оформлении заказа:\n${errorMessage}\n\nПользователь: ${currentState.name || 'Не указано'}\nUsername: ${currentState.username || 'Не указан'}`,
          parse_mode: 'Markdown'
        });
      } catch (e) {
        console.error("Error sending error notification to seller:", e);
      }
      return;
    }

    // Показываем индикатор загрузки на кнопке
    tgWebApp.MainButton.showProgress(false);
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Сначала отправляем сообщение в чат продавца
      const orderText = generateOrderText(orderDetails, userInfo, currentState.phone);
      console.log("[DEBUG] Generated order text:", orderText);
      
      try {
        const response = await axiosInstance.post('/sendMessage', {
          chat_id: SELLER_CHAT_ID,
          text: orderText,
          parse_mode: 'Markdown'
        });
        
        console.log("[DEBUG] Message sent to seller successfully:", response.data);
        setDebugInfo(prev => prev + "\nMessage sent to seller successfully");
      } catch (sellerError: any) {
        const errorMessage = `Ошибка при отправке заказа продавцу: ${sellerError?.message || 'Неизвестная ошибка'}`;
        console.error("[DEBUG] Error sending message to seller:", sellerError);
        setDebugInfo(prev => prev + `\nError sending message to seller: ${sellerError}`);
        
        // Отправляем информацию об ошибке продавцу
        try {
          await axiosInstance.post('/sendMessage', {
            chat_id: SELLER_CHAT_ID,
            text: `⚠️ Ошибка при отправке заказа:\n${errorMessage}\n\nПользователь: ${currentState.name || 'Не указано'}\nUsername: ${currentState.username || 'Не указан'}\n\nДетали заказа:\n${orderText}`,
            parse_mode: 'Markdown'
          });
        } catch (e) {
          console.error("Error sending error notification to seller:", e);
        }
        
        throw new Error(errorMessage);
      }

      // Если сообщение успешно отправлено, отправляем данные в WebApp
      const orderDataToSend = {
        ...orderDetails,
        user: {
          id: userInfo?.id,
          name: currentState.name,
          username: currentState.username,
          phone: currentState.phone
        }
      };
      
      console.log("[DEBUG] Sending data to WebApp:", orderDataToSend);
      tgWebApp.sendData(JSON.stringify(orderDataToSend));
      console.log("[DEBUG] Data sent to WebApp successfully");
      setDebugInfo(prev => prev + "\nData sent to WebApp successfully");
      
      setSuccess(true);
      setError(null);

    } catch (e: any) {
      const errorMessage = e?.message || 'Произошла ошибка при отправке заказа. Попробуйте еще раз.';
      console.error('[DEBUG] Error in handleSubmit:', e);
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nError in handleSubmit: ${e}`);
      
      // Отправляем информацию об ошибке продавцу
      try {
        await axiosInstance.post('/sendMessage', {
          chat_id: SELLER_CHAT_ID,
          text: `⚠️ Ошибка при оформлении заказа:\n${errorMessage}\n\nПользователь: ${currentState.name || 'Не указано'}\nUsername: ${currentState.username || 'Не указан'}\n\nДетали заказа:\n${JSON.stringify(orderDetails, null, 2)}`,
          parse_mode: 'Markdown'
        });
      } catch (e) {
        console.error("Error sending error notification to seller:", e);
      }
    } finally {
      // Скрываем индикатор загрузки
      tgWebApp.MainButton.hideProgress();
      setIsSubmitting(false);
    }
  };

  const handleRequestPhone = () => {
    console.log("[DEBUG] handleRequestPhone called");
    if (!window.Telegram?.WebApp) {
      console.error('[DEBUG] Telegram WebApp не доступен');
      message.error('Ошибка: Telegram WebApp не инициализирован.');
      return;
    }

    setIsLoading(true);
    const webApp = window.Telegram.WebApp;
    console.log("[DEBUG] WebApp object:", webApp);
    console.log("[DEBUG] WebApp version:", webApp.version);
    console.log("[DEBUG] WebApp platform:", webApp.platform);

    try {
      console.log("[DEBUG] Requesting contact");
      webApp.requestContact((success: boolean) => {
        console.log("[DEBUG] Contact request callback, success:", success);
        if (success) {
          // Контакт был предоставлен, получаем его через getRequestedContact
          console.log("[DEBUG] Contact request was successful");
          webApp.invokeCustomMethod('getRequestedContact', {}, (error: any, contact: string) => {
            if (error) {
              console.error('[DEBUG] Error getting contact:', error);
              message.error('Ошибка при получении контакта');
              setIsLoading(false);
              return;
            }

            try {
              // Декодируем параметры из URL-encoded строки
              const params = new URLSearchParams(contact);
              const contactData = JSON.parse(decodeURIComponent(params.get('contact') || '{}'));
              console.log("[DEBUG] Received contact data:", contactData);

              if (contactData.phone_number) {
                console.log("[DEBUG] Setting phone number:", contactData.phone_number);
                const formattedPhone = contactData.phone_number.startsWith('+') ? 
                  contactData.phone_number : 
                  `+${contactData.phone_number}`;
                
                setPhoneNumber(formattedPhone);
                setEditableUserInfo(prev => {
                  const newState = {
                    ...prev,
                    phone: formattedPhone
                  };
                  console.log("[DEBUG] Updated editableUserInfo with phone:", newState);
                  localStorage.setItem('editableUserInfo', JSON.stringify(newState));
                  return newState;
                });
                message.success('Номер телефона получен!');
              } else {
                console.warn("[DEBUG] No phone number in contact data");
                message.error('Не удалось получить номер телефона');
              }
            } catch (parseError) {
              console.error('[DEBUG] Error parsing contact data:', parseError);
              message.error('Ошибка при обработке данных контакта');
            } finally {
              setIsLoading(false);
            }
          });
        } else {
          console.log("[DEBUG] Contact request was cancelled");
          setIsLoading(false);
          message.info('Запрос контакта отменен');
        }
      });
    } catch (error) {
      console.error('[DEBUG] Error in handleRequestPhone:', error);
      message.error('Ошибка при запросе номера телефона');
      setIsLoading(false);
    }
  };

  // Отображение состояния загрузки, успеха или ошибки
  if (isSubmitting) {
    return <Container style={{ alignItems: 'center', justifyContent: 'center', height: '80vh' }}><Spin size="large" tip="Отправка заказа..." /></Container>;
  }

  if (success) {
    return (
      <Result
        status="success"
        title="Заказ успешно отправлен!"
        subTitle="Спасибо за ваш заказ! Мы скоро свяжемся с вами."
        extra={[
          <Button type="primary" key="close" onClick={() => tgWebApp?.close()}>
            Закрыть
          </Button>,
        ]}
      />
    );
  }

  return (
    <Container>
      <StyledTitle level={3}>Подтверждение заказа</StyledTitle>
      
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} closable onClose={() => setError(null)} />}
      
      {/* Вывод отладочной информации */} 
      {/* <Alert message={<pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{debugInfo}</pre>} type="info" style={{ marginBottom: '16px' }} /> */}
      
      {userInfo && (
        <StyledCard title="Ваши данные">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Имя:</strong>
              <Input
                value={editableUserInfo.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Логин:</strong>
              <Input
                value={editableUserInfo.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="Введите ваш логин"
                addonBefore="@"
              />
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Телефон:</strong>
              {phoneNumber ? (
                <Input
                  value={editableUserInfo.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="Введите номер телефона"
                />
              ) : (
                <Button 
                  type="primary" 
                  onClick={handleRequestPhone} 
                  loading={isLoading}
                  style={{ width: '100%' }}
                >
                  Получить из Telegram
                </Button>
              )}
            </div>
          </div>
        </StyledCard>
      )}
      
      <StyledCard title="Детали вашего заказа">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="small"
        />
      </StyledCard>

      <ButtonContainer>
        <ActionButton onClick={onBack} disabled={isSubmitting}>Назад</ActionButton>
      </ButtonContainer>
    </Container>
  );
};

export default PreviewStep; 