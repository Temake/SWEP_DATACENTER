import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin,  BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import StudentNavigation from '../../components/common/StudentNavigation';
import type { StudentAccount } from '../../types';
import api from '../../services/api';

const SupervisorProfilePage: React.FC = () => {
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
        } catch (error) {
          console.error('Failed to fetch fresh user data:', error);
        } finally {
          setIsLoadingSupervisor(false);
        }
      } else {
        // Use existing data if supervisor is already present
        setStudentUser(student);
      }
    };

    if (user) {
      fetchUserDataIfNeeded();
    }
  }, [user, updateUser, isLoadingSupervisor]);

  const supervisor = studentUser?.supervisor;

  if (isLoadingSupervisor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudentNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudentNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Back Button */}
            <div className="mb-6">
              <Link to="/student/dashboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Supervisor Assigned
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't been assigned a supervisor yet. Please contact your department administrator.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/student/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Supervisor
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View your supervisor's profile and contact information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                          {supervisor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{supervisor.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-sm">
                            {supervisor.position || 'Supervisor'}
                          </Badge>
                          <Badge variant="outline" className="text-sm">
                            {supervisor.department}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                          <a 
                            href={`mailto:${supervisor.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {supervisor.email}
                          </a>
                        </div>
                      </div>
                      
                      {supervisor.phone_number && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                            <a 
                              href={`tel:${supervisor.phone_number}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {supervisor.phone_number}
                            </a>
                          </div>
                        </div>
                      )}

                      {supervisor.office_address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Office</p>
                            <p className="text-gray-600 dark:text-gray-400">{supervisor.office_address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  {supervisor.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        About
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {supervisor.bio}
                      </p>
                    </div>
                  )}

                  {/* Faculty Information */}
                  {supervisor.faculty && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Academic Information
                      </h3>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Faculty</p>
                          <p className="text-gray-600 dark:text-gray-400">{supervisor.faculty}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`mailto:${supervisor.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  
                  {supervisor.phone_number && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.open(`tel:${supervisor.phone_number}`, '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Phone
                    </Button>
                  )}
                </CardContent>
              </Card>

    
             

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supervision Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                      <Badge variant="outline" className="text-xs">
                        {supervisor.department}
                      </Badge>
                    </div>
                    {supervisor.position && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Title</span>
                        <Badge variant="secondary" className="text-xs">
                          {supervisor.position}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorProfilePage;