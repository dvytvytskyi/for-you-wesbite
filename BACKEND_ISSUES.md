# Проблеми з API Key/Secret - Backend Issues

## Ситуація

Фронтенд відправляє правильні API ключі, але backend повертає 403 "Invalid API key or secret".

## Логи з фронтенду

### API Key/Secret, які відправляються:
- **API Key:** `ak_aa4d19418b385c370939b45365d0c687ddbdef7cbe9a72548748ef67f5e469e1`
- **API Secret:** `as_623caef2632983630ce11293e544504c834a9ab1015fa2c75a7c2583d6f28d7c`

### Формат ключів:
✅ API Key починається з `ak_` (правильно)
✅ API Secret починається з `as_` (правильно)
✅ Заголовки відправляються: `x-api-key` та `x-api-secret` (присутні)

### Помилки:
- `GET /api/properties?propertyType=secondary&sortBy=createdAt&sortOrder=DESC` → **403 Forbidden**
- `GET /api/public/data` → **403 Forbidden**
- Response: `{success: false, message: 'Invalid API key or secret', statusCode: 500}`

## Питання для Backend команди

### 1. Активність ключів в базі даних
- [ ] Чи існують ці API ключі в таблиці `api_keys` (або відповідній)?
- [ ] Чи є поле `is_active` або `status` для цих ключів? Яке значення?
- [ ] Чи є поле `expires_at`? Чи не прострочені ключі?
- [ ] Чи правильно збережені ключі в БД (без зайвих пробілів, правильний формат)?

### 2. Middleware `authenticateApiKeyWithSecret`
- [ ] Чи правильно працює функція `authenticateApiKeyWithSecret` в `middleware/auth.ts`?
- [ ] Чи перевіряє вона обидва заголовки `x-api-key` та `x-api-secret`?
- [ ] Чи правильно порівнюються ключі (case-sensitive, trim пробілів)?
- [ ] Чи є логування в middleware? Які помилки там?

### 3. Конфігурація ендпоінтів
- [ ] Чи підключений `authenticateApiKeyWithSecret` до `/api/properties`?
- [ ] Чи підключений `authenticateApiKeyWithSecret` до `/api/public/data`?
- [ ] Чи правильно обробляється `propertyType=secondary` в `/api/properties`?

### 4. Логування на backend
- [ ] Чи є логи в `authenticateApiKeyWithSecret`? Які значення приходять?
- [ ] Чи є логи в routes для `/api/properties` та `/api/public/data`?
- [ ] Які помилки з'являються в логах backend при отриманні запитів?

### 5. Формат ключів
- [ ] Який формат ключів очікується на backend?
- [ ] Чи треба якісь додаткові перетворення (наприклад, hash, encoding)?

### 6. Тестування
- [ ] Чи працює curl запит з цими ключами?
```bash
curl -H "x-api-key: ak_aa4d19418b385c370939b45365d0c687ddbdef7cbe9a72548748ef67f5e469e1" \
     -H "x-api-secret: as_623caef2632983630ce11293e544504c834a9ab1015fa2c75a7c2583d6f28d7c" \
     https://admin.foryou-realestate.com/api/public/data
```

## Очікувана поведінка

1. Запит до `/api/properties?propertyType=secondary` має повертати secondary properties
2. Запит до `/api/public/data` має повертати всі дані (включно з secondary properties)
3. Обидва запити мають працювати з наданими API Key/Secret

## Приклад запиту з фронтенду

```javascript
// Headers, які відправляються:
{
  'Content-Type': 'application/json',
  'x-api-key': 'ak_aa4d19418b385c370939b45365d0c687ddbdef7cbe9a72548748ef67f5e469e1',
  'x-api-secret': 'as_623caef2632983630ce11293e544504c834a9ab1015fa2c75a7c2583d6f28d7c'
}
```

## Додаткова інформація

- URL: `https://admin.foryou-realestate.com/api`
- Статус помилки: `403 Forbidden`
- Повідомлення помилки: `Invalid API key or secret`
- Status Code в response: `500` (можливо помилка в обробці)

