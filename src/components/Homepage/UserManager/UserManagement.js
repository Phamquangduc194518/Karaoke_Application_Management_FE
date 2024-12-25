import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.scss';
import {getAllAccount, updateProfile} from "../../services/adminService";

function UserManagement() {
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [selectedUser, setSelectedUser]= useState(null)// Người dùng đang chọn
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    phone: "",
    avatar_url: "",
    date_of_birth: "",
    gender: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllAccount();
      setUsers(response.data);
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
  const handleSelectUser = (user) =>{
    setSelectedUser(user.id);
    setFormData({
      email: user.email || "",
      password: "", // Không hiện mật khẩu
      username: user.username || "",
      phone: user.phone || "",
      avatar_url: user.avatar_url || "",
      date_of_birth: user.date_of_birth
      ? user.date_of_birth.replace(/\//g, "-") // Đổi từ yyyy/mm/dd sang yyyy-mm-dd
      : "",
      gender: user.gender || "",
    });
  };

  // Xử lý thay đổi trong form
  const handleChange = (e) =>{
      const {name, value} = e.target;
      setFormData((prev) => ({...prev, [name]: value}));
      console.log(name)
  };

  //update thông tin người dùng đã chọn
  const handleUpdateUser = async() =>{
    console.log("Date of Birth:", formData.date_of_birth); // Log để kiểm tra
    if (!selectedUser) {
      alert("Vui lòng chọn người dùng để cập nhật.");
      return;
    }
    try{
      const response = await updateProfile(selectedUser, formData);
      if (response.status === 200) {
        alert("Cập nhật thông tin người dùng thành công!");
        fetchUsers();
      }
    }catch(error){
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Đã xảy ra lỗi khi cập nhật người dùng.");
    };
  };


  return (
    <div className="user-management">
      <h2 className="title">QUẢN LÝ NGƯỜI DÙNG</h2>
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
                style={{ maxWidth: '200px', borderRadius: '8px' }}
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
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <button type="button" className="save-button" onClick={handleUpdateUser}>
          Lưu người dùng
        </button>
      </form>

      <div className="user-list">
        <h3>Danh sách người dùng</h3>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Date Of Birth</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.phone}</td>
                <td>{user.date_of_birth}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleSelectUser(user)}
                  >
                    Cập Nhật
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
  );
}

export default UserManagement;
