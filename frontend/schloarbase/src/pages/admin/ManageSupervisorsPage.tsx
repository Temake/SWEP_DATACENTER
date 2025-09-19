import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import AdminNavigation from '../../components/common/AdminNavigation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { SupervisorAccount } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';



interface SupervisorFilters {
  search?: string;
  department?: string;
}

const ManageSupervisorsPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorAccount[]>([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState<SupervisorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupervisorFilters>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; supervisor?: SupervisorAccount }>({ open: false });

  const loadSupervisors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllSupervisors();
      setSupervisors(data);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
      toast.error('Failed to load supervisors');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...supervisors];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(supervisor =>
        supervisor.name.toLowerCase().includes(searchLower) ||
        supervisor.email.toLowerCase().includes(searchLower) ||
        (supervisor.specialization && supervisor.specialization.toLowerCase().includes(searchLower))
      );
    }

    if (filters.department) {
      filtered = filtered.filter(supervisor => supervisor.department === filters.department);
    }

    setFilteredSupervisors(filtered);
  }, [supervisors, filters]);

  useEffect(() => {
    loadSupervisors();
  }, [loadSupervisors]);

  useEffect(() => {
    applyFilters();
  }, [supervisors, filters, applyFilters]);

  const handleFilterChange = (newFilters: Partial<SupervisorFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };




  const handleDeleteSupervisor = async () => {
    if (!deleteDialog.supervisor) return;

    try {
      await apiService.deleteSupervisor(deleteDialog.supervisor.id);
      toast.success('Supervisor deleted successfully');
      setDeleteDialog({ open: false });
      loadSupervisors();
    } catch (error) {
      console.error('Failed to delete supervisor:', error);
      toast.error('Failed to delete supervisor');
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

    const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Computer Engineering',
    'Cyber Security',
    'Information Systems',
  ];
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading </p>
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
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Supervisors
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage supervisor accounts
              </p>
            </div>
           
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Supervisors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supervisors.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {departments.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                  Average Students per Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {supervisors.length > 0 
                    ? Math.round(supervisors.reduce((sum, s) => sum + (s.students?.length || 0), 0) / supervisors.length)
                    : 0
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search supervisors..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                
                <select
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange({ department: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={() => setFilters({})}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supervisors List */}
          {filteredSupervisors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSupervisors.map((supervisor) => (
                <Card key={supervisor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={supervisor.profile_picture || undefined} />
                        <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                          {getInitials(supervisor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {supervisor.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Supervisor
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white truncate">
                          {supervisor.email}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Department:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {supervisor.department}
                        </span>
                      </div>
                      
                      {supervisor.position && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Title:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {supervisor.position}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Students:</span>
                        <Badge variant="secondary" className="ml-2">
                          {supervisor.students?.length || 0} assigned
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {format(new Date(supervisor.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, supervisor })}
                      >
                        Delete
                      </Button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No supervisors found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {supervisors.length === 0 
                    ? "No supervisors have been registered yet."
                    : "No supervisors match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>


      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Supervisor"
        description={`Are you sure you want to delete ${deleteDialog.supervisor?.name}? This will unassign all their students. This action cannot be undone.`}
        onConfirm={handleDeleteSupervisor}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ManageSupervisorsPage;