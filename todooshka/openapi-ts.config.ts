import { defineConfig } from '@hey-api/openapi-ts';

// Генерирует типы и zod-схемы из контракта бэкенда.
// Наружу они отдаются только через src/shared/api/index.ts — импортировать
// из *.gen.ts напрямую нельзя.
export default defineConfig({
  // ./ обязателен: путь без него разбирается как shorthand реестра Hey API
  input: './contracts/tasks.v1.yaml',
  // lint/format здесь намеренно не включены: постобработка запускает eslint проекта
  // на сгенерированном коде и падает на его flat-конфиге. Папка в globalIgnores.
  output: 'src/shared/api/tasks',
  plugins: [
    { name: '@hey-api/typescript' },
    {
      name: 'zod',
      // createTaskRequestSchema вместо zCreateTaskRequest — иначе схема
      // визуально неотличима от одноимённого типа из types.gen.ts
      definitions: { case: 'camelCase', name: '{{name}}Schema' },
      // операционные алиасы (zCreateTaskBody и т.п.) не нужны: те же схемы
      // уже доступны под доменными именами из definitions
      requests: false,
      responses: false,
    },
  ],
});
