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

// Helper function to extract error message from unknown error
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  const apiError = error as ApiError;
  if (apiError?.data?.message) {
    return apiError.data.message;
  }

  const axiosError = error as AxiosError;
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return 'An unexpected error occurred';
}
