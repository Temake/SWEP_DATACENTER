import { useState, useCallback, useRef, useEffect } from 'react';
import apiService from '../services/api';
import type { 
  ProjectFilters, 
  StudentFilters, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  LoginRequest,
  RegisterRequest,
  Project,
  PaginatedResponse,
  StudentAccount,
  SupervisorAccount,
  DashboardStats,
  SupervisorDashboardStats,
  StudentWithProject,
  Tags,
  Status,
  AuthResponse
} from '../types';

/**
 * Custom API Hooks for ScholarBase
 * 
 * These hooks provide state management for API calls while keeping the API service stateless.
 * Each hook instance maintains its own isolated state (loading, error, data).
 * 
 * Usage Examples:
 * 
 * // Projects
 * const { loading, error, getProjects, createProject } = useProjects();
 * const projects = await getProjects({ page: 1, per_page: 10 });
 * 
 * // Authentication
 * const { loading, error, login, register, isAuthenticated, getCurrentUser } = useAuth();
 * const user = await login({ email: 'user@example.com', password: 'password' });
 * const isLoggedIn = isAuthenticated();
 * const currentUser = getCurrentUser();
 * 
 * // Admin operations
 * const { loading, error, getAllStudents, createStudent } = useAdmin();
 * const students = await getAllStudents({ department: 'Computer Science' });
 * 
 * // Delete operations (separate hook for void returns)
 * const { loading, error, deleteProject, deleteStudent } = useDelete();
 * await deleteProject(projectId);
 * 
 * // Multiple API calls
 * const { executeMultiple, loading, data, errors } = useMultipleApi();
 * await executeMultiple({
 *   projects: () => apiService.getProjects(),
 *   tags: () => apiService.getTags(),
 * });
 */

// Generic API hook for any API call
export const useApi = <T = unknown>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    apiCall: (signal?: AbortSignal) => Promise<T>,
    options?: { showError?: boolean }
  ): Promise<T | null> => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const result = await apiCall(abortControllerRef.current.signal);
      setData(result);
      return result;
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = (err as Error & { response?: { data?: { detail?: string } } }).response?.data?.detail ||
                           err.message || 
                           'An error occurred';
        setError(errorMessage);
        
        if (options?.showError !== false) {
          console.error('API Error:', errorMessage);
        }
        throw err;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    abortControllerRef.current?.abort();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { execute, loading, error, data, reset };
};

// Project-specific hooks
export const useProjects = () => {
  const { execute, loading, error, data, reset } = useApi<PaginatedResponse<Project> | Project[] | Project>();

  const getProjects = useCallback((filters?: ProjectFilters) => {
    return execute(() => apiService.getProjects(filters));
  }, [execute]);

  const getMyProjects = useCallback(() => {
    return execute(() => apiService.getMyProjects());
  }, [execute]);

  const getApprovedProjects = useCallback((filters?: ProjectFilters) => {
    return execute(() => apiService.getApprovedProjects(filters));
  }, [execute]);

  const createProject = useCallback((projectData: CreateProjectRequest) => {
    return execute(() => apiService.createProject(projectData));
  }, [execute]);

  const updateProject = useCallback((projectData: UpdateProjectRequest) => {
    return execute(() => apiService.updateProject(projectData));
  }, [execute]);

  const approveProject = useCallback((id: number) => {
    return execute(() => apiService.approveProject(id));
  }, [execute]);

  const rejectProject = useCallback((id: number, reason?: string) => {
    return execute(() => apiService.rejectProject(id, reason));
  }, [execute]);

  return {
    loading,
    error,
    data,
    reset,
    getProjects,
    getMyProjects,
    getApprovedProjects,
    createProject,
    updateProject,
    approveProject,
    rejectProject,
  };
};

// Authentication hooks
export const useAuthhook = () => {
  const { execute, loading, error, reset } = useApi<AuthResponse>();

  const login = useCallback((credentials: LoginRequest) => {
    return execute(() => apiService.login(credentials));
  }, [execute]);

  const register = useCallback((userData: RegisterRequest) => {
    return execute(() => apiService.register(userData));
  }, [execute]);

  const logout = useCallback(() => {
    apiService.logout();
    reset();
  }, [reset]);

  const isAuthenticated = useCallback(() => {
    return apiService.isAuthenticated();
  }, []);

  const getCurrentUser = useCallback(() => {
    return apiService.getCurrentUser();
  }, []);

  return {
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    reset,
  };
};

// Supervisor hooks
export const useSupervisor = () => {
  const { execute, loading, error, data, reset } = useApi<Project[] | StudentWithProject[] | SupervisorDashboardStats | Project>();

  const getSupervisedProjects = useCallback(() => {
    return execute(() => apiService.getSupervisedProjects());
  }, [execute]);

  const getSupervisedStudents = useCallback(() => {
    return execute(() => apiService.getSupervisedStudents());
  }, [execute]);

  const updateProjectStatus = useCallback((projectId: number, statusData: { status: Status; review_comment?: string }) => {
    return execute(() => apiService.updateProjectStatus(projectId, statusData));
  }, [execute]);

  const getDashboardStats = useCallback(() => {
    return execute(() => apiService.getSupervisorDashboardStats());
  }, [execute]);

  return {
    loading,
    error,
    data,
    reset,
    getSupervisedProjects,
    getSupervisedStudents,
    updateProjectStatus,
    getDashboardStats,
  };
};

// Admin hooks
export const useAdmin = () => {
  const { execute, loading, error, data, reset } = useApi<DashboardStats | StudentAccount[] | SupervisorAccount[] | Project[] | StudentAccount | SupervisorAccount>();

  const getDashboardStats = useCallback(() => {
    return execute(() => apiService.getDashboardStats());
  }, [execute]);

  const getAllStudents = useCallback((filters?: StudentFilters) => {
    return execute(() => apiService.getAllStudents(filters));
  }, [execute]);

  const getAllSupervisors = useCallback(() => {
    return execute(() => apiService.getAllSupervisors());
  }, [execute]);

  const getAllProjects = useCallback(() => {
    return execute(() => apiService.getAllProjects());
  }, [execute]);

  const assignSupervisor = useCallback((studentId: number, supervisorId: number) => {
    return execute(() => apiService.assignSupervisor(studentId, supervisorId));
  }, [execute]);

  const createStudent = useCallback((studentData: Partial<StudentAccount>) => {
    return execute(() => apiService.createStudent(studentData));
  }, [execute]);

  const updateStudent = useCallback((id: number, studentData: Partial<StudentAccount>) => {
    return execute(() => apiService.updateStudent(id, studentData));
  }, [execute]);

  const createSupervisor = useCallback((supervisorData: Partial<SupervisorAccount>) => {
    return execute(() => apiService.createSupervisor(supervisorData));
  }, [execute]);

  const updateSupervisor = useCallback((id: number, supervisorData: Partial<SupervisorAccount>) => {
    return execute(() => apiService.updateSupervisor(id, supervisorData));
  }, [execute]);

  return {
    loading,
    error,
    data,
    reset,
    getDashboardStats,
    getAllStudents,
    getAllSupervisors,
    getAllProjects,
    assignSupervisor,
    createStudent,
    updateStudent,
    createSupervisor,
    updateSupervisor,
  };
};

// Utility hooks
export const useUtils = () => {
  const { execute, loading, error, data, reset } = useApi<Tags[] | string | string[]>();

  const getTags = useCallback(() => {
    return execute(() => apiService.getTags());
  }, [execute]);

  const uploadFile = useCallback((file: File, type: 'project' | 'document') => {
    return execute(() => apiService.uploadFile(file, type));
  }, [execute]);

  const getDepartments = useCallback(() => {
    return execute(() => apiService.getDepartments());
  }, [execute]);

  const getYears = useCallback(() => {
    return execute(() => apiService.getYears());
  }, [execute]);

  return {
    loading,
    error,
    data,
    reset,
    getTags,
    uploadFile,
    getDepartments,
    getYears,
  };
};

// Hook for delete operations that return void
export const useDelete = () => {
  const { execute, loading, error, reset } = useApi<void>();

  const deleteProject = useCallback((id: number) => {
    return execute(() => apiService.deleteProject(id));
  }, [execute]);

  const deleteStudent = useCallback((id: number) => {
    return execute(() => apiService.deleteStudent(id));
  }, [execute]);

  const deleteSupervisor = useCallback((id: number) => {
    return execute(() => apiService.deleteSupervisor(id));
  }, [execute]);

  return {
    loading,
    error,
    reset,
    deleteProject,
    deleteStudent,
    deleteSupervisor,
  };
};

// Hook for multiple simultaneous API calls
export const useMultipleApi = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, unknown>>({});

  const executeMultiple = useCallback(async (
    calls: Record<string, () => Promise<unknown>>
  ) => {
    setLoading(true);
    setErrors({});
    const newData: Record<string, unknown> = {};
    const newErrors: Record<string, string> = {};

    await Promise.allSettled(
      Object.entries(calls).map(async ([key, apiCall]) => {
        try {
          const result = await apiCall();
          newData[key] = result;
        } catch (error: unknown) {
          newErrors[key] = (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 
                          (error as Error).message || 
                          'An error occurred';
        }
      })
    );

    setData(newData);
    setErrors(newErrors);
    setLoading(false);

    return { data: newData, errors: newErrors };
  }, []);

  return { executeMultiple, loading, errors, data };
};