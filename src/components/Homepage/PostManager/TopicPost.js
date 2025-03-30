import React, { useState, useEffect } from "react";
import "./TopicPost.scss";
import { createTopic, createVideoOfTopic, getAllTopicsWithVideo } from "../../services/adminService";

const TopicPost = () => {
  const [newTopic, setNewTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTitleVideo, setNewTitleVideo] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ show: false, message: "" });

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const topicList = await getAllTopicsWithVideo();
      setTopics(topicList.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách topic:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic.trim()) {
      showNotification("Vui lòng nhập tên topic!");
      return;
    }

    try {
      setLoading(true);
      const response = await createTopic({ title: newTopic });
      if (response && response.id) {
        const newTopicObject = {
          id: response.id,
          title: response.title || newTopic,
          videos: []
        };
        setTopics((prevTopics) => [...prevTopics, newTopicObject]);
        setSelectedTopic(response.id.toString());
        setNewTopic("");
        fetchTopics();
        showNotification("Tạo topic thành công!", true);
      }
    } catch (error) {
      console.error("Lỗi khi tạo topic:", error);
      showNotification("Không thể tạo topic. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTopic || !newTitleVideo.trim() || !videoURL.trim() || !thumbnail.trim()) {
      showNotification("Vui lòng điền đủ thông tin.");
      return;
    }
    
    const video = {
      topicId: Number(selectedTopic),
      title: newTitleVideo.trim(),
      url: videoURL.trim(),
      thumbnail: thumbnail.trim()
    };
    
    try {
      setLoading(true);
      const response = await createVideoOfTopic(video);
      console.log("Video đã được tạo:", response);
      showNotification("Video đã được tạo thành công!", true);
      setNewTitleVideo("");
      setVideoURL("");
      setThumbnail("");
      fetchTopics();
    } catch (error) {
      console.error("Lỗi khi tạo video cho topic:", error);
      showNotification("Không thể tạo video cho topic. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo
  const showNotification = (message, isSuccess = false) => {
    setSuccess({
      show: true,
      message: message,
      type: isSuccess ? "success" : "error"
    });

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setSuccess({ show: false, message: "" });
    }, 3000);
  };

  // Chuyển đổi URL YouTube thành URL nhúng
  const getEmbedUrl = (url) => {
    if (!url) return "";
    // Xử lý URL YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  // Render topic và video list
  const renderTopicsList = () => {
    if (topics.length === 0) {
      return (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Chưa có Topic nào</h3>
          <p>Hãy tạo Topic mới để bắt đầu thêm Video</p>
        </div>
      );
    }

    return (
      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-card">
            <div className="topic-header">
              <h3>{topic.title}</h3>
              <span className="video-count">
                {topic.videos ? topic.videos.length : 0} videos
              </span>
            </div>
            
            {topic.videos && topic.videos.length > 0 ? (
              <div className="videos-grid">
                {topic.videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <div className="thumbnail-container">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="video-thumbnail"
                      />
                      <div className="play-button">
                        <i className="fas fa-play"></i>
                      </div>
                    </div>
                    <h4 className="video-title">{video.title}</h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-videos">
                <p>Chưa có video nào trong topic này</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container_topic">
      <h2 className="title">Quản lý Topic và Video</h2>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          <i className="fas fa-plus-circle"></i>
          Tạo mới Topic & Video
        </button>
        <button 
          className={`tab-button ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          <i className="fas fa-list"></i>
          Danh sách Topic & Video
        </button>
      </div>

      {/* Notification */}
      {success.show && (
        <div className={`notification ${success.type}`}>
          <i className={`fas ${success.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
          <span>{success.message}</span>
        </div>
      )}

      {/* Create Tab Content */}
      {activeTab === "create" && (
        <>
          <div className="form_container_topic">
            {/* Cột trái - Tạo Topic */}
            <div className="column_topic">
              <h3 className="section-title">
                <i className="fas fa-folder-plus"></i>
                Tạo Topic Mới
              </h3>
              <label className="label">Tên topic mới:</label>
              <div className="input-group">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Nhập tên topic"
                />
                <button 
                  className="btn-add-topic" 
                  onClick={handleAddTopic}
                  disabled={loading}
                >
                  {loading ? "Đang tạo..." : "Thêm Topic"}
                </button>
              </div>
              <div className="info-box">
                <i className="fas fa-info-circle"></i>
                <p>Topic là chủ đề để nhóm các video liên quan đến nhau.</p>
              </div>
            </div>

            {/* Cột phải - Chọn Topic và nhập Video */}
            <div className="column_topic">
              <h3 className="section-title">
                <i className="fas fa-video"></i>
                Thêm Video Vào Topic
              </h3>
              <label className="label">Chọn topic:</label>
              <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="select-topic"
              >
                <option value="">-- Chọn topic --</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>

              <label className="label">Tiêu đề Video:</label>
              <input
                type="text"
                value={newTitleVideo}
                onChange={(e) => setNewTitleVideo(e.target.value)}
                placeholder="Nhập tiêu đề video"
              />

              <label className="label">URL Video:</label>
              <input
                type="text"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="Nhập URL video (YouTube)"
              />

              <label className="label">URL Ảnh đại diện:</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="Nhập URL cho thumbnail"
              />
              
              {/* Preview section */}
              <div className="preview-section">
                {thumbnail && (
                  <div className="preview-item">
                    <h4>Preview Thumbnail:</h4>
                    <img src={thumbnail} alt="Thumbnail Preview" className="thumbnail-preview" />
                  </div>
                )}
                
                {videoURL && (
                  <div className="preview-item">
                    <h4>Preview Video:</h4>
                    <div className="video-embed">
                      <iframe
                        src={getEmbedUrl(videoURL)}
                        title="Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Lưu Video
              </>
            )}
          </button>
        </>
      )}

      {/* List Tab Content */}
      {activeTab === "list" && (
        <div className="list-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            renderTopicsList()
          )}
        </div>
      )}
    </div>
  );
};

export default TopicPost;