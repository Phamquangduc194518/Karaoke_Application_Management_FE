import api from '../../axiosInstance';
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
    return api.get('/api/song/getSong');
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
    updateAlbum
}