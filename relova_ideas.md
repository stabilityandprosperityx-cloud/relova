## Сессия 9 апреля 2026 — Guided Execution System

### Что сделано
- useRelocationCase хук поднят в корень Dashboard — все вкладки синхронизированы
- Overview перестроен по inverted pyramid — action first
- Phase logic исправлена — 0 шагов = Phase 1
- ChatActionButtons — русский язык, чёткие кнопки, навигация в Checklist
- Автоинициализация чеклиста при онбординге
- country поле добавлено в relocation_steps и visa_documents — изоляция данных по стране
- RLS политика relocation_steps исправлена — все пользователи могут читать шаги
- useRelocationCase фильтрует по country
- ChatActionButtons передаёт country при добавлении шагов
- Система протестирована — всё работает как единый организм

### Статус
- Overview, Checklist, Documents, AI, Countries — все связаны через единый кейс
- Новый пользователь сразу видит заполненный план после онбординга
- Данные изолированы по стране — никаких перемешиваний
