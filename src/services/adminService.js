import api from '../axiosInstance';
const handleLoginAPI= (email, password)=>{
    return api.post('api/admin/login',{email: email, password: password});
};

const getAllAccount = ()=>{
    return api.get('api/admin/getAllAccount');
}

const addMusic = (data)=>{
    return api.post('/api/song/createSong',data);
}

const getAllMusic = ()=>{
    return api.get('/api/song/getSongAdmin');
}

const updateProfile = (userId, data)=>{
    return api.patch(`/api/users/update/${userId}`, data);
}

const createArtist =(data)=>{
    return api.post('/api/song/createArtist', data)
}

const createAlbum =(data)=>{
    return api.post('/api/song/createAlbum', data)
}
const getAllArtist =()=>{
    return api.get('/api/song/getAllArtist')
}

const getAllAlbum =()=>{
    return api.get('/api/song/getAllAlbum')
}

const updateArtist =(artistId, data)=>{
    return api.patch(`/api/song/updateArtist/${artistId}`, data)
}
const updateAlbum =(albumId, data)=>{
    return api.patch(`/api/song/updateAlbum/${albumId}`, data)
}
const createTopic =(data)=>{
    return api.post('/api/createTopic', data)
}
const getAllTopicsWithVideo =()=>{
    return api.get('/api/getAllTopicsWithVideo')
}
const createVideoOfTopic =(data)=>{
    return api.post('/api/createVideoOfTopic', data)
}
const getSongRequestFromUser =()=>{
    return api.get('/api/admin/getSongRequestFromUser')
}
const createReplie = (data) =>{
    return api.post('/api/admin/createReplie', data)
}
const updateStatus = (data) =>{
    return api.patch('/api/admin/updateStatus', data)
}
const deleteSong = (data) =>{
    return api.delete('/api/song/deleteSong', {data})
}
const addSongToAlbum = (data) =>{
    return api.post('/api/song/addSongToAlbum', data)
}
const getRecordedSongsForAdmin = () =>{
    return api.get('/api/admin/getRecordedSongsForAdmin')
}
const deleteRecordedSongByAdmin = (songId) =>{
    return api.delete(`/api/admin/deleteRecordedSongByAdmin/${songId}`)
}
const approveRecordedSong = (songId) =>{
    return api.patch(`/api/admin/approveRecordedSong/${songId}`)
}

const rejectRecordedSong = (songId, data) =>{
    return api.patch(`/api/admin/rejectRecordedSong/${songId}`, data)
}

const countRecordedSongByStatus = () =>{
    return api.get('/api/admin/countRecordedSongByStatus')
}

const deleteAccount = (userId) =>{
    return api.delete(`/api/admin/deleteAccount/${userId}`)
}
export{
    handleLoginAPI,
    getAllAccount,
    addMusic,
    getAllMusic,
    updateProfile,
    createArtist,
    getAllArtist,
    updateArtist,
    getAllAlbum,
    createAlbum,
    updateAlbum,
    createTopic,
    getAllTopicsWithVideo,
    createVideoOfTopic,
    getSongRequestFromUser,
    createReplie,
    updateStatus,
    deleteSong,
    addSongToAlbum,
    getRecordedSongsForAdmin,
    deleteRecordedSongByAdmin,
    approveRecordedSong,
    rejectRecordedSong,
    countRecordedSongByStatus,
    deleteAccount
}