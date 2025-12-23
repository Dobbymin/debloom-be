import { createErrorResponse, createSuccessResponse } from '../../../utils/responseFormatter.js';
import { TodosRepository } from '../repository/todos.repository.js';
import { TodosService } from '../service/todos.service.js';

const todosService = new TodosService(new TodosRepository());

export const handlerTodos = async (req, res) => {
  try {
    const todos = await todosService.getTodos();
    const successResponse = createSuccessResponse(todos);
    res.status(200).json(successResponse);
  } catch (error) {
    const errorCode = error.name === 'CustomError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const statusCode = error.statusCode || 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};
