// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss'; 
import { useDispatch,useSelector  } from 'react-redux';
import { logOut } from '../../../store/actions/authActions';

function Header() {
  
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const handleLogout =()=>{
    if(isAuthenticated){
    dispatch(logOut())
    console.log('User logged out');
    }
  }
  return (
    <header className="header">
      <div className="header__logo">Admin Dashboard</div>
      <nav className="header__nav">
        <ul className="header__nav-list">
          <li className="header__nav-item">
            <Link to="/feedBack" className="header__nav-link">Phản Hồi</Link>
          </li>
          <li className="header__nav-item">
            <Link to="/users" className="header__nav-link">Quản lý User</Link>
          </li>
          <li className="header__nav-item header__nav-item--dropdown">
            <span className="header__nav-link">Quản lý Âm Nhạc</span>
            <ul className="header__dropdown">
              <li className="header__dropdown-item">
                <Link to="/music/list" className="header__dropdown-link">Danh sách nhạc</Link>
              </li>
              <li className="header__dropdown-item">
                <Link to="/album/add" className="header__dropdown-link">Thêm Abum</Link>
              </li>
              <li className="header__dropdown-item">
                <Link to="/artist/add" className="header__dropdown-link">Thêm Ca sĩ</Link>
              </li>
            </ul>
          </li>
          <li className="header__nav-item">
            <Link to="/post" className="header__nav-link">Quản lý Bài Đăng</Link>
          </li>
          <li className="header__nav-item header__nav-item--logout">
          <button  
              className="header__nav-logout-button"
              aria-label="Logout"
              onClick={handleLogout}
            >Đăng Xuất</button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
