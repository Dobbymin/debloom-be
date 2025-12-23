import { handlerTodos } from '../apis/todos/controller/todos.controller.js';

export const router = (app) => {
  app.get('/api/todos', handlerTodos);
};
