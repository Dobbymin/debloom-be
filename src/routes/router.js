import {
  createTodoGroupHandler,
  createTodoHandler,
  handlerTodos,
  handlerTodosCountByMonth,
  updateTodoHandler,
} from '../apis/todos/controller/todos.controller.js';

export const router = (app) => {
  // GET: 모든 todos 조회
  app.get('/api/todos', handlerTodos);

  // GET: 월별 날짜별 todo 갯수 조회
  app.get('/api/todos/monthly', handlerTodosCountByMonth);

  // POST: 새로운 todo 추가
  app.post('/api/todos', createTodoHandler);

  // PUT: 기존 todo 수정
  app.put('/api/todos/:id', updateTodoHandler);

  // POST: 새로운 todo_group(날짜별 카테고리) 생성
  app.post('/api/todos/groups', createTodoGroupHandler);
};
