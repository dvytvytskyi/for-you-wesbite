# SEO стратегія на 1 місяць (22.04.2026 -> 22.05.2026)

## 1) Executive Summary

Поточна картина: критична проблема не в інфраструктурі Vercel, а в архітектурі індексації URL і сигналах канонікалізації.

Що вже добре:
- www -> non-www редиректи працюють (за даними GSC).
- Preview URLs захищені Vercel Authentication.
- robots/sitemap віддаються з основного домену без www.

Що блокує ріст прямо зараз:
- Дублювання property URL в sitemap (`/properties/{slug}` і `/landing/{area}/{slug}` для одного об'єкта).
- Некоректна логіка canonical/alternates на рівні locale layout (не per-page).
- Розсинхрон домену в metadataBase (`www`) проти sitemap/robots (`non-www`).
- Велика кількість `Discovered, currently not indexed` і `Blocked by noindex` для `/landing/*` (за GSC drilldown).

Ціль на 30 днів:
- Мінімум x2 по ключовому SEO-виходу (індексовані money-сторінки + видимість по показам).
- Паралельно запустити AI visibility трек (LLM-friendly контент + schema + entity consistency).

Реалістична формула x2:
- Не чекати x2 по всьому сайту одразу.
- Цілитися в x2 по пріоритетному сегменту: `properties + areas + developers + news` для EN/RU, де є комерційний попит.

---

## 2) Підтверджені факти (GSC + код)

### 2.1. Висновки з GSC (з ваших експортів)
- Основний кластер проблем: `Discovered, currently not indexed` (~1,766 URL, зростає).
- Другий критичний кластер: `Blocked by noindex` (~304 URL, різкий ріст).
- `404` (~647) переважно legacy/asset noise, не головна SEO-блокада.
- `Page with redirect` показує, що www/http редиректи працюють.

### 2.2. Підтвердження в коді репозиторію

1) Дублювання property URL в sitemap
- У [app/sitemap.ts](app/sitemap.ts#L119) додається `/properties/${prop.slug}`.
- У [app/sitemap.ts](app/sitemap.ts#L127) додається `/landing/${areaSlug}/${prop.slug}`.
- Для Google це може виглядати як URL-клони з перекриттям контенту.

2) Розсинхрон домену в metadata
- `layout` використовує `https://www.foryou-realestate.com` у [app/[locale]/layout.tsx](app/[locale]/layout.tsx#L32).
- `sitemap` використовує `https://foryou-realestate.com` у [app/sitemap.ts](app/sitemap.ts#L4).
- `robots` теж вказує non-www у [app/robots.ts](app/robots.ts#L10).

3) Canonical/alternates не per-page у locale layout
- `canonical: /{locale}` у [app/[locale]/layout.tsx](app/[locale]/layout.tsx#L39).
- Мовні alternates зафіксовані на корінь локалі в [app/[locale]/layout.tsx](app/[locale]/layout.tsx#L40).
- Це створює слабкий або суперечливий canonical-сигнал для глибоких сторінок.

4) noindex у поточному коді
- Явних `noindex`/`robots: { index: false }` у `app/**/*.tsx` не знайдено під час перевірки.
- Висновок: або noindex був раніше й вже прибраний, або приходить з іншого шару (edge/header/старий деплой/сторонній шаблон).

---

## 3) Root Cause Map

### P0. URL-стратегія `/landing/*` не узгоджена
Симптом:
- GSC бачить масив landing URL як дубль/тонкий контент.

Корінь:
- Один і той самий об'єкт має кілька URL-шляхів у sitemap.
- Немає однозначної політики: indexable landing pages чи службові/кампанійні сторінки.

### P0. Canonical-сигнали не відповідають URL сторінки
Симптом:
- Google може обирати "іншу канонічну" або відкладати сканування.

Корінь:
- Canonical заданий на рівні locale-root, а не на рівні конкретної сторінки.

### P1. Domain consistency
Симптом:
- Розмитий сигнал між www і non-www в metadata.

Корінь:
- Різні базові домени в різних SEO-джерелах.

### P1. Crawl budget leakage
Симптом:
- Багато low-value/duplicate URL в sitemap.

Корінь:
- До sitemap потрапляють URL, які не повинні бути crawl-priority.

---

## 4) Стратегічне рішення по `/landing/*` (вибрати 1 з 2)

### Варіант A (рекомендовано на найближчі 30 днів):
`/landing/*` не індексуємо, це кампанійні/трафікові сторінки.

Що робимо:
- Прибираємо `/landing/*` з sitemap.
- Залишаємо індексацію тільки канонічних `properties` URL.
- Перевіряємо, що `/landing/*` не мають внутрішньої навігації як SEO-ціль.

Плюс:
- Швидко прибирає конфлікт сигналів і повертає crawl budget money-сторінкам.

Мінус:
- Landing URL не будуть органічною точкою входу.

### Варіант B:
`/landing/*` індексуємо як самостійні сторінки.

Що потрібно:
- Унікальний контент блочно/семантично (не лише інший URL).
- Self-canonical на кожній landing.
- Чітка інформаційна мета (район/сегмент/сценарій інвестора).

Плюс:
- Додатковий long-tail трафік.

Мінус:
- Значно більше контентної і технічної роботи; 30 днів може бути замало.

Рекомендація: для цілі x2 за 1 місяць обираємо Варіант A, потім повертаємося до B як фази 2.

---

## 5) План на 30 днів (по тижнях)

## Тиждень 1 (Дні 1-7): Cleanup критичних технічних блокерів

Ціль: прибрати суперечливі сигнали, стабілізувати індексацію.

Завдання:
1. Прибрати `landing`-дублі з sitemap генерації.
2. Вирівняти домен у всіх SEO-джерелах на один canonical host (рекомендовано non-www).
3. Перенести canonical/alternates на рівень конкретних сторінок (per-page metadata).
4. Зробити QA-перевірку:
- 20 URL (home/areas/properties/news/developers + EN/RU)
- перевірка `rel=canonical`, `hreflang`, status code, indexability.
5. Ресабміт sitemap + запуск Validate Fix у GSC по релевантних кластерах.

Очікуваний ефект:
- Падіння приросту `Discovered not indexed`.
- Зменшення нових `Blocked by noindex` для sitemap URL.

## Тиждень 2 (Дні 8-14): Crawl efficiency + IA signals

Ціль: дати Google чітку ієрархію важливих сторінок.

Завдання:
1. Перебалансувати internal linking:
- з home та hub-сторінок на top money pages.
- контекстні лінки між `areas -> properties`, `developers -> properties`.
2. Перевірити breadcrumbs на всіх шаблонах (прибрати "Unnamed item").
3. Нормалізувати URL-параметри фільтрів:
- неіндексовані фільтр-URL не повинні формувати помилкові 404.
4. Підготувати список 100 пріоритетних URL для повторного індексування.

Очікуваний ефект:
- Кращий crawl path.
- Більша частка crawl на конверсійних URL.

## Тиждень 3 (Дні 15-21): Контент + E-E-A-T + Entity signals

Ціль: підвищити шанси індексації та ранжування після технічного фіксу.

Завдання:
1. Оновити 20 пріоритетних сторінок `properties`:
- додати унікальні блоки (інвест-сценарій, окупність, мікро-локація, FAQ).
2. Оновити 6 сторінок `areas` + 6 `developers` з фактологією та внутрішніми лінками.
3. Розширити schema:
- `RealEstateListing`, `BreadcrumbList`, `FAQPage` де доречно.
- підготувати основу для `Person` (агенти/автори) і `Organization` consistency.

Очікуваний ефект:
- Менше "тонких" URL.
- Кращі сигнали якості для органіки і AI retrieval.

## Тиждень 4 (Дні 22-30): AI visibility + масштабування того, що спрацювало

Ціль: отримати видимість у відповідях AI-систем і закріпити SEO-ріст.

Завдання:
1. Запустити AI-ready knowledge blocks:
- короткі factual секції "What to know", "Investment snapshot", "Who is this for".
2. Уніфікувати entity naming (brand, area, developer, project) між сторінками і schema.
3. Додати 8-10 новин/гайдів з запит-орієнтованими заголовками (EN/RU).
4. Побудувати dashboard контролю:
- Indexing, Impressions, Clicks, CTR, AI-referral mentions (де доступно).
5. Ретроспектива: що дало приріст, що прибрати в наступному спринті.

Очікуваний ефект:
- Перші згадки/цитування в AI-відповідях (не миттєво, але закладається база).
- Приріст показів і coverage у пошуку.

---

## 6) KPI на 30 днів

Primary KPI:
- Indexed money pages (EN/RU properties+areas+developers+news): +100% до baseline 22.04.

Secondary KPI:
- `Discovered, currently not indexed`: знизити мінімум на 35-50%.
- `Blocked by noindex` для sitemap URL: знизити до 0 нових випадків.
- Impressions у GSC для money-segment: +60-100%.
- CTR: +15-25% через оновлені title/description на пріоритетних сторінках.

AI KPI (операційний):
- 30+ сторінок з AI-friendly factual blocks.
- 100% пріоритетних сторінок мають валідну структуровану entity/schema логіку.
- 0 конфліктів canonical/hreflang у вибірці топ-50 URL.

---

## 7) Пріоритети по impact (що робити першим)

1. Fix sitemap duplication і policy по `/landing/*`.
2. Fix canonical/alternates per-page.
3. Domain consistency (www/non-www).
4. Breadcrumb/schema clean-up.
5. Контентне посилення топ-URL.
6. AI visibility layer.

---

## 8) Backlog для підрядника (6-8 годин технічного ядра)

Терміново (P0):
1. Видалити або умовно виключити `/landing/*` з sitemap.
2. Винести per-page canonical/alternates в page-level metadata.
3. Уніфікувати `metadataBase` на canonical host.

Високий (P1):
4. Breadcrumb "Unnamed item" fix.
5. Нормалізація фільтр-параметрів без помилкових 404.
6. Шаблонний QA чек canonical/hreflang/indexability.

Середній (P2):
7. Person/Author schema rollout.
8. FAQ/HowTo блоки для AI retrievability.

---

## 9) Контрольний чек-лист приймання (після впровадження)

Технічний:
- [ ] У sitemap відсутні неканонічні дублікати.
- [ ] У кожного шаблону сторінки self-canonical на фактичний URL.
- [ ] Hreflang працює парно EN<->RU + x-default.
- [ ] Нема розсинхрону www/non-www у metadata/sitemap/robots.

GSC:
- [ ] Пересабмічений sitemap.
- [ ] Validate Fix запущено для ключових причин.
- [ ] Є позитивний тренд coverage за 7-14 днів.

Бізнес:
- [ ] Зростає кількість індексованих money pages.
- [ ] Зростають impressions/clicks на пріоритетних кластерах.

---

## 10) Ризики і реалістичні очікування

- Навіть після ідеальних фіксів Google оновлює coverage із лагом 3-21 день.
- x2 за 30 днів реально для сегменту пріоритетних сторінок, не для всього індексу сайту.
- AI видимість має більшу інерцію, але технічні й контентні передумови можна закласти за цей місяць.

---

## 11) Що робимо прямо сьогодні (Day 0)

1. Затвердити policy для `/landing/*` (рекомендовано: не індексувати, прибрати із sitemap).
2. Відкрити 3 задачі в розробку:
- Sitemap dedupe
- Canonical/hreflang refactor
- metadataBase/domain consistency
3. Після деплою одразу:
- URL Inspection для 4-6 контрольних URL.
- Resubmit sitemap у GSC.

Це дасть найшвидший технічний ефект і створить базу для контентного та AI-зростання в наступні 3 тижні.
