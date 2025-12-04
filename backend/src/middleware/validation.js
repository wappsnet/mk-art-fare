import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = {};
    errors.array().forEach((err) => {
      if (err?.path) {
        if (!extractedErrors[err.path]) {
          extractedErrors[err.path] = [];
        }
        extractedErrors[err.path].push(err.msg);
      }
    });

    sendError(res, JSON.stringify(extractedErrors), 400);
  };
};
