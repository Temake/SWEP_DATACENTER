import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { StudentAccount, SupervisorAccount, StudentFilters } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StudentFormData {
  name: string;
  email: string;
  matric_no: string;
  year: string;
  department: string;
  supervisor_id?: number;
}

interface StudentDialogData {
  open: boolean;
  mode: 'create' | 'edit' | 'assign';
  student?: StudentAccount;
}

const ManageStudentsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [supervisors, setSupervisors] = useState<SupervisorAccount[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StudentFilters>({});
  const [studentDialog, setStudentDialog] = useState<StudentDialogData>({ open: false, mode: 'create' });
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    matric_no: '',
    year: '',
    department: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student?: StudentAccount }>({ open: false });

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllStudents(filters);
      setStudents(response);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSupervisors = useCallback(async () => {
    try {
      const data = await apiService.getAllSupervisors();
      setSupervisors(data);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadSupervisors();
  }, [loadStudents, loadSupervisors]);

  const applyFilters = useCallback(() => {
    let filtered = [...students];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.matric_no.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(student => student.department === filters.department);
    }

    if (filters.supervisor_id) {
      filtered = filtered.filter(student => student.supervisor_id === filters.supervisor_id);
    }

    setFilteredStudents(filtered);
  }, [students, filters]);

  useEffect(() => {
    applyFilters();
  }, [students, filters, applyFilters]);

  const handleFilterChange = (newFilters: Partial<StudentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCreateStudent = () => {
    setFormData({
      name: '',
      email: '',
      matric_no: '',
      year: '',
      department: '',
    });
    setStudentDialog({ open: true, mode: 'create' });
  };

  const handleEditStudent = (student: StudentAccount) => {
    setFormData({
      name: student.name,
      email: student.email,
      matric_no: student.matric_no,
      year: student.year || '',
      department: student.department,
      supervisor_id: student.supervisor_id,
    });
    setStudentDialog({ open: true, mode: 'edit', student });
  };

  const handleAssignSupervisor = (student: StudentAccount) => {
    setFormData({
      name: student.name,
      email: student.email,
      matric_no: student.matric_no,
      year: student.year || '',
      department: student.department,
      supervisor_id: student.supervisor_id,
    });
    setStudentDialog({ open: true, mode: 'assign', student });
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (studentDialog.mode === 'create') {
        await apiService.createStudent(formData);
        toast.success('Student created successfully');
      } else if (studentDialog.mode === 'edit' && studentDialog.student) {
        await apiService.updateStudent(studentDialog.student.id, formData);
        toast.success('Student updated successfully');
      } else if (studentDialog.mode === 'assign' && studentDialog.student && formData.supervisor_id) {
        await apiService.assignSupervisor(studentDialog.student.id, formData.supervisor_id);
        toast.success('Supervisor assigned successfully');
      }
      
      setStudentDialog({ open: false, mode: 'create' });
      loadStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
      toast.error('Failed to save student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteDialog.student) return;

    try {
      await apiService.deleteStudent(deleteDialog.student.id);
      toast.success('Student deleted successfully');
      setDeleteDialog({ open: false });
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error('Failed to delete student');
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  const departments = [...new Set(students.map(s => s.department))];

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
              <Link to="/admin/dashboard" className="flex items-center">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ScholarBase Admin</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Students
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create, edit, and assign supervisors to students
              </p>
            </div>
            <Button onClick={handleCreateStudent}>
              Add New Student
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Search students..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                
                <Select
                  value={filters.department || ''}
                  onValueChange={(value) => handleFilterChange({ department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.year || ''}
                  onValueChange={(value) => handleFilterChange({ year: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.supervisor_id?.toString() || ''}
                  onValueChange={(value) => handleFilterChange({ supervisor_id: value ? Number(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Supervisors</SelectItem>
                    <SelectItem value="0">Unassigned</SelectItem>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setFilters({})}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.profile_picture || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.matric_no}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white truncate">
                          {student.email}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Year:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {student.year || 'Not specified'}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Department:</span>
                        <span className="ml-2 text-gray-900 dark:text-white truncate">
                          {student.department}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Supervisor:</span>
                        {student.supervisor ? (
                          <Badge variant="secondary" className="ml-2">
                            {student.supervisor.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {format(new Date(student.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditStudent(student)}>
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignSupervisor(student)}
                        className="flex-1"
                      >
                        {student.supervisor ? 'Reassign' : 'Assign'} Supervisor
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, student })}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No students found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {students.length === 0 
                    ? "No students have been registered yet."
                    : "No students match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Student Dialog */}
      <Dialog open={studentDialog.open} onOpenChange={(open) => setStudentDialog({ ...studentDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {studentDialog.mode === 'create' ? 'Create New Student' : 
               studentDialog.mode === 'edit' ? 'Edit Student' : 'Assign Supervisor'}
            </DialogTitle>
            <DialogDescription>
              {studentDialog.mode === 'assign' 
                ? 'Select a supervisor for this student.'
                : 'Fill in the student information below.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {studentDialog.mode !== 'assign' ? (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="matric_no">Matriculation Number</Label>
                  <Input
                    id="matric_no"
                    value={formData.matric_no}
                    onChange={(e) => setFormData({ ...formData, matric_no: e.target.value })}
                    placeholder="Enter matriculation number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData({ ...formData, year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </>
            ) : null}
            
            {(studentDialog.mode === 'create' || studentDialog.mode === 'assign') && (
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select
                  value={formData.supervisor_id?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, supervisor_id: value ? Number(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Supervisor</SelectItem>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStudentDialog({ open: false, mode: 'create' })}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={formLoading || !formData.name || !formData.email || !formData.matric_no}
            >
              {formLoading ? 'Saving...' : 
               studentDialog.mode === 'create' ? 'Create Student' : 
               studentDialog.mode === 'edit' ? 'Update Student' : 'Assign Supervisor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteDialog.student?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteStudent}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ManageStudentsPage;