# UI Kit for AI — Monorepo

Монорепозиторий, объединяющий два workspace-пакета: переиспользуемую дизайн-систему **`ui-kit`** и приложение **`todooshka`**, которое её потребляет.

Управление пакетами выполняется через **npm workspaces**. В корне настроены:
- **husky** — git-хуки;
- **@commitlint/cli** + **config-conventional** — проверка сообщений коммитов по Conventional Commits.

## Макет
Точка входа для всего флоу. Чтобы работали генерации на уровне агента, id figma nodes должны совпадать в мапе и в самом макете. [Ссылка на макет](https://www.figma.com/design/mCvUF676Ksuw1umEaJiXn7/AI-kit?m=auto&t=e62Lc8cmWHW939io-1)

### Примечание

Возможны расхождение после копирования макета.

-----------

## Структура

````
.
├── ui-kit/      # Библиотека UI-компонентов (React + TS + Vite + Storybook)
├── todooshka/   # Приложение-потребитель ui-kit (React + TS + Vite)
├── package.json # Корневой манифест с workspaces
└── commitlint.config.cjs
````

### Корневые npm-команды

```bash
npm install         # установка зависимостей всех workspace-ов
npm run prepare     # инициализация husky (выполняется автоматически)
```

Запуск команд внутри конкретного workspace:

```bash
npm run <script> --workspace=ui-kit
npm run <script> --workspace=todooshka
```

---

## 📦 ui-kit (`@monorepo/ui-kit`)

Библиотека дизайн-системы. Сборка в ESM + CJS с генерацией типов, документация компонентов в Storybook, дизайн-токены через **Style Dictionary** (с пресетом `@tokens-studio/sd-transforms`).

**Текущие компоненты:** `Avatar`, `Badge`, `Button`, `ButtonGroup`, `Checkbox`, `Input`, `Typography`.

Дополнительно содержит:
- `src/styles/` — глобальные стили и токены;

Экспортируется как:
- `@monorepo/ui-kit` — компоненты;
- `@monorepo/ui-kit/styles` — основные стили;
- `@monorepo/ui-kit/style` — отдельная сборка стилей.

### Ключевые npm-команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Сборка библиотеки в watch-режиме (`vite build --watch`) |
| `npm run build` | Production-сборка + генерация `.d.ts` |
| `npm run storybook` | Запуск Storybook на `http://localhost:6006` |
| `npm run build-storybook` | Сборка статической документации Storybook |
| `npm run build:tokens` | Генерация дизайн-токенов через Style Dictionary |
| `npm run lint` | Проверка кода ESLint (`src/**/*.{ts,tsx}`) |
| `npm run format` | Форматирование Prettier |

Запуск из корня:

```bash
npm run dev --workspace=ui-kit
npm run storybook --workspace=ui-kit
npm run build --workspace=ui-kit
```

---

## ✅ todooshka

Клиентское React-приложение на Vite, потребляющее `@monorepo/ui-kit` напрямую через workspace-зависимость (`"@monorepo/ui-kit": "*"`).

Структура исходников:
- `src/main.tsx`, `src/App.tsx` — точка входа;
- `src/pages/TodoList/` — страница списка задач;
- `src/assets/`, `public/` — статические ресурсы (иконки, favicon);

### Порядок запуска

Так как `todooshka` потребляет собранную версию `ui-kit` из `ui-kit/dist`, перед первым стартом нужно:

1. Собрать библиотеку из `ui-kit`:
   ```bash
   npm run build --workspace=ui-kit
   ```
2. Запустить приложение из `todooshka`:
   ```bash
   npm run dev --workspace=todooshka
   ```

### Ключевые npm-команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Type-check (`tsc -b`) + production-сборка |
| `npm run preview` | Локальный предпросмотр собранного билда |
| `npm run lint` | Проверка кода ESLint |

Запуск из корня:

```bash
npm run dev --workspace=todooshka
npm run build --workspace=todooshka
npm run preview --workspace=todooshka
```

---

## Типичный сценарий разработки

1. Установить зависимости в корне: `npm install`.
2. В одном терминале запустить ui-kit в watch-режиме:
   ```bash
   npm run storybook --workspace=ui-kit
   ```
3. В другом — приложение:
   ```bash
   npm run dev --workspace=todooshka
   ```
4. Изменения в `ui-kit/dist` автоматически подхватываются `todooshka` через workspaces.

## Эксперименты

В репозитории находятся три ветки, которые отвечают за один из видов AI экспериментов.

1. [Эксперимент Ева](https://github.com/kovalyovkirill/ui-kit-for-ai/tree/experiment-1) — промт на уровне проекта со структурой
2. [Эксперимент Руфь](https://github.com/kovalyovkirill/ui-kit-for-ai/tree/experiment-2) — маппинг свойств React и Figma в отдельном md файле. Промт для генерации страницы.
3. [Эксперимент Лия](https://github.com/kovalyovkirill/ui-kit-for-ai/tree/experiment-3) — маппинг свойств на уровне ui-kit настройки в CLAUDE.md

Переходите в нужную ветку и проверяйте результат, предварительно удалив страницу (папка `pages`). 


## Соглашения о коммитах

Используется **Conventional Commits**. Сообщения проверя
