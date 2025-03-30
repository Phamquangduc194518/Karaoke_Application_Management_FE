import { handleLoginAPI } from '../../../src/components/services/adminService';
import api from '../../axiosInstance'
// Định nghĩa các loại action
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';



export const loginRequest = () => ({
    type: LOGIN_REQUEST,
  });
  
export const loginSuccess = (user) => ({
    type: LOGIN_SUCCESS,
    payload: user,
  });
export const loginFailure = (error) => ({
    type: LOGIN_FAILURE,
    payload: error,
  });
export const logOut = () => {
   // Xóa token và thông tin user
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   return {
    type: LOGOUT
    };
  };


// Thunk để xử lý logic đăng nhập
export const login =({email, password})=>{
    return async  (dispatch)=>{
        dispatch(loginRequest()); // Thông báo bắt đầu quá trình đăng nhập
        try{
            const response = await handleLoginAPI(email, password);
            console.log("Login API response:", JSON.stringify(response.data));
            if(response.data && response.data.errCode ===0){
              localStorage.setItem('token', JSON.stringify(response.data.token || 'token-placeholder'));
              localStorage.setItem('user', JSON.stringify(response.data.user));
                dispatch(loginSuccess(response.data.user)); // Đăng nhập thành công
            }else{
                dispatch(
                    loginFailure(response.data.message || 'Login failed') // Đăng nhập thất bại
                  );
            }
        }catch(error){
            dispatch(
                loginFailure(
                  error.response?.data?.message || 'Xảy ra lỗi trong quá trình đăng nhập'
                )
              );
        }
    }
}

export const checkAuthState = () => {
  return (dispatch) => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch(logOut());
        return;
      }
          
          try {
              // Lấy thông tin user từ localStorage nếu có
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : { email: "admin@admin.com" };
              if(user){
                dispatch(loginSuccess(user));
              }else{
                dispatch(logOut());
              }
          } catch (e) {
              console.error("Error parsing user from localStorage:", e);
              dispatch(logOut());
          }
      }
  };