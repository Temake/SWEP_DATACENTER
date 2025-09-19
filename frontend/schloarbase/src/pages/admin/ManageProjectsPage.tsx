import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import AdminNavigation from '../../components/common/AdminNavigation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Project, StudentAccount, SupervisorAccount, Status } from '../../types';
import { Status as StatusEnum } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tags } from '../../types/index';

interface ProjectFormData {
  title: string;
  description: string;
  problem_statement: string;
  supervisor_id: string;
  student_id: string;
  status: Status;
  tags: Tags[] | undefined;
}

interface ProjectDialogData {
  open: boolean;
  mode: 'edit';
  project?: Project;
}

interface ProjectFilters {
  search?: string;
  status?: Status;
  supervisor_id?: string;
  tags?: string;
}

const ManageProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorAccount[]>([]);
  const [availableTags] = useState<Tags[]>(Object.values(Tags));
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [projectDialog, setProjectDialog] = useState<ProjectDialogData>({ open: false, mode: 'edit' });
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    problem_statement: '',
    supervisor_id: '',
    student_id: '',
    status: 'Pending',
    tags: [],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: Project }>({ open: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, studentsData, supervisorsData] = await Promise.all([
        apiService.getAllProjects(),
        apiService.getAllStudents(),
        apiService.getAllSupervisors(),
      ]);
      
      setProjects(projectsData);
      setStudents(studentsData);
      setSupervisors(supervisorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...projects];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.student?.name.toLowerCase().includes(searchLower) ||
        project.supervisor?.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.supervisor_id) {
      filtered = filtered.filter(project => project.supervisor_id === parseInt(filters.supervisor_id!));
    }

    if (filters.tags) {
      filtered = filtered.filter(project =>
        project.tags?.some(tag => tag === filters.tags)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      problem_statement: project.problem_statement || '',
      supervisor_id: project.supervisor_id?.toString() || '',
      student_id: project.student_id?.toString() || '',
      status: project.status as Status, // Cast to Status since admin uses Status enum
      tags:project.tags
    });
    setProjectDialog({ open: true, mode: 'edit', project });
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        problem_statement: formData.problem_statement,
        supervisor_id: parseInt(formData.supervisor_id),
        student_id: formData.student_id ? parseInt(formData.student_id) : undefined,
        status: formData.status,
        tags: formData.tags,
        year: new Date().getFullYear().toString(),
      };

      if (projectDialog.mode === 'edit' && projectDialog.project) {
        await apiService.updateProjectAsAdmin(projectDialog.project.id, payload);
        toast.success('Project updated successfully');
      }
      
      setProjectDialog({ open: false, mode: 'edit' });
      loadData();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;

    try {
      await apiService.deleteProjectAsAdmin(deleteDialog.project.id);
      toast.success('Project deleted successfully');
      setDeleteDialog({ open: false });
      loadData();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case StatusEnum.PENDING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case StatusEnum.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case StatusEnum.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTagColor = (tagName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    ];
    const index = tagName.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Projects
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Review and manage student projects
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {projects.filter(p => p.status === 'Pending').length}
                </div>
              </CardContent>
            </Card>
           
                 <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {projects.filter(p => p.status === 'Approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {projects.filter(p => p.status === 'Approved').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Search projects..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange({ status: e.target.value as Status })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(StatusEnum).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.supervisor_id || ''}
                  onChange={(e) => handleFilterChange({ supervisor_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Supervisors</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id.toString()}>
                      {supervisor.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.tags || ''}
                  onChange={(e) => handleFilterChange({ tags: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={() => setFilters({})}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-1 md:gap-2 mt-2 flex-wrap">
                          <Badge className={`text-xs ${getStatusColor(project.status as Status)}`}>
                            {typeof project.status === 'string' ? project.status : String(project.status)}
                          </Badge>
                          {project.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`text-xs ${getTagColor(tag)}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 md:mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                      <div className="text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Supervisor:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {project.supervisor?.name || 'Unassigned'}
                        </span>
                      </div>
                      
                      <div className="text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Student:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {project.student?.name || 'Unassigned'}
                        </span>
                      </div>
                      
                      <div className="text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {format(new Date(project.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditProject(project)}
                        className="flex-1 text-xs md:text-sm"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, project })}
                        className="text-xs md:text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {projects.length === 0 
                    ? "No projects have been created yet."
                    : "No projects match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Project Dialog */}
      <Dialog open={projectDialog.open} onOpenChange={(open) => setProjectDialog({ ...projectDialog, open })}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Project
            </DialogTitle>
            <DialogDescription>
              Update the project information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="problem_statement">Problem Statement</Label>
              <Textarea
                id="problem_statement"
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                placeholder="Enter problem statement"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <select
                  id="supervisor"
                  value={formData.supervisor_id}
                  onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Supervisor</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id.toString()}>
                      {supervisor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="student">Student (Optional)</Label>
                <select
                  id="student"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(StatusEnum).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.tags?.includes(tag) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            tags: [...(formData.tags || []), tag]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            tags: (formData.tags || []).filter(t => t !== tag)
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setProjectDialog({ open: false, mode: 'edit' })}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={formLoading || !formData.title || !formData.description || !formData.supervisor_id}
            >
              {formLoading ? 'Saving...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteDialog.project?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteProject}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ManageProjectsPage;