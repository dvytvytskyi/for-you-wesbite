# Wave 1 — SEO Audit & Fixes Log
Generated: 2026-04-23

---

## Групи для аналізу
- [x] Core pages (EN + RU) — **поточна секція**
- [x] Areas (EN + RU) — **проаналізовано**
- [x] News (EN + RU) — **проаналізовано**
- [ ] Developers — **excluded from Wave 1, не індексуємо зараз**
- [ ] Properties (EN + RU)

---

## 1. Core Pages

### Критерії перевірки
| Критерій | Метод |
|---|---|
| HTTP статус | curl -I |
| Canonical | `<link rel="canonical">` — має бути self-referencing без `/en/` |
| hreflang | EN↔RU пара + x-default |
| noindex | відсутній |
| Title | не порожній, містить ключові слова |
| Meta description | ≥ 10 символів, заповнений |

---

### Результати аудиту — EN (12 core pages у Wave 1 scope)

| URL | HTTP | Canonical | hreflang | noindex | Title | Desc |
|---|---|---|---|---|---|---|
| / | ✅ 200 | ✅ self | ❌ MISSING | ✅ | ✅ Buy Property in Dubai | ✅ |
| /about | ✅ 200 | ❌ `/en/about` | ❌ MISSING | ✅ | ⚠️ "ForYou Real Estate" | ✅ |
| /areas | ✅ 200 | ✅ self | ❌ MISSING | ✅ | ✅ Best Areas to Live in Dubai | ✅ |
| /map | ✅ 200 | ❌ `/en/map` | ❌ MISSING | ✅ | ✅ Interactive Dubai Map | ✅ |
| /news | ✅ 200 | ✅ self | ❌ MISSING | ✅ | ✅ Dubai Real Estate News | ✅ |
| /properties | ✅ 200 | ✅ self | ❌ MISSING | ✅ | ✅ Dubai Properties for Sale | ✅ |

### Результати аудиту — RU (12 core pages у Wave 1 scope)

| URL | HTTP | Canonical | hreflang | Title |
|---|---|---|---|---|
| /ru | ✅ 200 | ✅ self | ❌ MISSING | ✅ Недвижимость в Дубае |
| /ru/about | ✅ 200 | ✅ self | ❌ MISSING | ⚠️ "Агентство недвижимости ForYou" |
| /ru/areas | ✅ 200 | ✅ self | ❌ MISSING | ✅ Лучшие районы Дубая |
| /ru/map | ✅ 200 | ✅ self | ❌ MISSING | ✅ Карта недвижимости Дубая |
| /ru/news | ✅ 200 | ✅ self | ❌ MISSING | ✅ Новости недвижимости Дубая |
| /ru/properties | ✅ 200 | ❌ `/properties` (EN!) | ❌ MISSING | ✅ Каталог недвижимости |

---

### Знайдені проблеми — Core

#### 🔴 КРИТИЧНО

**P1 — hreflang відсутній на ВСІХ 14 core сторінках**
- Google не розуміє що `/about` і `/ru/about` — це мовні версії одна одної
- Без hreflang можливий дублікат-контент penalty між EN і RU
- Файли для фікса: `app/[locale]/` — homepage, areas, news, properties

**P2 — `/ru/properties` має неправильний canonical**
- Поточний: `https://foryou-realestate.com/properties` (вказує на EN)
- Має бути: `https://foryou-realestate.com/ru/properties` (self-referencing)
- Файл: `app/[locale]/properties/page.tsx` (list page, не detail)

#### 🟡 ВАЖЛИВО

**P3 — `/about` і `/map` canonical мають `/en/` префікс (live)**
- В коді вже виправлено (commit 94691aa), але live ще показує старий
- Дія: перевірити чи Vercel задеплоїв; якщо так — purge Cloudflare cache

**P4 — `/about` title слабкий**
- Поточний: "ForYou Real Estate" — чисто бренд, без ключових слів
- Рекомендація: "About ForYou Real Estate | Dubai Property Agency"
- Файл: `app/[locale]/about/page.tsx` → metadata title

**P5 — `/ru/about` title мінімальний**
- Поточний: "Агентство недвижимости ForYou"
- Рекомендація: "О компании ForYou | Агентство недвижимости Дубай"

---

### Плановані правки — Core

| # | Файл | Правка | Пріоритет | Статус |
|---|---|---|---|---|
| C1 | `app/[locale]/page.tsx` (homepage) | Додати hreflang EN↔RU + x-default | 🔴 | TODO |
| C2 | `app/[locale]/areas/page.tsx` | Додати hreflang | 🔴 | TODO |
| C3 | `app/[locale]/news/page.tsx` | Додати hreflang | 🔴 | TODO |
| C4 | `app/[locale]/properties/page.tsx` (list) | Додати hreflang + виправити RU canonical | 🔴 | TODO |
| C5 | `app/[locale]/about/page.tsx` | Виправити title + перевірити canonical deploy | 🟡 | TODO |
| C6 | `app/[locale]/map/page.tsx` | Перевірити canonical deploy | 🟡 | TODO |
| C7 | Cloudflare | Purge cache після deploy | 🟡 | TODO |

---

## 2. Areas

### Результати аудиту

| Метрика | Значення |
|---|---|
| URLs перевірено | 86 |
| HTTP 200 | 86 / 86 |
| Canonical missing | 0 |
| Wrong canonical | 0 |
| hreflang EN missing | 86 / 86 |
| hreflang RU missing | 86 / 86 |
| x-default missing | 86 / 86 |
| noindex | 0 |
| Missing description | 0 |
| Avg response time | ~230 ms |

### Що добре

- Усі EN/RU area detail URL живі і стабільно віддають `200`
- Canonical на всіх 86 сторінках self-referencing і без `/en/`
- EN↔RU пари повні: для кожного EN area URL є RU відповідник
- Немає numeric slug, дублів canonical або thin meta description

### Знайдені проблеми — Areas

#### 🔴 КРИТИЧНО

**A1 — hreflang повністю відсутній на всіх 86 area detail сторінках**
- Live HTML не містить `hreflang="en"`, `hreflang="ru"` і `hreflang="x-default"`
- Це блокує нормальну мовну кластеризацію EN/RU area pages в Google
- Файл-контролер: `app/[locale]/areas/[slug]/page.tsx`

#### 🟡 ВАЖЛИВО

**A2 — EN breadcrumb schema використовує неканонічні `/en/areas/...` URL**
- Приклад live JSON-LD для `/areas/dubai-marina`:
	- `https://foryou-realestate.com/en/areas`
	- `https://foryou-realestate.com/en/areas/dubai-marina`
- Це суперечить canonical `https://foryou-realestate.com/areas/dubai-marina`
- Файл: `app/[locale]/areas/[slug]/page.tsx`

**A3 — fallback title для відсутнього area занадто слабкий**
- Зараз при `!area` metadata повертає лише `t('areas')`
- Для SEO це не критично, але варто дати точніший fallback або коректний `notFound()` path

### Локальна причина проблем

- У metadata для `areas/[slug]` alternates описані в коді, але live HTML їх не рендерить
- У JSON-LD посилання збираються через `${locale}/areas`, тому EN сторінки отримують `/en/areas/...`

### Плановані правки — Areas

| # | Файл | Правка | Пріоритет | Статус |
|---|---|---|---|---|
| A1 | `app/[locale]/areas/[slug]/page.tsx` | Забезпечити реальний рендер hreflang EN↔RU + x-default | 🔴 | TODO |
| A2 | `app/[locale]/areas/[slug]/page.tsx` | Виправити breadcrumb/schema URL для EN без `/en/` | 🟡 | TODO |
| A3 | `app/[locale]/areas/[slug]/page.tsx` | Посилити fallback metadata для edge-case без area | 🟡 | TODO |

## 3. News

### Результати аудиту

| Метрика | Значення |
|---|---|
| URLs перевірено | 70 |
| HTTP 200 | 70 / 70 |
| Canonical missing | 2 |
| Wrong canonical | 0 |
| hreflang EN missing | 70 / 70 |
| hreflang RU missing | 70 / 70 |
| x-default missing | 70 / 70 |
| noindex | 2 |
| Missing description | 0 |
| Avg response time | ~247 ms |

### Що добре

- Усі 70 news URL з Wave 1 живі і віддають `200`
- Для нормальних article URL canonical зазвичай self-referencing і коректний по locale
- Сторінка списку `news` уже має правильну metadata-конфігурацію в коді

### Знайдені проблеми — News

#### 🔴 КРИТИЧНО

**N1 — hreflang повністю відсутній на всіх 70 news detail сторінках**
- Live HTML не містить `hreflang="en"`, `hreflang="ru"`, `hreflang="x-default"`
- Це повторює ту ж проблему, що і в `areas`: мовні дублікати не зв'язані між собою
- Файл-контролер: `app/[locale]/news/[slug]/page.tsx`

**N2 — fallback article URL віддає `200 + noindex` замість коректної статті або `404`**
- Проблемний кейс: `/news/forms-of-property-ownership-in-dubai`
- Те ж саме для RU: `/ru/news/forms-of-property-ownership-in-dubai`
- Live результат:
	- немає canonical
	- title = `News | ForYou Real Estate`
	- є `noindex`
- Це явний soft-404/fallback state усередині індексованої URL-структури

#### 🟡 ВАЖЛИВО

**N3 — EN breadcrumb/article schema використовує неканонічні `/en/news/...` URL**
- Для нормальної EN статті live JSON-LD віддає:
	- `https://foryou-realestate.com/en/news`
	- `https://foryou-realestate.com/en/news/{slug}`
- Canonical при цьому правильний: без `/en/`
- Це створює конфлікт між schema та canonical

**N4 — author URL у Article schema для EN веде на `/en/about`**
- У коді `author.url` = `https://foryou-realestate.com/${locale}/about`
- Для EN це неканонічний шлях, має бути `/about`

**N5 — частина EN news URL віддає RU title/content signals**
- Приклади: `/news/20-2032-ceo-marjan-hospitality`, `/news/amazon-emirates-islamic-mastercard`
- Це не технічний canonical-баг, але це контентна змішаність locale на EN URL
- Для Wave 1 такі URL треба окремо позначити як контентно-сумнівні

### Локальна причина проблем

- У `app/[locale]/news/[slug]/page.tsx` alternates описані, але live не показує їх у head
- У breadcrumb і author schema URL збираються через `${locale}/...`, тому EN отримує `/en/news` і `/en/about`
- У `generateMetadata()` catch-блок повертає лише заголовок `News | ForYou Real Estate`, що пояснює fallback-сторінку без canonical та з `noindex`

### Плановані правки — News

| # | Файл | Правка | Пріоритет | Статус |
|---|---|---|---|---|
| N1 | `app/[locale]/news/[slug]/page.tsx` | Забезпечити реальний рендер hreflang EN↔RU + x-default | 🔴 | TODO |
| N2 | `app/[locale]/news/[slug]/page.tsx` | При fallback не віддавати soft-404 `200 + noindex`; або 404, або коректний canonicalized article | 🔴 | TODO |
| N3 | `app/[locale]/news/[slug]/page.tsx` | Виправити breadcrumb schema URL для EN без `/en/` | 🟡 | TODO |
| N4 | `app/[locale]/news/[slug]/page.tsx` | Виправити `author.url` для EN на `/about` | 🟡 | TODO |
| N5 | контентний список | Помітити EN URL з RU titles/content для ручного відбору в Wave 1 | 🟡 | TODO |

## 4. Developers — excluded from Wave 1

- За рішенням поточної хвилі `developers` тимчасово не індексуємо
- Видалено з `core-pages-en.txt`, `core-pages-ru.txt` і `wave1-all-urls.json`
- Окремий файл `developers-wave1-current.txt` прибрано з Wave 1 набору
- Повернемося до цієї групи окремо після рішення по Wave 1.1

## 5. Properties — (наступна секція)
_детальний аудит ще не розпочато_

Поточне рішення по scope:
- У Wave 1 лишаємо тільки off-plan property detail URL.
- Secondary properties тимчасово не індексуємо.
- `properties-en-wave1-1200.txt`, `properties-ru-wave1-1200.txt` і `wave1-all-urls.json` вже оновлені під off-plan-only вибірку.
