import logging
import os
import sys
import time
import json
from telegram import Bot, Update, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, InputMediaPhoto, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import Application, ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes, ConversationHandler, CallbackQueryHandler
from telegram.error import Conflict, TimedOut, NetworkError
from better_profanity import Profanity
from config import *
from database import Database
from menu import get_menu_commands
import asyncio

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,  # Изменяем уровень на DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()  # Добавляем вывод в консоль
    ]
)
logger = logging.getLogger(__name__)

# Инициализация фильтра нецензурной лексики
profanity = Profanity()
profanity.load_censor_words()

# Определение этапов
PRODUCT, SIZE, SHAPE, MATERIAL, COLOR, OPTIONS, CONTACT, ORDER, PREVIEW = range(9)

class SumkiBot:
    def __init__(self):
        self.user_data = {}
        self.stages = ['start', 'choose_product', 'choose_size', 'choose_shape', 'choose_material', 'choose_color', 'choose_options', 'contact', 'order', 'preview']
        self.state_history = {}
        self.db = Database()

    async def initialize_db(self, application: ApplicationBuilder):
        """Асинхронно инициализирует базу данных (принимает application от post_init)."""
        await self.db.initialize()

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        try:
            logger.info("Получена команда /start")
            user_id = update.message.from_user.id
            self.state_history[user_id] = []
            context.user_data['stage'] = 'start'

            # Показываем только кнопку для открытия мини-приложения
            keyboard = ReplyKeyboardMarkup([
                [KeyboardButton("Оформить заказ", web_app=WebAppInfo(url=WEBAPP_URL))]
            ], resize_keyboard=True)
            
            welcome_message = (
                "Добро пожаловать в VaMi Bags - магазин изделий из бусин!\n\n"
                "Для оформления заказа нажмите на кнопку ниже:"
            )
            
            await update.message.reply_text(welcome_message, reply_markup=keyboard)
            logger.info(f"Отправлено приветственное сообщение пользователю {user_id}")
            
        except Exception as e:
            logger.error(f"Ошибка в обработчике команды /start: {e}")
            await update.message.reply_text(
                "Произошла ошибка при обработке команды. Пожалуйста, попробуйте позже."
            )

    async def cancel_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Отмена текущего заказа"""
        user_id = update.message.from_user.id
        context.user_data.clear()
        self.state_history[user_id] = []
        keyboard = ReplyKeyboardMarkup([["Оформить заказ"]], resize_keyboard=True)
        await update.message.reply_text(MESSAGES['order_cancelled'], reply_markup=keyboard)
        return ConversationHandler.END

    async def show_order_preview(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает предпросмотр заказа"""
        user_id = update.message.from_user.id
        self.state_history[user_id].append('preview')
        context.user_data['stage'] = 'preview'

        # Формируем текст предпросмотра
        preview_text = MESSAGES['order_preview'] + "\n\n"
        
        if context.user_data.get('product') == "Нестандартный заказ":
            preview_text += f"Тип заказа: Нестандартный\n"
            preview_text += f"Описание: {context.user_data.get('custom_description', 'Не указано')}\n"
            if 'custom_photo_id' in context.user_data:
                preview_text += "Фотографии: Прикреплены\n"
        else:
            preview_text += f"Продукт: {context.user_data.get('product', 'Не указан')}\n"
            if context.user_data.get('product') == "Сумка":
                preview_text += f"Размер: {context.user_data.get('size', 'Не указан')}\n"
                preview_text += f"Форма: {context.user_data.get('shape', 'Не указана')}\n"
            preview_text += (
                f"Материал бусин: {context.user_data.get('material', 'Не указан')}\n"
                f"Цвет: {context.user_data.get('color', 'Не указан')}\n"
                f"Дополнительные опции: {', '.join(context.user_data.get('options', ['Не указаны']))}\n"
            )

        # Создаем клавиатуру для подтверждения/отмены
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("Подтвердить", callback_data="confirm_order"),
                InlineKeyboardButton("Отменить", callback_data="cancel_order")
            ]
        ])

        # Отправляем предпросмотр
        await update.message.reply_text(preview_text, reply_markup=keyboard)

    async def handle_preview_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обрабатывает нажатия кнопок в предпросмотре заказа"""
        query = update.callback_query
        await query.answer()

        if query.data == "confirm_order":
            await query.message.reply_text(MESSAGES['request_contact'])
            keyboard = ReplyKeyboardMarkup([[KeyboardButton("Поделиться контактом", request_contact=True)]], resize_keyboard=True)
            await query.message.reply_text(MESSAGES['contact_button'], reply_markup=keyboard)
            context.user_data['stage'] = 'contact'
        elif query.data == "cancel_order":
            await self.cancel_order(update, context)

    async def choose_product(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_product')
        context.user_data['stage'] = 'choose_product'
        keyboard = ReplyKeyboardMarkup([
            ["Сумка", "Подстаканник"],
            ["Нестандартный заказ"]
        ], resize_keyboard=True)
        await update.message.reply_text("Какой продукт вы хотите заказать?", reply_markup=keyboard)

    async def choose_bag_size(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_size')
        context.user_data['stage'] = 'choose_size'
        keyboard = ReplyKeyboardMarkup([
            ["S (микросумка)"], 
            ["M (влезает телефон и картхолдер)"],
            ["L (на 5 см больше размера M)"],
            ["Назад"]
        ], resize_keyboard=True)
        await update.message.reply_text("Пожалуйста, выберите размер сумки:", reply_markup=keyboard)

    async def choose_bag_shape(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_shape')
        context.user_data['stage'] = 'choose_shape'
        keyboard = ReplyKeyboardMarkup([
            ["Круглая", "Прямоугольная"],
            ["Трапеция", "Квадратная"],
            ["Месяц", "Сердце"],
            ["Назад"]
        ], resize_keyboard=True)
        
        # Отправка фотографий
        photo_files = {
            "Круглая": "/Users/tumowuh/Desktop/Telebot/bag_shapes/krug.jpeg",
            "Прямоугольная": "/Users/tumowuh/Desktop/Telebot/bag_shapes/pramougolnaya.jpeg",
            "Трапеция": "/Users/tumowuh/Desktop/Telebot/bag_shapes/trapeciya.jpeg",
            "Квадратная": "/Users/tumowuh/Desktop/Telebot/bag_shapes/kvadrat.jpeg",
            "Месяц": "/Users/tumowuh/Desktop/Telebot/bag_shapes/mesyac.jpeg",
            "Сердце": "/Users/tumowuh/Desktop/Telebot/bag_shapes/serdce.jpeg"
        }
        
        # Подготовка медиа-группы
        success = False
        media_group = []
        try:
            for shape_name, photo_path in photo_files.items():
                if os.path.exists(photo_path):
                    try:
                        with open(photo_path, 'rb') as photo_file:
                            photo_bytes = photo_file.read()
                            media_group.append(InputMediaPhoto(media=photo_bytes, caption=shape_name))
                            logger.info(f"Фото {shape_name} успешно добавлено в медиагруппу")
                    except Exception as e:
                        logger.error(f"Ошибка при открытии или чтении файла {photo_path}: {e}")
                else:
                    logger.error(f"Файл не найден: {photo_path}")
            
            if media_group:
                await context.bot.send_media_group(chat_id=user_id, media=media_group)
                success = True
                logger.info("Медиагруппа форм успешно отправлена")
            else:
                logger.error("Не удалось подготовить ни одной фотографии форм.")
                
        except Exception as e:
            logger.error(f"Ошибка при подготовке или отправке медиагруппы форм: {e}")

        # Отправляем сообщение с информацией о доступных формах
        await update.message.reply_text(
            "Выберите форму сумки:\n\n" + 
            ("Фотографии доступных форм отправлены выше." if success else "К сожалению, не удалось отобразить фотографии форм."), 
            reply_markup=keyboard
        )

    async def choose_bag_material(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_material')
        context.user_data['stage'] = 'choose_material'
        keyboard = ReplyKeyboardMarkup([
            ["Акрил"],
            ["Хрусталь", "Swarovski"],
            ["Назад"]
        ], resize_keyboard=True)
        
        # Отправка фотографий
        photos = [
            "/Users/tumowuh/Desktop/Telebot/akril.jpeg",
            "/Users/tumowuh/Desktop/Telebot/hrust.jpeg",
            "/Users/tumowuh/Desktop/Telebot/swarovski.jpeg"
        ]
        
        media_group = []
        try:
            for photo_path in photos:
                if os.path.exists(photo_path):
                    try:
                        with open(photo_path, 'rb') as photo_file:
                            photo_bytes = photo_file.read()
                            media_group.append(InputMediaPhoto(media=photo_bytes))
                    except Exception as e:
                        logger.error(f"Ошибка при открытии или чтении файла материала {photo_path}: {e}")
                else:
                    logger.error(f"Файл материала не найден: {photo_path}")
            
            if media_group:
                await context.bot.send_media_group(chat_id=user_id, media=media_group)
                logger.info("Медиагруппа материалов успешно отправлена")
            else:
                await update.message.reply_text("Не удалось найти фотографии материалов для отображения.")
                logger.error("Не удалось подготовить ни одной фотографии материалов для отправки")
                
        except (TimedOut, NetworkError) as e:
            logger.error(f"Ошибка при отправке медиагруппы материалов: {e}")
            await update.message.reply_text("Произошла ошибка при отправке фотографий материалов. Пожалуйста, продолжите выбор.")
        except Exception as e:
            logger.error(f"Общая ошибка при обработке фотографий материалов: {e}")
            await update.message.reply_text("Произошла неизвестная ошибка при показе фотографий материалов.")
        
        await update.message.reply_text("Выберите материал бусин:", reply_markup=keyboard)

    async def choose_bag_color(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_color')
        context.user_data['stage'] = 'choose_color'
        keyboard = ReplyKeyboardMarkup([
            ["Белый", "Чёрный"],
            ["Синий", "Зелёный"],
            ["Назад"]
        ], resize_keyboard=True)
        await update.message.reply_text("Выберите цвет сумки:", reply_markup=keyboard)

    async def choose_options(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_options')
        context.user_data['stage'] = 'choose_options'
        
        product = context.user_data.get('product')
        if product == "Сумка":
            keyboard = ReplyKeyboardMarkup([
                ["Застёжка", "Подклад"],
                ["Ручка-цепочка"],
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        elif product == "Подстаканник":
            keyboard = ReplyKeyboardMarkup([
                ["Короткая ручка", "Ручка-цепочка"],
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        else:
            keyboard = ReplyKeyboardMarkup([
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        
        await update.message.reply_text("Выберите дополнительные опции:", reply_markup=keyboard)

    async def check_text_content(self, text):
        """Проверяет текст на наличие непристойного содержания"""
        try:
            # Проверяем текст на непристойности
            return not profanity.contains_profanity(text)
        except Exception as e:
            logger.error(f"Ошибка при проверке текста: {e}")
            return True  # В случае ошибки пропускаем проверку

    async def handle_custom_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('custom_order')
        context.user_data['stage'] = 'custom_order'
        context.user_data['product'] = "Нестандартный заказ"
        keyboard = ReplyKeyboardMarkup([["Назад"]], resize_keyboard=True)
        await update.message.reply_text(
            "Пожалуйста, опишите ваш заказ в свободной форме. "
            "Вы можете приложить фото-пример на следующем шаге, если он у вас есть. "
            "После описания нажмите прикрепите фото и нажмите 'Завершить описание'.",
            reply_markup=keyboard
        )

    async def handle_custom_order_description(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message.text == "Назад":
            await self.go_back(update, context)
            return
            
        if update.message.text == "Завершить описание":
            await self.request_contact(update, context)
        else:
            # Проверяем текст на непристойности
            if not await self.check_text_content(update.message.text):
                await update.message.reply_text(
                    "Извините, но ваше сообщение содержит неприемлемый контент. "
                    "Пожалуйста, переформулируйте ваш запрос.",
                    reply_markup=ReplyKeyboardMarkup([["Назад"]], resize_keyboard=True)
                )
                return

            context.user_data['custom_description'] = update.message.text
            keyboard = ReplyKeyboardMarkup([["Завершить описание", "Назад"]], resize_keyboard=True)
            await update.message.reply_text(
                "Описание сохранено. Вы можете добавить фото или завершить описание.",
                reply_markup=keyboard
            )

    async def handle_custom_order_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message.text == "Назад":
            await self.go_back(update, context)
            return
            
        # Проверяем размер фото
        photo = update.message.photo[-1]
        if photo.file_size > MAX_PHOTO_SIZE:
            await update.message.reply_text(MESSAGES['error_photo_size'])
            return

        # Проверяем количество фото
        photos = context.user_data.get('custom_photos', [])
        if len(photos) >= MAX_PHOTOS_PER_ORDER:
            await update.message.reply_text(MESSAGES['error_photo_count'])
            return

        photos.append(photo.file_id)
        context.user_data['custom_photos'] = photos
        context.user_data['custom_photo_id'] = photo.file_id

        keyboard = ReplyKeyboardMarkup([["Завершить описание", "Назад"]], resize_keyboard=True)
        await update.message.reply_text(
            f"Фото сохранено ({len(photos)}/{MAX_PHOTOS_PER_ORDER}). Вы можете добавить ещё фото или завершить описание.",
            reply_markup=keyboard
        )

    async def handle_input(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик входящих сообщений"""
        user_id = update.message.from_user.id
        text = update.message.text

        # Обработка команды для открытия мини-приложения
        if text == "Оформить заказ":
            keyboard = ReplyKeyboardMarkup([
                [KeyboardButton("Оформить заказ", web_app=WebAppInfo(url=WEBAPP_URL))]
            ], resize_keyboard=True)
            await update.message.reply_text(
                "Нажмите на кнопку ниже, чтобы открыть форму оформления заказа:",
                reply_markup=keyboard
            )
            return

        # Обработка запроса контакта
        if text == "Поделиться контактом":
            keyboard = ReplyKeyboardMarkup([[KeyboardButton("Поделиться контактом", request_contact=True)]], resize_keyboard=True)
            await update.message.reply_text(
                "Для продолжения оформления заказа, пожалуйста, поделитесь своим контактным номером.",
                reply_markup=keyboard
            )
            return

        # Закомментированный код для старого функционала оформления заказа
        # if text == "Оформить заказ":
        #     await self.choose_product(update, context)
        # elif text == "Заказать через приложение":
        #     await self.open_mini_app(update, context)
        # elif text == "Назад":
        #     await self.go_back(update, context)
        # else:
        #     current_stage = context.user_data.get('stage', '')
        #     if current_stage == 'choose_product':
        #         if text in ["Сумка", "Подстаканник", "Нестандартный заказ"]:
        #             context.user_data['product'] = text
        #             if text == "Сумка":
        #                 await self.choose_bag_size(update, context)
        #             elif text == "Подстаканник":
        #                 await.choose_bag_material(update, context)
        #             else:
        #                 await self.handle_custom_order(update, context)
        #     elif current_stage == 'choose_size':
        #         if text in ["S (микросумка)", "M (влезает телефон и картхолдер)", "L (на 5 см больше размера M)"]:
        #             context.user_data['size'] = text
        #             await self.choose_bag_shape(update, context)
        #     elif current_stage == 'choose_shape':
        #         if text in ["Круглая", "Прямоугольная", "Трапеция", "Квадратная", "Месяц", "Сердце"]:
        #             context.user_data['shape'] = text
        #             await.choose_bag_material(update, context)
        #     elif current_stage == 'choose_material':
        #         if text in ["Акрил", "Хрусталь", "Swarovski"]:
        #             context.user_data['material'] = text
        #             await.choose_bag_color(update, context)
        #     elif current_stage == 'choose_color':
        #         if text in ["Белый", "Чёрный", "Синий", "Зелёный", "Красный", "Жёлтый", "Фиолетовый", "Розовый"]:
        #             context.user_data['color'] = text
        #             await.choose_options(update, context)
        #     elif current_stage == 'choose_options':
        #         if text in ["Застёжка", "Подклад", "Ручка-цепочка", "Короткая ручка"]:
        #             if 'options' not in context.user_data:
        #                 context.user_data['options'] = []
        #             if text not in context.user_data['options']:
        #                 context.user_data['options'].append(text)
        #             await.choose_options(update, context)
        #     elif current_stage == 'custom_order':
        #         if text == "Продолжить":
        #             await.handle_custom_order_description(update, context)
        #     elif current_stage == 'custom_order_description':
        #         if text == "Продолжить":
        #             await.handle_custom_order_photo(update, context)
        #     elif current_stage == 'custom_order_photo':
        #         if text == "Продолжить":
        #             await.show_order_preview(update, context)
        #     elif current_stage == 'contact':
        #         if text == "Поделиться контактом":
        #             await.request_contact(update, context)
        #     elif current_stage == 'order':
        #         if text == "Подтвердить":
        #             await.send_order(update, context)
        #         elif text == "Отменить":
        #             await.cancel_order(update, context)

    async def go_back(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        if user_id in self.state_history and len(self.state_history[user_id]) > 1:
            # Удаляем текущее состояние
            self.state_history[user_id].pop()
            # Получаем предыдущее состояние
            previous_state = self.state_history[user_id].pop()
            if previous_state == 'start':
                await self.start(update, context)
            elif previous_state == 'choose_product':
                await self.choose_product(update, context)
            elif previous_state == 'choose_size':
                await self.choose_bag_size(update, context)
            elif previous_state == 'choose_shape':
                await self.choose_bag_shape(update, context)
            elif previous_state == 'choose_material':
                await self.choose_bag_material(update, context)
            elif previous_state == 'choose_color':
                await self.choose_bag_color(update, context)
            elif previous_state == 'choose_options':
                await self.choose_options(update, context)
            elif previous_state == 'custom_order':
                await self.handle_custom_order(update, context)
        else:
            await update.message.reply_text('No previous state found.')
            return ConversationHandler.END

    async def request_contact(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('contact')
        context.user_data['stage'] = 'contact'
        keyboard = ReplyKeyboardMarkup([[KeyboardButton("Поделиться контактом", request_contact=True)]], resize_keyboard=True)
        await update.message.reply_text("Пожалуйста, поделитесь своим контактом, чтобы мы могли с вами связаться.", reply_markup=keyboard)

    async def contact_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        contact = update.message.contact
        context.user_data['contact'] = contact.phone_number
        await update.message.reply_text("Благодарим за заказ!", reply_markup=ReplyKeyboardRemove())
        await self.send_order(update, context)

    async def send_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if context.user_data.get('product') == "Нестандартный заказ":
            order = (
                f"Нестандартный заказ от {update.effective_user.username}:\n"
                f"Описание: {context.user_data.get('custom_description', 'Не указано')}\n"
            )
            if 'custom_photo_id' in context.user_data:
                order += "Фотография прикреплена\n"
        else:
            order = (
                f"Заказ от {update.effective_user.username}:\n"
                f"Продукт: {context.user_data.get('product', 'Не указан')}\n"
            )
            if context.user_data.get('product') == "Сумка":
                order += f"Размер: {context.user_data.get('size', 'Не указан')}\n"
                order += f"Форма: {context.user_data.get('shape', 'Не указана')}\n"
            order += (
                f"Материал бусин: {context.user_data.get('material', 'Не указан')}\n"
                f"Цвет: {context.user_data.get('color', 'Не указан')}\n"
                f"Дополнительные опции: {', '.join(context.user_data.get('options', ['Не указаны']))}"
            )
        
        # Сохраняем заказ в базу данных
        order_id = await self.db.add_order(
            update.effective_user.id,
            update.effective_user.username,
            context.user_data
        )
        
        if order_id:
            order = f"Заказ #{order_id}\n{order}"
        
        # Отправляем сообщение с благодарностью
        chat_id = update.effective_user.id
        await context.bot.send_message(chat_id=chat_id, text=MESSAGES['contact_received'])
        logger.info(f"Заказ #{order_id} успешно сохранен")
        
        # Отправляем сообщение о возможности оформить дополнительный заказ
        keyboard = ReplyKeyboardMarkup([["Оформить заказ"]], resize_keyboard=True)
        await context.bot.send_message(chat_id=chat_id, text="Для оформления дополнительного заказа нажмите на кнопку ниже:", reply_markup=keyboard)
        
        # Очищаем данные заказа
        context.user_data.clear()
        context.user_data['stage'] = 'start'

    async def send_telegram_message(self, message, chat_id):
        """Отправляет сообщение в Telegram чат с повторными попытками"""
        max_retries = 3
        retry_delay = 2  # секунды
        
        for attempt in range(max_retries):
            try:
                await Bot(BOT_TOKEN).send_message(chat_id=chat_id, text=message)
                logger.info(f"Сообщение успешно отправлено в чат {chat_id}")
                return True
            except TimedOut:
                logger.warning(f"Тайм-аут при отправке сообщения (попытка {attempt+1}/{max_retries})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
            except NetworkError as e:
                logger.warning(f"Сетевая ошибка при отправке сообщения (попытка {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
            except Exception as e:
                logger.error(f"Неизвестная ошибка при отправке сообщения: {e}")
                break
        
        logger.error(f"Не удалось отправить сообщение после {max_retries} попыток")
        return False

    # Обработчик ошибок
    async def error_handler(self, update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обрабатывает и логирует ошибки."""
        logger.error(f"Произошла ошибка: {context.error}")
        
        if isinstance(context.error, Conflict):
            logger.error("Обнаружен конфликт: возможно, запущено несколько экземпляров бота")
        elif isinstance(context.error, TimedOut):
            logger.error("Истекло время ожидания ответа от Telegram API")
        
        # Если произошла критическая ошибка, можно перезапустить бота
        # time.sleep(5)  # Ждем немного перед перезапуском
        # os.execv(sys.executable, [sys.executable] + sys.argv)

    def is_admin(self, user_id):
        """Проверяет, является ли пользователь администратором"""
        user_id_str = str(user_id)
        logger.info(f"Проверка администратора. Запрашиваемый ID: {user_id_str}")
        logger.info(f"Список админов: {ADMIN_IDS}")
        
        # Сравниваем строки (не числа)
        if user_id_str in ADMIN_IDS:
            logger.info(f"ID {user_id_str} найден в списке администраторов")
            return True
        else:
            logger.info(f"ID {user_id_str} НЕ найден в списке администраторов")
            return False

    async def admin_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает справку по админ-командам"""
        user_id = update.effective_user.id
        logger.info(f"Запрос админ-помощи от пользователя с ID: {user_id}")
        
        if not self.is_admin(user_id):
            logger.warning(f"Отказано в доступе для ID: {user_id}")
            await update.message.reply_text(MESSAGES['access_denied'])
            return
            
        logger.info(f"Доступ разрешен для ID: {user_id}")
        await update.message.reply_text(MESSAGES['admin_help'])

    async def admin_orders(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает список всех заказов"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        orders = await self.db.get_all_orders()
        if not orders:
            await update.message.reply_text("Нет доступных заказов.")
            return

        message = "Список заказов:\n\n"
        for order in orders:
            message += f"Заказ #{order['id']}\n"
            message += f"Дата: {order['order_date']}\n"
            message += f"Клиент: {order['username']}\n"
            message += f"Статус: {order['status']}\n"
            message += f"Тип: {order['product_type']}\n"
            if order['product_type'] == "Сумка":
                message += f"Размер: {order['size']}\n"
                message += f"Форма: {order['shape']}\n"
            message += f"Материал: {order['material']}\n"
            message += f"Цвет: {order['color']}\n"
            message += f"Опции: {order['options']}\n"
            if order['custom_description']:
                message += f"Описание: {order['custom_description']}\n"
            message += f"Контакт: {order['contact']}\n"
            if order['notes']:
                message += f"Заметки: {order['notes']}\n"
            message += "-------------------\n"

        # Разбиваем сообщение на части, если оно слишком длинное
        max_length = 4000
        for i in range(0, len(message), max_length):
            await update.message.reply_text(message[i:i + max_length])

    async def admin_order_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обновляет статус заказа"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        try:
            order_id, status = context.args
            order_id = int(order_id)
            
            if await self.db.update_order_status(order_id, status):
                await update.message.reply_text(f"Статус заказа #{order_id} обновлен на '{status}'")
            else:
                await update.message.reply_text(f"Не удалось обновить статус заказа #{order_id}")
        except (ValueError, IndexError):
            await update.message.reply_text("Использование: /status <id_заказа> <новый_статус>")

    async def admin_order_note(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Добавляет заметку к заказу"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        try:
            order_id = int(context.args[0])
            note = ' '.join(context.args[1:])
            
            if await self.db.add_order_note(order_id, note):
                await update.message.reply_text(f"Заметка добавлена к заказу #{order_id}")
            else:
                await update.message.reply_text(f"Не удалось добавить заметку к заказу #{order_id}")
        except (ValueError, IndexError):
            await update.message.reply_text("Использование: /note <id_заказа> <текст_заметки>")

    # Добавляем обработчик для Mini App
    async def open_mini_app(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Открывает Mini App для оформления заказа"""
        # Добавляем параметр v с текущим временем, чтобы обойти кэширование
        timestamp = int(time.time())
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("Открыть приложение", web_app=WebAppInfo(url=f"https://squazaryu.github.io/sumki-mini-app/?v={timestamp}"))
        ]])
        await update.message.reply_text(
            "Нажмите на кнопку ниже, чтобы открыть приложение для оформления заказа:",
            reply_markup=keyboard
        )

    async def handle_webapp_data(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обрабатывает данные, полученные из веб-приложения"""
        logging.info("!!!!!! ++++++ ВХОД В handle_webapp_data ++++++ !!!!!!")
        try:
            logging.info(f"!!!!!! handle_webapp_data: UPDATE: {repr(update)} !!!!!!")
            
            if update.effective_message and hasattr(update.effective_message, 'web_app_data') and update.effective_message.web_app_data:
                logging.info(f"!!!!!! handle_webapp_data: RAW DATA: >>>{update.effective_message.web_app_data.data}<<< !!!!!!")
                
                # Парсим JSON данные
                data = json.loads(update.effective_message.web_app_data.data)
                
                # Получаем информацию о пользователе
                user_info = data.get('user', {})
                user_name = user_info.get('name', 'Не указано')
                username = user_info.get('username', 'Не указано')
                phone = user_info.get('phone', 'Не указано')
                
                # Формируем сообщение о заказе
                order_message = "🛍 Новый заказ!\n\n"
                
                # Добавляем информацию о продукте
                if data.get('product') == 'bag':
                    order_message += f"Изделие: Сумка\n"
                    order_message += f"Размер: {data.get('size', 'Не указан')}\n"
                    order_message += f"Форма: {data.get('shape', 'Не указана')}\n"
                elif data.get('product') == 'coaster':
                    order_message += f"Изделие: Подстаканник\n"
                
                order_message += f"Материал: {data.get('material', 'Не указан')}\n"
                order_message += f"Цвет: {data.get('color', 'Не указан')}\n"
                
                # Добавляем дополнительные опции
                options = data.get('options', [])
                if options:
                    order_message += "Дополнительные опции:\n"
                    for option in options:
                        order_message += f"- {option}\n"
                order_message += "\n"
                
                # Добавляем контактную информацию
                order_message += "Контактная информация:\n"
                order_message += f"Имя: {user_name}\n"
                order_message += f"Username: @{username}\n"
                order_message += f"Телефон: {phone}\n"
                
                # Отправляем сообщение продавцу
                try:
                    await context.bot.send_message(
                        chat_id=SELLER_CHAT_ID,
                        text=order_message
                    )
                    logging.info(f"Заказ успешно отправлен продавцу")
                    
                    # Отправляем подтверждение пользователю
                    await context.bot.send_message(
                        chat_id=update.effective_user.id,
                        text="Спасибо за заказ! Мы свяжемся с вами в ближайшее время."
                    )
                    
                except Exception as e:
                    logging.error(f"Ошибка при отправке заказа: {e}")
                    await context.bot.send_message(
                        chat_id=update.effective_user.id,
                        text="Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже."
                    )
            else:
                logging.info("!!!!!! handle_webapp_data: НЕТ web_app_data в сообщении !!!!!!")
                
        except Exception as e:
            logging.error(f"!!!!!! handle_webapp_data: Ошибка: {e} !!!!!!")
            import traceback
            logging.error(f"!!!!!! handle_webapp_data: Трассировка: {traceback.format_exc()} !!!!!!")

    async def send_message_to_seller(self, order_text, user, context):
        """Отправка информации о заказе продавцу"""
        try:
            # ID продавца
            SELLER_CHAT_ID = "50122963"
            
            logging.info(f"Попытка отправки заказа продавцу в чат {SELLER_CHAT_ID}")
            logging.info(f"Текст заказа для отправки: {order_text}") # Логируем финальный текст
            
            # Сначала пробуем отправить простой текст без форматирования
            try:
                # --- Первый try для отправки --- 
                result = await context.bot.send_message(
                    chat_id=SELLER_CHAT_ID,
                    text=order_text
                )
                logging.info(f"Сообщение продавцу успешно отправлено без форматирования, message_id: {result.message_id}")
                return # Выходим при успехе
            except Exception as plain_error:
                # --- except для первого try --- 
                logging.error(f"❌ Ошибка отправки продавцу без форматирования: {plain_error}")
            
            # Если не удалось, пробуем с Markdown
            logging.info("Попытка отправки продавцу с MarkdownV2...")
            try:
                # --- Второй try для отправки --- 
                import re
                escaped_text = re.sub(r'([_*[\]()~`>#+=|{}.!-])', r'\\\1', order_text)
                
                result = await context.bot.send_message(
                    chat_id=SELLER_CHAT_ID,
                    text=escaped_text,
                    parse_mode="MarkdownV2"
                )
                logging.info(f"Сообщение продавцу успешно отправлено с MarkdownV2, message_id: {result.message_id}")
                return # Выходим при успехе
            except Exception as markdown_error:
                # --- except для второго try --- 
                logging.error(f"❌ Ошибка отправки продавцу с MarkdownV2: {markdown_error}")
                
                # Крайний случай - пробуем отправить только основную информацию
                logging.info("Попытка отправки базового уведомления продавцу...")
                try:
                    # --- Третий try для отправки --- 
                    basic_text = f"Новый заказ!\n\nОт: {user.first_name} {user.last_name or ''} (@{user.username or 'без username'})\n\nПожалуйста, проверьте логи."
                    await context.bot.send_message(
                        chat_id=SELLER_CHAT_ID,
                        text=basic_text
                    )
                    logging.info("Базовое уведомление продавцу успешно отправлено")
                except Exception as basic_error:
                    # --- except для третьего try --- 
                    logging.error(f"❌ Критическая ошибка! Невозможно отправить продавцу даже базовое уведомление: {basic_error}")

        except Exception as e:
            # --- Глобальный except для всей функции --- 
            logging.error(f"❌ Критическая ошибка ВНУТРИ send_message_to_seller: {str(e)}")
            import traceback
            logging.error(f"❌ Трассировка send_message_to_seller: {traceback.format_exc()}")

    def main(self):
        """Запуск бота"""
        try:
            logger.info("Начало инициализации бота...")
            application = Application.builder().token(BOT_TOKEN).build()
            
            # Регистрируем обработчики
            logger.debug("Регистрация обработчиков команд...")
            application.add_handler(CommandHandler("start", self.start))
            application.add_handler(CommandHandler("help", self.admin_help))
            application.add_handler(CommandHandler("orders", self.admin_orders))
            application.add_handler(CommandHandler("status", self.admin_order_status))
            application.add_handler(CommandHandler("note", self.admin_order_note))
            
            # Регистрируем обработчик для мини-приложения
            logger.debug("Регистрация обработчика мини-приложения...")
            application.add_handler(MessageHandler(filters.StatusUpdate.ALL, self.handle_webapp_data))
            
            # Регистрируем обработчик для запроса контакта
            logger.debug("Регистрация обработчика контактов...")
            application.add_handler(MessageHandler(filters.CONTACT, self.contact_handler))
            
            # Регистрируем обработчик для текстовых сообщений
            logger.debug("Регистрация обработчика текстовых сообщений...")
            application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_input))
            
            # Регистрируем обработчик ошибок
            logger.debug("Регистрация обработчика ошибок...")
            application.add_error_handler(self.error_handler)
            
            # Инициализируем базу данных
            logger.debug("Инициализация базы данных...")
            application.post_init = self.initialize_db
            
            logger.info("Бот успешно инициализирован, запуск polling...")
            application.run_polling(allowed_updates=Update.ALL_TYPES)
            
        except Exception as e:
            logger.error(f"Критическая ошибка при запуске бота: {e}", exc_info=True)
            raise

if __name__ == "__main__":
    bot = SumkiBot()
    # Вызов main() запускает все, включая асинхронную инициализацию и run_polling
    bot.main()