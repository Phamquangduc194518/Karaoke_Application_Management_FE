import React, { useState, useEffect } from "react";
import "./AddMusic.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { addMusic, getAllArtist } from "../../services/adminService.js";

const AddMusicForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    artist_id: "",
    genre: "",
    lyrics: "",
    audio_url: "",
    url_image:"",
  });

  const [artists, setArtists] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await getAllArtist();
        setArtists(response.data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };
    fetchArtists();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLyricChange = (value) => {
    setFormData((prev) => ({ ...prev, lyrics: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Tên bài hát không được để trống";
    if (!formData.subTitle.trim()) newErrors.subTitle = "Giới thiệu bài hát không được để trống";
    if (!formData.artist_id.trim()) newErrors.artist_id = "Ca sĩ không được để trống";
    if (!formData.genre) newErrors.genre = "Thể loại không được để trống";
    if (!formData.audio_url.trim()) newErrors.audio_url = "URL Audio không được để trống";
    if (!formData.url_image.trim()) newErrors.url_image = "URL Ảnh bìa không được để trống";
    if (!formData.lyrics.trim()) newErrors.lyrics = "Lời bài hát không được để trống";

    console.log("Dữ liệu gửi lên API:", formData);

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await addMusic(formData);
      console.log(response.data)
      alert("Bài hát đã được tạo thành công!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Đã xảy ra lỗi khi tạo bài hát.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">TẠO BÀI HÁT MỚI</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
             {/* Phần giới thiệu */}
          <div className="form-column">
            <label className="form-label">Giới thiệu</label>
            <textarea
               className="form-control form-intro"
              placeholder="Thông tin giới thiệu..."
              name="subTitle"
              value={formData.subTitle}
              onChange={handleInputChange}
            ></textarea>
            {errors.subTitle && <p className="error-message">{errors.subTitle}</p>}
          </div>
           {/* Nút Lưu bài hát */}
           <div className="button-container">
            <button type="submit" className="btn-save" onClick={handleSubmit}>
            Lưu bài hát
            </button>
            </div>
        </div>
        <div className="form-row">
          <div className="form-column">
            <label className="form-label">Tên bài hát</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tên bài hát..."
            />
            {errors.title && <p className="error-message">{errors.title}</p>}
          </div>
          <div className="form-column">
            <label className="form-label">Ca sĩ</label>
            <select
              className="form-control"
              name="artist_id"
              value={formData.artist_id}
              onChange={handleInputChange}
            >
              <option value="">Chọn ca sĩ...</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
            {errors.artist_id && <p className="error-message">{errors.artist_id}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-column">
            <label className="form-label">Thể loại</label>
            <select
              className="form-control"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
            >
              <option value="">Chọn thể loại...</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
            </select>
            {errors.genre && <p className="error-message">{errors.genre}</p>}
          </div>
          <div className="form-column">
            <label className="form-label">URL Audio</label>
            <input
              type="url"
              className="form-control"
              name="audio_url"
              value={formData.audio_url}
              onChange={handleInputChange}
              placeholder="Nhập URL audio..."
            />
            {errors.audio_url && <p className="error-message">{errors.audio_url}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-column">
            <label className="form-label">URL Ảnh bìa</label>
            <input
              type="url"
              className="form-control"
              name="url_image"
              value={formData.url_image}
              onChange={handleInputChange}
              placeholder="Nhập URL ảnh bìa..."
            />
            {errors.url_image && <p className="error-message">{errors.url_image}</p>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Lời bài hát</label>
          <ReactQuill
            theme="snow"
            name="lyrics"
            value={formData.lyrics}
            onChange={handleLyricChange}
            style={{
              height: "200px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
          {errors.lyrics && <p className="error-message">{errors.lyrics}</p>}
        </div>
      </form>
    </div>
  );
};

export default AddMusicForm;