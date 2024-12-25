import { handleLoginAPI } from '../../../src/components/services/adminService';
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
export const logOut = () => ({
    type: LOGOUT,
  });


// Thunk để xử lý logic đăng nhập
export const login =({email, password})=>{
    return async  (dispatch)=>{
        dispatch(loginRequest()); // Thông báo bắt đầu quá trình đăng nhập
        try{
            const response = await handleLoginAPI(email, password);
            if(response.data && response.data.errCode ===0){
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