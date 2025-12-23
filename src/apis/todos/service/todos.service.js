export class TodosService {
  constructor(todosRepository) {
    this.todosRepository = todosRepository;
  }

  async getTodos() {
    const todos = await this.todosRepository.findAll();
    return todos;
  }
}
