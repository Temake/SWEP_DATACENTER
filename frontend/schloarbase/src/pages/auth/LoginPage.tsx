import React, { useState, useEffect } from 'react';
import Logo from '../../components/common/logo'
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {Alert,  AlertTitle} from '../../components/ui/alert'
import {AlertCircleIcon}from 'lucide-react'
// import { useAuthhook } from "../../hooks/useApi"
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Role } from '../../types';
import ThemeToggle from '../../components/common/ThemeToggle';

const loginSchema = z.object({
  email: z
      .string()
      .email('Please enter a valid email address')
      .regex(
        /^[a-zA-Z0-9._%+-]+@oauife\.edu\.ng$/,
        'Only School email addresses are allowed'
      ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const {login,error} = useAuthhook()
  const { login,isAuthenticated, error} = useAuth();
  const role = searchParams.get('role') as Role | null;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email,data.password);
      toast.success('Login successful!');
      if (error){
        toast.error(error)
        console.log(error)
      }
     
      navigate('/dashboard');
      
    } catch (error: unknown) {
     
     
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case Role.STUDENT:
        return 'Student Login';
      case Role.SUPERVISOR:
        return 'Supervisor Login';
      case Role.ADMIN:
        return 'Admin Login';
      default:
        return 'Login';
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case Role.STUDENT:
        return 'Access your projects and browse the repository';
      case Role.SUPERVISOR:
        return 'Review and manage student submissions';
      case Role.ADMIN:
        return 'Manage the entire repository system';
      default:
        return 'Sign in to your account';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 backdrop-blur-sm shadow-xl">

        <CardHeader className="space-y-1 pb-4">
         <Logo/>
          <CardTitle className="text-xl md:text-2xl text-center text-gray-900 dark:text-white">
            {getRoleTitle()}
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-center text-gray-600 dark:text-gray-400">
            {getRoleDescription()}
          </CardDescription>
        </CardHeader>
     
        <CardContent>
          
             {error && (<Alert className='mr-5' variant="destructive">
        <AlertCircleIcon />
        <AlertTitle> {error}</AlertTitle>
      </Alert>)
          }
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white text-sm md:text-base">Email</FormLabel>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white text-sm md:text-base">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
              Don't have an account?{' '}
              <Link
                to={`/register${role ? `?role=${role}` : ''}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Register here
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs md:text-sm underline"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;