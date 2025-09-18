import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import type { CreateProjectRequest, Project, StudentAccount } from '../../types';
import { Tags } from '../../types';
import apiService from '../../services/api';
import { toast } from 'sonner';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  year: z.string().min(1, 'Year is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  file_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);
  const [existingProject, setExistingProject] = useState<Project | null>(null);

  const isEdit = !!id;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      year: currentYear.toString(),
      description: '',
      file_url: '',
      tags: [],
      
    },
  });

  const loadProject = React.useCallback(async (projectId: number) => {
    try {
      setInitialLoading(true);
      const project = await apiService.getProject(projectId);
      setExistingProject(project);
      
      // Populate form with existing data
      form.setValue('title', project.title);
      form.setValue('year', project.year);
      form.setValue('description', project.description);
      form.setValue('file_url', project.file_url || '');
      setSelectedTags((project.tags || []).map(tag => tag as Tags));
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      navigate('/student/projects');
    } finally {
      setInitialLoading(false);
    }
  }, [form, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      loadProject(parseInt(id));
    }
  }, [id, isEdit, loadProject]);

  useEffect(() => {
    form.setValue('tags', selectedTags);
  }, [selectedTags, form]);

  const handleTagToggle = (tag: Tags) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setDocumentFile(file);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const projectData: CreateProjectRequest = {
        title: data.title,
        year: data.year,
        description: data.description,
        tags: selectedTags,
        file_url: data.file_url || undefined,
        document: documentFile || undefined,
        supervisor_id: user?.role === 'Student' ? (user as StudentAccount).supervisor_id : undefined,
      };

      if (isEdit && existingProject) {
        await apiService.updateProject({
          id: existingProject.id,
          ...projectData,
        });
        toast.success('Project updated successfully!');
      } else {
         console.log(projectData);
        await apiService.createProject(projectData);
       
        toast.success('Project created successfully!');
      }
      
      navigate('/student/projects');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(isEdit ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const availableTags = Object.values(Tags).filter(tag => tag !== Tags.OTHERS);

  if (initialLoading) {
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
              <Link to="/student/dashboard" className="flex items-center">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ScholarBase</h1>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/student/dashboard" className="text-gray-400 hover:text-gray-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link to="/student/projects" className="text-gray-400 hover:text-gray-500">
                  Projects
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-500">
                  {isEdit ? 'Edit Project' : 'New Project'}
                </span>
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isEdit ? 'Update your project details' : 'Submit your research project to the repository'}
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your project title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Year */}
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Year *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of your project..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File URL */}
                  <FormField
                    control={form.control}
                    name="file_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project File URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/username/project or https://drive.google.com/..."
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Link to your project files (GitHub repository, Google Drive, etc.)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags */}
                  <div>
                    <FormLabel>Project Tags *</FormLabel>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Select tags that best describe your project
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? "default" : "secondary"}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                    {selectedTags.length === 0 && (
                      <p className="text-red-500 text-sm mt-2">At least one tag is required</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <FormLabel>Documentation Upload</FormLabel>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload project documentation, report, or thesis (optional)
                    </p>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                    />
                    {documentFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {documentFile.name}
                      </p>
                    )}
                    {existingProject?.document_url && !documentFile && (
                      <p className="text-sm text-blue-600 mt-1">
                        Current document: <a href={existingProject.document_url} target="_blank" rel="noopener noreferrer" className="underline">View existing document</a>
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={loading || selectedTags.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
                    </Button>
                    <Link to="/student/projects">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectForm;