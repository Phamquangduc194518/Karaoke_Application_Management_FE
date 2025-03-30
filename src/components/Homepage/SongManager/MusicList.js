import React, { useEffect, useState } from "react";
import './MusicList.scss';
import { getAllMusic, getAllArtist, getAllAlbum, deleteSong, addMusic, addSongToAlbum} from '../../services/adminService';
import { 
    FaPlay, FaPencilAlt,  FaTrash,   FaMusic,  FaEdit,   FaPlus,   FaSave,  FaTimes,   FaUpload,   FaChartBar,   FaUsers,   FaCalendarAlt,   FaStar,   FaVolumeUp 
} from 'react-icons/fa';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement,
    LineElement,
    Title, 
    Tooltip, 
    Legend
);
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC54F', '#EA80FC', '#00B8D4', '#FF5252'
];
const MusicList = () => {
    const [songs, setSongs] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [activeTab, setActiveTab] = useState('songList');
    const [genreFilter, setGenreFilter] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subTitle: '',
        artist_id: '', 
        genre: '',
        releaseDate: '',
        url_image: '',
        audioFile: null,
        lyrics: '',
        is_duet: 'false', 
        vip_required: 'false' ,
        album_id:''
    });
    const [previewImage, setPreviewImage] = useState('');
    const [artists, setArtists] = useState([]); 
    const [album, setAlbum] = useState([]); 
    const [errors, setErrors] = useState({}); 
    const [statsData, setStatsData] = useState({
        totalPlays: 0,
        newSongsThisMonth: 0,
        vipSongsCount: 0,
        freeSongsCount: 0,
        duetCount: 0,
        soloCount: 0,
        genreStats: [],
        artistStats: [],
        topSongs: []
    });

    // Filter cho thống kê
    const [statsPeriod, setStatsPeriod] = useState('all');
    const [chartView, setChartView] = useState('genre');

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await getAllMusic();
                setSongs(response.data);
                setFilteredSongs(response.data);
                calculateStatistics(response.data);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };
        fetchSongs();
    }, []);

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

    useEffect(()=>{
        const fetchAlbum = async () =>{
            try {
                const response = await getAllAlbum();
                setAlbum(response.data);
            } catch (error) {
                console.error("Error fetching artists:", error);
            }
        }
        fetchAlbum();
    },[]);

    useEffect(() => {
        let filtered = [...songs];
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = songs.filter(song => 
              song.title.toLowerCase().includes(query) || 
              song.songArtist.name.toLowerCase().includes(query)
            );
        }
        if (genreFilter) {
            filtered = filtered.filter(song => song.genre === genreFilter);
        }
        setFilteredSongs(filtered);
    }, [searchQuery, genreFilter, songs]);

    const calculateStatistics = (songsData) => {
        if (!songsData || songsData.length === 0) return;

        // Tạo dữ liệu giả cho số lượt phát
        const totalPlays = songsData.reduce((sum, song) => sum + (Math.floor(Math.random() * 10000)), 0);
        
        // Đếm số bài hát VIP và miễn phí
        const vipSongsCount = songsData.filter(song => song.vip_required).length;
        const freeSongsCount = songsData.length - vipSongsCount;
        
        // Đếm số bài solo và song ca
        const duetCount = songsData.filter(song => song.is_duet).length;
        const soloCount = songsData.length - duetCount;
        
        // Thống kê theo thể loại
        const genreMap = {};
        songsData.forEach(song => {
            const genre = song.genre || 'Không xác định';
            genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
        
        const genreStats = Object.keys(genreMap).map((genre, index) => ({
            name: genre,
            count: genreMap[genre],
            color: chartColors[index % chartColors.length]
        }));

        setStatsData(prev => ({
            ...prev,
            genreStats
        }));
        
        // Thống kê theo nghệ sĩ (top 5)
        const artistMap = {};
        songsData.forEach(song => {
            const artistName = song.songArtist?.name || 'Không xác định';
            artistMap[artistName] = (artistMap[artistName] || 0) + 1;
        });
        
        const artistEntries = Object.entries(artistMap);
        artistEntries.sort((a, b) => b[1] - a[1]); // Sắp xếp giảm dần
        
        const artistStats = artistEntries.slice(0, 5).map(([name, count], index) => ({
            name,
            count,
            color: chartColors[index % chartColors.length]
        }));
        
        // Tính số bài hát mới trong tháng hiện tại
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const newSongsThisMonth = songsData.filter(song => {
            if (!song.releaseDate && !song.createdAt) return false;
            const date = song.releaseDate ? new Date(song.releaseDate) : new Date(song.createdAt);
            return date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear;
        }).length;
        

        // Tạo danh sách top bài hát (giả lập theo số lượt nghe)
        const topSongs = [...songsData]
            .map(song => ({
                ...song,
                playCount: Math.floor(Math.random() * 5000) // Giả lập số lượt nghe
            }))
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5);
        
        setStatsData({
            totalPlays,
            newSongsThisMonth,
            vipSongsCount,
            freeSongsCount,
            duetCount,
            soloCount,
            genreStats,
            artistStats,
            topSongs
        });
    };

    const handleSongClick = (song) => {
        setSelectedSong(selectedSong?.id === song.id ? null : song);
    };

    const handleSelectSong = (song) => {
        setSelectedSong(song);
        const albumId =song.albums && song.albums.length > 0? song.albums[0].AlbumSong?.album_id || '': '';
        setSelectedSong(song);
        setFormData({
            title: song.title || '',
            subTitle: song.subTitle || '',
            artist_id: song.songArtist?.id || '',
            genre: song.genre || '',
            releaseDate: song.releaseDate ? new Date(song.releaseDate).toISOString().split('T')[0] : '',
            url_image: song.url_image || '',
            audioFile: null,
            lyrics: song.lyrics || '',
            is_duet: song.is_duet ? 'true' : 'false',
            vip_required: song.vip_required ? 'true' : 'false',
            album_id: albumId
        });
        setPreviewImage(song.url_image || '');
        setActiveTab('editSong');
        setErrors({}); // Reset errors
    };

    const handleDeleteSong = async(song, e) => {
        e.stopPropagation();
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${song.title}"?`)) {
            try{
                console.log(song.id);
                await deleteSong({song_id:song.id})
                const updatedSongs = songs.filter(s => s.id !== song.id);
                setSongs(updatedSongs);
                if (selectedSong && selectedSong.id === song.id) {
                    setSelectedSong(null);
                }
                calculateStatistics(updatedSongs);
            }catch (error) {
                console.error("Lỗi khi xóa bài hát:", error);
                alert("Xóa bài hát thất bại, vui lòng thử lại.");
            }
        }
    };

    const handleAddNewClick = () => {
        setSelectedSong(null);
        setFormData({
            title: '',
            subTitle: '',
            artist_id: '', 
            genre: '',
            releaseDate: '',
            url_image: '',
            audioFile: null,
            lyrics: '',     
            is_duet: 'false', 
            vip_required: 'false',
            album_id: ''

        });
        setPreviewImage('');
        setErrors({}); // Reset errors
        setActiveTab('editSong');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Thêm hàm xử lý lời bài hát từ ReactQuill
    const handleLyricChange = (value) => {
        setFormData({
            ...formData,
            lyrics: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Trong thực tế, đây là nơi bạn sẽ upload file lên server
            // và nhận URL trả về. Hiện tại chúng ta giả lập bằng URL.createObjectURL
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setFormData({
                ...formData,
                url_image: imageUrl // Trong thực tế, đây sẽ là URL từ server
            });
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                audioFile: file
            });
        }
    };

    const handleSaveMusic = async () => {
        // Thêm validation
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Tên bài hát không được để trống";
        if (!formData.subTitle.trim()) newErrors.subTitle = "Giới thiệu bài hát không được để trống";
        if (!formData.artist_id) newErrors.artist_id = "Ca sĩ không được để trống";
        if (!formData.genre) newErrors.genre = "Thể loại không được để trống";
        if (!formData.url_image.trim()) newErrors.url_image = "URL Ảnh bìa không được để trống";
        if (!formData.lyrics || !formData.lyrics.trim()) newErrors.lyrics = "Lời bài hát không được để trống";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            if (selectedSong) {
                // Cập nhật bài hát
                const updatedSong = {
                    ...selectedSong,
                    title: formData.title,
                    subTitle: formData.subTitle,
                    genre: formData.genre,
                    releaseDate: formData.releaseDate,
                    url_image: formData.url_image,
                    lyrics: formData.lyrics, 
                    is_duet: formData.is_duet === 'true', 
                    vip_required: formData.vip_required === 'true',
                    songArtist: artists.find(artist => artist.id === formData.artist_id) || selectedSong.songArtist
                };
                const songOfAlbum = {
                    album_id: parseInt(formData.album_id, 10),
                    song_id: parseInt(selectedSong.id, 10) 
                }
                console.log(songOfAlbum)
                await addSongToAlbum(songOfAlbum)
                const updatedSongs = songs.map(song => 
                    song.id === selectedSong.id ? updatedSong : song
                );
                setSongs(updatedSongs);
                alert("Cập nhật bài hát thành công!");
            } else {
                // Thêm bài hát mới
                const newSong = {
                    title: formData.title,
                    subTitle: formData.subTitle,
                    genre: formData.genre,
                    audio_url: formData.audioFile,
                    url_image: formData.url_image,
                    lyrics: formData.lyrics, 
                    is_duet: formData.is_duet, 
                    vip_required: formData.vip_required,
                    artist_id: formData.artist_id,
                };
                await addMusic(newSong);
                setSongs([...songs, newSong]);
                alert("Thêm bài hát mới thành công!");
            }

            // Quay lại danh sách
            setActiveTab('songList');
        } catch (error) {
            console.error("Lỗi khi lưu bài hát:", error);
            alert("Đã xảy ra lỗi khi lưu bài hát.");
        }
    };

    // Chuyển tab
    const switchTab = (tab) => {
        setActiveTab(tab);
        if (tab === 'songList') {
            setSelectedSong(null);
        }
    };

    return (
        <div className="music-management">
            <h2 className="title">QUẢN LÝ BÀI HÁT</h2>
            
            {/* Tabs Navigation */}
            <div className="tabs-navigation">
                <button 
                    className={`tab-button ${activeTab === 'songList' ? 'active' : ''}`}
                    onClick={() => switchTab('songList')}
                >
                    <FaMusic /> Danh sách bài hát
                </button>
                <button 
                    className={`tab-button ${activeTab === 'editSong' ? 'active' : ''}`}
                    onClick={() => selectedSong ? switchTab('editSong') : handleAddNewClick()}
                >
                    <FaEdit /> {selectedSong ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
                </button>
                <button 
                    className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                    onClick={() => switchTab('statistics')}
                >
                    <FaMusic /> Thống kê bài hát
                </button>
            </div>

            {/* Edit Song Form */}
            {activeTab === 'editSong' && (
                <form className="form">
                    <div className="form-group">
                        <label>Tên bài hát:</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên bài hát"
                        />
                        {errors.title && <p className="error-message">{errors.title}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label>Mô tả phụ:</label>
                        <input
                            type="text"
                            name="subTitle"
                            value={formData.subTitle}
                            onChange={handleChange}
                            placeholder="Nhập mô tả phụ"
                        />
                        {errors.subTitle && <p className="error-message">{errors.subTitle}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label>Ảnh bìa:</label>
                        <div className="file-upload">
                            <input
                                type="text"
                                name="url_image"
                                placeholder="Nhập URL ảnh"
                                value={formData.url_image}
                                onChange={handleChange}
                            />
                            <label className="upload-button" htmlFor="imageInput">
                                <FaUpload /> Tải ảnh
                            </label>
                            <input 
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </div>
                        {errors.url_image && <p className="error-message">{errors.url_image}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label>Xem trước:</label>
                        <div className="preview">
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Ca sĩ:</label>
                        <select
                            name="artist_id" 
                            value={formData.artist_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn ca sĩ --</option>
                            {artists.map((artist) => (
                                <option key={artist.id} value={artist.id}>
                                    {artist.name}
                                </option>
                            ))}
                        </select>
                        {errors.artist_id && <p className="error-message">{errors.artist_id}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label>Thể loại:</label>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn thể loại --</option>
                            <option value="Nhạc trẻ">Nhạc trẻ</option>
                            <option value="Chữ Tình">Chữ Tình</option>
                            <option value="Rap">Rap</option>
                            <option value="Nhạc nước ngoài">Nhạc nước ngoài</option>
                        </select>
                        {errors.genre && <p className="error-message">{errors.genre}</p>}
                    </div>
                    
                    <div className="form-group" data-field="album_id">
                        <label>Thuộc Album?:</label>
                        <select
                            name="album_id" 
                            value={formData.album_id}
                            onChange={handleChange}
                            required
                        >
                            <option  value="" style={{ color: "#000" }}>-- Chọn album --</option>
                            {album.map((album) => (
                                <option key={album.id} value={album.id}>
                                    {album.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>File nhạc:</label>
                        <div className="file-upload">
                            <span className="file-name">
                                {formData.audioFile ? formData.audioFile.name : (selectedSong?.audio_url ? "File nhạc hiện tại" : "Chưa chọn file")}
                            </span>
                            <label className="upload-button" htmlFor="audioInput">
                                <FaUpload /> Tải file nhạc
                            </label>
                            <input 
                                id="audioInput"
                                type="file"
                                accept="audio/*"
                                style={{ display: 'none' }}
                                onChange={handleAudioChange}
                            />
                        </div>
                    </div>
                    
                    {/* Thêm các trường mới */}
                    <div className="form-group">
                        <label>Hình thức trình bày:</label>
                        <select
                            name="is_duet"
                            value={formData.is_duet}
                            onChange={handleChange}
                        >
                            <option value="false">Đơn ca</option>
                            <option value="true">Song ca</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Quyền truy cập:</label>
                        <select
                            name="vip_required"
                            value={formData.vip_required}
                            onChange={handleChange}
                        >
                            <option value="false">Miễn phí</option>
                            <option value="true">Chỉ VIP</option>
                        </select>
                    </div>
                    
                    <div className="form-group lyrics-editor">
                        <label>Lời bài hát:</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.lyrics}
                            onChange={handleLyricChange}
                        />
                        {errors.lyrics && <p className="error-message">{errors.lyrics}</p>}
                    </div>
                    
                    <button type="button" className="save-button" onClick={handleSaveMusic}>
                        <FaSave /> {selectedSong ? 'Cập nhật bài hát' : 'Thêm bài hát mới'}
                    </button>
                </form>
            )}
            
            {/* Song List */}
            {activeTab === 'songList' && (
                <div className="song-list-section">
                    <div className="list-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <i className="fas fa-search"></i>
                        </div>
                        <div className="list-filters">
                            <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                                <option value="">Tất cả thể loại</option>
                                <option value="Nhạc trẻ">Nhạc trẻ</option>
                                <option value="Chữ Tình">Chữ Tình</option>
                                <option value="Rap">Rap</option>
                                <option value="Nhạc nước ngoài">Nhạc nước ngoài</option>
                            </select>
                        </div>
                        <button className="add-new-btn" onClick={handleAddNewClick}>
                            <FaPlus /> Thêm bài hát mới
                        </button>
                    </div>
                    
                    <div className="song-list">
                        <h3>Danh sách bài hát</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Ảnh bìa</th>
                                    <th>Tên bài hát</th>
                                    <th>Nghệ sĩ</th>
                                    <th>Thể loại</th>
                                    <th>Trạng thái</th> {/* Thêm cột trạng thái */}
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSongs.map((song, index) => (
                                    <tr 
                                        key={song.id || index}
                                        className={selectedSong?.id === song.id ? 'selected' : ''}
                                        onClick={() => handleSongClick(song)}
                                    >
                                        <td>{index + 1}</td>
                                        <td className="avatar-cell">
                                            <img 
                                                src={song.url_image || '/images/default-album-art.jpg'} 
                                                alt={song.title}
                                            />
                                        </td>
                                        <td className="song-title-cell">
                                            <div className="song-title">{song.title}</div>
                                            {song.subTitle && <div className="song-subtitle">{song.subTitle}</div>}
                                        </td>
                                        <td>{song.songArtist?.name || 'Unknown Artist'}</td>
                                        <td>
                                            <span className={`song-genre ${song.genre}`}>
                                                {song.genre || 'Không có'}
                                            </span>
                                        </td>
                                        {/* Thêm cột VIP/Miễn phí */}
                                        <td>
                                            <span className={`song-status ${song.vip_required ? 'vip' : 'free'}`}>
                                                {song.vip_required ? 'VIP' : 'Miễn phí'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="edit-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectSong(song);
                                                }}
                                            >
                                                <FaPencilAlt /> Sửa
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={(e) => handleDeleteSong(song, e)}
                                            >
                                                <FaTrash /> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Thống kê chi tiết */}
{activeTab === 'statistics' && (
    <div className="statistics-dashboard">
        <div className="stats-header">
            <h3>Thống kê tổng quan về âm nhạc</h3>
            <div className="stats-filters">
                <label>Thời gian:</label>
                <select 
                    value={statsPeriod} 
                    onChange={(e) => setStatsPeriod(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="month">Tháng này</option>
                    <option value="quarter">Quý này</option>
                    <option value="year">Năm nay</option>
                </select>
            </div>
        </div>
        
        {/* Thẻ thống kê tổng quan */}
        <div className="stats-cards">
            <div className="stat-card">
                <div className="stat-icon">
                    <FaMusic />
                </div>
                <div className="stat-content">
                    <h3>Tổng số bài hát</h3>
                    <p className="stat-number">{songs.length}</p>
                    <p className="stat-description">Bài hát trong hệ thống</p>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <FaVolumeUp />
                </div>
                <div className="stat-content">
                    <h3>Lượt Yêu Thích</h3>
                    <p className="stat-number">{statsData.totalPlays.toLocaleString()}</p>
                    <p className="stat-description">Tổng lượt yêu thích từ người dùng</p>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <FaCalendarAlt />
                </div>
                <div className="stat-content">
                    <h3>Bài hát mới</h3>
                    <p className="stat-number">{statsData.newSongsThisMonth}</p>
                    <p className="stat-description">Thêm mới trong tháng này</p>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <FaStar />
                </div>
                <div className="stat-content">
                    <h3>Bài hát VIP</h3>
                    <p className="stat-number">{statsData.vipSongsCount}</p>
                    <p className="stat-description">
                        {statsData.vipSongsCount > 0 && songs.length > 0 
                            ? `${Math.round((statsData.vipSongsCount / songs.length) * 100)}%` 
                            : '0%'} tổng số
                    </p>
                </div>
            </div>
        </div>
        
        {/* Phân tích phân loại */}
        <div className="stats-section">
            <h3 className="section-title">Phân tích phân loại bài hát</h3>
            
            <div className="category-comparison">
                <div className="comparison-item">
                    <div className="comparison-title">
                        <span>VIP vs Miễn phí</span>
                    </div>
                    <div className="comparison-bars">
                        <div className="comparison-bar">
                            <div className="bar-label">
                                <span>Miễn phí</span>
                                <span className="bar-count">{statsData.freeSongsCount}</span>
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar free-bar" 
                                    style={{ 
                                        width: `${songs.length > 0 ? (statsData.freeSongsCount / songs.length) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="comparison-bar">
                            <div className="bar-label">
                                <span>VIP</span>
                                <span className="bar-count">{statsData.vipSongsCount}</span>
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar vip-bar" 
                                    style={{ 
                                        width: `${songs.length > 0 ? (statsData.vipSongsCount / songs.length) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="comparison-item">
                    <div className="comparison-title">
                        <span>Solo vs Song ca</span>
                    </div>
                    <div className="comparison-bars">
                        <div className="comparison-bar">
                            <div className="bar-label">
                                <span>Solo</span>
                                <span className="bar-count">{statsData.soloCount}</span>
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar solo-bar" 
                                    style={{ 
                                        width: `${songs.length > 0 ? (statsData.soloCount / songs.length) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="comparison-bar">
                            <div className="bar-label">
                                <span>Song ca</span>
                                <span className="bar-count">{statsData.duetCount}</span>
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar duet-bar" 
                                    style={{ 
                                        width: `${songs.length > 0 ? (statsData.duetCount / songs.length) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Biểu đồ thống kê */}
        <div className="charts-section">
            <div className="chart-tabs">
                <button 
                    className={`chart-tab ${chartView === 'genre' ? 'active' : ''}`}
                    onClick={() => setChartView('genre')}
                >
                    <FaMusic /> Thể loại
                </button>
                <button 
                    className={`chart-tab ${chartView === 'artist' ? 'active' : ''}`}
                    onClick={() => setChartView('artist')}
                >
                    <FaUsers /> Ca sĩ
                </button>
            </div>
            
            <div className="charts-container">
                {chartView === 'genre' && (
                    <div className="chart-box">
                        <h3>Phân bố theo thể loại</h3>
                        <div className="chart-wrapper">
                            {statsData.genreStats.length > 0 ? (
                                <Pie 
                                    data={{
                                        labels: statsData.genreStats.map(item => item.name),
                                        datasets: [
                                            {
                                                data: statsData.genreStats.map(item => item.count),
                                                backgroundColor: statsData.genreStats.map(item => item.color),
                                                borderWidth: 1
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    boxWidth: 15,
                                                    padding: 15
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const label = context.label || '';
                                                        const value = context.raw || 0;
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((value / total) * 100);
                                                        return `${label}: ${value} bài hát (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="no-data">Không có dữ liệu</div>
                            )}
                        </div>
                    </div>
                )}
                
                {chartView === 'artist' && (
                    <div className="chart-box">
                        <h3>Top 5 nghệ sĩ có nhiều bài hát nhất</h3>
                        <div className="chart-wrapper">
                            {statsData.artistStats.length > 0 ? (
                                <Bar
                                    data={{
                                        labels: statsData.artistStats.map(item => item.name),
                                        datasets: [
                                            {
                                                label: 'Số bài hát',
                                                data: statsData.artistStats.map(item => item.count),
                                                backgroundColor: statsData.artistStats.map(item => item.color),
                                                borderWidth: 1
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="no-data">Không có dữ liệu</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* Top bài hát và bảng phân tích */}
        <div className="stats-tables">
            <div className="stats-table">
                <h3>Top 5 bài hát được nghe nhiều nhất</h3>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Bài hát</th>
                            <th>Ca sĩ</th>
                            <th>Thể loại</th>
                            <th>Lượt Yêu Thích</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statsData.topSongs.length > 0 ? (
                            statsData.topSongs.map((song, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="song-info">
                                            <img 
                                                src={song.url_image || '/images/default-album-art.jpg'} 
                                                alt={song.title} 
                                                className="song-thumbnail"
                                            />
                                            <span>{song.title}</span>
                                        </div>
                                    </td>
                                    <td>{song.songArtist?.name || 'Unknown Artist'}</td>
                                    <td>
                                        <span className={`song-genre ${song.genre}`}>
                                            {song.genre || 'Không có'}
                                        </span>
                                    </td>
                                    <td>{song.playCount.toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data-cell">Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="stats-table">
                <h3>Phân tích thể loại chi tiết</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Thể loại</th>
                            <th>Số lượng</th>
                            <th>Tỷ lệ</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statsData.genreStats.length > 0 ? (
                            statsData.genreStats.map((genre, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className={`song-genre ${genre.name}`}>
                                            {genre.name}
                                        </span>
                                    </td>
                                    <td>{genre.count}</td>
                                    <td>
                                        {songs.length > 0 
                                            ? `${Math.round((genre.count / songs.length) * 100)}%` 
                                            : '0%'
                                        }
                                    </td>
                                    <td>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress" 
                                                style={{ 
                                                    width: `${songs.length > 0 ? (genre.count / songs.length) * 100 : 0}%`,
                                                    backgroundColor: genre.color
                                                }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data-cell">Không có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Số liệu tổng hợp cuối trang */}
        <div className="stats-summary">
            <div className="summary-title">Tóm tắt thống kê</div>
            <div className="summary-grid">
                <div className="summary-item">
                    <div className="summary-label">Tổng số bài hát</div>
                    <div className="summary-value">{songs.length}</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Lượt phát trung bình/bài hát</div>
                    <div className="summary-value">
                        {songs.length > 0 
                            ? Math.round(statsData.totalPlays / songs.length).toLocaleString() 
                            : 0}
                    </div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Tổng thể loại</div>
                    <div className="summary-value">{statsData.genreStats.length}</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Tổng ca sĩ</div>
                    <div className="summary-value">{artists.length}</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Tỉ lệ VIP</div>
                    <div className="summary-value">
                        {songs.length > 0 
                            ? `${Math.round((statsData.vipSongsCount / songs.length) * 100)}%` 
                            : '0%'}
                    </div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Tỉ lệ song ca</div>
                    <div className="summary-value">
                        {songs.length > 0 
                            ? `${Math.round((statsData.duetCount / songs.length) * 100)}%` 
                            : '0%'}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default MusicList;