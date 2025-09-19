import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import SupervisorNavigation from '../../components/common/SupervisorNavigation';
import type { Project } from '../../types';
import { Status } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, FileText, Download, User, Calendar, Tag, MessageSquare , ExternalLink} from 'lucide-react';

interface ReviewDialogData {
  open: boolean;
  action: 'approve' | 'reject';
}

const StudentProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({ open: false, action: 'approve' });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadProject = useCallback(async (projectId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
      navigate('/supervisor/projects');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
    }
  }, [id, loadProject]);

  const handleReviewProject = async (action: 'approve' | 'reject') => {
    if (!project) return;

    setReviewLoading(true);
    try {
      const newStatus = action === 'approve' ? Status.APPROVED : Status.REJECTED;
      
      await apiService.updateProjectStatus(project.id, {
        status: newStatus,
        review_comment: reviewComment.trim() || undefined
      });

      toast.success(`Project ${action}d successfully`);
      setReviewDialog({ open: false, action: 'approve' });
      setReviewComment('');
      
      // Reload project data to show updated status
      await loadProject(project.id);
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
      case Status.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case Status.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canReview = project && (project.status === Status.PENDING || project.status === Status.UNDER_REVIEW);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SupervisorNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Project Not Found
              </h2>
              <Button onClick={() => navigate('/supervisor/projects')}>
                Back to Projects
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SupervisorNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/supervisor/projects')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
              
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project.title}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              Project details and review actions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Academic Year</h4>
                      <p className="text-gray-600 dark:text-gray-400">{project.year}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Submission Date</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {format(new Date(project.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Files */}
                  <div>
    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Project Url</h4>
                    <div className="space-y-2">
                      {project.file_url && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Project File Url</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                             Visit
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {project.document_url && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Documentation</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.document_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Comments */}
              {project.review_comment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Review Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {project.review_comment}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.student ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={project.student.profile_picture} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {getInitials(project.student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {project.student.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {project.student.matric_no}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Email:</span>
                          <p className="text-gray-600 dark:text-gray-400">{project.student.email}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Department:</span>
                          <p className="text-gray-600 dark:text-gray-400">{project.student.department}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">Year:</span>
                          <p className="text-gray-600 dark:text-gray-400">{project.student.year}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Student information not available</p>
                  )}
                </CardContent>
              </Card>

              {/* Review Actions */}
              {canReview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setReviewDialog({ open: true, action: 'approve' })}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Approve Project
                    </Button>
                    
                    <Button
                      onClick={() => setReviewDialog({ open: true, action: 'reject' })}
                      variant="destructive"
                      className="w-full"
                    >
                      Reject Project
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Project Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Current Status:</span>
                    <div className="mt-1">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Last Updated:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format(new Date(project.updated_at), 'MMMM dd, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
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
                {project?.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                by {project?.student?.name}
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
              onClick={() => setReviewDialog({ ...reviewDialog, open: false })}
              disabled={reviewLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReviewProject(reviewDialog.action)}
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

export default StudentProjectDetailPage;