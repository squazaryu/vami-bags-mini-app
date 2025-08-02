import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from config import BOT_TOKEN, WEBAPP_URL, LOG_LEVEL, LOG_FILE
import json
import sqlite3
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=getattr(logging, LOG_LEVEL),
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VamiBagsBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
        self.init_database()

    def init_database(self):
        """Инициализация базы данных"""
        conn = sqlite3.connect('bot.db')
        cursor = conn.cursor()
        
        # Создание таблицы заказов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                order_data TEXT,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

    def setup_handlers(self):
        """Настройка обработчиков команд"""
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("order", self.order_command))
        self.application.add_handler(CallbackQueryHandler(self.button_callback))

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка команды /start"""
        user = update.effective_user
        keyboard = [
            [InlineKeyboardButton("🛍️ Сделать заказ", web_app=WebAppInfo(url=WEBAPP_URL))],
            [InlineKeyboardButton("ℹ️ О нас", callback_data="about")],
            [InlineKeyboardButton("📞 Контакты", callback_data="contacts")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        welcome_text = f"""
Привет, {user.first_name}! 👋

Добро пожаловать в Vami Bags - ваш магазин стильных сумок и аксессуаров!

🎨 Мы создаем уникальные изделия:
• Сумки с вашим дизайном
• Подстаканники ручной работы
• Серьги из качественных материалов

✨ Наши преимущества:
• Индивидуальный подход
• Качественные материалы
• Быстрое выполнение заказов

Нажмите кнопку ниже, чтобы начать заказ!
        """
        
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup
        )

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка команды /help"""
        help_text = """
🤝 Как мы работаем:

1️⃣ Нажмите "Сделать заказ" и откроется наше приложение
2️⃣ Выберите тип продукта (сумка, подстаканник, серьги)
3️⃣ Выберите форму, материал, размер и цвет
4️⃣ Укажите количество и дополнительные опции
5️⃣ Проверьте детали заказа и итоговую стоимость
6️⃣ Заполните контактные данные
7️⃣ Отправьте заказ!

📞 По всем вопросам обращайтесь к @admin

💳 Оплата производится при получении заказа
🚚 Доставка по городу бесплатно
        """
        
        keyboard = [
            [InlineKeyboardButton("🛍️ Сделать заказ", web_app=WebAppInfo(url=WEBAPP_URL))],
            [InlineKeyboardButton("📞 Связаться с нами", callback_data="contacts")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(help_text, reply_markup=reply_markup)

    async def order_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка команды /order"""
        keyboard = [
            [InlineKeyboardButton("🛍️ Сделать заказ", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "Нажмите кнопку ниже, чтобы открыть форму заказа:",
            reply_markup=reply_markup
        )

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка нажатий на кнопки"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "about":
            about_text = """
🏪 О нас - Vami Bags

Мы создаем уникальные изделия ручной работы уже более 5 лет!

🎨 Наша миссия:
Создавать качественные и стильные аксессуары, которые подчеркивают индивидуальность каждого клиента.

✨ Что мы предлагаем:
• Сумки с индивидуальным дизайном
• Подстаканники ручной работы
• Серьги из качественных материалов
• Персонализированные изделия

🛠️ Наши материалы:
• Акрил - прочный и красивый
• Хрусталь - элегантный и блестящий
• Сваровски - роскошные кристаллы

💝 Каждое изделие создается с любовью и вниманием к деталям!
            """
            keyboard = [
                [InlineKeyboardButton("🛍️ Сделать заказ", web_app=WebAppInfo(url=WEBAPP_URL))]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await query.edit_message_text(about_text, reply_markup=reply_markup)
            
        elif query.data == "contacts":
            contacts_text = """
📞 Контакты

💬 Telegram: @admin
📧 Email: info@vamibags.ru
🌐 Сайт: vamibags.ru

📍 Адрес мастерской:
г. Москва, ул. Примерная, д. 123

🕒 Время работы:
Пн-Пт: 10:00 - 19:00
Сб: 10:00 - 16:00
Вс: выходной

🚚 Доставка:
• По городу - бесплатно
• В регионы - по договоренности
            """
            keyboard = [
                [InlineKeyboardButton("🛍️ Сделать заказ", web_app=WebAppInfo(url=WEBAPP_URL))]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await query.edit_message_text(contacts_text, reply_markup=reply_markup)

    def save_order(self, user_id: int, username: str, first_name: str, last_name: str, order_data: dict):
        """Сохранение заказа в базу данных"""
        conn = sqlite3.connect('bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO orders (user_id, username, first_name, last_name, order_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name, json.dumps(order_data, ensure_ascii=False)))
        
        order_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return order_id

    def get_order_summary(self, order_data: dict) -> str:
        """Формирование сводки заказа"""
        summary = "📋 Детали заказа:\n\n"
        
        if order_data.get('productType'):
            summary += f"🎒 Тип: {order_data['productType']['displayName']}\n"
        
        if order_data.get('shape'):
            summary += f"📐 Форма: {order_data['shape']['displayName']}\n"
        
        if order_data.get('material'):
            summary += f"💎 Материал: {order_data['material']['displayName']}\n"
        
        if order_data.get('size'):
            summary += f"📏 Размер: {order_data['size']['displayName']}\n"
        
        if order_data.get('color'):
            summary += f"🎨 Цвет: {order_data['color']['displayName']}\n"
        
        summary += f"📦 Количество: {order_data.get('quantity', 1)} шт.\n"
        
        if order_data.get('customerName'):
            summary += f"👤 Имя: {order_data['customerName']}\n"
        
        if order_data.get('customerPhone'):
            summary += f"📞 Телефон: {order_data['customerPhone']}\n"
        
        if order_data.get('customerAddress'):
            summary += f"📍 Адрес: {order_data['customerAddress']}\n"
        
        if order_data.get('additionalNotes'):
            summary += f"📝 Примечания: {order_data['additionalNotes']}\n"
        
        return summary

    async def process_webapp_data(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка данных из веб-приложения"""
        try:
            # Получаем данные из веб-приложения
            webapp_data = update.effective_message.web_app_data.data
            order_data = json.loads(webapp_data)
            
            user = update.effective_user
            
            # Сохраняем заказ в базу данных
            order_id = self.save_order(
                user.id,
                user.username or "",
                user.first_name or "",
                user.last_name or "",
                order_data
            )
            
            # Формируем сводку заказа
            order_summary = self.get_order_summary(order_data)
            
            # Отправляем подтверждение пользователю
            await update.message.reply_text(
                f"✅ Заказ #{order_id} успешно оформлен!\n\n{order_summary}\n\n"
                "Мы свяжемся с вами в ближайшее время для уточнения деталей.",
                parse_mode='HTML'
            )
            
            # Отправляем уведомление администратору (если есть)
            admin_chat_id = os.getenv('ADMIN_CHAT_ID')
            if admin_chat_id:
                admin_message = f"""
🆕 Новый заказ #{order_id}

{order_summary}

👤 Пользователь: @{user.username or user.first_name}
🆔 ID: {user.id}
⏰ Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                """
                await context.bot.send_message(chat_id=admin_chat_id, text=admin_message)
            
            logger.info(f"New order #{order_id} from user {user.id}")
            
        except Exception as e:
            logger.error(f"Error processing webapp data: {e}")
            await update.message.reply_text(
                "❌ Произошла ошибка при обработке заказа. Попробуйте еще раз или свяжитесь с нами."
            )

    def run(self):
        """Запуск бота"""
        logger.info("Starting Vami Bags Bot...")
        self.application.run_polling()

if __name__ == "__main__":
    bot = VamiBagsBot()
    bot.run() 