import { createErrorResponse, createSuccessResponse } from '../../../utils/responseFormatter.js';
import { TodosRepository } from '../repository/todos.repository.js';
import { TodosService } from '../service/todos.service.js';
import {
  validateCreateGroupPayload,
  validateCreateTodoPayload,
  validateGetTodosCountByMonthQuery,
  validateGetTodosQuery,
  validateUpdateTodoPayload,
} from '../validator/todos.validator.js';

const todosService = new TodosService(new TodosRepository());

export const handlerTodos = async (req, res) => {
  try {
    const { date } = req.query;
    const validation = validateGetTodosQuery(date);
    if (!validation.valid) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', validation.message);
      return res.status(400).json(errorResponse);
    }
    const todos = await todosService.getTodos(date);
    const successResponse = createSuccessResponse(todos);
    res.status(200).json(successResponse);
  } catch (error) {
    const errorCode = error.name === 'CustomError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const statusCode = error.statusCode || 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};

export const handlerTodosCountByMonth = async (req, res) => {
  try {
    const { month } = req.query;
    const validation = validateGetTodosCountByMonthQuery(month);
    if (!validation.valid) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', validation.message);
      return res.status(400).json(errorResponse);
    }

    const counts = await todosService.getTodosCountByMonth(month);
    const successResponse = createSuccessResponse(counts);
    res.status(200).json(successResponse);
  } catch (error) {
    const errorCode = error.message.includes('Invalid') ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const statusCode = errorCode === 'VALIDATION_ERROR' ? 400 : 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};

export const createTodoHandler = async (req, res) => {
  try {
    const validation = validateCreateTodoPayload(req.body);
    if (!validation.valid) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', validation.message);
      return res.status(400).json(errorResponse);
    }

    const { categoryName, todoDate, content } = req.body;

    const newTodo = await todosService.createTodo(categoryName, todoDate, content);
    const successResponse = createSuccessResponse(newTodo);
    res.status(201).json(successResponse);
  } catch (error) {
    const errorCode = error.message.includes('Invalid') ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const statusCode = errorCode === 'VALIDATION_ERROR' ? 400 : 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};

export const updateTodoHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', 'todosId (path parameter) is required');
      return res.status(400).json(errorResponse);
    }

    const validation = validateUpdateTodoPayload(updates);
    if (!validation.valid) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', validation.message);
      return res.status(400).json(errorResponse);
    }

    const todoId = parseInt(id, 10);
    if (Number.isNaN(todoId)) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', 'todosId must be a number');
      return res.status(400).json(errorResponse);
    }

    const updatedTodo = await todosService.updateTodo(todoId, updates);
    const successResponse = createSuccessResponse(updatedTodo);
    res.status(200).json(successResponse);
  } catch (error) {
    const errorCode = error.message.includes('not found')
      ? 'NOT_FOUND'
      : error.message.includes('Invalid') || error.message.includes('No fields')
        ? 'VALIDATION_ERROR'
        : 'INTERNAL_ERROR';
    const statusCode = errorCode === 'NOT_FOUND' ? 404 : errorCode === 'VALIDATION_ERROR' ? 400 : 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};

export const createTodoGroupHandler = async (req, res) => {
  try {
    const validation = validateCreateGroupPayload(req.body);
    if (!validation.valid) {
      const errorResponse = createErrorResponse('VALIDATION_ERROR', validation.message);
      return res.status(400).json(errorResponse);
    }

    const { categoryName, todoDate } = req.body;

    const newGroup = await todosService.createTodoGroup(categoryName, todoDate);
    const successResponse = createSuccessResponse(newGroup);
    res.status(201).json(successResponse);
  } catch (error) {
    const errorCode = error.message.includes('Invalid') ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const statusCode = errorCode === 'VALIDATION_ERROR' ? 400 : 500;
    const errorResponse = createErrorResponse(errorCode, error.message);
    res.status(statusCode).json(errorResponse);
  }
};
