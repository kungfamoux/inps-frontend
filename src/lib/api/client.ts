import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ApiErrorBody {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: ApiErrorBody['errors'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Debug logging for API requests
  console.log(`🌐 [API Client] ${config.method?.toUpperCase()} Request:`, {
    url: config.url,
    method: config.method,
    params: config.params,
    data: config.data,
    headers: config.headers,
  });

  return config;
});

client.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    console.log(
      `✅ [API Client] ${response.config.method?.toUpperCase()} Response:`,
      {
        url: response.config.url,
        status: response.status,
        data: response.data,
      },
    );
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    // Debug logging for error responses
    console.error(
      `❌ [API Client] ${error.config?.method?.toUpperCase()} Error:`,
      {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      },
    );

    // Log error context for better debugging
    if (import.meta.env.DEV) {
      console.group('API Error Details');
      console.error('Request:', error.config);
      console.error('Response:', error.response);
      console.error('Error:', error);
      console.groupEnd();
    }

    const request = error.config as RetryableRequest | undefined;

    if (error.response?.status === 401 && request && !request._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user_data');
      const userType = userData ? JSON.parse(userData).userType : null;

      if (refreshToken) {
        request._retry = true;
        try {
          // Use appropriate refresh endpoint based on user type
          const endpoint =
            userType === 'parent'
              ? '/api/parent/refresh-token'
              : '/api/staff/refresh-token';
          const response = await axios.post<{
            token: string;
            refreshToken?: string;
          }>(`${API_URL}${endpoint}`, { refreshToken });
          localStorage.setItem('auth_token', response.data.token);
          if (response.data.refreshToken)
            localStorage.setItem('refresh_token', response.data.refreshToken);
          request.headers.Authorization = `Bearer ${response.data.token}`;
          return client(request);
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new Event('auth:expired'));
        }
      } else {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }

    const status = error.response?.status;
    const fallback =
      status === 403
        ? 'You do not have permission to perform this action.'
        : status === 404
          ? 'The requested record could not be found.'
          : status && status >= 500
            ? 'The server could not complete your request. Please try again.'
            : 'Unable to complete your request.';

    return Promise.reject(
      new ApiError(
        error.response?.data?.message ?? fallback,
        status,
        error.response?.data?.errors,
      ),
    );
  },
);

export const apiClient = {
  get: <T>(url: string, params?: unknown) => {
    console.log(`📡 [API Client] GET request initiated:`, { url, params });
    return client.get<T>(url, { params }).then((response) => {
      console.log(`📡 [API Client] GET request completed:`, {
        url,
        status: response.status,
      });
      return response.data;
    });
  },
  post: <T>(url: string, data?: unknown) => {
    console.log(`📡 [API Client] POST request initiated:`, { url, data });
    return client.post<T>(url, data).then((response) => {
      console.log(`📡 [API Client] POST request completed:`, {
        url,
        status: response.status,
      });
      return response.data;
    });
  },
  put: <T>(url: string, data?: unknown) => {
    console.log(`📡 [API Client] PUT request initiated:`, { url, data });
    return client.put<T>(url, data).then((response) => {
      console.log(`📡 [API Client] PUT request completed:`, {
        url,
        status: response.status,
      });
      return response.data;
    });
  },
  patch: <T>(url: string, data?: unknown) => {
    console.log(`📡 [API Client] PATCH request initiated:`, { url, data });
    return client.patch<T>(url, data).then((response) => {
      console.log(`📡 [API Client] PATCH request completed:`, {
        url,
        status: response.status,
      });
      return response.data;
    });
  },
  delete: <T>(url: string, data?: unknown) => {
    console.log(`📡 [API Client] DELETE request initiated:`, { url, data });
    return client.delete<T>(url, { data }).then((response) => {
      console.log(`📡 [API Client] DELETE request completed:`, {
        url,
        status: response.status,
      });
      return response.data;
    });
  },
  upload: <T>(
    url: string,
    formData: FormData,
    onProgress?: (percentage: number) => void,
  ) => {
    console.log(`📡 [API Client] UPLOAD request initiated:`, { url });
    return client
      .post<T>(url, formData, {
        headers: { 'Content-Type': undefined },
        onUploadProgress: (event) => {
          if (event.total && onProgress)
            onProgress(Math.round((event.loaded / event.total) * 100));
        },
      })
      .then((response) => {
        console.log(`📡 [API Client] UPLOAD request completed:`, {
          url,
          status: response.status,
        });
        return response.data;
      });
  },
};
