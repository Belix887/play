# Инструкция по созданию репозитория на GitHub

## Вариант 1: Через веб-интерфейс GitHub (рекомендуется)

1. Откройте https://github.com и войдите в свой аккаунт
2. Нажмите кнопку "+" в правом верхнем углу → "New repository"
3. Заполните форму:
   - **Repository name**: `cybersecurity-game` (или любое другое имя)
   - **Description**: "Игра Киберзащита: Охранник для Telegram Mini App"
   - **Visibility**: Public (или Private, если хотите)
   - **НЕ** создавайте README, .gitignore или лицензию (они уже есть)
4. Нажмите "Create repository"
5. Скопируйте URL репозитория (например: `https://github.com/ваш-username/cybersecurity-game.git`)

## Вариант 2: Через GitHub CLI

Если вы авторизованы в GitHub CLI, выполните:

```bash
gh repo create cybersecurity-game --public --source=. --remote=origin --push
```

## После создания репозитория

Выполните следующие команды в терминале (замените URL на ваш):

```bash
git remote add origin https://github.com/ваш-username/cybersecurity-game.git
git branch -M main
git push -u origin main
```

## Настройка GitHub Pages (опционально)

После создания репозитория:

1. Перейдите в Settings → Pages
2. В разделе "Source" выберите "Deploy from a branch"
3. Выберите ветку `main` и папку `/ (root)`
4. Нажмите "Save"
5. Ваша игра будет доступна по адресу: `https://ваш-username.github.io/cybersecurity-game/`

Этот URL можно использовать для Telegram Mini App!

