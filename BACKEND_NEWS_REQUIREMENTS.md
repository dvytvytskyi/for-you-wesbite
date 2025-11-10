# Вимоги до бекенду для News API

## Base URL

```
/api/news
```

## Authentication

Публічні ендпоінти (не вимагають авторизації):
- **API Key** (via `x-api-key` header) - для публічного доступу

---

## 📋 News Entity Schema

```typescript
{
  id: string;                    // UUID (auto-generated)
  slug: string;                  // URL-friendly slug (required, unique)
  title: string;                 // Заголовок англійською (required)
  titleRu: string;              // Заголовок російською (required)
  description?: string;          // Короткий опис англійською (optional)
  descriptionRu?: string;       // Короткий опис російською (optional)
  image: string;                // URL головного зображення (required)
  publishedAt: string;          // ISO date string (required)
  createdAt: string;            // ISO date string (auto-generated)
  updatedAt: string;            // ISO date string (auto-generated)
  contents?: NewsContent[];     // Масив контентних блоків (optional)
}
```

### NewsContent Schema (для деталей новини)

```typescript
{
  id: string;                   // UUID
  newsId: string;               // ID новини
  type: 'text' | 'image' | 'video';  // Тип контенту
  title: string;                // Заголовок блоку
  description: string | null;   // Текст блоку
  imageUrl: string | null;      // URL зображення (якщо type === 'image')
  videoUrl: string | null;      // URL відео (якщо type === 'video')
  order: number;                // Порядок відображення
}
```

---

## 🔍 Endpoints

### 1. GET `/api/news`

Отримати список всіх новин (для сторінки списку новин).

**Request:**

```http
GET /api/news
x-api-key: YOUR_API_KEY
```

**Query Parameters (опціонально):**

| Параметр | Тип | Опис | Приклад |
|----------|-----|------|---------|
| `page` | number | Номер сторінки (починається з 1) | `page=1` |
| `limit` | number | Кількість items на сторінку (за замовчуванням 12) | `limit=12` |
| `sortBy` | string | Поле для сортування: `publishedAt`, `createdAt` | `sortBy=publishedAt` |
| `sortOrder` | string | Напрямок сортування: `ASC` або `DESC` | `sortOrder=DESC` |

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "8315af5e-2d12-4537-9e25-a7fcc29d3619",
        "slug": "dubai-real-estate-market-growth-2024",
        "title": "Dubai Real Estate Market Shows Strong Growth in Q1 2024",
        "titleRu": "Рынок недвижимости Дубая показывает сильный рост в первом квартале 2024 года",
        "description": "The real estate sector in Dubai continues to demonstrate resilience and growth...",
        "descriptionRu": "Сектор недвижимости в Дубае продолжает демонстрировать устойчивость и рост...",
        "image": "https://files.alnair.ae/uploads/2024/1/news-image.jpg",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "createdAt": "2024-01-10T08:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 12
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (якщо API key невалідний)

**Важливо:**
- `total` - загальна кількість ВСІХ новин (не тільки завантажених)
- Сортування за замовчуванням: `publishedAt DESC` (новіші спочатку)
- `contents` НЕ включається в список (тільки в деталі)

---

### 2. GET `/api/news/:slug`

Отримати деталі однієї новини за slug (для сторінки деталей новини).

**Request:**

```http
GET /api/news/dubai-real-estate-market-growth-2024
x-api-key: YOUR_API_KEY
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "8315af5e-2d12-4537-9e25-a7fcc29d3619",
    "slug": "dubai-real-estate-market-growth-2024",
    "title": "Dubai Real Estate Market Shows Strong Growth in Q1 2024",
    "titleRu": "Рынок недвижимости Дубая показывает сильный рост в первом квартале 2024 года",
    "description": "The real estate sector in Dubai continues to demonstrate resilience and growth...",
    "descriptionRu": "Сектор недвижимости в Дубае продолжает демонстрировать устойчивость и рост...",
    "image": "https://files.alnair.ae/uploads/2024/1/news-image.jpg",
    "publishedAt": "2024-01-15T10:00:00.000Z",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "contents": [
      {
        "id": "content-1",
        "newsId": "8315af5e-2d12-4537-9e25-a7fcc29d3619",
        "type": "text",
        "title": "Market Overview",
        "description": "The Dubai real estate sector continues to attract international investors...",
        "imageUrl": null,
        "videoUrl": null,
        "order": 1
      },
      {
        "id": "content-2",
        "newsId": "8315af5e-2d12-4537-9e25-a7fcc29d3619",
        "type": "image",
        "title": "Luxury Developments",
        "description": null,
        "imageUrl": "https://files.alnair.ae/uploads/2024/1/content-image.jpg",
        "videoUrl": null,
        "order": 2
      },
      {
        "id": "content-3",
        "newsId": "8315af5e-2d12-4537-9e25-a7fcc29d3619",
        "type": "video",
        "title": "Investment Opportunities",
        "description": null,
        "imageUrl": null,
        "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
        "order": 3
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - News not found
- `401` - Unauthorized

**Важливо:**
- `contents` має бути відсортований за `order` (ASC)
- Якщо `contents` відсутній або порожній, повертається `null` або `[]`

---

## 📝 Приклади запитів

### Приклад 1: Отримати список новин (перша сторінка)

```bash
curl -X GET "https://admin.foryou-realestate.com/api/news?page=1&limit=12&sortBy=publishedAt&sortOrder=DESC" \
  -H "x-api-key: YOUR_API_KEY"
```

### Приклад 2: Отримати деталі новини за slug

```bash
curl -X GET "https://admin.foryou-realestate.com/api/news/dubai-real-estate-market-growth-2024" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## ⚠️ Важливі примітки

1. **Slug Uniqueness**: `slug` має бути унікальним. Використовується для URL (`/news/:slug`).

2. **Published Date**: `publishedAt` використовується для сортування та відображення дати публікації.

3. **Contents Order**: Контентні блоки (`contents`) мають бути відсортовані за полем `order` (ASC).

4. **Image URLs**: Всі URL зображень мають бути повними (з доменом), не відносними.

5. **Video URLs**: Підтримуються YouTube URLs. Фронтенд конвертує їх в embed формат.

6. **Multi-language**: Обов'язкові поля `title` та `titleRu`. Опціональні `description` та `descriptionRu`.

7. **Pagination**: Для списку новин обов'язково повертати `total` (загальна кількість), `page` та `limit`.

---

## 🔗 Формат відповіді (стандартний)

Всі ендпоінти повертають дані в стандартному форматі:

```json
{
  "success": true,
  "data": {
    // Для списку:
    "data": [...],
    "total": 50,
    "page": 1,
    "limit": 12
    
    // Або для деталей:
    // {...single news object...}
  }
}
```

---

## 📊 Поточні вимоги фронтенду

Фронтенд очікує:
- **GET /api/news** - список новин з пагінацією
- **GET /api/news/:slug** - деталі новини з контентними блоками
- Публічний доступ (тільки API key, без JWT)
- Підтримка пагінації для списку
- Сортування за `publishedAt DESC` за замовчуванням

