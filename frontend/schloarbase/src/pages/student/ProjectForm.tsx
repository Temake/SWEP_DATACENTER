import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { AlertCircle } from 'lucide-react';
import type { CreateProjectRequest, StudentAccount } from '../../types';
import { Tags } from '../../types';
import StudentNavigation from '@/components/common/StudentNavigation';

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
  const { user } = useAuth();
  const { 
    currentProject, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    loadProject,
    clearError 
  } = useProject();
  
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);

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

  // Load project for editing
  useEffect(() => {
    if (isEdit && id) {
      const projectId = parseInt(id);
      loadProject(projectId);
    }
  }, [id, isEdit, loadProject]);

  // Populate form when currentProject is loaded
  useEffect(() => {
    if (currentProject && isEdit) {
      form.setValue('title', currentProject.title);
      form.setValue('year', currentProject.year);
      form.setValue('description', currentProject.description);
      form.setValue('file_url', currentProject.file_url || '');
      setSelectedTags((currentProject.tags || []).map(tag => tag as Tags));
    }
  }, [currentProject, isEdit, form]);

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
        // Use toast or show error through context
        return;
      }
      
      setDocumentFile(file);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    // Clear any previous errors
    clearError();
    
    const projectData: CreateProjectRequest = {
      title: data.title,
      year: data.year,
      description: data.description,
      tags: selectedTags,
      file_url: data.file_url || undefined,
      document: documentFile || undefined,
      supervisor_id: user?.role === 'Student' ? (user as StudentAccount).supervisor_id : undefined,
    };

    let result;
    if (isEdit && currentProject) {
      result = await updateProject({
        id: currentProject.id,
        ...projectData,
      });
    } else {
      result = await createProject(projectData);
    }
    
    if (result) {
      navigate('/student/projects');
    }
  };

  const availableTags = Object.values(Tags).filter(tag => tag !== Tags.OTHERS);

  // Show loading spinner when loading a project for editing
  if (loading && isEdit && !currentProject) {
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudentNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  

  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentNavigation/>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
        

       
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isEdit ? 'Update your project details' : 'Submit your research project to the repository'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
                    {currentProject?.document_url && !documentFile && isEdit && (
                      <p className="text-sm text-blue-600 mt-1">
                        Current document: <a href={currentProject.document_url} target="_blank" rel="noopener noreferrer" className="underline">View existing document</a>
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