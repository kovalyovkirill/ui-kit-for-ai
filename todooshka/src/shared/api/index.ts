// Публичный API слоя. Всё, что лежит в tasks/*.gen.ts, — артефакт кодогенерации;
// наружу отдаётся только перечисленное здесь. Импорт из `*.gen` в обход этого
// файла запрещён: он привязывает код к раскладке генератора.
//
// Регенерация: `npm run api` (проверка расхождения — `npm run api:check`).

export {
  createTaskRequestSchema,
  prioritySchema,
  validationErrorSchema,
} from './tasks/zod.gen';

export type {
  CreateTaskData,
  CreateTaskRequest,
  FieldError,
  Priority,
  Task,
} from './tasks/types.gen';
