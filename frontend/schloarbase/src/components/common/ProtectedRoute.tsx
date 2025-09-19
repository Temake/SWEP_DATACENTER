import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {jwtDecode, type JwtPayload} from 'jwt-decode'

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}
interface Decode{
  decode:JwtPayload
  exp:number
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { isAuthenticated, user} = useAuth();
  const location = useLocation();
useEffect( () =>{
checkToken();
},[location])
const checkToken = async () => {
  const access= localStorage.getItem("access_token")
  if(!access){
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const decode:Decode = jwtDecode(access)
  const exp = decode.exp
  const now = Date.now()/1000


  if (exp < now){
    localStorage.removeItem("user")
    return <Navigate to="/login" state={{ from: location }} replace />;
    
  }

}
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;