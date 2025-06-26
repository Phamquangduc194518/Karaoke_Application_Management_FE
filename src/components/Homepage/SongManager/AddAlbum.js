import React, { useState, useEffect } from "react";
import "./AddAlbum.scss";
import { createAlbum, getAllAlbum, getAllArtist, updateAlbum } from "../../../services/adminService";

const AddAlbum = () => {

  const [artists, setArtists] = useState([]) // lưu danh sách ca sĩ
  const [albums, setAlbums] = useState([]) // lưu danh sách album
  const [albumData, setAlbumData] = useState({
    title: "",
    subTitle: "",
    cover_url: "",
    artist_id: "",
  })  
  const[selectedAlbumId, setSelectedAlbumId] = useState(null) // Lưu id album đang chỉnh sửa

  const fetchArtists = async() =>{
      try{
        const artist = await getAllArtist()
        setArtists(artist.data)
      }catch(error){
        console.error("Error fetching artists:", error);
      }
  }

  const fetchAlbums = async()=>{
    try{
        const album = await getAllAlbum()
        setAlbums(album.data)
    }catch(error){
      console.error("Error fetching album:", error);
    }
  }

  useEffect(()=>{
    fetchArtists();
    fetchAlbums();
  },[]);

  const handleInputChange = (e) =>{
    const {name, value} = e.target;
    setAlbumData((prev)=> ({...prev, [name]: value}));
  };

  const handleSave = async() =>{
    if(selectedAlbumId){
        // Cập nhật album
        const response = await updateAlbum(selectedAlbumId,albumData)
        console.log(response.data)
        console.log(selectedAlbumId)
        setAlbums((prev)=>prev.map((album)=> 
        album.id === selectedAlbumId? response.data : album)
      )
      alert("Cập nhật thành công!");
    }else{
        // Thêm mới album
        try{
          const response = await createAlbum(albumData)
          setAlbums((prev) => [...prev, response.data]);
      }catch(error){
          console.error("Error creating album:", error);
      }
    }
    setAlbumData({ title: "", subTitle: "", cover_url: "", artist_id: "" });
    setSelectedAlbumId(null);
  }
  const handleEdit  = (album) =>{
    setSelectedAlbumId(album.id);
    setAlbumData({
      title: album.title,
      subTitle: album.subTitle,
      cover_url: album.cover_url,
      artist_id: album.artist_id,

    })
  }
  const getArtistName = (artistsId) =>{
    const artist  = artists.find((a)=> a.id = artistsId);
    return artist ? artist.name : "Không rõ";
  }
  

  return (
    <div className="album-management">
      <h2 className="title">QUẢN LÝ ALBUM</h2>
      <form className="form">
        <div className="form-group">
          <label>Tên album:</label>
          <input
            type="text"
            name="title"
            value={albumData.title}
            onChange={handleInputChange}
            placeholder="Nhập tên album..."
          />
        </div>
        <div className="form-group">
          <label>Mô tả:</label>
          <textarea
            name="subTitle"
            value={albumData.subTitle}
            onChange={handleInputChange}
            placeholder="Nhập mô tả album..."
          ></textarea>
        </div>
        <div className="form-group">
          <label>URL ảnh bìa:</label>
          <input
            type="text"
            name="cover_url"
            value={albumData.cover_url}
            onChange={handleInputChange}
            placeholder="Nhập URL ảnh bìa..."
          />
        </div>
        <div className="form-group">
          <label>Xem trước ảnh:</label>
          <div className="preview">
            {albumData.cover_url ? (
              <img src={albumData.cover_url} alt="Preview" />
            ) : (
              <p>Chưa có ảnh bìa</p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Chọn ca sĩ:</label>
          <select
            name="artist_id"
            value={albumData.artist_id}
            onChange={handleInputChange}
          >
            <option value="">-- Chọn ca sĩ --</option>
            {artists.map((artist)=>
                <option key={artist.id} value={artist.id}>{artist.name}</option>
            )}
          </select>
        </div>
        <button type="button" className="save-button" onClick={handleSave}>
          {selectedAlbumId ? "Cập nhật" : "Thêm album"}
        </button>
      </form>

      <div className="album-list">
        <h3>Danh sách album</h3>
        <table>
          <thead>
            <tr>
              <th>Ảnh bìa</th>
              <th>Tên album</th>
              <th>Mô tả</th>
              <th>Ca sĩ</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album)=>(
                <tr key={album.id}>
                  <td>
                  <img src={album.cover_url} alt={album.title} />
                  </td>
                  <td>{album.title}</td>
                  <td>{album.subTitle}</td>
                  <td>{getArtistName(album.artist_id)}</td>
                  <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(album)}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-button"
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

export default AddAlbum;
