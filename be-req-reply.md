# 📚 Документація API Admin Panel

## 🔗 Базові параметри

- **Базовий URL API:** `https://admin.foryou-realestate.com/api`
- **Технологія бекенду:** Express.js 5.1 • Node.js • TypeScript • TypeORM • PostgreSQL
- **Версія API:** 1.0.0

---

## 📡 Існуючі endpoints

### ✅ GET /api/public/data

**Опис:** Отримати всі публічні дані одним запитом (properties, countries, cities, areas, developers, facilities).

**Автентифікація:** API Key (X-API-Key + X-API-Secret)

**Headers:**
```
X-API-Key: your_api_key
X-API-Secret: your_api_secret
```

**Структура відповіді:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid",
        "propertyType": "off-plan" | "secondary",
        "name": "string",
        "description": "string",
        "photos": ["string (URLs)"],
        "country": {
          "id": "uuid",
          "nameEn": "string",
          "nameRu": "string",
          "nameAr": "string",
          "code": "string"
        },
        "city": {
          "id": "uuid",
          "nameEn": "string",
          "nameRu": "string",
          "nameAr": "string",
          "countryId": "uuid",
          "country": { /* country object */ }
        },
        "area": {
          "id": "uuid",
          "nameEn": "string",
          "nameRu": "string",
          "nameAr": "string",
          "cityId": "uuid",
          "city": { /* city object with country */ }
        },
        "developer": {
          "id": "uuid",
          "name": "string",
          "logo": "string (URL)",
          "description": "string"
        },
        "facilities": [
          {
            "id": "uuid",
            "nameEn": "string",
            "nameRu": "string",
            "nameAr": "string",
            "iconName": "string"
          }
        ],
        "units": [
          {
            "id": "uuid",
            "unitId": "string",
            "type": "apartment" | "villa" | "penthouse" | "townhouse" | "office",
            "price": "number (USD)",
            "priceAED": "number",
            "totalSize": "number (sqm)",
            "totalSizeSqft": "number",
            "balconySize": "number (sqm)",
            "balconySizeSqft": "number",
            "planImage": "string (URL)"
          }
        ],
        // Off-Plan fields
        "priceFrom": "number (USD)",
        "priceFromAED": "number",
        "bedroomsFrom": "number",
        "bedroomsTo": "number",
        "bathroomsFrom": "number",
        "bathroomsTo": "number",
        "sizeFrom": "number (sqm)",
        "sizeFromSqft": "number",
        "sizeTo": "number (sqm)",
        "sizeToSqft": "number",
        "paymentPlan": "string",
        // Secondary fields
        "price": "number (USD)",
        "priceAED": "number",
        "bedrooms": "number",
        "bathrooms": "number",
        "size": "number (sqm)",
        "sizeSqft": "number",
        // Common fields
        "latitude": "number",
        "longitude": "number",
        "createdAt": "ISO 8601 date",
        "updatedAt": "ISO 8601 date"
      }
    ],
    "countries": [
      {
        "id": "uuid",
        "nameEn": "string",
        "nameRu": "string",
        "nameAr": "string",
        "code": "string"
      }
    ],
    "cities": [
      {
        "id": "uuid",
        "nameEn": "string",
        "nameRu": "string",
        "nameAr": "string",
        "countryId": "uuid",
        "country": { /* country object */ }
      }
    ],
    "areas": [
      {
        "id": "uuid",
        "nameEn": "string",
        "nameRu": "string",
        "nameAr": "string",
        "cityId": "uuid",
        "city": { /* city object with country */ }
      }
    ],
    "developers": [
      {
        "id": "uuid",
        "name": "string",
        "logo": "string (URL)",
        "description": "string",
        "createdAt": "ISO 8601 date"
      }
    ],
    "facilities": [
      {
        "id": "uuid",
        "nameEn": "string",
        "nameRu": "string",
        "nameAr": "string",
        "iconName": "string",
        "createdAt": "ISO 8601 date"
      }
    ]
  }
}
```

**Примітки:**
- Всі ціни автоматично конвертуються в AED (курс: 1 USD = 3.67 AED)
- Всі розміри автоматично конвертуються в sqft (1 sqm = 10.764 sqft)
- Properties повертаються з усіма зв'язаними даними (country, city, area, developer, facilities, units)

---

### ✅ GET /api/news

**Опис:** Отримати список всіх новин/блогу.

**Автентифікація:** JWT Token або API Key

**Headers (JWT):**
```
Authorization: Bearer <your_jwt_token>
```

**Headers (API Key):**
```
X-API-Key: your_api_key
```

**Структура відповіді:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "string (URL)",
      "isPublished": "boolean",
      "publishedAt": "ISO 8601 date | null",
      "contents": [
        {
          "id": "uuid",
          "language": "en" | "ru" | "ar",
          "title": "string",
          "content": "string"
        }
      ],
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ]
}
```

**Endpoint для однієї новини:**
- **GET /api/news/:id** - отримати деталі однієї новини

---

### ✅ GET /api/properties

**Опис:** Отримати список нерухомості з опціональною фільтрацією.

**Автентифікація:** JWT Token або API Key

**Query Parameters:**
- `propertyType` (string, optional): `"off-plan"` або `"secondary"`
- `developerId` (uuid, optional): ID девелопера для фільтрації
- `cityId` (uuid, optional): ID міста для фільтрації

**Приклад запиту:**
```
GET /api/properties?propertyType=off-plan&developerId=123e4567-e89b-12d3-a456-426614174000
```

**Структура відповіді:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyType": "off-plan" | "secondary",
      "name": "string",
      "photos": ["string (URLs)"],
      "country": { /* full country object */ },
      "city": { /* full city object */ },
      "area": { /* full area object */ },
      "developer": { /* full developer object */ },
      "facilities": [ /* array of facility objects */ ],
      "units": [ /* array of unit objects */ ],
      // ... всі поля як в /api/public/data
      "priceFromAED": "number (auto-calculated)",
      "priceAED": "number (auto-calculated)",
      "sizeFromSqft": "number (auto-calculated)",
      "sizeToSqft": "number (auto-calculated)",
      "sizeSqft": "number (auto-calculated)"
    }
  ]
}
```

**Примітки:**
- Всі ціни автоматично конвертуються в AED
- Всі розміри автоматично конвертуються в sqft
- Повертаються всі зв'язані дані (country, city, area, developer, facilities, units)

---

### ✅ GET /api/properties/:id

**Опис:** Отримати деталі конкретної нерухомості.

**Автентифікація:** JWT Token або API Key

**Структура відповіді:**
```json
{
  "success": true,
  "data": {
    // Повна структура Property object з усіма зв'язаними даними
    // Така сама як елемент в масиві /api/properties
  }
}
```

---

### ✅ GET /api/courses

**Опис:** Отримати список курсів (Knowledge Base) для Broker Dashboard.

**Автентифікація:** JWT Token або API Key

**Структура відповіді:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "order": "number",
      "contents": [
        {
          "id": "uuid",
          "language": "en" | "ru" | "ar",
          "title": "string",
          "content": "string"
        }
      ],
      "links": [
        {
          "id": "uuid",
          "title": "string",
          "url": "string",
          "description": "string"
        }
      ],
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ]
}
```

**Endpoint для одного курсу:**
- **GET /api/courses/:id** - отримати деталі одного курсу

---

## 📊 Структури даних

### Property Object (повна структура)

```typescript
{
  id: string (UUID),
  propertyType: "off-plan" | "secondary",
  name: string,
  photos: string[] (масив URL фото),
  description: string,
  
  // Location
  countryId: string (UUID),
  country: {
    id: string (UUID),
    nameEn: string,
    nameRu: string,
    nameAr: string,
    code: string
  },
  cityId: string (UUID),
  city: {
    id: string (UUID),
    nameEn: string,
    nameRu: string,
    nameAr: string,
    countryId: string (UUID),
    country: { /* country object */ }
  },
  areaId: string (UUID),
  area: {
    id: string (UUID),
    nameEn: string,
    nameRu: string,
    nameAr: string,
    cityId: string (UUID),
    city: { /* city object */ }
  },
  latitude: number (decimal 10,8),
  longitude: number (decimal 11,8),
  
  // Developer
  developerId: string (UUID) | null,
  developer: {
    id: string (UUID),
    name: string,
    logo: string (URL) | null,
    description: string | null,
    createdAt: ISO 8601 date
  } | null,
  
  // Facilities
  facilities: [
    {
      id: string (UUID),
      nameEn: string,
      nameRu: string,
      nameAr: string,
      iconName: string,
      createdAt: ISO 8601 date
    }
  ],
  
  // Units (для off-plan)
  units: [
    {
      id: string (UUID),
      unitId: string,
      type: "apartment" | "villa" | "penthouse" | "townhouse" | "office",
      price: number (USD) | null,
      priceAED: number | null (auto-calculated),
      totalSize: number (sqm) | null,
      totalSizeSqft: number | null (auto-calculated),
      balconySize: number (sqm) | null,
      balconySizeSqft: number | null (auto-calculated),
      planImage: string (URL) | null
    }
  ],
  
  // Off-Plan fields
  priceFrom: number (USD) | null,
  priceFromAED: number | null (auto-calculated),
  bedroomsFrom: number | null,
  bedroomsTo: number | null,
  bathroomsFrom: number | null,
  bathroomsTo: number | null,
  sizeFrom: number (sqm) | null,
  sizeFromSqft: number | null (auto-calculated),
  sizeTo: number (sqm) | null,
  sizeToSqft: number | null (auto-calculated),
  paymentPlan: string | null,
  
  // Secondary fields
  price: number (USD) | null,
  priceAED: number | null (auto-calculated),
  bedrooms: number | null,
  bathrooms: number | null,
  size: number (sqm) | null,
  sizeSqft: number | null (auto-calculated),
  
  // Timestamps
  createdAt: ISO 8601 date,
  updatedAt: ISO 8601 date
}
```

### Area Object (оновлена структура)

```typescript
{
  id: string (UUID),
  cityId: string (UUID),
  city: {
    id: string (UUID),
    nameEn: string,
    nameRu: string,
    nameAr: string,
    countryId: string (UUID),
    country: { /* country object */ }
  },
  nameEn: string,
  nameRu: string,
  nameAr: string,
  description: string | null, // ✅ Додано
  images: string[] | null // ✅ Додано (масив URL фото)
}
```

**✅ Реалізовані розширення:**
- ✅ Поле `description` (текст)
- ✅ Поле `images` (масив URL фото)
- ⚠️ Можливі додаткові поля: `coordinates` (lat/lng), `amenities`, `overview`

### Developer Object (оновлена структура)

```typescript
{
  id: string (UUID),
  name: string (unique),
  logo: string (URL) | null,
  description: string | null,
  images: string[] | null, // ✅ Додано (масив URL фото)
  createdAt: ISO 8601 date
}
```

**✅ Реалізовані поля:**
- ✅ `logo` - зберігається як URL (рядок)
- ✅ `description` - текст
- ✅ `images` - масив URL фото для галереї

**⚠️ Можливі додаткові поля:**
- `website`, `contactEmail`, `phone`, `address`

### News/Blog Post Object

```typescript
{
  id: string (UUID),
  title: string,
  description: string,
  imageUrl: string (URL) | null,
  isPublished: boolean,
  publishedAt: ISO 8601 date | null,
  contents: [
    {
      id: string (UUID),
      language: "en" | "ru" | "ar",
      title: string,
      content: string
    }
  ],
  createdAt: ISO 8601 date,
  updatedAt: ISO 8601 date
}
```

---

## 🔐 Автентифікація та користувачі

### Аутентифікація

#### ✅ POST /api/auth/login

**Опис:** Вхід користувача (наразі тільки для адміна через env змінні).

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "token": "string (JWT token)"
  },
  "message": "Login successful"
}
```

**Примітки:**
- Наразі підтримується тільки вход через `ADMIN_EMAIL` та `ADMIN_PASSWORD` з env
- Токен зберігається на 7 днів

#### ✅ POST /api/auth/register

**Опис:** Реєстрація нового користувача (Investor/Broker).

**Body:**
```json
{
  "email": "string",
  "phone": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "CLIENT" | "BROKER" | "INVESTOR" | "ADMIN",
  "licenseNumber": "string (required if role=BROKER)"
}
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "phone": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "CLIENT" | "BROKER" | "INVESTOR" | "ADMIN",
      "status": "PENDING" | "ACTIVE" | "BLOCKED" | "REJECTED",
      "licenseNumber": "string | null",
      "googleId": "string | null",
      "appleId": "string | null",
      "avatar": "string | null",
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    },
    "accessToken": "string (JWT token)"
  },
  "message": "User created successfully"
}
```

**Примітки:**
- Для BROKER обов'язкове поле `licenseNumber`
- Користувачі створюються зі статусом `PENDING` (крім CLIENT - `ACTIVE`)
- Токен зберігається на 7 днів

#### ❌ POST /api/auth/logout

**Статус:** Не реалізовано

**Примітки:**
- Наразі логінізація виконується через видалення токена на клієнті
- JWT токени stateless, тому немає необхідності в logout endpoint на сервері

#### ✅ GET /api/auth/me

**Опис:** Отримати інформацію про поточного авторизованого користувача.

**Автентифікація:** JWT Token

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Відповідь:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "phone": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "CLIENT" | "BROKER" | "INVESTOR" | "ADMIN",
    "status": "PENDING" | "ACTIVE" | "BLOCKED" | "REJECTED",
    "licenseNumber": "string | null",
    "avatar": "string (URL) | null",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

### Зберігання токенів

- **Метод:** JWT токени в headers
- **Header формат:** `Authorization: Bearer <token>`
- **Місце зберігання на клієнті:** localStorage (фронтенд використовує `localStorage.getItem('token')`)
- **Термін дії:** 7 днів (`expiresIn: '7d'`)

### Refresh Token

**Статус:** ❌ Не підтримується

**Примітки:**
- Наразі використовується тільки access token з терміном дії 7 днів
- При закінченні терміну дії потрібно виконати новий login

### Ролі користувачів

**Існуючі ролі:**
- `CLIENT` - звичайний клієнт
- `BROKER` - брокер (потребує licenseNumber)
- `INVESTOR` - інвестор
- `ADMIN` - адміністратор

**Enum визначення:**
```typescript
export enum UserRole {
  CLIENT = 'CLIENT',
  BROKER = 'BROKER',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}
```

### User Model (повна структура)

```typescript
{
  id: string (UUID),
  email: string (unique),
  phone: string (unique),
  passwordHash: string (bcrypt hash, не повертається в API),
  firstName: string,
  lastName: string,
  role: "CLIENT" | "BROKER" | "INVESTOR" | "ADMIN",
  status: "PENDING" | "ACTIVE" | "BLOCKED" | "REJECTED",
  licenseNumber: string | null (required for BROKER),
  googleId: string | null,
  appleId: string | null,
  avatar: string (URL) | null,
  createdAt: ISO 8601 date,
  updatedAt: ISO 8601 date
}
```

**Поля для Investor:**
- Всі стандартні поля User
- Додаткових спеціальних полів для Investor немає

**Поля для Broker:**
- Всі стандартні поля User
- Обов'язкове поле `licenseNumber` (номер ліцензії)

---

## 📱 Синхронізація з мобільним додатком

### Collections (для Broker)

**Статус:** ✅ Endpoints реалізовані

**Endpoints:**
- ✅ GET /api/collections - список колекцій користувача
- ✅ POST /api/collections - створити колекцію
- ✅ PUT /api/collections/:id - оновити колекцію
- ✅ DELETE /api/collections/:id - видалити колекцію
- ✅ POST /api/collections/:id/properties - додати нерухомість
- ✅ DELETE /api/collections/:id/properties/:propertyId - видалити нерухомість

**Автентифікація:** JWT Token

#### GET /api/collections
Отримати всі колекції поточного користувача.

**Відповідь:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "string",
      "description": "string | null",
      "properties": [ /* масив Property objects */ ],
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ]
}
```

#### POST /api/collections
Створити нову колекцію.

**Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

#### PUT /api/collections/:id
Оновити колекцію.

**Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

#### POST /api/collections/:id/properties
Додати нерухомість до колекції.

**Body:**
```json
{
  "propertyId": "uuid (required)"
}
```

**Структура Collection:**
```typescript
{
  id: string (UUID),
  userId: string (UUID),
  name: string,
  description: string | null,
  properties: Property[],
  createdAt: ISO 8601 date,
  updatedAt: ISO 8601 date
}
```

### Liked Properties (Favorites)

**Статус:** ✅ Endpoints реалізовані

**Endpoints:**
- ✅ GET /api/favorites - список улюблених
- ✅ POST /api/favorites/:propertyId - додати в улюблені
- ✅ DELETE /api/favorites/:propertyId - видалити з улюблених

**Автентифікація:** JWT Token

#### GET /api/favorites
Отримати всі улюблені нерухомості поточного користувача.

**Відповідь:**
```json
{
  "success": true,
  "data": [
    /* масив Property objects з усіма зв'язаними даними */
  ]
}
```

#### POST /api/favorites/:propertyId
Додати нерухомість в улюблені.

**Відповідь:**
```json
{
  "success": true,
  "data": { /* Property object */ }
}
```

#### DELETE /api/favorites/:propertyId
Видалити нерухомість з улюблених.

**Відповідь:**
```json
{
  "success": true,
  "message": "Favorite removed"
}
```

**Структура Favorite (внутрішня):**
```typescript
{
  id: string (UUID),
  userId: string (UUID),
  propertyId: string (UUID),
  property: Property (relation),
  createdAt: ISO 8601 date
}
```

**Примітки:**
- Користувач може додати property тільки один раз (unique constraint на user_id + property_id)
- GET повертає масив Property objects, а не Favorite objects

### Investments (для Investor)

**Статус:** ✅ Endpoints реалізовані

**Endpoints:**
- ✅ GET /api/investments - список інвестованої нерухомості
- ✅ POST /api/investments - додати інвестицію
- ✅ GET /api/investments/:id - деталі інвестиції

**Автентифікація:** JWT Token (тільки для INVESTOR та ADMIN ролі)

#### GET /api/investments
Отримати всі інвестиції поточного користувача (тільки для Investor).

**Відповідь:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "propertyId": "uuid",
      "property": { /* Property object */ },
      "amount": "number (USD)",
      "status": "pending" | "confirmed" | "completed" | "cancelled",
      "date": "ISO 8601 date",
      "notes": "string | null",
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ]
}
```

#### POST /api/investments
Створити нову інвестицію (тільки для Investor).

**Body:**
```json
{
  "propertyId": "uuid (required)",
  "amount": "number (required, USD)",
  "status": "pending" | "confirmed" | "completed" | "cancelled (optional, default: pending)",
  "date": "ISO 8601 date (required)",
  "notes": "string (optional)"
}
```

#### GET /api/investments/:id
Отримати деталі конкретної інвестиції.

**Відповідь:**
```json
{
  "success": true,
  "data": {
    /* Investment object з property та всіма зв'язаними даними */
  }
}
```

**Структура Investment:**
```typescript
{
  id: string (UUID),
  userId: string (UUID),
  propertyId: string (UUID),
  property: Property (relation),
  amount: number (USD),
  status: "pending" | "confirmed" | "completed" | "cancelled",
  date: ISO 8601 date,
  notes: string | null,
  createdAt: ISO 8601 date,
  updatedAt: ISO 8601 date
}
```

---

## 🔄 Розширення даних

### Areas (Райони) - рекомендації

**Поточні поля:**
- `id`, `cityId`, `nameEn`, `nameRu`, `nameAr`

**Потрібно додати:**
- ✅ `description` (EN/RU тексти) - **поки відсутнє**
- ✅ `images` (масив фото для галереї) - **поки відсутнє**
- ⚠️ Додаткові поля (опціонально): `coordinates` (lat/lng), `amenities`, `overview`

### Developers (Девелопери) - рекомендації

**Поточні поля:**
- `id`, `name`, `logo`, `description`, `createdAt`

**✅ Вже існують:**
- `logo` - зберігається як URL (рядок)
- `description` - вже існує

**Потрібно додати:**
- ✅ `images` (масив фото для галереї) - **поки відсутнє**
- ⚠️ Додаткові поля (опціонально): `website`, `contactEmail`, `phone`, `address`

---

## 🌍 Інтеграція з адмінкою

### Синхронізація даних

**Метод:** ❓ Не реалізовано

**Поточний стан:**
- Real-time (WebSocket) - ❌ Не використовується
- Polling (перевірка змін періодично) - ✅ Можна використовувати на клієнті
- Webhook (відправка подій при змінах) - ❌ Не реалізовано

**Рекомендації:**
- Для мобільного додатку можна використовувати polling (перевірка `/api/public/data` кожні N хвилин)
- Для веб-сайту можна використовувати polling або додати WebSocket для real-time оновлень

**Події для синхронізації:**
- Properties created/updated/deleted
- Areas created/updated/deleted
- Developers created/updated/deleted
- News created/updated/deleted

### Доступ до даних

**Rate Limiting:** ❌ Не налаштовано

**Обмеження по запитам:** Наразі немає обмежень

**Кешування на бекенді:** ❌ Не використовується

**Рекомендації:**
- Додати rate limiting (наприклад, 100 запитів/хвилину на API key)
- Додати кешування для `/api/public/data` (оновлювати раз на хвилину)
- Додати Redis для кешування

---

## 🗄️ База даних

### Загальні питання

**База даних:** PostgreSQL 15

**ORM:** TypeORM

**Схема БД:** Можна отримати через TypeORM entities в `admin-panel-backend/src/entities/`

### Основні таблиці та зв'язки

**Зв'язки між таблицями:**

```
properties
  ├─ countryId → countries (id)
  ├─ cityId → cities (id)
  ├─ areaId → areas (id)
  ├─ developerId → developers (id)
  ├─ facilities (many-to-many через join table)
  └─ units (one-to-many)

areas
  └─ cityId → cities (id)

cities
  └─ countryId → countries (id)

news
  └─ contents (one-to-many)

courses
  ├─ contents (one-to-many)
  └─ links (one-to-many)

users
  └─ (наразі немає зв'язків з іншими таблицями)
```

**Основні таблиці:**
- `properties` - нерухомість
- `property_units` - юніти (квартири/вілли) для off-plan
- `countries` - країни
- `cities` - міста
- `areas` - райони
- `developers` - девелопери
- `facilities` - зручності/аменіті
- `news` - новини/блог
- `news_contents` - контент новин (мультимовний)
- `courses` - курси (Knowledge Base)
- `course_contents` - контент курсів (мультимовний)
- `course_links` - посилання в курсах
- `users` - користувачі
- `api_keys` - API ключі для інтеграцій

---

## 🔒 Безпека

### API Security

**HTTPS:** ✅ Використовується (через Nginx з SSL)

**CORS налаштування:**
```javascript
app.use(cors()); // Дозволено всі домени (необхідно обмежити для production)
```

**Поточні налаштування:**
- CORS дозволяє всі домени (`*`)
- Для production потрібно обмежити дозволені домени

**Рекомендовані налаштування CORS:**
```javascript
app.use(cors({
  origin: ['https://your-website.com', 'https://your-mobile-app.com'],
  credentials: true
}));
```

**Додаткові headers для запитів:**
- **JWT автентифікація:** `Authorization: Bearer <token>`
- **API Key автентифікація:** `X-API-Key: <key>` та `X-API-Secret: <secret>`

### Environment Variables

**Необхідні змінні оточення:**

**Backend:**
```env
DATABASE_URL=postgresql://admin:password@host:5432/admin_panel
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
ADMIN_JWT_SECRET=your-secret-jwt-key-minimum-32-chars
NODE_ENV=production
PORT=4000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (для клієнта):**
```env
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
```

---

## 📝 Додаткова інформація

### Документація

**Swagger/OpenAPI документація:** ❌ Не реалізовано

**Postman collection:** ❌ Не створено

**API Documentation в адмінці:** ✅ Існує за адресою `/integrations/docs`

### Приклади запитів/відповідей

**Приклад 1: Отримання всіх properties (Off-Plan)**
```bash
curl -X GET "https://admin.foryou-realestate.com/api/properties?propertyType=off-plan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Приклад 2: Отримання публічних даних через API Key**
```bash
curl -X GET "https://admin.foryou-realestate.com/api/public/data" \
  -H "X-API-Key: your_api_key" \
  -H "X-API-Secret: your_api_secret"
```

**Приклад 3: Реєстрація користувача**
```bash
curl -X POST "https://admin.foryou-realestate.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1234567890",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "INVESTOR"
  }'
```

**Приклад 4: Отримання деталей property**
```bash
curl -X GET "https://admin.foryou-realestate.com/api/properties/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 Підсумок стану API

### ✅ Реалізовано
- GET /api/public/data
- GET /api/properties (з фільтрацією)
- GET /api/properties/:id
- GET /api/news
- GET /api/news/:id
- GET /api/courses
- GET /api/courses/:id
- POST /api/auth/login (оновлено - підтримує БД користувачів)
- POST /api/auth/register
- **✅ GET /api/auth/me** - отримання поточного користувача
- **✅ GET /api/collections** - список колекцій
- **✅ POST /api/collections** - створити колекцію
- **✅ PUT /api/collections/:id** - оновити колекцію
- **✅ DELETE /api/collections/:id** - видалити колекцію
- **✅ POST /api/collections/:id/properties** - додати нерухомість
- **✅ DELETE /api/collections/:id/properties/:propertyId** - видалити нерухомість
- **✅ GET /api/favorites** - список улюблених
- **✅ POST /api/favorites/:propertyId** - додати в улюблені
- **✅ DELETE /api/favorites/:propertyId** - видалити з улюблених
- **✅ GET /api/investments** - список інвестицій (для Investor)
- **✅ POST /api/investments** - створити інвестицію
- **✅ GET /api/investments/:id** - деталі інвестиції
- Автоматична конвертація цін (USD → AED)
- Автоматична конвертація розмірів (sqm → sqft)
- **✅ Розширені поля для Areas** (description, images)
- **✅ Розширені поля для Developers** (images)

### ❌ Не реалізовано (опціональні функції)
- POST /api/auth/logout (не потрібен для JWT - stateless токени)
- Refresh token механізм (можна додати при потребі)
- Rate limiting (рекомендується для production)
- WebSocket для real-time синхронізації (опціонально)
- Webhook система (опціонально для автоматизації)
- Swagger/OpenAPI документація (є вбудована документація в адмінці)

---

## 🔗 Корисні посилання

- **API Base URL:** `https://admin.foryou-realestate.com/api`
- **Health Check:** `https://admin.foryou-realestate.com/health`
- **API Documentation:** `https://admin.foryou-realestate.com/integrations/docs`

---

**Останнє оновлення:** 2024

**Версія API:** 1.0.0

