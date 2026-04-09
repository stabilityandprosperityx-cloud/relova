# Relova — Ideas, Architecture & Roadmap

---

## 🎯 Что такое Relova

**Relova (relova.ai)** — Guided Relocation Execution System. Не набор инструментов, а живой организм который ведёт пользователя от решения переехать до успешного переезда.

**Позиционирование:** AI + tools for relocation → Guided relocation execution system

**Стек:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Supabase + Claude API + Paddle + Vercel

---

## 🏗️ Архитектура

### Ключевые файлы
src/
├── pages/
│   ├── Index.tsx                          # Лендинг
│   ├── Pricing.tsx                        # Monthly/Lifetime toggle
│   ├── Dashboard.tsx                      # Dashboard root — useRelocationCase здесь
│   └── dashboard/
│       ├── DashboardOverviewPage.tsx
│       ├── DashboardAdvisorPage.tsx
│       ├── DashboardPlanPage.tsx
│       ├── DashboardChecklistPage.tsx
│       ├── DashboardDocumentsPage.tsx
│       └── DashboardCountriesPage.tsx
├── components/dashboard/
│   ├── DashboardOverview.tsx              # Mission Control — action first
│   ├── DashboardChat.tsx                  # AI Advisor + buildSystemContext
│   ├── DashboardChecklist.tsx             # Execution Board по фазам
│   ├── DashboardDocuments.tsx             # Case File — документы по стране
│   ├── DashboardPlan.tsx                  # Your Plan + Timeline
│   ├── DashboardCountries.tsx             # 50 стран
│   ├── CostCalculator.tsx                 # 70 стран
│   ├── ChatActionButtons.tsx              # Apply plan из AI чата
│   ├── OnboardingModal.tsx                # 4 шага + автоинициализация плана
│   ├── VisaLetterGenerator.tsx            # Full план
│   ├── FeedbackWidget.tsx                 # Telegram feedback
│   ├── LockedOverlay.tsx                  # Full paywall
│   └── LockedOverlayPro.tsx               # Pro paywall
├── hooks/
│   ├── useRelocationCase.ts               # Единый источник правды — поднят в Dashboard root
│   └── useDashboardContext.tsx            # Context хук для страниц
├── lib/
│   ├── countryMatching.ts                 # countryDatabase 50 стран
│   ├── planGenerator.ts                   # generatePlan + generateChecklist
│   └── filterCountries.ts
supabase/
└── functions/
├── chat/index.ts                      # Claude claude-sonnet-4-20250514, streaming SSE
└── paddle-webhook/index.ts            # Paddle → update plan in Supabase

### Supabase таблицы
- **user_profiles** — citizenship, target_country, visa_type, plan, move_date, monthly_budget, family_status, goal, timeline, questions_used, paddle_customer_id
- **user_steps** — user_id, step_id, status (todo/active/done), completed_at
- **relocation_steps** — visa_type, country, title, description, phase, step_number, estimated_days
- **chat_messages** — user_id, role, content, created_at
- **user_documents** — user_id, document_name, file_url, status, uploaded_at
- **visa_documents** — visa_type, country, document_name, description, is_required
- **visa_cases** — краудсорсинг
- **salary_entries** — краудсорсинг

### Важно: поле country
Таблицы `relocation_steps` и `visa_documents` имеют поле `country` — изоляция данных по стране. Всегда фильтровать по `visa_type + country` вместе, иначе данные разных стран перемешаются.

### RLS политики (важно)
- `relocation_steps` — SELECT: authenticated (все читают), INSERT: authenticated (все вставляют)
- `user_steps` — привязаны к user_id
- `visa_documents` — общая таблица с изоляцией по visa_type + country

---

## 📦 Планы

**Free ($0):** Overview, Countries, Cost Calculator (ограничен), Advisor (3 вопроса)

**Pro ($19/мес или $79 lifetime):** + Unlimited Advisor, Checklist, Timeline, Cost Calculator (70 стран)

**Full ($49/мес или $149 lifetime):** + Your Plan, Documents, Visa Cover Letter Generator

### Paddle Price IDs
Хранятся локально — не в репозитории.

---

## ✅ Что сделано (хронология)

### Март 2026 — Основа
- Dashboard: Overview, My Plan, Checklist, AI Chat, Documents, Countries
- Планы Free/Pro/Full с paywall
- Onboarding 4 шага + матчинг стран
- Legal pages: /terms, /privacy, /refund
- Paddle настроен, payouts активны
- Zoho Mail: info@relova.ai, support@relova.ai
- AI под капотом: Claude (claude-sonnet-4-20250514)

### 7-8 апреля 2026 — Фичи
- Cost Calculator — 70 стран, интерактивный
- Countries вкладка — 50 стран, поиск, фильтры, детальные страницы
- AI Advisor улучшен — знает районы, банки, страховки для 15+ стран
- Visa Cover Letter Generator — Full план, Claude API, PDF
- Lifetime Pricing — toggle Monthly/Lifetime
- Feedback Widget → Telegram бот
- SEO блог — 10 статей на blog.relova.ai
- Supabase RLS — все таблицы защищены

### 9 апреля 2026 — Guided Execution System
- **useRelocationCase хук** — единый источник правды, поднят в Dashboard root
- **Overview → Mission Control** — inverted pyramid (action first, context second)
- **Phase logic** — 0 шагов = Phase 1, не определяется по названию шага
- **ChatActionButtons** — русский язык, чёткие кнопки, навигация в Checklist после apply
- **Автоинициализация чеклиста** при онбординге — пользователь сразу видит план
- **country поле** в relocation_steps и visa_documents — изоляция данных по стране
- **RLS исправлена** — relocation_steps доступны всем authenticated пользователям
- **Система протестирована** — новый пользователь видит полный план сразу после онбординга

---

## 🔴 Задачи в очереди

### Приоритет 1 — Лендинг
- [ ] Обновить Index.tsx — показать "guided execution system" вместо просто "AI tools"
- [ ] Обновить данные по странам — актуальные 2026 цифры
- [ ] Pricing секция с lifetime toggle на лендинге

### Приоритет 2 — Монетизация
- [ ] NOWPayments — крипто оплата (BTC, ETH, USDT)
- [ ] Weekly email digest для Pro пользователей

### Приоритет 3 — Фичи
- [ ] Country Comparison Tool — сравнение 2-3 стран рядом (Full план)
- [ ] Timeline & Milestones — календарь с дедлайнами

### Приоритет 4 — Будущее
- [ ] Specialist Marketplace — после 500+ пользователей
- [ ] Community — форум по странам
- [ ] Visa eligibility checker
- [ ] Языки интерфейса (ru, es, de) — после первых 100 пользователей

---

## 📊 Маркетинг

### Инфлюенсеры (в процессе)
- **Kemoy Martin** (1.3M Instagram) — письмо отправлено
- **Expat Life Ru** (14.5K YouTube) — интересно, цена 35,000 RUB (~$400)
- **Expat Life Ghana** (69K YouTube) — письмо отправлено
- **Marcus Abroad** (5.1K YouTube) — ответил, попросил исправить данные

### Контент готов к публикации
- X (Twitter) тред — личная история переезда + первый $19
- r/buildinpublic — "I got my first $19 last week"
- r/SaaS beta testers — 10 тестировщиков за Free Full доступ

---

## 🔵 Будущие большие фичи

### Specialist Marketplace
- Иммиграционные юристы, налоговые консультанты, визовые агенты
- AI матчинг по профилю пользователя
- Монетизация: листинг $50-200/мес + комиссия 10-15%
- Когда: после 500+ пользователей

### Community
- Форум/чат по странам
- Верифицированные экспаты
- Когда: после Marketplace

---

*Обновлён: 9 апреля 2026*
*Ключи и чувствительные данные хранятся локально — не в репозитории*
