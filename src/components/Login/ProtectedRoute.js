import React from 'react';
import { Navigate } from 'react-router-dom';

// Component ProtectedRoute
const ProtectedRoute = ({ isAuthenticated, children }) => {
  // Nếu chưa đăng nhập, điều hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung của route
  return children;
};

export default ProtectedRoute;
