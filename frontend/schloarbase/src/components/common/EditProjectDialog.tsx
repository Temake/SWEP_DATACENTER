import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Project, StudentAccount } from '../../types';
import { Tags } from '../../types';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  year: z.string().min(1, 'Year is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  file_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  project,
  open,
  onOpenChange,
  onSave,
}) => {
  const { user } = useAuth();
  const { updateProject, loading, error, clearError } = useProject();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const availableTags = Object.values(Tags).filter(tag => tag !== Tags.OTHERS);

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

  useEffect(() => {
    if (project && open) {
      form.setValue('title', project.title);
      form.setValue('year', project.year);
      form.setValue('description', project.description);
      form.setValue('file_url', project.file_url || '');
      
      const projectTags = project.tags || [];
      setSelectedTags(projectTags as Tags[]);
      form.setValue('tags', projectTags);
      
      // Clear any previous errors when opening
      clearError();
    }
  }, [project, open, form, clearError]);

  // Sync selectedTags with form tags
  useEffect(() => {
    form.setValue('tags', selectedTags);
  }, [selectedTags, form]);

  const handleTagToggle = (tag: Tags) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!project) return;
    
    try {
      const studentUser = user as StudentAccount;
      
      const updateData = {
        id: project.id,
        title: data.title,
        year: data.year,
        description: data.description,
        file_url: data.file_url || undefined,
        document: documentFile || undefined,
        tags: selectedTags,
        supervisor_id: studentUser.supervisor_id
      };

      const updatedProject = await updateProject(updateData);
      if (updatedProject) {
        onSave();
        onOpenChange(false);
      }
    } catch (error) {
      // Error handling is managed by ProjectContext
      console.error('Error updating project:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedTags([]);
    setDocumentFile(null);
    clearError(); // Clear any errors when closing
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project File URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://github.com/username/project or https://drive.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">Upload New Document (Optional)</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {documentFile && (
                <p className="text-sm text-green-600">
                  Selected: {documentFile.name}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;