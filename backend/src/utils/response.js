export const sendSuccess = (res, data, message, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, error, statusCode = 400) => {
  const response = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = (res, data, page, limit, total, message) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json(response);
};
