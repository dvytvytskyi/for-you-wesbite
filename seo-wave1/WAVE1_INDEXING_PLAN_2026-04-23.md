# Wave 1 SEO Indexing Plan (23.04.2026)

## 1) Що таке "якісні" URL для першої хвилі

URL вважається якісним для індексації, якщо проходить всі перевірки:

1. HTTP 200, без редірект-ланцюжка.
2. Canonical вказує на self-URL (або парний RU URL для локалі RU).
3. Є парний hreflang EN/RU + x-default.
4. Немає noindex.
5. Є базовий контентний мінімум:
   - Property: ціна/діапазон ціни, локація, фото, опис, schema.
   - Area: опис району, інфраструктура, пов'язані пропозиції.
   - Developer: опис + список проектів.
   - News: змістовний матеріал (не короткий шумний slug).
6. URL присутній у sitemap або має стабільний внутрішній лінк з індексованих сторінок.

## 2) Перша хвиля: цільовий обсяг

- Properties Detail: 1200 off-plan EN + 1200 off-plan RU
- Areas Detail: 43 EN + 43 RU
- News: 35 EN + 35 RU (попередній quality-фільтр)
- Core list pages: 6 EN + 6 RU

Разом у Wave 1 зараз готово: 2568 URL.

## 3) Готові списки URL (вже згенеровано)

- Core EN: seo-wave1/core-pages-en.txt
- Core RU: seo-wave1/core-pages-ru.txt
- Areas EN: seo-wave1/areas-en.txt
- Areas RU: seo-wave1/areas-ru.txt
- News EN (quality): seo-wave1/news-en-quality.txt
- News RU (quality): seo-wave1/news-ru-quality.txt
- Properties EN (wave1, off-plan only): seo-wave1/properties-en-wave1-1200.txt
- Properties RU (wave1, off-plan only): seo-wave1/properties-ru-wave1-1200.txt

Property scope для поточної хвилі:
- Secondary properties тимчасово виключені з Wave 1.
- Поточна property-вибірка зібрана через `propertyType=off-plan` з `https://foryou-realestate.com/api/proxy/public/properties`.
- Доступний pool на момент генерації: 1530 off-plan URL, у файл взято перші 1200 EN + 1200 RU.

## 4) Developers: поза scope поточної Wave 1

Поточне рішення:
- Developer list pages і detail pages не індексуємо в цій хвилі.
- Причина: ця група поки не проходить поточний пріоритетний відбір для Wave 1.

Що робити пізніше у Wave 1.1 або окремій хвилі:
1. Повернутись до developers після завершення основної хвилі.
2. За потреби добрати top developer detail URL окремим файлом.

## 5) Порядок викатки в GSC

1. Тримати один sitemap index: https://foryou-realestate.com/sitemap.xml
2. Validate Fix для "Discovered, currently not indexed".
3. Моніторити 7-10 днів:
   - Indexed pages delta
   - Discovered not indexed delta
   - Impressions/day delta
4. Якщо індексація нової хвилі >= 35-45%, відкривати Wave 2.

## 6) Короткий quality-stoplist (не пускати у хвилю)

- Landing URL та будь-які дублікати canonical сторінок.
- News зі slug-"шумом" (надто короткі/без сенсу).
- Filter/parameter URL, які дають 404 або soft-404.
