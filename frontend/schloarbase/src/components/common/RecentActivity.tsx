import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project, Status } from '../../types';

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'status_changed';
  project: Project;
  timestamp: Date;
  description: string;
}

interface RecentActivityProps {
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  maxItems = 5, 
  showTitle = true,
  compact = false
}) => {
  const { myProjects, loadMyProjects, loading } = useProject();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (myProjects.length === 0) {
      loadMyProjects();
    }
  }, [myProjects.length, loadMyProjects]);

  useEffect(() => {
    const generateActivities = () => {
      const activityList: ActivityItem[] = [];

      myProjects.forEach(project => {
        // Project creation activity
        const createdDate = parseISO(project.created_at);
        activityList.push({
          id: `created-${project.id}`,
          type: 'created',
          project,
          timestamp: createdDate,
          description: `Created project "${project.title}"`
        });

        // Project update activity (if different from created)
        const updatedDate = parseISO(project.updated_at);
        if (project.updated_at !== project.created_at) {
          activityList.push({
            id: `updated-${project.id}`,
            type: 'updated',
            project,
            timestamp: updatedDate,
            description: `Updated project "${project.title}"`
          });
        }

        // Status change activity (based on current status)
        if (project.status !== 'Pending') {
          let statusDescription = '';
          switch (project.status) {
            case 'Approved':
              statusDescription = `Project "${project.title}" was approved`;
              break;
            case 'Rejected':
              statusDescription = `Project "${project.title}" was rejected`;
              break;
            case 'Under Review':
              statusDescription = `Project "${project.title}" is under review`;
              break;
            case 'In Progress':
              statusDescription = `Project "${project.title}" is now in progress`;
              break;
            case 'Completed':
              statusDescription = `Project "${project.title}" was completed`;
              break;
            case 'Suspended':
              statusDescription = `Project "${project.title}" was suspended`;
              break;
            default:
              statusDescription = `Project "${project.title}" status changed to ${project.status}`;
          }
          
          activityList.push({
            id: `status-${project.id}`,
            type: 'status_changed',
            project,
            timestamp: updatedDate, // Using updated timestamp for status changes
            description: statusDescription
          });
        }
      });

      // Sort by timestamp descending (most recent first)
      activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Take only the most recent items
      setActivities(activityList.slice(0, maxItems));
    };

    if (myProjects.length > 0) {
      generateActivities();
    }
  }, [myProjects, maxItems]);

  const getActivityIcon = (type: ActivityItem['type'], status?: Status) => {
    switch (type) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'updated':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'status_changed':
        switch (status) {
          case 'Approved':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
          case 'Rejected':
            return <XCircle className="h-4 w-4 text-red-500" />;
          case 'Under Review':
            return <Eye className="h-4 w-4 text-purple-500" />;
          default:
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        }
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: Status) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Rejected':
        return 'destructive';
      case 'Under Review':
        return 'secondary';
      case 'Pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Today at ${format(timestamp, 'h:mm a')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday at ${format(timestamp, 'h:mm a')}`;
    } else if (isThisWeek(timestamp)) {
      return format(timestamp, 'EEEE \'at\' h:mm a');
    } else {
      return format(timestamp, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No recent activity</p>
            <p className="text-sm mb-4">Your project submissions will appear here</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link to="/student/projects/new">
                <Button size="sm" className="text-xs">
                  Create Your First Project
                </Button>
              </Link>
              <Link to="/student/browse">
                <Button variant="outline" size="sm" className="text-xs">
                  Browse Examples
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className={compact ? "pb-2" : ""}>
          <CardTitle className={compact ? "text-lg" : ""}>Recent Activity</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`space-y-${compact ? '2' : '4'}`}>
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start space-x-3 ${compact ? 'p-2' : 'p-3'} rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type, activity.project.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white`}>
                    {compact ? 
                      `${activity.type === 'created' ? 'Created' : activity.type === 'updated' ? 'Updated' : 'Status:'} ${activity.project.title}` :
                      activity.description
                    }
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={getStatusBadgeVariant(activity.project.status)}
                      className="text-xs"
                    >
                      {activity.project.status}
                    </Badge>
                    {!compact && activity.project.tags && activity.project.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {activity.project.tags[0]}
                        {activity.project.tags.length > 1 && ` +${activity.project.tags.length - 1}`}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {compact ? 
                      format(activity.timestamp, 'MMM d') :
                      formatTimestamp(activity.timestamp)
                    }
                  </p>
                </div>
                
                {!compact && (
                  <Link 
                    to={`/student/projects`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs font-medium ml-2"
                  >
                    View
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {myProjects.length > maxItems && (
          <div className={`text-center ${compact ? 'pt-2' : 'pt-4'} border-t border-gray-200 dark:border-gray-700`}>
            <Link 
              to="/student/projects"
              className={`${compact ? 'text-xs' : 'text-sm'} text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium`}
            >
              View all projects →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
