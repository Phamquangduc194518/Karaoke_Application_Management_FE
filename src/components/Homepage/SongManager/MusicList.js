import React, { useEffect, useState } from "react";
import './MusicList.scss'
import {getAllMusic} from '../../services/adminService'
const MusicList = ()=>{

    const [songs, setSongs] = useState([]);

    useEffect(()=>{
        const fetchSongs = async()=>{
            try{
                const response = await getAllMusic();
                setSongs(response.data);
            }catch(error){
                console.error("Error fetching songs:", error);
            }
        };
        fetchSongs();
    },[]);


      
    return(
      <div className="song-list-container">
      <table className="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tiêu đề</th>
            <th>Thể loại</th>
            <th>Ngày thêm</th>
            <th>Giới Thiệu</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <div className="song-info">
                  <img
                    src={song.url_image} // Thay bằng URL ảnh bìa thật
                    alt="Album Cover"
                    className="song-cover"
                  />
                  <div>
                    <div className="song-title">{song.title}</div>
                    <div className="song-artist">{song.artist}</div>
                  </div>
                </div>
              </td>
              <td>{song.genre}</td>
              <td>Hôm nay</td> {/* Thay bằng ngày thêm thật nếu có */}
              <td>{song.subTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}

export default MusicList;