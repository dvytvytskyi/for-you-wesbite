# 📖 Документація Property Finder API (Фронтенд -> Бекенд)

Цей документ описує всі параметри, які фронтенд відправляє на бекенд для фільтрації та сортування проектів Property Finder.

## 1. Основний ендпоінт
`GET /api/property-finder/projects`

## 2. Параметри фільтрації (Query Parameters)

| Параметр | Тип | Опис | Приклад |
| :--- | :--- | :--- | :--- |
| `status` | string | Статус об'єкту (`off_plan`, `secondary`, `completed`) | `?status=off_plan` |
| `bedrooms` | array/string | Кількість спалень. Може бути кілька. `6` — для "6+". | `?bedrooms=2&bedrooms=3` |
| `priceMin` | number | Мінімальна ціна в **AED** | `?priceMin=1000000` |
| `priceMax` | number | Максимальна ціна в **AED** | `?priceMax=5000000` |
| `sizeMin` | number | Мінімальна площа в **sq. ft.** | `?sizeMin=1000` |
| `sizeMax` | number | Максимальна площа в **sq. ft.** | `?sizeMax=3000` |
| `furnishingType`| string | Тип меблювання (`furnished`, `unfurnished`, `partly-furnished`) | `?furnishingType=furnished` |
| `developerId` | string | ID розробника | `?developerId=123` |
| `location` | array/string | Назва або ID району. Може бути кілька. | `?location=Dubai+Marina` |
| `search` | string | Пошуковий запит (по назві проекту) | `?search=Pearl` |

## 3. Сортування

Бекенд повинен підтримувати два параметри одночасно: `sortBy` та `sortOrder`.

| UI Опція | sortBy | sortOrder | Опис |
| :--- | :--- | :--- | :--- |
| **Price Higher** | `price` | `DESC` | Спочатку найдорожчі |
| **Price Lower** | `price` | `ASC` | Спочатку найдешевші |
| **Newest First** | `createdAt` | `DESC` | Свіжі надходження зверху |
| **Size Larger** | `size` | `DESC` | Більша площа зверху |
| **Size Smaller** | `size` | `ASC` | Менша площа зверху |

**Приклад запиту для сортування за ціною (від вищої):**
`GET /api/property-finder/projects?sortBy=price&sortOrder=DESC`

## 4. Пагінація

| Параметр | Тип | Опис | За замовчуванням |
| :--- | :--- | :--- | :--- |
| `page` | number | Номер сторінки | `1` |
| `limit` | number | Кількість об'єктів на сторінку | `24` |

---

## 5. Додаткові ендпоінти для даних

Фронтенд використовує цей ендпоінт для завантаження списків у випадаючі списки фільтрів:
`GET /api/public/data`

**Очікувана структура відповіді:**
```json
{
  "success": true,
  "data": {
    "areas": [ { "id": "...", "nameEn": "...", "nameRu": "..." } ],
    "developers": [ { "id": "...", "name": "..." } ]
  }
}
```

---

### Резюме:
На даний момент фронтенд готовий і відправляє ці параметри. Якщо фільтри не працюють — бекенд повинен додати обробку цих ключів (`bedrooms`, `priceMin`, `sortBy` тощо) у свій SQL/NoSQL запит до бази даних.
