import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.scss';
import { getAllAccount, updateProfile } from "../../services/adminService";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function UserManagement() {
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    phone: "",
    avatar_url: "",
    date_of_birth: "",
    gender: "",
    slogan: "",
    role: "",
    active: false,
  });
  const [activeTab, setActiveTab] = useState('userList'); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredUsers, setFilteredUsers] = useState([]); 

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    vipUsers: 0,
    genderDistribution: [],
    newUsersPerMonth: []
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(lowercaseQuery) ||
        user.email?.toLowerCase().includes(lowercaseQuery) ||
        user.phone?.includes(lowercaseQuery) ||
        user.role?.toLowerCase().includes(lowercaseQuery)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(user => user.active.toString() === statusFilter);
    }
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, users]);

  useEffect(() => {
    if (users.length > 0) {
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.active).length;
      const vipUsers = users.filter(user => user.role === 'vip').length;
      const genderCounts = users.reduce((acc, user) => {
        const gender = user.gender || 'Không xác định';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {});
      
      const genderDistribution = Object.keys(genderCounts).map(gender => ({
        name: gender,
        value: genderCounts[gender]
      }));
      const currentYear = new Date().getFullYear();
      const monthsData = Array(12).fill(0);
      users.forEach(user => {
        if (user.createdAt) {
          const createdDate = new Date(user.createdAt);
          if (createdDate.getFullYear() === currentYear) {
            monthsData[createdDate.getMonth()]++;
          }
        }
      });
      
      const newUsersPerMonth = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        users: monthsData[i] || Math.floor(Math.random() * 10)
      }));
      
      setStats({
        totalUsers,
        activeUsers,
        vipUsers,
        genderDistribution,
        newUsersPerMonth
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const response = await getAllAccount();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        await axios.delete(`users/deleteAccount/${userId}`);
        fetchUsers(); // Cập nhật lại danh sách sau khi xóa
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
      }
    }
  };

  // Khi chọn người dùng, đổ dữ liệu vào form
  const handleSelectUser = (user) => {
    setSelectedUser(user.id);
    setFormData({
      email: user.email || "",
      password: "", // Không hiện mật khẩu
      username: user.username || "",
      slogan: user.slogan || "",
      phone: user.phone || "",
      avatar_url: user.avatar_url || "",
      date_of_birth: user.date_of_birth
        ? user.date_of_birth.replace(/\//g, "-") // Đổi từ yyyy/mm/dd sang yyyy-mm-dd
        : "",
      gender: user.gender || "",
      role: user.role || "",
      active: user.active || false,
    });
    
    setActiveTab('editUser');
  };

  // Xử lý thay đổi trong form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Update thông tin người dùng đã chọn
  const handleUpdateUser = async () => {
    if (!selectedUser) {
      alert("Vui lòng chọn người dùng để cập nhật.");
      return;
    }
    try {
      const response = await updateProfile(selectedUser, formData);
      if (response.status === 200) {
        alert("Cập nhật thông tin người dùng thành công!");
        fetchUsers();
        setActiveTab('userList');
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Đã xảy ra lỗi khi cập nhật người dùng.");
    }
  };

  // Chuyển tab
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'userList') {
      setSelectedUser(null);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="user-management">
      <h2 className="title">QUẢN LÝ NGƯỜI DÙNG</h2>
      
      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'userList' ? 'active' : ''}`}
          onClick={() => switchTab('userList')}
        >
          <i className="fas fa-users"></i>
          Danh sách người dùng
        </button>
        <button 
          className={`tab-button ${activeTab === 'editUser' ? 'active' : ''}`}
          onClick={() => switchTab('editUser')}
          disabled={!selectedUser}
        >
          <i className="fas fa-user-edit"></i>
          Chỉnh sửa người dùng
        </button>
        <button 
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => switchTab('statistics')}
        >
          <i className="fas fa-chart-pie"></i>
          Thống kê
        </button>
      </div>
      
      {/* Statistics Dashboard */}
      {activeTab === 'statistics' && (
        <div className="statistics-dashboard">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>Tổng người dùng</h3>
                <p className="stat-number">{stats.totalUsers}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon active">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-content">
                <h3>Người dùng kích hoạt</h3>
                <p className="stat-number">{stats.activeUsers}</p>
                <p className="stat-percentage">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon vip">
                <i className="fas fa-crown"></i>
              </div>
              <div className="stat-content">
                <h3>Người dùng VIP</h3>
                <p className="stat-number">{stats.vipUsers}</p>
                <p className="stat-percentage">
                  {stats.totalUsers > 0 ? Math.round((stats.vipUsers / stats.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-box">
              <h3 className="chart-title">Phân bố giới tính</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-box">
              <h3 className="chart-title">Người dùng mới theo tháng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.newUsersPerMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="Người dùng mới" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-box full-width">
              <h3 className="chart-title">Phân tích người dùng theo loại tài khoản</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Thường', Số_lượng: users.filter(u => u.role !== 'vip').length },
                    { name: 'VIP', Số_lượng: stats.vipUsers },
                    { name: 'Kích hoạt', Số_lượng: stats.activeUsers },
                    { name: 'Chưa kích hoạt', Số_lượng: stats.totalUsers - stats.activeUsers },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Số_lượng" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Form */}
      {activeTab === 'editUser' && (
        <form className="form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Để trống nếu không thay đổi mật khẩu"
            />
          </div>
          
          <div className="form-group">
            <label>Ảnh đại diện:</label>
            <div className="file-upload">
              <input
                type="text"
                name="avatar_url"
                placeholder="Nhập URL ảnh"
                value={formData.avatar_url}
                onChange={handleChange}
              />
              <button type="button" className="upload-button">
                Tải ảnh
              </button>
              <button type="button" className="delete-button">
                Xóa ảnh
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>Xem trước:</label>
            <div className="preview">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Preview"
                />
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Slogan:</label>
            <textarea
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              placeholder="Nhập slogan cá nhân"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">-- Chọn loại tài khoản --</option>
              <option value="user">User</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Kích hoạt tài khoản
            </label>
          </div>
          
          <button type="button" className="save-button" onClick={handleUpdateUser}>
            Lưu thông tin
          </button>
        </form>
      )}
      
      {/* User List */}
      {activeTab === 'userList' && (
        <div className="user-list-section">
          <div className="list-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="fas fa-search"></i>
            </div>
            <div className="list-filters">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">Tất cả loại tài khoản</option>
                <option value="vip">VIP</option>
                <option value="normal">Thường</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Chưa kích hoạt</option>
              </select>
            </div>
          </div>
          
          <div className="user-list">
            <h3>Danh sách người dùng</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Avater</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Slogan</th>
                  <th>Date</th>
                  <th>Gender</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="avatar-cell">
                      <img src={user.avatar_url || '/default-avatar.png'} alt={user.username} />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td className="slogan-cell">{user.slogan}</td>
                    <td>{user.date_of_birth}</td>
                    <td>{user.gender}</td>
                    <td>
                      <span className={`user-role ${user.role}`}>
                        {user.role === 'vip' ? 'VIP' : 
                          user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={`user-status ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Hoạt động' : 'Chưa kích hoạt'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleSelectUser(user)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteUser(user.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;