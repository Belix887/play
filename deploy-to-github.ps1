# Скрипт для развертывания на GitHub
# Выполните этот скрипт после авторизации в GitHub CLI

Write-Host "🚀 Развертывание игры на GitHub..." -ForegroundColor Cyan

# Проверка авторизации
Write-Host "`nПроверка авторизации в GitHub..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Требуется авторизация в GitHub CLI" -ForegroundColor Red
    Write-Host "Выполните: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Авторизация успешна" -ForegroundColor Green

# Создание репозитория
Write-Host "`n📦 Создание репозитория на GitHub..." -ForegroundColor Yellow
gh repo create cybersecurity-game --public --description "Игра Киберзащита: Охранник для Telegram Mini App" --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Репозиторий успешно создан и код загружен!" -ForegroundColor Green
    
    # Получение URL репозитория
    $repoUrl = gh repo view --web 2>&1 | Select-String -Pattern "https://github.com/[^\s]+" | ForEach-Object { $_.Matches.Value }
    
    Write-Host "`n📋 Информация о репозитории:" -ForegroundColor Cyan
    Write-Host "URL: https://github.com/$((gh api user | ConvertFrom-Json).login)/cybersecurity-game" -ForegroundColor White
    
    Write-Host "`n💡 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Перейдите в Settings → Pages" -ForegroundColor White
    Write-Host "2. Выберите 'Deploy from a branch'" -ForegroundColor White
    Write-Host "3. Выберите ветку 'main' и папку '/ (root)'" -ForegroundColor White
    Write-Host "4. Ваша игра будет доступна по адресу: https://ваш-username.github.io/cybersecurity-game/" -ForegroundColor White
} else {
    Write-Host "`n❌ Ошибка при создании репозитория" -ForegroundColor Red
    Write-Host "Попробуйте создать репозиторий вручную через веб-интерфейс GitHub" -ForegroundColor Yellow
}

