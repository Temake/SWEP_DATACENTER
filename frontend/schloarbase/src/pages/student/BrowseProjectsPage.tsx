import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import  ProjectCard  from '../../components/common/ProjectCard';
import FilterBar  from '../../components/common/FilterBar';
import StudentNavigation from '../../components/common/StudentNavigation';
import SupervisorProfile from '../../components/common/SupervisorProfile';
import { type Project, Status, type ProjectFilters, type StudentAccount } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';

const BrowseProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    year: '',
    tags: [],
    department: '',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Only load approved projects for browsing
      const allProjects = await apiService.getProjects();
      const approvedProjects = allProjects.items.filter((project: Project) => project.status === Status.APPROVED);
      setProjects(approvedProjects);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...projects];

    // Search filter
    // Search filter (title and student name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        (project.student?.name && project.student?.name.toLowerCase().includes(searchLower))
      );
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(project => project.year === filters.year);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(project => 
        project.student?.department?.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    // Tags filter (multiple tags)
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags && project.tags.length > 0 && 
        filters.tags!.some(tag => project.tags!.some(projectTag => projectTag === tag))
      );
    }

    // Sort by most recent (default)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredProjects(filtered);
  }, [projects, filters]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters, applyFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      year: '',
      tags: [],
      department: '',
    });
  }, []);

  const getFilteredCount = () => {
    const activeFilters = [
      filters.search,
      filters.year,
      filters.department,
      filters.tags && filters.tags.length > 0,
    ].filter(Boolean).length;
    return activeFilters;
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
      <StudentNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Page Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Browse Projects
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore approved research projects from your institution
                </p>
              </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3v8m0 0V9a2 2 0 00-2-2H9m4 11h1m-1 0H9m4 0V9" />
                    </svg>
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Results</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{filteredProjects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Active Filters</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{getFilteredCount()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            onFiltersChange={(newFilters: ProjectFilters) => setFilters({ ...filters, ...newFilters })}
            onClearFilters={clearFilters}
            showYearFilter={true}
            showDepartmentFilter={true}
            years={years}
            departments={['Computer Science', 'Software Engineering', 'Information Technology', 'Computer Engineering']}
          />

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {projects.length === 0 
                    ? "There are no approved projects available yet."
                    : "No projects match your current filters. Try adjusting your search criteria."
                  }
                </p>
                {getFilteredCount() > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Want to submit your own project?
            </p>
            <Link to="/student/projects/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create New Project
              </Button>
            </Link>
          </div>
            </div>

            {/* Supervisor Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Supervisor</h3>
                <SupervisorProfile supervisor={(user as StudentAccount)?.supervisor} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseProjectsPage;