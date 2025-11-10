# Вимоги до бекенду для пагінації Properties

## Endpoint: `/api/properties`

### Параметри запиту (Query Parameters)

| Параметр | Тип | Обов'язковий | Опис | Приклад |
|----------|-----|--------------|------|---------|
| `propertyType` | string | Ні | Тип нерухомості: `off-plan` або `secondary` | `propertyType=secondary` |
| `page` | number | Ні | Номер сторінки (починається з 1) | `page=1` |
| `limit` | number | Ні | Кількість items на сторінку (за замовчуванням 36) | `limit=36` |
| `sortBy` | string | Ні | Поле для сортування: `createdAt`, `name`, `price`, `priceFrom`, `size`, `sizeFrom` | `sortBy=createdAt` |
| `sortOrder` | string | Ні | Напрямок сортування: `ASC` або `DESC` | `sortOrder=DESC` |
| `developerId` | string (UUID) | Ні | Фільтр по developer | `developerId=uuid` |
| `cityId` | string (UUID) | Ні | Фільтр по місту | `cityId=uuid` |
| `areaId` | string (UUID) | Ні | Фільтр по району | `areaId=uuid` |
| `bedrooms` | string | Ні | Фільтр по кількості спалень (через кому) | `bedrooms=1,2,3` |
| `sizeFrom` | number | Ні | Мінімальна площа (м²) | `sizeFrom=50` |
| `sizeTo` | number | Ні | Максимальна площа (м²) | `sizeTo=200` |
| `priceFrom` | number | Ні | Мінімальна ціна (USD) | `priceFrom=100000` |
| `priceTo` | number | Ні | Максимальна ціна (USD) | `priceTo=500000` |
| `search` | string | Ні | Пошук по назві/опису | `search=apartment` |

### Формат відповіді

**Обов'язкова структура:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "propertyType": "secondary",
        "name": "Property Name",
        "description": "Description",
        "photos": ["url1", "url2"],
        "price": 100000,
        "priceAED": 367000,
        "size": 85,
        "sizeSqft": 915,
        "bedrooms": 2,
        "bathrooms": 2,
        "area": {
          "id": "uuid",
          "nameEn": "Area Name",
          "nameRu": "Название района",
          "nameAr": "اسم المنطقة"
        },
        "city": {
          "id": "uuid",
          "nameEn": "Dubai"
        },
        "developer": {
          "id": "uuid",
          "name": "Developer Name"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 26000,
    "page": 1,
    "limit": 36
  }
}
```

### Критично важливі поля

#### 1. `total` (ОБОВ'ЯЗКОВО)
- **Тип:** `number`
- **Опис:** Загальна кількість ВСІХ properties, що відповідають фільтрам (не тільки завантажених на цій сторінці)
- **Приклад:** Якщо є 26,000 secondary properties, але завантажено тільки 36 на сторінці 1, `total` має бути `26000`, а не `36`

**❌ НЕПРАВИЛЬНО:**
```json
{
  "data": {
    "data": [...36 properties...],
    "total": 36  // ❌ Це кількість завантажених, а не загальна
  }
}
```

**✅ ПРАВИЛЬНО:**
```json
{
  "data": {
    "data": [...36 properties...],
    "total": 26000  // ✅ Загальна кількість всіх properties
  }
}
```

#### 2. `page` (рекомендовано)
- **Тип:** `number`
- **Опис:** Номер поточної сторінки
- **Приклад:** `1`, `2`, `3`

#### 3. `limit` (рекомендовано)
- **Тип:** `number`
- **Опис:** Кількість items на сторінці
- **Приклад:** `36`, `100`

### Приклади запитів

#### 1. Отримати першу сторінку secondary properties (36 items)
```
GET /api/properties?propertyType=secondary&page=1&limit=36&sortBy=createdAt&sortOrder=DESC
```

**Очікувана відповідь:**
```json
{
  "success": true,
  "data": {
    "data": [...36 properties...],
    "total": 26000,
    "page": 1,
    "limit": 36
  }
}
```

#### 2. Отримати другу сторінку (items 37-72)
```
GET /api/properties?propertyType=secondary&page=2&limit=36&sortBy=createdAt&sortOrder=DESC
```

**Очікувана відповідь:**
```json
{
  "success": true,
  "data": {
    "data": [...36 properties (items 37-72)...],
    "total": 26000,
    "page": 2,
    "limit": 36
  }
}
```

#### 3. Отримати з фільтрами
```
GET /api/properties?propertyType=secondary&cityId=uuid&bedrooms=2&page=1&limit=36
```

**Очікувана відповідь:**
```json
{
  "success": true,
  "data": {
    "data": [...properties matching filters...],
    "total": 1500,  // Загальна кількість properties, що відповідають фільтрам
    "page": 1,
    "limit": 36
  }
}
```

### Логіка пагінації

1. **Обчислення offset:**
   ```
   offset = (page - 1) * limit
   ```

2. **SQL запит (приклад):**
   ```sql
   SELECT * FROM properties 
   WHERE property_type = 'secondary'
   ORDER BY created_at DESC
   LIMIT 36 OFFSET 0  -- для page=1
   LIMIT 36 OFFSET 36 -- для page=2
   LIMIT 36 OFFSET 72 -- для page=3
   ```

3. **Підрахунок total:**
   ```sql
   SELECT COUNT(*) FROM properties 
   WHERE property_type = 'secondary'
   -- (з урахуванням всіх фільтрів)
   ```

### Важливі моменти

1. **`total` має враховувати ВСІ фільтри:**
   - Якщо запит: `propertyType=secondary&cityId=uuid`
   - То `total` = кількість secondary properties в цьому місті
   - НЕ загальна кількість всіх secondary properties

2. **Сортування:**
   - Має застосовуватися ДО пагінації
   - Тобто спочатку сортуємо всі results, потім беремо потрібну сторінку

3. **Обмеження `limit`:**
   - Рекомендований максимум: 100 items за запит
   - Фронтенд за замовчуванням запитує `limit=100` для першого завантаження
   - Потім робить клієнтську пагінацію по 36 items на сторінку

### Перевірка

Після реалізації перевірте:

```bash
# Тест 1: Перевірка total
curl -X GET "https://admin.foryou-realestate.com/api/properties?propertyType=secondary&page=1&limit=36" \
  -H "X-Api-Key: your-key" \
  -H "X-Api-Secret: your-secret" | jq '.data.total'

# Має повернути загальну кількість (наприклад, 26000), а не 36

# Тест 2: Перевірка пагінації
curl -X GET "https://admin.foryou-realestate.com/api/properties?propertyType=secondary&page=1&limit=36" \
  -H "X-Api-Key: your-key" \
  -H "X-Api-Secret: your-secret" | jq '.data.data | length'

# Має повернути 36

curl -X GET "https://admin.foryou-realestate.com/api/properties?propertyType=secondary&page=2&limit=36" \
  -H "X-Api-Key: your-key" \
  -H "X-Api-Secret: your-secret" | jq '.data.data[0].id'

# Має повернути ID першого property з другої сторінки (не той самий, що на першій)
```

### Підсумок

**Найголовніше:**
- ✅ `total` має бути загальною кількістю ВСІХ properties (з урахуванням фільтрів), а не кількістю завантажених
- ✅ `page` і `limit` мають правильно працювати для серверної пагінації
- ✅ Сортування має застосовуватися ДО пагінації

Якщо все це працює, фронтенд автоматично покаже правильну кількість сторінок для 26К+ проектів.
