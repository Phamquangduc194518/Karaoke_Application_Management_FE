import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserManagement from './components/Homepage/UserManager/UserManagement';
import Header from './components/Homepage/Header/Header';
import Login from './components/Login/Login';
import AddMusic from './components/Homepage/SongManager/AddMusic'
import ProtectedRoute from './components/Login/ProtectedRoute';
import { useSelector } from 'react-redux'; // Lấy trạng thái từ Redux Store
import MusicList from './components/Homepage/SongManager/MusicList';
import AddArtist from './components/Homepage/SongManager/AddArtist';
import AddAlbum from './components/Homepage/SongManager/AddAlbum';

function App() {
  // Lấy trạng thái isAuthenticated từ Redux Store
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Route cho trang đăng nhập */}
          <Route path="/login" element={<Login />} />
          
          {/* Route cho trang quản lý người dùng */}
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
          <Route path="/music/add" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <>
              <Header/>
              <AddMusic/>
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
          {/* Route cho trang đăng nhập */}
          <Route path="*" element={<Login />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
