# 🤖 Настройка Telegram Бота

## 1. Создание бота в Telegram

1. Откройте чат с [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Дайте имя боту (например: "Vami Bags Shop")
4. Дайте username боту (например: "vami_bags_bot")
5. Скопируйте полученный токен

## 2. Создание .env файла

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Telegram Bot Token (замените на ваш настоящий токен!)
BOT_TOKEN=ваш_токен_от_BotFather

# URL веб-приложения
WEBAPP_URL=https://squazaryu.github.io/vami-bags-mini-app/

# ID чата администратора (ваш Telegram ID)
ADMIN_CHAT_ID=ваш_telegram_id

# Настройки логирования
LOG_LEVEL=INFO
LOG_FILE=bot.log

# Настройки базы данных
DATABASE_URL=bot.db
```

## 3. Настройка веб-приложения

1. В чате с [@BotFather] отправьте `/setmenubutton`
2. Выберите вашего бота
3. Введите текст кнопки: "🛍️ Оформить заказ"
4. Введите URL: `https://squazaryu.github.io/vami-bags-mini-app/`

## 4. Запуск бота

После создания .env файла с настоящим токеном:

```bash
python3 bot.py
```

## 5. Тестирование

1. Найдите вашего бота в Telegram
2. Нажмите "Запустить" или отправьте `/start`
3. Нажмите кнопку "🛍️ Оформить заказ"
4. Веб-приложение должно открыться в Telegram

## 🎯 Готово!

Теперь ваш бот готов принимать заказы через красивое веб-приложение!