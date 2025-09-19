import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { Project } from '../../types';
import { Status, Tags } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format, subMonths, isAfter, parseISO } from 'date-fns';
import SupervisorNavigation from '../../components/common/SupervisorNavigation';

interface AnalyticsData {
  totalProjects: number;
  statusBreakdown: Record<Status, number>;
  tagDistribution: Record<string, number>;
  monthlySubmissions: Record<string, number>;
  averageReviewTime: number;
  recentActivity: Project[];
}

const SupervisorAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const projectsData = await apiService.getSupervisedProjects();
      
      // Process analytics data
      const analyticsData = processAnalyticsData(projectsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const processAnalyticsData = (projects: Project[]): AnalyticsData => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);

    // Status breakdown
    const statusBreakdown = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);

    // Tag distribution
    const tagDistribution = projects.reduce((acc, project) => {
      project.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Monthly submissions (last 6 months)
    const monthlySubmissions = projects.reduce((acc, project) => {
      const projectDate = parseISO(project.created_at);
      if (isAfter(projectDate, sixMonthsAgo)) {
        const monthKey = format(projectDate, 'MMM yyyy');
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 10 projects)
    const recentActivity = projects
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Simple average review time calculation (mock data for demonstration)
    const reviewedProjects = projects.filter(p => p.status === Status.APPROVED || p.status === Status.REJECTED);
    const averageReviewTime = reviewedProjects.length > 0 ? 3.5 : 0; // Days (mock calculation)

    return {
      totalProjects: projects.length,
      statusBreakdown,
      tagDistribution,
      monthlySubmissions,
      averageReviewTime,
      recentActivity
    };
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

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      [Tags.AI]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      [Tags.WEB_DEV]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [Tags.MOBILE_DEV]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [Tags.DATA_SCIENCE]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      [Tags.CYBER_SECURITY]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [Tags.BLOCKCHAIN]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [Tags.CLOUD_COMPUTING]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      [Tags.ANIMATION]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      [Tags.ROBOTICS]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [Tags.GAME_DEV]: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      [Tags.MACHINE_LEARNING]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      [Tags.AR_VR]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SupervisorNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
              </CardContent>
            </Card>
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
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Supervision Analytics
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Overview of your supervision performance and project trends
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalProjects}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All time supervised projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.totalProjects > 0 
                    ? Math.round(((analytics.statusBreakdown[Status.APPROVED] || 0) / analytics.totalProjects) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Projects approved vs total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Avg. Review Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.averageReviewTime.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Days average review time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analytics.statusBreakdown[Status.PENDING] || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Projects awaiting review
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Breakdown of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(status as Status)}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{count}</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${analytics.totalProjects > 0 ? (count / analytics.totalProjects) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Research Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Research Areas</CardTitle>
                <CardDescription>Most common project tags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.tagDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([tag, count]) => (
                    <div key={tag} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getTagColor(tag)} variant="secondary">
                          {tag.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{count}</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ 
                              width: `${analytics.totalProjects > 0 ? (count / analytics.totalProjects) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Activity and Recent Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Submissions over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.monthlySubmissions)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([month, count]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {month}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{count}</span>
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${count > 0 ? Math.max(20, (count / Math.max(...Object.values(analytics.monthlySubmissions))) * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Project Submissions</CardTitle>
                <CardDescription>Latest projects from your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {project.student?.name} • {format(new Date(project.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                  {analytics.recentActivity.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>No recent project submissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorAnalyticsPage;