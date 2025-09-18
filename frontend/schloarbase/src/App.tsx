
import { BrowserRouter as Router, Routes, Route,Navigate} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import MyProjectsPage from './pages/student/MyProjectsPage';
import ProjectForm from './pages/student/ProjectForm';
import BrowseProjectsPage from './pages/student/BrowseProjectsPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisedProjectsPage from './pages/supervisor/SupervisedProjectsPage';
import StudentListPage from './pages/supervisor/StudentListPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudentsPage from './pages/admin/ManageStudentsPage';
import ManageSupervisorsPage from './pages/admin/ManageSupervisorsPage';
import ManageProjectsPage from './pages/admin/ManageProjectsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { Role } from './types';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
           
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
           <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
         
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                  <StudentDashboard />
                  </ProtectedRoute>
                  

                
              }
            />
           
              <Route
              path="/student/projects"
              element={
                <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                  <MyProjectsPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/student/projects/new"
              element={
               <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                  <ProjectForm />
               </ProtectedRoute>
              
              }
            /> 
            
            <Route
              path="/student/projects/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                  <ProjectForm />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/student/browse"
              element={
                
                  <BrowseProjectsPage />
               
              }
            />
   
            <Route
              path="/supervisor/dashboard"
              element={
                <ProtectedRoute allowedRoles={[Role.SUPERVISOR]}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/supervisor/projects"
              element={
                <ProtectedRoute allowedRoles={[Role.SUPERVISOR]}>
                  <SupervisedProjectsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/supervisor/students"
              element={
                <ProtectedRoute allowedRoles={[Role.SUPERVISOR]}>
                  <StudentListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <ManageStudentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/supervisors"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <ManageSupervisorsPage />
                </ProtectedRoute>
              }
            /> 
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                  <ManageProjectsPage />
                  </ProtectedRoute>
                
              }
            /> 
            
        
            <Route path="*" element={<Navigate to="/" replace />} /> 
          </Routes>

        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
