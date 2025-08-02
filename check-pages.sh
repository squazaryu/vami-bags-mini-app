#!/bin/bash

echo "🔍 Проверяем статус GitHub Pages..."

# Проверяем, есть ли ветка gh-pages
if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
    echo "✅ Ветка gh-pages существует"
else
    echo "❌ Ветка gh-pages не найдена"
fi

# Проверяем содержимое ветки gh-pages
echo "📁 Содержимое ветки gh-pages:"
git checkout gh-pages 2>/dev/null && ls -la | head -10

# Возвращаемся в main
git checkout main 2>/dev/null

echo ""
echo "🌐 Проверьте следующие ссылки:"
echo "1. GitHub Actions: https://github.com/squazaryu/vami-bags-mini-app/actions"
echo "2. Настройки Pages: https://github.com/squazaryu/vami-bags-mini-app/settings/pages"
echo "3. Прямая ссылка: https://squazaryu.github.io/vami-bags-mini-app/"
echo ""
echo "📋 Инструкции:"
echo "1. Перейдите в Actions и проверьте статус workflow 'Deploy to GitHub Pages'"
echo "2. Если нужно, запустите workflow 'Setup GitHub Pages' вручную"
echo "3. В настройках репозитория найдите раздел 'Pages' и выберите 'GitHub Actions'" 