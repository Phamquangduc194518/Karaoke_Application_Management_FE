import React, { useEffect, useState} from "react";
import "./AddArtist.scss";
import { createArtist, getAllArtist, updateArtist } from "../../../services/adminService";

const AddArtist  = () => {
  const [artist, setArtists] = useState([]) // lưu chữ danh sách ca sĩ
  const [artistData, setArtistData] = useState({
    name: "",
    bio: "",
    avatar_url: "",
  })
  const [message, setMessage] = useState("");
  const [editingArtistId, setEditingArtistId] = useState(null);

  const handleInputChange = (e)=>{
    const {name, value} = e.target
    setArtistData((prev)=>({...prev,[name]:value}))
  };

  const handleCreateArtist = async()=>{
    try{
        const response = await createArtist(artistData)
        setMessage("Ca sĩ được tạo thành công!");
    }catch(error){
        console.error("Error creating artist:", error);
        setMessage("Đã xảy ra lỗi khi tạo ca sĩ!");
    }
  }

  const handleSaveArtist = async()=>{
    try{
      if (editingArtistId) {
        // Nếu đang chỉnh sửa, gọi API update
        const response = await updateArtist(editingArtistId, artistData);
        setArtists((prev)=> prev.map((artist) => 
          artist.id === editingArtistId ? response.data : artist
      ));
      setMessage("Cập nhật ca sĩ thành công!");
      }else{
        handleCreateArtist()
      }
      // Reset form
      setArtistData({ name: "", bio: "", avatar_url: "" });
      setEditingArtistId(null); // Reset trạng thái chỉnh sửa

    }catch(error){
      console.error("Error saving artist:", error);
      setMessage("Đã xảy ra lỗi khi lưu ca sĩ.");
    }
  } 

  //lấy danh sách ca sĩ
  useEffect(()=>{
    const fetchArtists = async()=>{
      try{
        const response = await getAllArtist(); // Gọi API lấy danh sách ca sĩ
        setArtists(response.data || []); // Lưu danh sách ca sĩ vào state
      }catch(error){
        console.error("Error fetching artists:", error);
      }
    };
    fetchArtists();
  },[])

  const handleEdit = async()=>{

  }

  const handleDelete = async()=>{
  
  };
  const handleEditArtist = (artist) => {
    setArtistData({
      name: artist.name,
      bio: artist.bio,
      avatar_url: artist.avatar_url,
    });
    setEditingArtistId(artist.id); // Lưu ID ca sĩ đang chỉnh sửa
  };

  return (
    <div className="artist-management">
      <h2 className="title">QUẢN LÝ CA SĨ</h2>
      <form className="form">
        <div className="form-group">
          <label>Tên ca sĩ:</label>
          <input
            type="text"
            name="name"
            value={artistData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên ca sĩ..."
          />
        </div>
        <div className="form-group">
          <label>Tiểu sử:</label>
          <textarea
            name="bio"
            value={artistData.bio}
            onChange={handleInputChange}
            placeholder="Nhập tiểu sử ca sĩ..."
          ></textarea>
        </div>
        <div className="form-group">
          <label>URL ảnh đại diện:</label>
          <input
            type="text"
            name="avatar_url"
            value={artistData.avatar_url}
            onChange={handleInputChange}
            placeholder="Nhập URL ảnh đại diện..."
          />
        </div>
        <div className="form-group">
          <label>Xem trước ảnh:</label>
          <div className="preview">
            {artistData.avatar_url ? (
              <img src={artistData.avatar_url} alt="Preview" />
            ) : (
              <p>Chưa có ảnh đại diện</p>
            )}
          </div>
        </div>
        <button type="button" className="save-button" 
        onClick={handleSaveArtist}
        >Lưu ca sĩ</button>
      </form>

      <div className="artist-list">
        <h3>Danh sách ca sĩ</h3>
        <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Tiểu sử</th>
            </tr>
          </thead>
          <tbody>
            {artist.map((artist) => (
              <tr key={artist.id}>
                <td>
                  <img src={artist.avatar_url} alt={artist.name} />
                </td>
                <td>{artist.name}</td>
                <td>{artist.bio}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEditArtist(artist)}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(artist.id)}
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
  };
export default AddArtist ;
