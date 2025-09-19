import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import type { Project, ProjectFilters } from '../../types';
import { Status } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import SupervisorNavigation from '../../components/common/SupervisorNavigation';

interface ReviewDialogData {
  open: boolean;
  project?: Project;
  action?: 'approve' | 'reject';
}

const SupervisedProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    per_page: 20,
  });
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({ open: false });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        (project.student?.name && project.student.name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(project => project.year === filters.year);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags && project.tags.length > 0 && 
        filters.tags!.some(tag => project.tags!.some(projectTag => projectTag === tag))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSupervisedProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleReviewProject = async (action: 'approve' | 'reject') => {
    if (!reviewDialog.project) return;

    setReviewLoading(true);
    try {
      const newStatus = action === 'approve' ? Status.APPROVED : Status.REJECTED;
      
      await apiService.updateProjectStatus(reviewDialog.project.id, {
        status: newStatus,
        review_comment: reviewComment
      });

      toast.success(`Project ${action}d successfully`);
      setReviewDialog({ open: false });
      setReviewComment('');
      loadProjects(); // Reload projects
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
      toast.error(`Failed to ${action} project`);
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.PENDING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case Status.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case Status.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case Status.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
     
      case Status.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getProjectStats = () => {
    const total = projects.length;
    const pending = projects.filter(p => p.status === Status.PENDING).length;
    const underReview = projects.filter(p => p.status === Status.UNDER_REVIEW).length;
    const approved = projects.filter(p => p.status === Status.APPROVED).length;
    const rejected = projects.filter(p => p.status === Status.REJECTED).length;
    
    return { total, pending, underReview, approved, rejected };
  };

  const stats = getProjectStats();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SupervisorNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Supervised Projects
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review and manage student project submissions
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.pending}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Under Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.underReview}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.approved}
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
                    {stats.rejected}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search projects or students..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                  />
                  
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => handleFilterChange({ status: value === 'all' ? undefined : value as Status })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={Status.PENDING}>Pending</SelectItem>
                      <SelectItem value={Status.UNDER_REVIEW}>Under Review</SelectItem>
                      <SelectItem value={Status.APPROVED}>Approved</SelectItem>
                      <SelectItem value={Status.REJECTED}>Rejected</SelectItem>
                     
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.year || 'all'}
                    onValueChange={(value) => handleFilterChange({ year: value === 'all' ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => setFilters({ page: 1, per_page: 20 })}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects List */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {project.title}
                              </h3>
                              <Badge className={`${getStatusColor(project.status)} shrink-0`}>
                                {project.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span className="font-medium">Student:</span> {project.student?.name} ({project.student?.matric_no})
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span className="font-medium">Year:</span> {project.year} • 
                              <span className="font-medium ml-2">Submitted:</span> {format(new Date(project.created_at), 'MMM dd, yyyy')}
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 text-sm">
                              {project.description}
                            </p>
                            
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {project.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {project.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{project.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                              {project.file_url && (
                                <Button variant="outline" size="sm" className="text-xs" asChild>
                                  <a href={project.file_url} target="_blank" rel="noopener noreferrer">
                                    View Project
                                  </a>
                                </Button>
                              )}
                              {project.document_url && (
                                <Button variant="outline" size="sm" className="text-xs" asChild>
                                  <a href={project.document_url} target="_blank" rel="noopener noreferrer">
                                    View Document
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {project.status === Status.PENDING && (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <Button
                                size="sm"
                                onClick={() => setReviewDialog({ 
                                  open: true, 
                                  project, 
                                  action: 'approve' 
                                })}
                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setReviewDialog({ 
                                  open: true, 
                                  project, 
                                  action: 'reject' 
                                })}
                                className="flex-1 sm:flex-none"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {project.status === Status.UNDER_REVIEW && (
                            <Button size="sm" variant="outline" disabled className="w-full sm:w-auto">
                              Under Review
                            </Button>
                          )}
                          {(project.status === Status.APPROVED || project.status === Status.REJECTED) && (
                            <Badge className={`${getStatusColor(project.status)} self-start`}>
                              {project.status}
                            </Badge>
                          )}
                        </div>
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
                      ? "No supervised projects available yet."
                      : "No projects match your current filters."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Review Dialog */}
        <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Project
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === 'approve' 
                  ? 'Are you sure you want to approve this project? You can add optional feedback.'
                  : 'Please provide a reason for rejecting this project.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {reviewDialog.project?.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {reviewDialog.project?.student?.name}
                </p>
              </div>
              
              <Textarea
                placeholder={reviewDialog.action === 'approve' 
                  ? 'Optional feedback for the student...'
                  : 'Please explain why this project is being rejected...'
                }
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setReviewDialog({ open: false })}
                disabled={reviewLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReviewProject(reviewDialog.action!)}
                disabled={reviewLoading || (reviewDialog.action === 'reject' && !reviewComment.trim())}
                className={reviewDialog.action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
                }
              >
                {reviewLoading ? 'Processing...' : (reviewDialog.action === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default SupervisedProjectsPage;