# SEO План та Реалізація (22.04.2026 -> 22.05.2026)

## 1. Ціль спринту

Головна ціль: подвоїти результат у пріоритетному сегменті (money pages) за 30 днів.

Сегмент для х2:
- Properties
- Areas
- Developers
- News
- Локалі EN та RU

Ключовий принцип: спочатку прибираємо технічні блокери індексації, потім посилюємо контент і AI-видимість.

---

## 2. KPI і Baseline

Baseline дата: 22.04.2026

Primary KPI:
- Indexed money pages: +100%

Secondary KPI:
- Discovered, currently not indexed: -35% до -50%
- Blocked by noindex (для sitemap URL): 0 нових
- GSC impressions у money-сегменті: +60% до +100%
- CTR: +15% до +25%

AI KPI:
- 30+ сторінок з AI-ready factual секціями
- 0 конфліктів canonical/hreflang у вибірці top-50 URL

---

## 3. Decision Log (фіксуємо рішення)

1. Landing policy
- Рішення: Варіант A на цей спринт
- Суть: Landing не індексуємо як окремий SEO-кластер, прибираємо з sitemap
- Причина: найшвидше прибирає конфлікт дублювання і повертає crawl budget

2. Canonical host
- Рішення: non-www як єдиний canonical host
- Суть: однаковий host у metadata, sitemap, robots, internal canonical

3. EN URL policy
- Рішення: поточну політику не ламати у цьому спринті, але canonical/hreflang зробити консистентними

---

## 4. План робіт: що, де, як, критерій готовності

## Workstream P0-1: Sitemap дублювання і landing policy

Статус: Planned
Пріоритет: P0
Вплив: Дуже високий

Що змінюємо:
- Прибираємо landing URL з sitemap генерації

Де в коді:
- [app/sitemap.ts](app/sitemap.ts#L119)
- [app/sitemap.ts](app/sitemap.ts#L127)

Реалізація:
1. Залишити у sitemap тільки canonical property URL
2. Видалити/закоментувати додавання landing URL
3. Переконатись, що кількість URL у projects sitemap зменшилась без втрати canonical сторінок

Definition of Done:
- У sitemap немає /landing/ URL
- У Coverage через 7-14 днів немає приросту нових landing проблем з sitemap

Перевірка:
- Локально відкрити sitemap index і projects sitemap
- Вибірково перевірити 20 property URL

---

## Workstream P0-2: Canonical і hreflang per-page

Статус: Planned
Пріоритет: P0
Вплив: Дуже високий

Що змінюємо:
- Прибираємо глобальний canonical locale-root з layout
- Переносимо canonical/alternates у page-level metadata для ключових шаблонів

Де в коді:
- [app/[locale]/layout.tsx](app/[locale]/layout.tsx#L39)

Реалізація:
1. У layout залишити тільки metadataBase та глобальні речі без fixed canonical
2. Для шаблонів Home, Properties List, Property Detail, Areas, Area Detail, Developers, Developer Detail, News, News Detail задати generateMetadata з self-canonical
3. Додати парні alternates EN/RU + x-default за фактичним шляхом сторінки

Definition of Done:
- Для тестової вибірки 20 URL canonical = фактичний канонічний URL
- hreflang парний і валідний

Перевірка:
- View source або SEO інспектор на 20 URL
- URL Inspection у GSC для 4-6 контрольних URL

---

## Workstream P0-3: Domain consistency

Статус: Planned
Пріоритет: P0
Вплив: Високий

Що змінюємо:
- Приводимо всі SEO-джерела до non-www

Де в коді:
- [app/[locale]/layout.tsx](app/[locale]/layout.tsx#L32)
- [app/sitemap.ts](app/sitemap.ts#L4)
- [app/robots.ts](app/robots.ts#L10)

Реалізація:
1. Встановити один canonical host
2. Перевірити JSON-LD url/logo/image на той самий host
3. Перевірити, що в sitemap і robots теж той самий host

Definition of Done:
- Нема розсинхрону домену у metadata/sitemap/robots/schema

Перевірка:
- Пошук по репозиторію www.foryou-realestate.com і foryou-realestate.com
- Ручна перевірка head на ключових шаблонах

---

## Workstream P1-1: Breadcrumb Unnamed item

Статус: Planned
Пріоритет: P1
Вплив: Середній

Що змінюємо:
- Fix schema breadcrumbs, щоб кожен item мав name

Реалізація:
1. Перевірити генератор breadcrumb schema
2. Гарантувати fallback для name
3. Перевірити Rich Results Test на 5 шаблонах

Definition of Done:
- Нема помилки Unnamed item у валідаторі

---

## Workstream P1-2: Filter URL 404

Статус: Planned
Пріоритет: P1
Вплив: Середній

Що змінюємо:
- Валідні комбінації фільтрів не повинні давати 404

Реалізація:
1. Відокремити невалідні параметри від валідних
2. Для сумнівних комбінацій повертати сторінку з дефолтним станом або clean redirect
3. Уникати індексації шумних параметричних URL

Definition of Done:
- Вибіркові URL з GSC не дають 404
- Нема нових soft/false 404 по фільтрам

---

## Workstream P2-1: AI Visibility Layer

Статус: Planned
Пріоритет: P2
Вплив: Високий в середньостроковій перспективі

Що змінюємо:
- Додаємо фактичні блоки для AI retrieval на пріоритетні сторінки

Реалізація:
1. Додати блоки:
- Investment snapshot
- Who is this for
- Key facts
2. Уніфікувати назви entity між контентом і schema
3. Оновити 20 priority properties + 6 areas + 6 developers

Definition of Done:
- 30+ URL мають структуровані factual секції
- Контент консистентний з schema

---

## 5. Календар виконання

Дні 1-3:
- P0-1 Sitemap cleanup
- P0-3 Domain consistency

Дні 4-7:
- P0-2 Canonical/hreflang refactor для основних шаблонів
- Ресабміт sitemap + Validate Fix у GSC

Дні 8-14:
- P1-1 Breadcrumb fix
- P1-2 Filter URL нормалізація

Дні 15-21:
- Контентний блок по priority URL
- Schema enhancement

Дні 22-30:
- AI visibility rollout
- Підсумкова аналітика і план спринту 2

---

## 6. Щоденний робочий ритм

Щодня:
1. Перевірка GSC Coverage delta (10 хв)
2. Перевірка індексації контрольних URL (5-10 хв)
3. Оновлення статусу задач у цьому документі (5 хв)

Раз на тиждень:
1. Звіт по KPI delta
2. Рішення по пріоритетах наступного тижня

---

## 7. Статус трекер

Оновлювати щодня.

- P0-1 Sitemap cleanup: Planned
- P0-2 Canonical/hreflang per-page: Planned
- P0-3 Domain consistency: Planned
- P1-1 Breadcrumb fix: Planned
- P1-2 Filter URL 404 fix: Planned
- P2-1 AI visibility layer: Planned

---

## 8. Перший конкретний крок прямо зараз

Починаємо з P0-1 і P0-3 в одному релізі:
1. Прибрати landing URL з sitemap
2. Вирівняти canonical host на non-www
3. Задеплоїти
4. Перевірити 5 контрольних URL і пересабмітити sitemap у GSC

Після цього одразу переходимо до P0-2 (canonical/hreflang per-page).
