# 🏗️ Архітектура проекту

## Структура системи

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL BACKEND                        │
│  https://admin.foryou-realestate.com/api                      │
│  - Express.js 5.1 • TypeScript • TypeORM • PostgreSQL        │
│  - Обслуговує:                                                │
│    • Admin Panel (адмін-панель)                               │
│    • Public API (для веб-сайту та мобільного додатку)        │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTP API
                          │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐                ┌──────────────────┐
│   WEBSITE        │                │  MOBILE APP      │
│   (Next.js)      │                │  (React Native)  │
│   Frontend Only  │                │  Frontend Only   │
│                  │                │                  │
│  - Викликає API  │                │  - Викликає API  │
│  - Немає бекенду │                │  - Немає бекенду │
└──────────────────┘                └──────────────────┘
```

## 📦 Компоненти

### 1. Admin Panel Backend (Один бекенд для всього)
- **URL:** `https://admin.foryou-realestate.com/api`
- **Технології:** Express.js 5.1 • Node.js • TypeScript • TypeORM • PostgreSQL
- **Ролі:**
  - Обслуговує адмін-панель (CRUD операції)
  - Надає публічний API для веб-сайту
  - Надає публічний API для мобільного додатку
  - Синхронізація даних між всіма клієнтами

### 2. Website (Frontend Only)
- **Технології:** Next.js 16 • TypeScript • Tailwind CSS
- **Роль:** Тільки frontend, робить HTTP запити до API
- **Немає:** Власного бекенду, бази даних, серверної логіки

### 3. Mobile App (Frontend Only)
- **Технології:** React Native (ймовірно)
- **Роль:** Тільки frontend, робить HTTP запити до API
- **Немає:** Власного бекенду, бази даних, серверної логіки

## 🔄 Потік даних

```
Website/Mobile App
    │
    │ HTTP Request (GET /api/properties)
    ▼
Admin Panel Backend
    │
    │ Query Database
    ▼
PostgreSQL Database
    │
    │ Return Data
    ▼
Admin Panel Backend
    │
    │ HTTP Response (JSON)
    ▼
Website/Mobile App
```

## ✅ Висновок

**Бекенд один - це Admin Panel Backend!**

Всі покращення (pagination, refresh token, rate limiting, кешування) потрібно додавати в бекенд адмінки, а не створювати новий бекенд для веб-сайту.

Веб-сайт - це тільки frontend, який використовує API адмінки.

