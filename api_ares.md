# API для Areas (Райони) з підрахунком проектів

## Endpoint

```
GET /api/public/areas
```

## Аутентифікація

Потрібна API Key/Secret аутентифікація:
- Header: `X-Api-Key: <your-api-key>`
- Header: `X-Api-Secret: <your-api-secret>`

## Query Parameters

| Параметр | Тип | Обов'язковий | Опис |
|----------|-----|--------------|------|
| `cityId` | string (UUID) | Ні | Фільтр по місту. Якщо не вказано, повертаються всі areas |

## Приклад запиту

```bash
curl -X GET "https://your-api.com/api/public/areas" \
  -H "X-Api-Key: your-api-key" \
  -H "X-Api-Secret: your-api-secret"
```

З фільтром по місту:
```bash
curl -X GET "https://your-api.com/api/public/areas?cityId=93d991f3-2468-4506-8417-f117f42a5b5b" \
  -H "X-Api-Key: your-api-key" \
  -H "X-Api-Secret: your-api-secret"
```

## Формат відповіді

### Успішна відповідь (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nameEn": "Business Bay",
      "nameRu": "Бізнес Бей",
      "nameAr": "الخليج التجاري",
      "cityId": "uuid",
      "city": {
        "id": "uuid",
        "nameEn": "Dubai",
        "nameRu": "Дубай",
        "nameAr": "دبي",
        "countryId": "uuid",
        "country": {
          "id": "uuid",
          "nameEn": "UAE",
          "nameRu": "ОАЭ",
          "nameAr": "الإمارات العربية المتحدة",
          "code": "AE"
        }
      },
      "projectsCount": {
        "total": 40,
        "offPlan": 35,
        "secondary": 5
      },
      "description": {
        "title": "Business Bay",
        "description": "Описание района"
      },
      "infrastructure": {
        "title": "Инфраструктура",
        "description": "Описание инфраструктуры"
      },
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ]
    },
    {
      "id": "uuid",
      "nameEn": "Downtown Dubai",
      "nameRu": "Даунтаун Дубай",
      "nameAr": "وسط مدينة دبي",
      "cityId": "uuid",
      "city": { ... },
      "projectsCount": {
        "total": 25,
        "offPlan": 20,
        "secondary": 5
      },
      ...
    }
  ]
}
```

### Помилка (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid API key or secret"
}
```

### Помилка (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch areas",
  "error": "Error details"
}
```

## Структура даних

### Area Object

| Поле | Тип | Опис |
|------|-----|------|
| `id` | string (UUID) | Унікальний ідентифікатор району |
| `nameEn` | string | Назва району англійською |
| `nameRu` | string | Назва району російською |
| `nameAr` | string | Назва району арабською |
| `cityId` | string (UUID) | ID міста |
| `city` | object | Об'єкт міста (див. нижче) |
| `projectsCount` | object | Підрахунок проектів (див. нижче) |
| `description` | object \| null | Опис району |
| `infrastructure` | object \| null | Інфраструктура району |
| `images` | string[] \| null | Масив URL зображень |

### City Object

| Поле | Тип | Опис |
|------|-----|------|
| `id` | string (UUID) | ID міста |
| `nameEn` | string | Назва міста англійською |
| `nameRu` | string | Назва міста російською |
| `nameAr` | string | Назва міста арабською |
| `countryId` | string (UUID) | ID країни |
| `country` | object \| null | Об'єкт країни |

### Country Object

| Поле | Тип | Опис |
|------|-----|------|
| `id` | string (UUID) | ID країни |
| `nameEn` | string | Назва країни англійською |
| `nameRu` | string | Назва країни російською |
| `nameAr` | string | Назва країни арабською |
| `code` | string | Код країни (наприклад, "AE") |

### ProjectsCount Object

| Поле | Тип | Опис |
|------|-----|------|
| `total` | number | Загальна кількість проектів в районі |
| `offPlan` | number | Кількість off-plan проектів |
| `secondary` | number | Кількість secondary проектів |

## Приклади використання

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';

// Отримати всі areas
const response = await axios.get('https://your-api.com/api/public/areas', {
  headers: {
    'X-Api-Key': apiKey,
    'X-Api-Secret': apiSecret,
  },
});

const areas = response.data.data;
console.log('Business Bay projects:', areas.find(a => a.nameEn === 'Business Bay')?.projectsCount);

// Отримати areas для конкретного міста
const dubaiAreas = await axios.get('https://your-api.com/api/public/areas', {
  params: {
    cityId: '93d991f3-2468-4506-8417-f117f42a5b5b',
  },
  headers: {
    'X-Api-Key': apiKey,
    'X-Api-Secret': apiSecret,
  },
});
```

### React Hook

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useAreas(cityId?: string) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/public/areas', {
          params: cityId ? { cityId } : {},
          headers: {
            'X-Api-Key': process.env.REACT_APP_API_KEY,
            'X-Api-Secret': process.env.REACT_APP_API_SECRET,
          },
        });
        setAreas(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [cityId]);

  return { areas, loading, error };
}

// Використання
function AreasList() {
  const { areas, loading, error } = useAreas();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {areas.map(area => (
        <div key={area.id}>
          <h3>{area.nameEn}</h3>
          <p>Total projects: {area.projectsCount.total}</p>
          <p>Off-plan: {area.projectsCount.offPlan}</p>
          <p>Secondary: {area.projectsCount.secondary}</p>
        </div>
      ))}
    </div>
  );
}
```

## Примітки

1. **Сортування**: Areas відсортовані за `nameEn` в алфавітному порядку
2. **Підрахунок**: `projectsCount` включає всі properties, пов'язані з area
3. **Фільтрація**: Можна фільтрувати areas по `cityId` через query parameter
4. **Порожні areas**: Endpoint повертає всі areas, навіть якщо в них немає проектів (projectsCount.total = 0)

## Приклад відповіді для Business Bay

```json
{
  "id": "e12ba239-3265-4665-b6b4-4124058ac5b5",
  "nameEn": "Business Bay",
  "nameRu": "Бізнес Бей",
  "nameAr": "الخليج التجاري",
  "cityId": "93d991f3-2468-4506-8417-f117f42a5b5b",
  "city": {
    "id": "93d991f3-2468-4506-8417-f117f42a5b5b",
    "nameEn": "Dubai",
    "nameRu": "Дубай",
    "nameAr": "دبي",
    "countryId": "...",
    "country": { ... }
  },
  "projectsCount": {
    "total": 40,
    "offPlan": 35,
    "secondary": 5
  }
}
```

