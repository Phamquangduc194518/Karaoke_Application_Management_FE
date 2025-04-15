import React, { useState, useEffect } from 'react';
import { 
  FaEye, FaTimes, FaTrash, FaCheck, FaBan, FaCalendarAlt, FaUser, 
  FaMusic, FaHeart, FaComment, FaFilter, FaSearch, FaChartBar
} from 'react-icons/fa';
import './CoverPostManager.scss';
import ReactPlayer from 'react-player';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { approveRecordedSong, countRecordedSongByStatus, deleteRecordedSongByAdmin, getRecordedSongsForAdmin, rejectRecordedSong} from '../services/adminService';


const CoverPostManager = () => {

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'stats'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [statsData, setStatsData] = useState({
    dailyPosts: [],
    statusDistribution: [],
    topUsers: []
  });
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getRecordedSongsForAdmin();
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (activeTab === 'pending') {
      filtered = filtered.filter(post => post.statusFromAdmin === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(post => post.statusFromAdmin === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(post => post.statusFromAdmin === 'rejected');
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.user.username.toLowerCase().includes(query)
      );
    }
 
    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.statusFromAdmin === filterStatus);
    }
   
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(post => {
        const postDate = new Date(post.upload_time);
        return postDate >= startDate && postDate <= endDate;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, searchQuery, filterStatus, dateRange]);

  useEffect(() => {
    if (posts.length > 0 && activeTab === 'stats') {
      calculateStatistics();
    }
  }, [posts, activeTab]);

  const calculateStatistics = () => {
    // 1. Thống kê bài đăng theo ngày (7 ngày gần nhất)
    const dailyPostsMap = {};
    const now = new Date();
    // Khởi tạo 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyPostsMap[dateStr] = 0;
    }
    
    // Đếm bài đăng theo ngày
    posts.forEach(post => {
        console.log("upload_time:", post.upload_time);
      const dateStr = new Date(post.upload_time).toISOString().split('T')[0];
      if (dailyPostsMap[dateStr] !== undefined) {
        dailyPostsMap[dateStr]++;
      }
    });
    
    const dailyPosts = Object.keys(dailyPostsMap).map(date => ({
      date: date,
      posts: dailyPostsMap[date]
    }));
    console.log(statsData)
    // 2. Phân bố trạng thái
    const statusCount = {
      'pending': 0,
      'approved':0,
      'rejected': 0
    };
    
    posts.forEach(post => {
      statusCount[post.statusFromAdmin]++;
    });
    
    const statusDistribution = [
      { name: 'Chờ duyệt', value: statusCount.pending, fill: '#FFBB28' },
      { name: 'Đã duyệt', value: statusCount.approved, fill: '#00C49F' },
      { name: 'Từ chối', value: statusCount.rejected, fill: '#FF8042' }
    ];
    
    // 3. Top người đăng nhiều nhất
    const userPostsMap = {};
    posts.forEach(post => {
      const username = post.user.username;
      userPostsMap[username] = (userPostsMap[username] || 0) + 1;
    });
    
    const userEntries = Object.entries(userPostsMap);
    userEntries.sort((a, b) => b[1] - a[1]); // Sắp xếp giảm dần
    
    const topUsers = userEntries.slice(0, 5).map(([name, count]) => ({
      name,
      posts: count
    }));
    
    setStatsData({
      dailyPosts,
      statusDistribution,
      topUsers
    });
  };

  // Xử lý chọn bài đăng
  const handleSelectPost = (post) => {
    setSelectedPost(post);
  };

  // Xử lý xóa bài đăng
  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
      try {
        await deleteRecordedSongByAdmin(postId);
        setPosts(posts.filter(post => post.id !== postId));
        if (selectedPost?.id === postId) {
          setSelectedPost(null);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Xóa bài đăng thất bại");
      }
    }
  };

  // Xử lý phê duyệt bài đăng
  const handleApprovePost = async (postId, e) => {
    e.stopPropagation();
    try {
      await approveRecordedSong(postId);
      const updatedPosts = posts.map(post => 
        post.id === postId ? { ...post, status: 'approved' } : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error approving post:", error);
      alert("Phê duyệt bài đăng thất bại");
    }
  };

  // Xử lý từ chối bài đăng
  const handleRejectPost = async (postId, e) => {
    e.stopPropagation();
    const reason = prompt("Lý do từ chối bài đăng:");
    if (reason !== null) {
      try {
        await rejectRecordedSong(postId, { reason });
        const updatedPosts = posts.map(post => 
          post.id === postId ? { ...post, status: 'rejected', rejectReason: reason } : post
        );
        setPosts(updatedPosts);
      } catch (error) {
        console.error("Error rejecting post:", error);
        alert("Từ chối bài đăng thất bại");
      }
    }
  };

  // Xử lý chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPost(null);
  };

  // Đổi định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy tên class dựa vào trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // Lấy tên trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Chờ duyệt';
    }
  };

  return (
    <div className="cover-post-management">
      <h2 className="title">QUẢN LÝ BÀI ĐĂNG COVER</h2>
      
      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          <FaMusic /> Tất cả bài đăng
        </button>
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          <FaFilter /> Chờ duyệt
        </button>
        <button 
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => handleTabChange('approved')}
        >
          <FaCheck /> Đã duyệt
        </button>
        <button 
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => handleTabChange('rejected')}
        >
          <FaBan /> Đã từ chối
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          <FaChartBar /> Thống kê
        </button>
      </div>
      
      {/* Danh sách và chi tiết bài đăng */}
      {activeTab !== 'stats' && (
        <div className="posts-container">
          {/* Bộ lọc và tìm kiếm */}
          <div className="filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, người đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
            
            <div className="filter-options">
              <div className="filter-group">
                <label>Trạng thái:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Từ ngày:</label>
                <input 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              
              <div className="filter-group">
                <label>Đến ngày:</label>
                <input 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="posts-content">
            {/* Danh sách bài đăng */}
            <div className="posts-list">
              <h3>Danh sách bài đăng ({filteredPosts.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ảnh</th>
                      <th>Tiêu đề</th>
                      <th>Người đăng</th>
                      <th>Ngày đăng</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map(post => (
                        <tr 
                          key={post.id} 
                          className={selectedPost?.id === post.id ? 'selected' : ''}
                          onClick={() => handleSelectPost(post)}
                        >
                          <td>{post.id}</td>
                          <td className="thumbnail-cell">
                            <img 
                              src={post.cover_image_url || '/images/default-cover.jpg'} 
                              alt={post.title}
                            />
                          </td>
                          <td className="title-cell">{post.title}</td>
                          <td>{post.user.username}</td>
                          <td>{formatDate(post.upload_time)}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(post.statusFromAdmin)}`}>
                              {getStatusText(post.statusFromAdmin)}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-button view-button"
                              onClick={(e) => {e.stopPropagation(); handleSelectPost(post);}}
                              title="Xem chi tiết"
                            >
                              <FaEye />
                            </button>
                            
                            {post.status === 'pending' && (
                              <>
                                <button
                                  className="action-button approve-button"
                                  onClick={(e) => handleApprovePost(post.id, e)}
                                  title="Phê duyệt"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="action-button reject-button"
                                  onClick={(e) => handleRejectPost(post.id, e)}
                                  title="Từ chối"
                                >
                                  <FaBan />
                                </button>
                              </>
                            )}
                            
                            <button
                              className="action-button delete-button"
                              onClick={(e) => handleDeletePost(post.id, e)}
                              title="Xóa bài đăng"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="no-data">Không có bài đăng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Chi tiết bài đăng */}
            {selectedPost && (
              <div className="post-detail">
                <div className="detail-header">
                  <h3>Chi tiết bài đăng</h3>
                  <button 
                    className="close-button"
                    onClick={() => setSelectedPost(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="detail-content">
                  <div className="detail-section">
                    <h4 className="post-title">{selectedPost.title}</h4>
                    <div className="post-meta">
                      <span className="post-author">
                        <FaUser /> {selectedPost.user.username}
                      </span>
                      <span className="post-date">
                        <FaCalendarAlt /> {formatDate(selectedPost.upload_time)}
                      </span>
                      <span className={`status-badge ${getStatusClass(selectedPost.statusFromAdmin)}`}>
                        {getStatusText(selectedPost.statusFromAdmin)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="media-preview">
                    <div className="video-player">
                      <ReactPlayer
                        url={selectedPost.recording_path}
                        controls
                        width="100%"
                        height="100%"
                        config={{
                          file: {
                            attributes: {
                              controlsList: 'nodownload'
                            }
                          }
                        }}
                      />
                    </div>
                    
                    <div className="cover-image">
                      <img 
                        src={selectedPost.cover_image_url || '/images/default-cover.jpg'} 
                        alt={selectedPost.title} 
                      />
                    </div>
                  </div>
                  
                  <div className="engagement-stats">
                    <div className="stat-box">
                      <FaHeart className="icon-heart" />
                      <div className="stat-data">
                        <span className="stat-number">{selectedPost.likes_count}</span>
                        <span className="stat-label">Lượt thích</span>
                      </div>
                    </div>
                    
                    <div className="stat-box">
                      <FaComment className="icon-comment" />
                      <div className="stat-data">
                        <span className="stat-number">{selectedPost.comments_count}</span>
                        <span className="stat-label">Bình luận</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPost.description && (
                    <div className="post-description">
                      <h4>Mô tả</h4>
                      <p>{selectedPost.description}</p>
                    </div>
                  )}
                  
                  {selectedPost.status === 'rejected' && selectedPost.rejectReason && (
                    <div className="reject-reason">
                      <h4>Lý do từ chối</h4>
                      <p>{selectedPost.rejectReason}</p>
                    </div>
                  )}
                  
                  <div className="action-buttons">
                    {selectedPost.status === 'pending' && (
                      <>
                        <button 
                          className="approve-btn" 
                          onClick={(e) => handleApprovePost(selectedPost.id, e)}
                        >
                          <FaCheck /> Phê duyệt
                        </button>
                        <button 
                          className="reject-btn" 
                          onClick={(e) => handleRejectPost(selectedPost.id, e)}
                        >
                          <FaBan /> Từ chối
                        </button>
                      </>
                    )}
                    <button 
                      className="delete-btn" 
                      onClick={(e) => handleDeletePost(selectedPost.id, e)}
                    >
                      <FaTrash /> Xóa bài đăng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Trang thống kê */}
      {activeTab === 'stats' && (
        <div className="statistics-dashboard">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <FaMusic />
              </div>
              <div className="stat-content">
                <h3>Tổng số bài đăng</h3>
                <p className="stat-number">{posts.length}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaFilter />
              </div>
              <div className="stat-content">
                <h3>Chờ duyệt</h3>
                <p className="stat-number">
                  {posts.filter(post => post.statusFromAdmin === 'pending').length}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaCheck />
              </div>
              <div className="stat-content">
                <h3>Đã duyệt</h3>
                <p className="stat-number">
                  {posts.filter(post => post.statusFromAdmin === 'approved').length}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaBan />
              </div>
              <div className="stat-content">
                <h3>Đã từ chối</h3>
                <p className="stat-number">
                  {posts.filter(post => post.statusFromAdmin === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Biểu đồ phân bố trạng thái */}
          <div className="chart-box">
            <h3>Phân bố trạng thái bài đăng</h3>
            {statsData.statusDistribution.length > 0 ? (
              <div className="chart-container pie-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statsData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statsData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bài đăng`, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>Không có dữ liệu</p>
              </div>
            )}
          </div>
          
          {/* Biểu đồ bài đăng theo ngày */}
          <div className="chart-box">
            <h3>Số lượng bài đăng theo ngày (7 ngày gần đây)</h3>
            {statsData.dailyPosts.length > 0 ? (
              <div className="chart-container line-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={statsData.dailyPosts}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} bài đăng`, 'Số lượng']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="posts" 
                      stroke="#8884d8" 
                      name="Bài đăng" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>Không có dữ liệu</p>
              </div>
            )}
          </div>
          
          {/* Biểu đồ top 5 người đăng nhiều nhất */}
          <div className="chart-box">
            <h3>Top 5 người dùng đăng nhiều nhất</h3>
            {statsData.topUsers.length > 0 ? (
              <div className="chart-container bar-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={statsData.topUsers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} bài đăng`, 'Số lượng']} />
                    <Bar dataKey="posts" fill="#8884d8" name="Số bài đăng" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverPostManager;