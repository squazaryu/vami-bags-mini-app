import os
from server import app

if __name__ == '__main__':
    # Получаем порт из переменных окружения Render
    port = int(os.environ.get('PORT', 8000))
    
    # Запускаем приложение
    app.run(host='0.0.0.0', port=port) 