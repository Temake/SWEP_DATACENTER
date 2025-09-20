import axios from 'axios';
import type { AxiosInstance} from 'axios';
 
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Project, 
  ProjectFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
  StudentAccount,
  SupervisorAccount,
  StudentFilters,
  DashboardStats,
  SupervisorDashboardStats,
  StudentWithProject,
  PaginatedResponse,
  Status,
  Tags
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = import.meta.env.API_URL || 'http://localhost:8000'
  private userDataCache: { data: AuthResponse['user']; timestamp: number } | null = null;
  private CACHE_DURATION = 5 * 60 * 1000;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // this.logout();
          // window.location.href = '/login';
          console.log("hred")
          
        }
        return Promise.reject(error);
      }
    );
  }

 
  async login(credentials: LoginRequest): Promise<AuthResponse> {
 
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password)
    const response = await this.api.post<AuthResponse>('/auth/login/', formData, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
  const role = userData.role;
  console.log(userData,role)
    const response = await this.api.post<AuthResponse>(`/auth/register/${role}`, userData);
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.invalidateUserCache();
  }

  getCurrentUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async fetchCurrentUser(forceRefresh: boolean = false, includeRelations: boolean = false): Promise<AuthResponse['user']> {
    // Check if we have cached data and it's still valid
    const now = Date.now();
    if (!forceRefresh && this.userDataCache && (now - this.userDataCache.timestamp) < this.CACHE_DURATION) {
      console.log('Using cached user data');
      return this.userDataCache.data;
    }

    console.log('Fetching fresh user data from server');
    const params = includeRelations ? '?include_relations=true' : '';
    const response = await this.api.get(`/auth/me${params}`);
    
    // Update cache
    this.userDataCache = {
      data: response.data,
      timestamp: now
    };
    
    // Update localStorage with fresh user data
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  invalidateUserCache(): void {
    this.userDataCache = null;
    // Also remove from localStorage to force fresh fetch
    localStorage.removeItem('user');
  }

  // Helper method to specifically invalidate user cache when supervisor changes
  invalidateUserCacheOnSupervisorChange(): void {
    this.invalidateUserCache();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Project endpoints
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.year) params.append('year', filters.year);
      if (filters.status) params.append('status', filters.status);
      if (filters.department) params.append('department', filters.department);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
    }

    const response = await this.api.get<Project[]>(`/projects/all?${params}`);
    // Transform the array response to match the expected PaginatedResponse format
    return {
      items: response.data,
      total: response.data.length,
      page: 1,
      per_page: response.data.length,
      pages: 1
    };
  }

  async getMyProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/projects/');
    return response.data;
  }

  async getApprovedProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    
    // Always filter for approved status
    params.append('status', 'APPROVED');
    
    if (filters) {
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.year) params.append('year', filters.year);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
    }

    const response = await this.api.get<Project[]>(`/projects/all?${params}`);
    // Transform the array response to match the expected PaginatedResponse format
    return {
      items: response.data,
      total: response.data.length,
      page: 1,
      per_page: response.data.length,
      pages: 1
    };
  }

  async getProject(id: number): Promise<Project> {
    const response = await this.api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    console.log('Creating project with data:', projectData);
    
    const formData = new FormData();
    formData.append('title', projectData.title);
    formData.append('year', projectData.year);
    formData.append('description', projectData.description);
    formData.append('tags', JSON.stringify(projectData.tags));
    
    if (projectData.file_url) {
      formData.append('file_url', projectData.file_url);
    }
    if (projectData.supervisor_id) {
      formData.append('supervisor_id', projectData.supervisor_id.toString());
    }
    if (projectData.document) {
      formData.append('document', projectData.document);
    }
    
    // Log FormData contents
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await this.api.post<Project>('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateProject(projectData: UpdateProjectRequest): Promise<Project> {
    const { id, ...updateData } = projectData;
    const formData = new FormData();
    
    if (updateData.title) formData.append('title', updateData.title);
    if (updateData.year) formData.append('year', updateData.year);
    if (updateData.description) formData.append('description', updateData.description);
    if (updateData.tags) formData.append('tags', JSON.stringify(updateData.tags));

    if (updateData.file_url) formData.append('file', updateData.file_url);
    if (updateData.document) formData.append('document', updateData.document);

    const response = await this.api.patch<Project>(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/projects/${id}`);
  }

  async approveProject(id: number): Promise<Project> {
    const response = await this.api.patch<Project>(`/projects/${id}/approve`);
    return response.data;
  }

  async rejectProject(id: number, reason?: string): Promise<Project> {
    const response = await this.api.patch<Project>(`/projects/${id}/reject`, {
      reason,
    });
    return response.data;
  }

  // Supervisor endpoints
  async getSupervisedProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/supervisor/projects');
    return response.data;
  }

  async getSupervisedStudents(): Promise<StudentWithProject[]> {
    const response = await this.api.get<StudentWithProject[]>('/supervisor/students');
    return response.data;
  }

  async updateProjectStatus(projectId: number, data: { status: Status; review_comment?: string }): Promise<Project> {
    const response = await this.api.put<Project>(`/projects/${projectId}/review`, data);
    return response.data;
  }

  async getSupervisorDashboardStats(): Promise<SupervisorDashboardStats> {
    const response = await this.api.get<SupervisorDashboardStats>('/supervisor/dashboard/stats');
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  }

  async getAllStudents(filters?: StudentFilters): Promise<StudentAccount[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
    }

    const response = await this.api.get<StudentAccount[]>(`/admin/students?${params}`);
    console.log(response.data)
    return response.data;
  }

  async getAllSupervisors(): Promise<SupervisorAccount[]> {
    const response = await this.api.get<SupervisorAccount[]>('/admin/supervisors');
    console.log(response.data)
    return response.data;
    
  }

  async getAllProjects(): Promise<Project[]> {
    const response = await this.api.get<Project[]>('/admin/projects');
    return response.data;
  }

  async assignSupervisor(studentId: number, supervisorId: number): Promise<StudentAccount> {
    
    const response = await this.api.patch<StudentAccount>(
      `/projects/${studentId}/assign-supervisor?supervisor_id=${supervisorId}`
    );
    return response.data;
  }

  async createStudent(studentData: Partial<StudentAccount>): Promise<StudentAccount> {
    const response = await this.api.post<StudentAccount>('/admin/students', studentData);
    return response.data;
  }

  async updateStudent(id: number, studentData: Partial<StudentAccount>): Promise<StudentAccount> {
    const response = await this.api.put<StudentAccount>(`/admin/students/${id}`, studentData);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.api.delete(`/admin/students/${id}`);
  }

  async createSupervisor(supervisorData: Partial<SupervisorAccount>): Promise<SupervisorAccount> {
    const response = await this.api.post<SupervisorAccount>('/admin/supervisors', supervisorData);
    return response.data;
  }

  async updateSupervisor(id: number, supervisorData: Partial<SupervisorAccount>): Promise<SupervisorAccount> {
    const response = await this.api.put<SupervisorAccount>(`/admin/supervisors/${id}`, supervisorData);
    return response.data;
  }

  async deleteSupervisor(id: number): Promise<void> {
    await this.api.delete(`/admin/supervisors/${id}`);
  }

  async createProjectAsAdmin(projectData: {
    title: string;
    description: string;
    problem_statement?: string;
    supervisor_id: number;
    student_id?: number;
    status: Status;
    tags: Tags[];
    year: string;
  }): Promise<Project> {
    const response = await this.api.post<Project>('/admin/projects', projectData);
    return response.data;
  }

  async updateProjectAsAdmin(id: number, projectData: {
    title?: string;
    description?: string;
    problem_statement?: string;
    supervisor_id?: number;
    student_id?: number;
    status?: Status;
    tags?: Tags[];
    year?: string;
  }): Promise<Project> {
    const response = await this.api.put<Project>(`/admin/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProjectAsAdmin(id: number): Promise<void> {
    await this.api.delete(`/admin/projects/${id}`);
  }

  // Tag endpoints
  async getTags(): Promise<Tags[]> {
    const response = await this.api.get<Tags[]>('/tags');
    return response.data;
  }

  // Utility methods
  async uploadFile(file: File, type: 'project' | 'document'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  }

  async getDepartments(): Promise<string[]> {
    const response = await this.api.get<string[]>('/departments');
    return response.data;
  }

  async getYears(): Promise<string[]> {
    const response = await this.api.get<string[]>('/years');
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;