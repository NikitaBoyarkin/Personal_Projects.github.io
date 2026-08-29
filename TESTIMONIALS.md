# Testimonials — how to collect and publish

Публикация отзывов на главной — двухшаговая: сначала просишь рекомендацию,
потом добавляешь её объект в `src/lib/testimonials.ts`. Блок на главной
ничего не рендерит, пока список пуст.

## Шаг 1 — как попросить

Совет: не «можно рекомендацию?», а конкретика по сценарию, где коллега видел
твой результат. Отправляй в Telegram/почту или как запрос LinkedIn-рекомендации
(там поля Name → Relationship → Position → Story как раз заточены под это).
Рекомендуется 2–3 штуки: коллега-аналитик, продуктовый менеджер, инженер/тимлид
— разные ракурсы.

### Шаблон (RU)

> Привет, [имя]! Собираю отзывы для страницы-портфолио — хочу показать, как
> работаю в паре, а не только что посчитать.
> Если у тебя есть 10 минут: ответь на 2 вопроса (можно по пунктам, как удобно):
> 1. Работали ли мы над [проект/задача], где ты видел меня «в деле»? Что я
>    сделал и что из этого вышло?
> 2. Что для тебя было важно во взаимодействии со мной (скорость, глубина,
>    продакшн-мышление, комфорт в коммуникации)?
> Добавлю твой отзыв со ссылкой на твой профиль — укажи, как тебя подписать
> (имя, должность, компания).

### Template (EN)

> Hi [name]! I'm collecting short recommendations for my portfolio site to show
> how I work in a team, not only what I can compute.
> If you have ~10 minutes, could you answer two quick questions (bullet points
> are fine):
> 1. We worked together on [project/task] — what did I actually do, and what
>    came out of it?
> 2. What mattered to you about working with me (speed, depth, product thinking,
>    ease of communication)?
> I'd list your quote with a link to your profile — how should I sign you
> (name, role, company)?

## Шаг 2 — как добавить

Открой `src/lib/testimonials.ts` и допиши объект в массив `testimonials`:

```ts
{ quote: "…цитата автора, дословно…", name: "Имя Фамилия", role: "Продуктовый аналитик", company: "…", url: "https://linkedin.com/in/…" }
```

Правила:
- Цитата дословно — не редактируй формулировку автора.
- `url` — открытый профиль (LinkedIn/GitHub), если автор согласен.
- Порядок массива = порядок на странице: первым самый сильный отзыв.
- Отзыв нельзя выдумывать — блок показывает только реальные цитаты.
