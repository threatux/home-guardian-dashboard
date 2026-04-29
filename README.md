# Smart Home Monitor — Frontend

Frontend для системы мониторинга умного дома. Работает с FastAPI backend локально.

## Установка

```bash
npm install
```

## Настройка

Файл `.env` уже создан с настройками по умолчанию:

```
VITE_API_URL=http://127.0.0.1:8000
```

Если backend запущен на другом порту — измените значение здесь.

## Запуск

1. Сначала запустите backend (FastAPI):

   ```bash
   uvicorn app.main:app --reload
   ```

   Backend будет доступен на http://127.0.0.1:8000

2. В отдельном терминале запустите frontend:

   ```bash
   npm run dev
   ```

   Frontend будет доступен на http://localhost:5173

3. Откройте http://localhost:5173, зарегистрируйтесь и войдите.

## Стек

- React + Vite + TypeScript
- TailwindCSS + shadcn/ui
- recharts (графики)
- lucide-react (иконки)
- react-router-dom (роутинг)
- sonner (toast-уведомления)

## Страницы

- `/login`, `/register` — авторизация
- `/dashboard` — текущее состояние датчиков, сводка, режим дома (автообновление 10с)
- `/charts` — графики истории (temperature / humidity / light_level / gas)
- `/alerts` — уведомления с фильтром «Все / Непрочитанные»
- `/devices` — управление устройствами
- `/simulate` — генерация новых показаний

## API

Все запросы идут через `apiFetch` из `src/lib/api.ts` на адрес из `VITE_API_URL`.
JWT-токен хранится в `localStorage` под ключом `token`. При ответе `401`
происходит автоматический выход и редирект на `/login`.
