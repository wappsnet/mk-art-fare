// Common error types for API responses and error handling

export interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

export interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

// Type guards
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('data' in error || 'message' in error)
  );
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

// Helper function to extract error message from unknown error
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (isApiError(error)) {
    if (error.data?.message) {
      return error.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }

  return 'An unexpected error occurred';
}
