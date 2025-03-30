import React from 'react';
import { Navigate} from 'react-router-dom';
import { useSelector } from 'react-redux';

// Component ProtectedRoute
const ProtectedRoute = ({children, isAuthenticated}) => {
  console.log("Protected Route - Auth status:", isAuthenticated);
  // Nếu chưa xác thực, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung của route
  return children;
};

export default ProtectedRoute;
