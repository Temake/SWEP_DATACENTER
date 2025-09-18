import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Project } from '../../types';
import { Status, Tags } from '../../types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
  isOwner = false,
}) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case Status.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case Status.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case Status.PENDING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case Status.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case Status.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case Status.SUSPENDED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
        <CardDescription className="line-clamp-3">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
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
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* View/Download Files */}
            {project.file_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.file_url, '_blank')}
              >
                View Project
              </Button>
            )}
            {project.document_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.document_url, '_blank')}
              >
                View Document
              </Button>
            )}

            {/* Owner Actions */}
            {isOwner && project.status === Status.PENDING && (
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

            {/* Supervisor Actions */}
            {onApprove && project.status === Status.PENDING && (
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