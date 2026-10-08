import AppError from '../utils/appError.js';
import isValidId from '../utils/isValidId.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
      .join('. ');
    return next(new AppError(`Invalid input data. ${message}`, 400));
  }

  req.body = result.data;
  next();
};

export const checkId = (req, res, next, id) => {
  if (!isValidId(id)) {
    return next(new AppError(`Invalid id: ${id}`, 400));
  }
  next();
};
