# Vami Bags Mini App

Telegram Mini App для заказа стильных сумок и аксессуаров ручной работы.

## 🚀 Особенности

- **Многошаговая форма заказа** с выбором типа продукта, формы, материала, размера и цвета
- **Адаптивный дизайн** для мобильных устройств
- **Интеграция с Telegram Web App** для seamless пользовательского опыта
- **Автоматический деплой** на GitHub Pages
- **База данных** для хранения заказов
- **Уведомления администратору** о новых заказах

## 📋 Структура проекта

```
├── src/                    # React приложение
│   ├── components/         # Компоненты UI
│   ├── types/             # TypeScript типы
│   ├── utils/             # Утилиты и данные
│   └── ...
├── bot.py                 # Telegram бот
├── config.py              # Конфигурация бота
├── requirements.txt       # Python зависимости
├── package.json           # Node.js зависимости
└── ...
```

## 🛠️ Установка и настройка

### 1. Клонирование репозитория

```bash
git clone https://github.com/squazaryu/vami-bags-mini-app.git
cd vami-bags-mini-app
```

### 2. Настройка фронтенда

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

### 3. Настройка Telegram бота

1. **Создайте бота** у [@BotFather](https://t.me/BotFather)
2. **Получите токен** бота
3. **Создайте файл `.env`** на основе `env.example`:

```bash
cp env.example .env
```

4. **Заполните переменные окружения** в файле `.env`:

```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://squazaryu.github.io/vami-bags-mini-app/
ADMIN_CHAT_ID=your_admin_chat_id_here
LOG_LEVEL=INFO
LOG_FILE=bot.log
DATABASE_URL=bot.db
```

### 4. Установка Python зависимостей

```bash
pip install -r requirements.txt
```

### 5. Настройка веб-приложения в боте

1. Отправьте команду `/setmenubutton` боту @BotFather
2. Выберите вашего бота
3. Укажите текст кнопки: "🛍️ Сделать заказ"
4. Укажите URL: `https://squazaryu.github.io/vami-bags-mini-app/`

## 🚀 Запуск

### Запуск бота

```bash
python bot.py
```

### Запуск фронтенда (для разработки)

```bash
npm start
```

## 📱 Использование

1. **Откройте бота** в Telegram
2. **Нажмите кнопку** "🛍️ Сделать заказ"
3. **Выберите параметры** заказа:
   - Тип продукта (сумка, подстаканник, серьги)
   - Форма (круглая, квадратная, сердце и т.д.)
   - Материал (акрил, хрусталь, сваровски)
   - Размер (маленький, средний, большой)
   - Цвет (9 вариантов)
   - Дополнительные опции
4. **Заполните контактные данные**
5. **Отправьте заказ**

## 🎨 Компоненты

### Основные компоненты

- `ProductTypeStep` - выбор типа продукта
- `ShapeStep` - выбор формы
- `MaterialStep` - выбор материала
- `SizeStep` - выбор размера
- `ColorStep` - выбор цвета
- `OptionsStep` - дополнительные опции
- `PreviewStep` - предварительный просмотр
- `OrderFormStep` - финальная форма заказа

### Функции бота

- `/start` - приветствие и основное меню
- `/help` - инструкции по использованию
- `/order` - быстрый доступ к форме заказа
- Обработка данных из веб-приложения
- Сохранение заказов в базу данных
- Уведомления администратору

## 🗄️ База данных

База данных SQLite автоматически создается при первом запуске бота.

### Таблица `orders`

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Уникальный ID заказа |
| user_id | INTEGER | ID пользователя Telegram |
| username | TEXT | Username пользователя |
| first_name | TEXT | Имя пользователя |
| last_name | TEXT | Фамилия пользователя |
| order_data | TEXT | JSON данные заказа |
| status | TEXT | Статус заказа (new, processing, completed) |
| created_at | TIMESTAMP | Время создания заказа |
| updated_at | TIMESTAMP | Время обновления заказа |

## 🌐 Деплой

### GitHub Pages

Приложение автоматически деплоится на GitHub Pages при push в main ветку.

### Настройка домена

1. Перейдите в настройки репозитория
2. Включите GitHub Pages
3. Выберите источник: "Deploy from a branch"
4. Выберите ветку: `gh-pages`

## 🔧 Разработка

### Структура данных

```typescript
interface OrderForm {
  productType: ProductType | null;
  shape: Shape | null;
  material: Material | null;
  size: Size | null;
  color: Color | null;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  additionalNotes: string;
}
```

### Добавление новых продуктов

1. Добавьте данные в `src/utils/data.ts`
2. Обновите типы в `src/types/index.ts`
3. При необходимости обновите компоненты

## 📞 Поддержка

По всем вопросам обращайтесь:
- Telegram: @tumowuh
- Email: none

## 📄 Лицензия

MIT License
