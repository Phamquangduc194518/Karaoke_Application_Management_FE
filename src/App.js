import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthState } from './store/actions/authActions';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from './components/Homepage/UserManager/UserManagement';
import Header from './components/Homepage/Header/Header';
import Login from './components/Login/Login';
import ProtectedRoute from './components/Login/ProtectedRoute';
import { useSelector } from 'react-redux'; // Lấy trạng thái từ Redux Store
import MusicList from './components/Homepage/SongManager/MusicList';
import AddArtist from './components/Homepage/SongManager/AddArtist';
import AddAlbum from './components/Homepage/SongManager/AddAlbum';
import TopicPost from './components/Homepage/PostManager/TopicPost'
import FeedbackManagement from './components/FeedbackManagement/FeedbackList';
import CoverPostManager from './components/CoverPostManager/CoverPostManager';

function App() {
  const dispatch = useDispatch();
  // Lấy trạng thái isAuthenticated từ Redux Store
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);
  
  return (
    <Router>
      <div className="container">
      <Routes>
          {/* Route mặc định */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/* Route cho trang quản lý người dùng */}
          <Route 
            path="/feedBack" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <>
                  <Header />
                  <FeedbackManagement />
                </>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <>
                  <Header />
                  <UserManagement />
                </>
              </ProtectedRoute>
            } 
          />
          <Route path='/music/list' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <MusicList/>
              </>
            </ProtectedRoute>
          }
          />
          <Route path='/album/add' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <AddAlbum/>
              </>
            </ProtectedRoute>
          }
          />
          <Route path='/artist/add' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <AddArtist/>
              </>
            </ProtectedRoute>
          }
          />
          <Route path='/post' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <TopicPost/>
              </>
            </ProtectedRoute>
          }
          />
          <Route path='/cover_post' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <CoverPostManager/>
              </>
            </ProtectedRoute>
          }
          />
          {/* Route cho trang đăng nhập */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
