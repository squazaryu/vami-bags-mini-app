import axios from 'axios';

const SELLER_CHAT_ID = "50122963";
const BOT_TOKEN = "7408506728:AAGK9d5kddSnMQDwgIYOiEK-6nPFFwgYP-M";

// Создаем экземпляр axios для прямых запросов к Telegram API
export const axiosInstance = axios.create({
  baseURL: `https://api.telegram.org/bot${BOT_TOKEN}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const testProxyConnection = async () => {
  try {
    const testMessage = "🔄 Тестовое сообщение от прокси-сервера";
    const response = await axiosInstance.post('/sendMessage', {
      chat_id: SELLER_CHAT_ID,
      text: testMessage,
      parse_mode: 'Markdown'
    });
    
    console.log("Telegram API ответил:", response.data);
    return true;
  } catch (error) {
    console.error("Ошибка при тестировании подключения:", error);
    return false;
  }
}; 