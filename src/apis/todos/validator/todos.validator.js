const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

const isValidDate = (value) => DATE_REGEX.test(value);
const isValidMonth = (value) => {
  if (!MONTH_REGEX.test(value)) return false;
  const [, monthStr] = value.split('-');
  const month = Number(monthStr);
  return month >= 1 && month <= 12;
};

export const validateGetTodosQuery = (date) => {
  if (!date) return { valid: true };
  if (!isValidDate(date)) return { valid: false, message: 'date must be YYYY-MM-DD' };
  return { valid: true };
};

export const validateCreateTodoPayload = (body) => {
  const { categoryName, todoDate, content } = body || {};
  if (!categoryName || !todoDate || !content) {
    return { valid: false, message: 'categoryName, todoDate and content are required' };
  }
  if (!isValidDate(todoDate)) {
    return { valid: false, message: 'todoDate must be YYYY-MM-DD' };
  }
  return { valid: true };
};

export const validateCreateGroupPayload = (body) => {
  const { categoryName, todoDate } = body || {};
  if (!categoryName || !todoDate) {
    return { valid: false, message: 'categoryName and todoDate are required' };
  }
  if (!isValidDate(todoDate)) {
    return { valid: false, message: 'todoDate must be YYYY-MM-DD' };
  }
  return { valid: true };
};

export const validateUpdateTodoPayload = (body) => {
  const { content, isCompleted } = body || {};
  const hasContent = content !== undefined;
  const hasCompleted = isCompleted !== undefined;

  if (!hasContent && !hasCompleted) {
    return { valid: false, message: 'At least one of content or isCompleted is required' };
  }
  return { valid: true };
};

export const validateGetTodosCountByMonthQuery = (month) => {
  if (!month) return { valid: false, message: 'month is required' };
  if (!isValidMonth(month)) return { valid: false, message: 'month must be YYYY-MM' };
  return { valid: true };
};
