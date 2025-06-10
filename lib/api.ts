import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  mfa_enabled: boolean;
  vpn_enabled: boolean;
}

export interface Client {
  id: number;
  client_id: string;
  hostname: string;
  status: string;
  os_version?: string;
  ip_address?: string;
  vpn_connected: boolean;
  last_heartbeat?: string;
  client_type: string;
  location?: string;
  created_at: string;
}

export interface Task {
  id: number;
  task_id: string;
  name: string;
  description?: string;
  task_type: string;
  command: string;
  status: string;
  client_id: number;
  created_by_user_id: number;
  created_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  exit_code?: number;
}

export interface AuditLog {
  id: number;
  action: string;
  description: string;
  severity: string;
  user_id?: number;
  client_id?: number;
  task_id?: string;
  ip_address?: string;
  timestamp: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface Statistics {
  total_users?: number;
  active_users?: number;
  total_clients?: number;
  online_clients?: number;
  total_tasks?: number;
  pending_tasks?: number;
  running_tasks?: number;
  completed_tasks?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from cookies on initialization
    this.loadToken();

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        
        // Show error toast
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        toast.error(message);
        
        return Promise.reject(error);
      }
    );
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = Cookies.get('access_token') || null;
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      Cookies.set('access_token', token, { expires: 1 }); // 1 day
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      Cookies.remove('access_token');
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', credentials);
    this.saveToken(response.data.access_token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.client.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }

  // Users
  async getUsers(page = 1, perPage = 50, search?: string): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await this.client.get<{users: User[], total: number, page: number, per_page: number}>(`/users/?${params}`);
    
    return {
      data: response.data.users,
      total: response.data.total,
      page: response.data.page,
      per_page: response.data.per_page,
    };
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    const response = await this.client.post<User>('/users/', userData);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  async getUserStats(): Promise<Statistics> {
    const response = await this.client.get<Statistics>('/users/stats/summary');
    return response.data;
  }

  // Clients
  async getClients(page = 1, perPage = 50, search?: string, status?: string): Promise<ApiResponse<Client[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await this.client.get<{clients: Client[], total: number, page: number, per_page: number}>(`/clients/?${params}`);
    
    return {
      data: response.data.clients,
      total: response.data.total,
      page: response.data.page,
      per_page: response.data.per_page,
    };
  }

  async getClient(id: number): Promise<Client> {
    const response = await this.client.get<Client>(`/clients/${id}`);
    return response.data;
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<void> {
    await this.client.put(`/clients/${id}`, clientData);
  }

  async getClientStats(): Promise<Statistics> {
    const response = await this.client.get<Statistics>('/clients/stats/summary');
    return response.data;
  }

  // Tasks
  async getTasks(page = 1, perPage = 50, status?: string, clientId?: number): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (status) params.append('status', status);
    if (clientId) params.append('client_id', clientId.toString());

    const response = await this.client.get<{tasks: Task[], total: number, page: number, per_page: number}>(`/tasks/?${params}`);
    
    return {
      data: response.data.tasks,
      total: response.data.total,
      page: response.data.page,
      per_page: response.data.per_page,
    };
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await this.client.post<Task>('/tasks/', taskData);
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.client.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async cancelTask(id: number): Promise<void> {
    await this.client.post(`/tasks/${id}/cancel`);
  }

  async getTaskStats(): Promise<Statistics> {
    const response = await this.client.get<Statistics>('/tasks/stats/summary');
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(page = 1, perPage = 100, filters?: {
    action?: string;
    severity?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<ApiResponse<AuditLog[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await this.client.get<{logs: AuditLog[], total: number, page: number, per_page: number}>(`/audit/?${params}`);
    
    return {
      data: response.data.logs,
      total: response.data.total,
      page: response.data.page,
      per_page: response.data.per_page,
    };
  }

  async getAuditStats(): Promise<any> {
    const response = await this.client.get('/audit/stats/summary');
    return response.data;
  }

  async getSecurityAlerts(): Promise<any> {
    const response = await this.client.get('/audit/security/alerts');
    return response.data;
  }

  async exportAuditLogs(filters?: any): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }

    const response = await this.client.get(`/audit/export/csv?${params}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // Health
  async getHealth(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
