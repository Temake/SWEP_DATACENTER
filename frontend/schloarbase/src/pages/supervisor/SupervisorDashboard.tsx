import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { Project, DashboardStats } from '../../types';
import { Status } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import ThemeToggle from '../../components/common/ThemeToggle';


const SupervisorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load supervisor-specific data
      const [dashboardStats, supervisedProjects] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSupervisedProjects()
      ]);
      
      setStats(dashboardStats);
      setRecentProjects(supervisedProjects.slice(0, 5)); // Show latest 5 projects
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/supervisor/dashboard" className="flex items-center">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ScholarBase</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700 dark:text-gray-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, Prof. {user?.name}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Supervisor Dashboard - Manage student projects and submissions
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Supervised Students
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_students || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Active students under supervision
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.pending_projects || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Projects awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">
                  Approved Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.approved_projects || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Successfully approved projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.total_projects || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All supervised projects
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/supervisor/projects">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center">
                    <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <svg className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Review Projects</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Manage supervised projects</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/supervisor/students">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center">
                    <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <svg className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Manage Students</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">View supervised students</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to="/supervisor/analytics">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center">
                    <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <svg className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">View supervision analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Project Submissions</CardTitle>
                  <CardDescription>
                    Latest projects from your supervised students
                  </CardDescription>
                </div>
                <Link to="/supervisor/projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {project.student?.name} • {project.year}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          {project.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags && project.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{project.tags.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/supervisor/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No recent project submissions</p>
                  <p className="text-sm">Student projects will appear here when submitted</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;