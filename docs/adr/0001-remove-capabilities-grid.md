# ADR-0001: Удаление CapabilitiesGrid с главной в пользу featured project + bento

13.09.2026 главная переведена на editorial hero (dataviz-панель + карточка избранного кейса) и bento-раскладку; в ходе редизайна с главной удалён CapabilitiesGrid (deliverable v1 Phase 1, REQ-014) и Testimonials (v2/v3, REQ-041). Решение принято осознанно: capabilities-грид дублировал сигнал, который теперь несут featured project card, bento-стек и доска проектов, и визуально перегружал главную.

Статус: accepted

## Considered Options

- **Оставить грид + bento:** грид дублировал карточки проектов (та же «concrete»-информация в двух местах), главная перегружалась двумя сильными поверхностями сразу.
- **Сокращённый грид:** оставалась бы дублирующая поверхность без ясной дополнительной функции.

## Consequences

- Capabilities-сигнал («что умею конкретно») теперь живёт в featured project card, стек-чипах bento и доске проектов `/projects/`.
- Вовлечение новых поверхностей трекается: `featured_project`, `bento_stack`, `bento_graph`, `bento_notes`.
- Возврат грида без нового замысла запрещён (см. PRD v4.0 Out of Scope).