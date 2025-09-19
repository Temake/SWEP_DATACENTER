import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Project, type ProjectFilters, type CreateProjectRequest, type UpdateProjectRequest, type Status, type Tags } from '../types';
import apiService from '../services/api';
import { toast } from 'sonner';

interface ProjectContextType {
  // State
  projects: Project[];
  myProjects: Project[];
  approvedProjects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadAllProjects: (filters?: ProjectFilters) => Promise<void>;
  loadMyProjects: () => Promise<void>;
  loadApprovedProjects: (filters?: ProjectFilters) => Promise<void>;
  loadProject: (id: number) => Promise<void>;
  createProject: (projectData: CreateProjectRequest) => Promise<Project | null>;
  updateProject: (projectData: UpdateProjectRequest) => Promise<Project | null>;
  deleteProject: (id: number) => Promise<boolean>;
  
  // Project status management
  approveProject: (id: number) => Promise<boolean>;
  rejectProject: (id: number, reason?: string) => Promise<boolean>;
  updateProjectStatus: (projectId: number, status: Status, review_comment?: string) => Promise<boolean>;
  
  // Utility functions
  clearError: () => void;
  refreshProjects: () => Promise<void>;
  filterProjects: (filters: ProjectFilters) => Project[];
  getProjectsByStatus: (status: Status) => Project[];
  getProjectsByTags: (tags: Tags[]) => Project[];
  getProjectsByYear: (year: string) => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all projects with optional filters
  const loadAllProjects = async (filters?: ProjectFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjects(filters);
      setProjects(response.items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load current user's projects
  const loadMyProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMyProjects();
      setMyProjects(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load approved projects with optional filters
  const loadApprovedProjects = async (filters?: ProjectFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getApprovedProjects(filters);
      setApprovedProjects(response.items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load approved projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load a specific project
  const loadProject = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const project = await apiService.getProject(id);
      setCurrentProject(project);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (projectData: CreateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await apiService.createProject(projectData);
      
      // Update relevant state arrays
      setMyProjects(prev => [newProject, ...prev]);
      setProjects(prev => [newProject, ...prev]);
      
      toast.success('Project created successfully!');
      return newProject;
    } catch (error) {
     if (error instanceof Error && 'response' in error ) if ( 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data && 'detail' in error.response.data) {
          
          const details = error.response.data.detail as Array<{ msg: string }>;
          const err = details && details.length > 0 ? details[0].msg : String(error.response.data.detail)  
      setError(err);
      toast.error(err);}
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (projectData: UpdateProjectRequest): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await apiService.updateProject(projectData);
      
      // Update all relevant state arrays
      const updateArrays = (prev: Project[]) => 
        prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      
      setProjects(updateArrays);
      setMyProjects(updateArrays);
      setApprovedProjects(updateArrays);
      
      if (currentProject?.id === updatedProject.id) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Project updated successfully!');
      return updatedProject;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteProject(id);
      
      // Remove from all state arrays
      const filterArrays = (prev: Project[]) => prev.filter(p => p.id !== id);
      
      setProjects(filterArrays);
      setMyProjects(filterArrays);
      setApprovedProjects(filterArrays);
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      
      toast.success('Project deleted successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Approve a project
  const approveProject = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await apiService.approveProject(id);
      
      // Update project status in state
      const updateArrays = (prev: Project[]) => 
        prev.map(p => p.id === id ? updatedProject : p);
      
      setProjects(updateArrays);
      setMyProjects(updateArrays);
      
      toast.success('Project approved successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve project';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reject a project
  const rejectProject = async (id: number, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await apiService.rejectProject(id, reason);
      
      // Update project status in state
      const updateArrays = (prev: Project[]) => 
        prev.map(p => p.id === id ? updatedProject : p);
      
      setProjects(updateArrays);
      setMyProjects(updateArrays);
      
      toast.success('Project rejected successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject project';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update project status (for supervisors)
  const updateProjectStatus = async (projectId: number, status: Status, review_comment?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await apiService.updateProjectStatus(projectId, { status, review_comment });
      
      // Update project status in state
      const updateArrays = (prev: Project[]) => 
        prev.map(p => p.id === projectId ? updatedProject : p);
      
      setProjects(updateArrays);
      setMyProjects(updateArrays);
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success(`Project status updated to ${status}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project status';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const clearError = () => setError(null);

  const refreshProjects = async () => {
    await Promise.all([
      loadAllProjects(),
      loadMyProjects(),
      loadApprovedProjects()
    ]);
  };

  const filterProjects = (filters: ProjectFilters): Project[] => {
    return projects.filter(project => {
      if (filters.status && project.status !== filters.status) return false;
      if (filters.year && project.year !== filters.year) return false;
      if (filters.tags?.length && !filters.tags.some(tag => project.tags?.includes(tag))) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const getProjectsByStatus = (status: Status): Project[] => {
    return projects.filter(project => project.status === status);
  };

  const getProjectsByTags = (tags: Tags[]): Project[] => {
    return projects.filter(project => 
      project.tags?.some(tag => tags.includes(tag))
    );
  };

  const getProjectsByYear = (year: string): Project[] => {
    return projects.filter(project => project.year === year);
  };

  const value: ProjectContextType = {
    // State
    projects,
    myProjects,
    approvedProjects,
    currentProject,
    loading,
    error,
    
    // Actions
    loadAllProjects,
    loadMyProjects,
    loadApprovedProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    
    // Project status management
    approveProject,
    rejectProject,
    updateProjectStatus,
    
    // Utility functions
    clearError,
    refreshProjects,
    filterProjects,
    getProjectsByStatus,
    getProjectsByTags,
    getProjectsByYear,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};