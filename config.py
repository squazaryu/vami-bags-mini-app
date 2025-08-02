import os
from dotenv import load_dotenv

load_dotenv()

# Bot configuration
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = "https://squazaryu.github.io/vami-bags-mini-app/"

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'bot.db')

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'bot.log') 