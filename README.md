# VaMi Bags - Telegram Mini App

Telegram Mini App для заказа сумок и подстаканников с вышивкой. Приложение предоставляет удобный интерфейс для выбора типа изделия, размера, формы, материала, цвета и дополнительных опций.

## Функциональность

- Выбор типа изделия (сумка, подстаканник, нестандартный заказ)
- Выбор размера сумки (S, M, L)
- Выбор формы сумки (круглая, прямоугольная, трапеция, квадратная, месяц, сердце)
- Выбор материала (акрил, хрусталь, Swarovski)
- Выбор цвета
- Выбор дополнительных опций (застёжка, подклад, ручка-цепочка, короткая ручка)
- Предпросмотр заказа
- Расчет стоимости
- Отправка заказа в Telegram бот

## Технологии

- React
- TypeScript
- Ant Design
- Styled Components
- Telegram Web App API

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/squazaryu/vami-bags-mini-app.git
cd vami-bags-mini-app
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение в режиме разработки:
```bash
npm start
```

4. Соберите приложение для продакшена:
```bash
npm run build
```

## Структура проекта

```
src/
  ├── components/          # React компоненты
  │   ├── ProductTypeStep.tsx
  │   ├── SizeStep.tsx
  │   ├── ShapeStep.tsx
  │   ├── MaterialStep.tsx
  │   ├── ColorStep.tsx
  │   ├── OptionsStep.tsx
  │   ├── CustomOrderStep.tsx
  │   └── PreviewStep.tsx
  ├── types/              # TypeScript типы
  │   ├── index.ts
  │   └── telegram.d.ts
  ├── App.tsx            # Главный компонент
  ├── App.css            # Стили главного компонента
  ├── index.tsx          # Точка входа
  └── index.css          # Глобальные стили
```

## Разработка

### Добавление новых функций

1. Создайте новый компонент в директории `src/components/`
2. Добавьте необходимые типы в `src/types/index.ts`
3. Импортируйте и используйте компонент в `App.tsx`

### Стилизация

Приложение использует CSS переменные Telegram для адаптации под тему пользователя:

- `--tg-theme-bg-color` - цвет фона
- `--tg-theme-text-color` - цвет текста
- `--tg-theme-hint-color` - цвет подсказок
- `--tg-theme-link-color` - цвет ссылок
- `--tg-theme-button-color` - цвет кнопок
- `--tg-theme-button-text-color` - цвет текста кнопок
- `--tg-theme-secondary-bg-color` - вторичный цвет фона

## Развертывание

1. Соберите приложение:
```bash
npm run build
```

2. Загрузите содержимое директории `build/` на ваш хостинг

3. Настройте Telegram бота для работы с Mini App:
   - Добавьте URL вашего приложения в настройках бота
   - Настройте обработку данных, отправляемых из Mini App

## Лицензия

MIT
