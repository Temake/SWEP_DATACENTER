import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import StudentNavigation from '../../components/common/StudentNavigation';
import SupervisorProfile from '../../components/common/SupervisorProfile';
import RecentActivity from '../../components/common/RecentActivity';
import type { StudentAccount } from '../../types';
import api from '../../services/api';

const StudentDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [studentUser, setStudentUser] = useState<StudentAccount>(user as StudentAccount);
  const [isLoadingSupervisor, setIsLoadingSupervisor] = useState(false);

  useEffect(() => {
    const fetchUserDataIfNeeded = async () => {
      // Only fetch fresh data if supervisor is missing but supervisor_id exists
      const student = user as StudentAccount;
      if (student?.supervisor_id && !student?.supervisor && !isLoadingSupervisor) {
        setIsLoadingSupervisor(true);
        try {
          console.log('Supervisor data missing, fetching fresh user data...');
          const freshUserData = await api.fetchCurrentUser(false, true); // Include relations
          setStudentUser(freshUserData as StudentAccount);
          if (updateUser) {
            updateUser(freshUserData);
          }
          console.log('Fresh user data loaded:', freshUserData);
          console.log('Supervisor:', (freshUserData as StudentAccount).supervisor);
        } catch (error) {
          console.error('Failed to fetch fresh user data:', error);
        } finally {
          setIsLoadingSupervisor(false);
        }
      } else {
        // Use existing data if supervisor is already present
        setStudentUser(student);
        console.log('Using cached user data:', student);
        console.log('Cached supervisor:', student?.supervisor);
      }
    };

    if (user) {
      fetchUserDataIfNeeded();
    }
  }, [user, updateUser, isLoadingSupervisor]);

  console.log('Current studentUser.supervisor:', studentUser.supervisor);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Dashboard
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your projects and explore the repository
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-sm md:text-base">
                      <svg className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Project
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Submit a new research project to the repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to="/student/projects/new">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base h-9 md:h-10">
                        Create Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Projects
                    </CardTitle>
                    <CardDescription>
                      View and manage your submitted projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/student/projects">
                      <Button variant="outline" className="w-full">
                        View Projects
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Repository
                    </CardTitle>
                    <CardDescription>
                      Explore approved projects from senior students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/student/browse">
                      <Button variant="outline" className="w-full">
                        Browse Projects
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Supervisor
                    </CardTitle>
                    <CardDescription>
                      View your supervisor's profile and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/student/supervisor">
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Supervisor Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Supervisor</h3>
              
              <SupervisorProfile supervisor={studentUser?.supervisor} compact={true} />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity maxItems={5} showTitle={true} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;