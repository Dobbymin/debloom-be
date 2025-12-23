import { TODO_MOCK } from '../../../mocks/todos.mock.js';

export class TodosRepository {
  async findAll() {
    return TODO_MOCK;
  }
}
