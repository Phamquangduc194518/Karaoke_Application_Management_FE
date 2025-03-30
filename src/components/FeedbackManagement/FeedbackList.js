import React, { useState, useEffect } from 'react';
import './FeedbackManagement.scss';
import { getSongRequestFromUser } from "../services//adminService";
import {createReplie} from "../services/adminService"
import {updateStatus} from "../services/adminService"

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [statistics, setStatistics] = useState({
    new: 0,
    pending: 0,
    resolved: 0,
    critical: 0
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchFeedbacks  = async () => {
        try{
            const response = await getSongRequestFromUser();
            const data = response.data;
            console.log(data)
            setFeedbacks(data);
            setFilteredFeedbacks(data);

            const stats = {
                new: data.filter(fb => fb.status === 'new').length,
                pending: data.filter(fb => fb.status === 'pending' || fb.status === 'in-progress').length,
                resolved: data.filter(fb => fb.status === 'resolved').length,
                critical: data.filter(fb => fb.priority === 'high').length
              };

              setStatistics(stats)
        }catch (error) {
            console.error('Lỗi khi lấy phản hồi:', error);
        }finally {
            setLoading(false);
          }
        };

        fetchFeedbacks();
    }, []);

  useEffect(() => {
    let filtered = [...feedbacks];
    
    if (activeTab !== 'all') {
      if (activeTab === 'critical') {
        filtered = filtered.filter(fb => fb.priority === 'high');
      } else {
        filtered = filtered.filter(fb => fb.status === activeTab);
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fb => 
        fb.title.toLowerCase().includes(query) || 
        fb.content.toLowerCase().includes(query) ||
        fb.requestUser.username.toLowerCase().includes(query) ||
        fb.requestUser.email.toLowerCase().includes(query)
      );
    }

    if(timeFilter !== 'all'){
      filtered  = filtered.filter(fb =>{
        const created = new Date(fb.createdAt);
        const now = new Date();
        if (timeFilter === 'today') {
          return created.toDateString() === now.toDateString();
        }
        if (timeFilter === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return created >= oneWeekAgo;
        }
        if (timeFilter === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(now.getDate() - 30);
          return created >= oneMonthAgo;
        }
        return true;
      });
    }
    
    setFilteredFeedbacks(filtered);
  }, [activeTab, searchQuery,timeFilter, feedbacks]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleStatusClick = () =>{
    setIsDropdownOpen(true);
  }
  const handleTimeFilterChange = (e) =>{
    setTimeFilter(e.target.value);
  }

  const handleStatusChange  = async(newStatus) =>{
    const request = {
        "request_id": selectedFeedback.id,
        "status": newStatus
    }
    console.log(request)          
    try{
      await updateStatus(request)
      const updatedFeedback = { ...selectedFeedback, status: newStatus };
      setSelectedFeedback(updatedFeedback);
      const updatedFeedbacks = feedbacks.map(fb =>
        fb.id === updatedFeedback.id ? updatedFeedback : fb
      );
      setFeedbacks(updatedFeedbacks);
      setIsDropdownOpen(false);
    }catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    }
  }

  const handleSendReply = async() => {
    if (!replyText.trim() || !selectedFeedback) return;
    const dataToSend = {
        request_id: selectedFeedback.id,
        content: replyText,
        is_admin: true
      };
    try{
    const response = await createReplie(dataToSend)
    const newReply = response.data.reply; 
    const updatedFeedback = {
        ...selectedFeedback,
        replies: [...selectedFeedback.replies, newReply],
        status: selectedFeedback.status === 'new' ? 'pending' : selectedFeedback.status
        };
    const updatedFeedbacks = feedbacks.map(fb =>
        fb.id === selectedFeedback.id ? updatedFeedback : fb
        );

    setFeedbacks(updatedFeedbacks);
    setSelectedFeedback(updatedFeedback);
    setReplyText('');
  
    if (selectedFeedback.status === 'new') {
        setStatistics(prev => ({
          ...prev,
          new: prev.new - 1,
          pending: prev.pending + 1
        }));
      }
    }catch (error) {
    console.error('Lỗi gửi phản hồi:', error);
    alert("Không thể gửi phản hồi. Vui lòng thử lại.");
    }
  };

  const handleResolveFeedback = async(feedbackId) => {
    const request = {
      "request_id": feedbackId,
      "status": "resolved"
    }
    try{
      await updateStatus(request)
      const feedback = feedbacks.find(fb => fb.id === feedbackId);
      if (!feedback) return;
      const updatedFeedback = { ...feedback, status: 'resolved' };
      const updatedFeedbacks = feedbacks.map(fb => 
        fb.id === feedbackId ? updatedFeedback : fb
    );
     setFeedbacks(updatedFeedbacks);
    
    if (selectedFeedback && selectedFeedback.id === feedbackId) {
      setSelectedFeedback(updatedFeedback);
    }
    
    setStatistics(prev => ({
      ...prev,
      new: prev.new - (feedback.status === 'new' ? 1 : 0),
      pending: prev.pending - (feedback.status === 'pending' || feedback.status === 'in-progress' ? 1 : 0),
      resolved: prev.resolved + 1
    }));
    }catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="feedback-management">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="title">Quản lý <span>Phản Ánh</span></h1>
        
        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm phản ánh..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <div className="filter-dropdown">
            <select value={timeFilter} onChange={handleTimeFilterChange}>
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics-cards">
        <div className="stat-card new">
          <div className="stat-title">
            <i className="fas fa-inbox"></i>
            Phản ánh mới
          </div>
          <div className="stat-value">{statistics.new}</div>
          <div className="stat-change positive">
            <i className="fas fa-arrow-up"></i>
            12% so với tuần trước
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-title">
            <i className="fas fa-clock"></i>
            Đang xử lý
          </div>
          <div className="stat-value">{statistics.pending}</div>
          <div className="stat-change negative">
            <i className="fas fa-arrow-down"></i>
            5% so với tuần trước
          </div>
        </div>
        
        <div className="stat-card resolved">
          <div className="stat-title">
            <i className="fas fa-check-circle"></i>
            Đã giải quyết
          </div>
          <div className="stat-value">{statistics.resolved}</div>
          <div className="stat-change positive">
            <i className="fas fa-arrow-up"></i>
            18% so với tuần trước
          </div>
        </div>
        
        <div className="stat-card critical">
          <div className="stat-title">
            <i className="fas fa-exclamation-triangle"></i>
            Ưu tiên cao
          </div>
          <div className="stat-value">{statistics.critical}</div>
          <div className="stat-change negative">
            <i className="fas fa-arrow-up"></i>
            7% so với tuần trước
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="feedback-tabs">
        <div 
          className={`feedback-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          <span>Tất cả</span>
          <span className="badge">{feedbacks.length}</span>
        </div>
        
        <div 
          className={`feedback-tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => handleTabChange('new')}
        >
          <span>Mới</span>
          <span className="badge">{statistics.new}</span>
        </div>
        
        <div 
          className={`feedback-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          <span>Đang xử lý</span>
          <span className="badge">{statistics.pending}</span>
        </div>
        
        <div 
          className={`feedback-tab ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => handleTabChange('resolved')}
        >
          <span>Đã giải quyết</span>
          <span className="badge">{statistics.resolved}</span>
        </div>
        
        <div 
          className={`feedback-tab ${activeTab === 'critical' ? 'active' : ''}`}
          onClick={() => handleTabChange('critical')}
        >
          <span>Ưu tiên cao</span>
          <span className="badge">{statistics.critical}</span>
        </div>
      </div>

      {/* Table */}
      <div className="feedback-table-container">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Chủ đề</th>
                <th>Trạng thái</th>
                <th>Mức độ ưu tiên</th>
                <th>Ngày gửi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map(feedback => (
                  <tr 
                    key={feedback.id}
                    className={selectedFeedback?.id === feedback.id ? 'selected' : ''}
                    onClick={() => handleSelectFeedback(feedback)}
                  >
                    <td>
                      <div className="user-info">
                        <img src={feedback.requestUser.avatar_url} alt={feedback.requestUser.username} />
                        <div className="user-details">
                          <span className="name">{feedback.requestUser.username}</span>
                          <span className="email">{feedback.requestUser.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="feedback-subject">{feedback.title}</div>
                    </td>
                    <td>
                      <div className="status-badge-container">
                        {isDropdownOpen && selectedFeedback?.id === feedback.id ?(
                          <select
                          className="status-select"
                          value={feedback.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          onBlur={() => setIsDropdownOpen(false)} // Đóng dropdown khi mất focus
                        >
                          <option value="new" >Mới</option>
                          <option value="pending">Chờ xử lý</option>
                          <option value="resolved">Đã giải quyết</option>
                        </select>
                            ):(
                      <div className={`status-badge ${feedback.status}`} onClick={(e) =>{
                        e.stopPropagation();
                        handleStatusClick();
                        handleSelectFeedback(feedback);
                      }}>
                        {feedback.status === 'new' && <span>Mới</span>}
                        {feedback.status === 'pending' && <span>Chờ xử lý</span>}
                        {feedback.status === 'resolved' && <span>Đã giải quyết</span>}
                      </div>
                      )}
                      </div>
                    </td>
                    <td>
                      <div className="priority-indicator">
                        <div className={`dot ${feedback.priority}`}></div>
                        <span>
                          {feedback.priority === 'high' && 'Cao'}
                          {feedback.priority === 'medium' && 'Trung bình'}
                          {feedback.priority === 'low' && 'Thấp'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="timestamp">{formatDate(feedback.createdAt)}</div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-btn" 
                          title="Xem chi tiết"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFeedback(feedback);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="resolve-btn" 
                          title="Đánh dấu đã giải quyết"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveFeedback(feedback.id);
                          }}
                          disabled={feedback.status === 'resolved'}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    <div>
                      <i className="fas fa-inbox"></i>
                      <p>Không tìm thấy phản ánh nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Feedback Details */}
      {selectedFeedback && (
        <div className="feedback-details-panel">
          <div className="feedback-details">
            <div className="feedback-header">
              <div className="feedback-info">
                <h3>{selectedFeedback.subject}</h3>
                <div className="meta-info">
                  <div className="user-info">
                    <img src={selectedFeedback.requestUser.avatar_url} alt={selectedFeedback.requestUser.username} />
                    <span>{selectedFeedback.requestUser.username}</span>
                  </div>
                  <div className="timestamp">
                    <i className="far fa-clock"></i>
                    <span>{formatDate(selectedFeedback.createdAt)}</span>
                  </div>
                  <div className={`status-badge ${selectedFeedback.status}`}>
                    {selectedFeedback.status === 'new' && <span>Mới</span>}
                    {selectedFeedback.status === 'pending' && <span>Chờ xử lý</span>}
                    {selectedFeedback.status === 'in-progress' && <span>Đang xử lý</span>}
                    {selectedFeedback.status === 'resolved' && <span>Đã giải quyết</span>}
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="resolve-btn"
                  onClick={() => handleResolveFeedback(selectedFeedback.id)}
                  disabled={selectedFeedback.status === 'resolved'}
                >
                  <i className="fas fa-check-circle"></i>
                  Đánh dấu đã giải quyết
                </button>
              </div>
            </div>
            
            <div className="feedback-content">
              <p>{selectedFeedback.content}</p>
            </div>
            
            <div className="conversation">
              <h4>Cuộc hội thoại</h4>
              
              <div className="messages">
                {selectedFeedback.replies.map((reply, index) => (
                  <div className="message" key={index}>
                    <div className="avatar">
                      <img 
                        src={reply.is_admin ? 'https://randomuser.me/api/portraits/men/41.jpg' : selectedFeedback.requestUser.avatar_url} 
                        alt={reply.is_admin ? 'Admin' : selectedFeedback.requestUser.username} 
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender">{reply.is_admin ? 'Quản trị viên' : selectedFeedback.requestUser.username}</span>
                        <span className="time">{formatDate(reply.createdAt)}</span>
                      </div>
                      <div className={`message-bubble ${reply.is_admin ? 'admin' : ''}`}>
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="reply-box">
                <div className="editor-toolbar">
                  <button title="In đậm"><i className="fas fa-bold"></i></button>
                  <button title="In nghiêng"><i className="fas fa-italic"></i></button>
                  <button title="Gạch chân"><i className="fas fa-underline"></i></button>
                  <button title="Danh sách"><i className="fas fa-list-ul"></i></button>
                </div>
                
                <textarea 
                  placeholder="Nhập phản hồi của bạn..."
                  value={replyText}
                  onChange={handleReplyChange}
                ></textarea>
                
                <div className="editor-footer">
                  <button className="attachment-btn">
                    <i className="fas fa-paperclip"></i>
                    Đính kèm tệp
                  </button>
                  
                  <button 
                    className="send-reply-btn"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;