import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import AdminNavigation from '../../components/common/AdminNavigation';
import ProjectStatusChart from '../../components/charts/ProjectStatusChart';
import apiService from '../../services/api';
import type { DashboardStats } from '../../types';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
 
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
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
                <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your ScholarBase system - users, projects, and configurations
            </p>
          </div>

          {/* Statistics Overview */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2 md:pb-3">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_projects}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stats.approved_projects} Approved
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      {stats.rejected_projects} Rejected
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {stats.pending_projects} Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-3">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.total_students}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Registered students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 md:pb-3">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Supervisors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.total_supervisors}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Active supervisors
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Button asChild className="h-auto p-4 md:p-6 flex-col space-y-2">
                  <Link to="/admin/students">
                    <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium">Manage Students</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 md:p-6 flex-col space-y-2">
                  <Link to="/admin/supervisors">
                    <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium">Manage Supervisors</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 md:p-6 flex-col space-y-2">
                  <Link to="/admin/projects">
                    <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs md:text-sm font-medium">Manage Projects</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Project Status Chart */}
            {stats && (
              <ProjectStatusChart
                pending={stats.pending_projects}
                approved={stats.approved_projects}
                rejected={stats.rejected_projects}
              />
            )}

            <Card>
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {stats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Approval Rate</span>
                        <span className="text-xs md:text-sm font-medium">
                          {stats.total_projects > 0 
                            ? Math.round((stats.approved_projects / stats.total_projects) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pending Reviews</span>
                        <span className="text-xs md:text-sm font-medium text-yellow-600">
                          {stats.pending_projects}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Student-Supervisor Ratio</span>
                        <span className="text-xs md:text-sm font-medium">
                          {stats.total_supervisors > 0 
                            ? Math.round(stats.total_students / stats.total_supervisors)
                            : 0}:1
                        </span>
                      </div>
                    </>
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

export default AdminDashboard;