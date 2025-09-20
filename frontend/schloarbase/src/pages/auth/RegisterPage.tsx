import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertTitle } from '../../components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../../types';
import ThemeToggle from '../../components/common/ThemeToggle';

const baseRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .regex(
      /^[a-zA-Z0-9._%+-]+@oauife\.edu\.ng$/,
      'Only School email addresses are allowed'
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(Role),
  department: z.string().min(1, 'Department is required'),
});

const studentRegisterSchema = baseRegisterSchema.extend({
  matric_no: z.string().min(1, 'Matric number is required'),
  level: z.string().min(1, 'Level is required'),
});

const supervisorRegisterSchema = baseRegisterSchema.extend({
  faculty: z.string().optional(),
  phone_number: z.string().optional(),
  office_address: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
});

const adminRegisterSchema = baseRegisterSchema.extend({
  faculty: z.string().optional(),
  phone_number: z.string().optional(),
  office_address: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
});

// Complete form data type including all possible fields
type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Student' | 'Supervisor' | 'Admin';
  department: string;
  matric_no?: string;
  level?: string;
  faculty?: string;
  phone_number?: string;
  office_address?: string;
  title?: string;
  bio?: string;
};

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isAuthenticated,error } = useAuth();
  const roleParam = searchParams.get('role') as Role | null;
  const [selectedRole, setSelectedRole] = useState<Role>(roleParam || Role.STUDENT);

  const getValidationSchema = () => {
    const baseSchema = baseRegisterSchema.refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    );

    if (selectedRole === Role.STUDENT) {
      return studentRegisterSchema.refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }
      );
    } else if (selectedRole === Role.SUPERVISOR) {
      return supervisorRegisterSchema.refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }
      );
    } else if (selectedRole === Role.ADMIN) {
      return adminRegisterSchema.refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }
      );
    }

    return baseSchema;
  };

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: selectedRole,
      department: '',
      matric_no: '',
      level: '',
      faculty: '',
      phone_number: '',
      office_address: '',
      title: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    form.setValue('role', selectedRole);
  }, [selectedRole, form]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {

      const { ...registerData } = data;
      await registerUser(registerData);
      if (!error){
      toast.success('Registration successful!');
      navigate('/dashboard');}
    } catch (error: unknown) {
     console.log(error)
      
    } finally {
      setLoading(false);
      toast.error(error);
    }
  };

  const levels = [
    "Undergraduate",
    "Postgraduate"
  ];

  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Computer Engineering',
    'Cyber Security',
    'Information Systems',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-lg bg-white/95 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">ScholarBase</span>
            </Link>
            <ThemeToggle />
          </div>
          <CardTitle className="text-xl md:text-2xl text-center text-gray-900 dark:text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-center text-gray-600 dark:text-gray-400">
            Join the ScholarBase community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm md:text-base">Role</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        setSelectedRole(value as Role);
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm md:text-base h-9 md:h-10">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value={Role.STUDENT}>Student</SelectItem>
                        <SelectItem value={Role.SUPERVISOR}>Supervisor</SelectItem>
                        <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm md:text-base">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm md:text-base">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              {selectedRole === Role.STUDENT && (
                <>
                  <FormField
                    control={form.control}
                    name="matric_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm md:text-base">Matric Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your matric number"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm md:text-base">Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm md:text-base h-9 md:h-10">
                              <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            {levels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white text-sm md:text-base">Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm md:text-base h-9 md:h-10">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              {selectedRole === Role.SUPERVISOR  && (
                <>
                  <FormField
                    control={form.control}
                    name="office_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm md:text-base">Office Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your office address"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {(selectedRole === Role.SUPERVISOR || selectedRole === Role.ADMIN) && (
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm md:text-base">Title</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm md:text-base h-9 md:h-10">
                              <SelectValue placeholder="Select your title" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            <SelectItem value="Prof">Prof</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm md:text-base">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm md:text-base">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Create a password"
                        type="password"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm md:text-base">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-9 md:h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base h-9 md:h-10"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs md:text-sm">
              Already have an account?{' '}
              <Link
                to={`/login${roleParam ? `?role=${roleParam}` : ''}`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-300 text-sm underline"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;