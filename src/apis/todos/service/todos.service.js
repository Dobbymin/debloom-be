export class TodosService {
  constructor(todosRepository) {
    this.todosRepository = todosRepository;
  }

  async getTodos(date) {
    if (date) {
      const todos = await this.todosRepository.findByDate(date);
      return todos;
    }
    const todos = await this.todosRepository.findAll();
    return todos;
  }

  async createTodo(categoryName, todoDate, content) {
    if (!categoryName || !todoDate || !content) {
      throw new Error('categoryName, todoDate and content are required');
    }

    const newTodo = await this.todosRepository.createTodo(categoryName, todoDate, content);
    return newTodo;
  }

  async updateTodo(todosId, updates) {
    if (!todosId) {
      throw new Error('todosId is required');
    }

    const updatedTodo = await this.todosRepository.updateTodo(todosId, updates);
    return updatedTodo;
  }

  async createTodoGroup(categoryName, todoDate) {
    if (!categoryName || !todoDate) {
      throw new Error('categoryName and todoDate are required');
    }

    const newGroup = await this.todosRepository.createTodoGroup(categoryName, todoDate);
    return newGroup;
  }

  async getTodosCountByMonth(month) {
    if (!month) {
      throw new Error('month is required');
    }

    return this.todosRepository.countTodosByMonth(month);
  }
}
