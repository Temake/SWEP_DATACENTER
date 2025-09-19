import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import ProjectCard from '../../components/common/ProjectCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EditProjectDialog from '../../components/common/EditProjectDialog';
import FilterBar from '../../components/common/FilterBar';
import StudentNavigation from '../../components/common/StudentNavigation';
import SupervisorProfile from '../../components/common/SupervisorProfile';
import type { Project, ProjectFilters, Tags, StudentAccount } from '../../types';
import { Status } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';

const MyProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId?: number }>({
    open: false,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; project?: Project }>({
    open: false,
  });
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    year: '',
    tags: [],
    department: '',
  });

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyProjects();
      // Apply simple filtering
      let filteredProjects = data;
      
      // Search filter (title only for simplicity)
      if (filters.search) {
        filteredProjects = filteredProjects.filter(p => 
          p.title.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      // Year filter
      if (filters.year) {
        filteredProjects = filteredProjects.filter(p => p.year === filters.year);
      }
      
      // Department filter
      if (filters.department) {
        filteredProjects = filteredProjects.filter(p => 
          p.student?.department?.toLowerCase().includes(filters.department!.toLowerCase())
        );
      }
      
      // Tags filter (multiple tags)
      if (filters.tags && filters.tags.length > 0) {
        filteredProjects = filteredProjects.filter(p => 
          p.tags?.some(tag => filters.tags!.includes(tag as Tags))
        );
      }
      
      setProjects(filteredProjects);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDeleteProject = async (id: number) => {
    try {
      await apiService.deleteProject(id);
      toast.success('Project deleted successfully');
      setDeleteDialog({ open: false });
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      year: '',
      tags: [],
      department: '',
    });
  };

  const getProjectStats = () => {
    const total = projects.length;
    const pending = projects.filter(p => p.status === Status.PENDING).length;
    const approved = projects.filter(p => p.status === Status.APPROVED).length;
    const rejected = projects.filter(p => p.status === Status.REJECTED).length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getProjectStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      My Projects
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Manage and track your project submissions
                    </p>
              </div>
              <Link to="/student/projects/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.approved}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              showYearFilter={true}
              showDepartmentFilter={false}
              years={['2024', '2023', '2022', '2021']}
            />
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </div>

          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(project) => {
                    setEditDialog({ open: true, project });
                  }}
                  onDelete={(id) => setDeleteDialog({ open: true, projectId: id })}
                  isOwner={true}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.status || filters.year || (filters.tags && filters.tags.length > 0)
                    ? "No projects match your current filters. Try adjusting your search criteria."
                    : "You haven't submitted any projects yet. Create your first project to get started."
                  }
                </p>
                {!filters.search && !filters.status && !filters.year && (!filters.tags || filters.tags.length === 0) && (
                  <Link to="/student/projects/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Your First Project
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
            </div>

            {/* Supervisor Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Supervisor</h3>
                <SupervisorProfile supervisor={(user as StudentAccount)?.supervisor} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editDialog.project || null}
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open })}
        onSave={loadProjects}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteDialog.projectId && handleDeleteProject(deleteDialog.projectId)}
        variant="destructive"
      />
    </div>
  );
};

export default MyProjectsPage;