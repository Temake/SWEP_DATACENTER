import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Project } from '../../types';
import { Status, Tags } from '../../types';
import { format } from 'date-fns';
import {  FileText, ExternalLink } from 'lucide-react';
import { downloadFile, generateProjectFilename, isDownloadableUrl } from '../../utils/downloadUtils';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
  isOwner?: boolean;
  expandedView?: boolean; // New prop for expanded viewing
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
  isOwner = false,
  expandedView = false, // Default to false for backwards compatibility
}) => {
  const [downloadingFile, setDownloadingFile] = useState<'file' | 'document' | null>(null);

  const handleDownload = async (url: string, type: 'file' | 'document') => {
    if (!url) return;
    
    try {
      setDownloadingFile(type);
      const filename = generateProjectFilename(project, type);
      const fileExtension = url.split('.').pop();
      const fullFilename = fileExtension ? `${filename}.${fileExtension}` : filename;
      
      await downloadFile(url, fullFilename);
      toast.success(`${type === 'file' ? 'Project file' : 'Document'} downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      toast.error(`Failed to download ${type}. Please try again.`);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleView = (url: string) => {
    // For non-downloadable URLs or if user prefers to view
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case Status.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case Status.PENDING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTagColor = (tag: Tags): string => {
    const colors: Record<string, string> = {
      [Tags.AI]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [Tags.WEB_DEV]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [Tags.DATA_SCIENCE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [Tags.MOBILE_DEV]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [Tags.CYBER_SECURITY]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [Tags.CLOUD_COMPUTING]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      [Tags.GAME_DEV]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      [Tags.DEVOPS]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      [Tags.IOT]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      [Tags.BLOCKCHAIN]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [Tags.SOFTWARE_TESTING]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      [Tags.UI_UX]: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      [Tags.NETWORKING]: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      [Tags.DATABASES]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      [Tags.EMBEDDED_SYSTEMS]: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      [Tags.ANIMATION]: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
      [Tags.MACHINE_LEARNING]: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
      [Tags.AR_VR]: 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300',
      [Tags.BIG_DATA]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
      [Tags.ROBOTICS]: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
      [Tags.OTHERS]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.year}
              </span>
            </div>
          </div>
        </div>
        <CardDescription className={expandedView ? "mb-4" : "line-clamp-3"}>
          {project.description}
        </CardDescription>
        
        {/* Problem Statement - Show in expanded view */}
        {expandedView && project.problem_statement && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Problem Statement:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {project.problem_statement}
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {expandedView ? (
              // Show all tags in expanded view
              project.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs ${getTagColor(tag as Tags)}`}
                >
                  {tag}
                </Badge>
              ))
            ) : (
              // Show limited tags in normal view
              <>
                {project.tags?.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs ${getTagColor(tag as Tags)}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {project.tags && project.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 3} more
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Project Info */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {project.student && (
              <p>
                <span className="font-medium">Student:</span> {project.student.name}
              </p>
            )}
            {project.supervisor && (
              <p>
                <span className="font-medium">Supervisor:</span> {project.supervisor.name}
              </p>
            )}
            <p>
              <span className="font-medium">Submitted:</span>{' '}
              {format(new Date(project.created_at), 'MMM dd, yyyy')}
            </p>
            
            {/* File and Document Availability */}
            {expandedView && (
              <div className="mt-3 space-y-1">
                <p>
                  <span className="font-medium">Project Link:</span>{' '}
                  {project.file_url ? (
                    <span className="text-green-600 dark:text-green-400">Available</span>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Document:</span>{' '}
                  {project.document_url ? (
                    <span className="text-green-600 dark:text-green-400">Available for download</span>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Review Comment - Show only when project is rejected */}
          {project.status === Status.REJECTED && project.review_comment && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Rejection Reason:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {project.review_comment}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons - Always show file/document actions when available */}
        {(showActions || project.file_url || project.document_url) && (
          <div className="mt-4 flex flex-wrap gap-2">
            
            {/* File URL Actions */}
            {project.file_url && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(project.file_url!, 'file')}
                  disabled={downloadingFile === 'file'}
                  className="flex items-center gap-1"
                >
                  {downloadingFile === 'file' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                      <span className="text-xs">Opening...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">Open Project Link</span>
                    </>
                  )}
                </Button>
                {!isDownloadableUrl(project.file_url) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(project.file_url!)}
                    className="px-2"
                  >
                    
                  </Button>
                )}
              </div>
            )}
            
            {/* Document Download Actions */}
            {project.document_url && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(project.document_url!, 'document')}
                  disabled={downloadingFile === 'document'}
                  className="flex items-center gap-1"
                >
                  {downloadingFile === 'document' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                      <span className="text-xs">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3" />
                      <span className="text-xs">Download Document</span>
                    </>
                  )}
                </Button>
                {/* {!isDownloadableUrl(project.document_url) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(project.document_url!)}
                    className="px-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )} */}
              </div>
            )}

            {/* Owner Actions - Only show when user is owner and showActions is true */}
            {showActions && isOwner && project.status === Status.PENDING && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(project)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete?.(project.id)}
                >
                  Delete
                </Button>
              </>
            )}

            {/* Supervisor Actions - Only show when showActions is true */}
            {showActions && onApprove && project.status === Status.PENDING && (
              <>
                <Button
                  size="sm"
                  onClick={() => onApprove(project.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject?.(project.id)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;