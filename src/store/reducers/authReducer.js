import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT,
  } from '../actions/authActions.js'

  const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  };

  export const authReducer=(state = initialState, action)=>{
    switch(action.type){
        case LOGIN_REQUEST:
            return { ...state, isLoading: true, error: null };
        case LOGIN_SUCCESS:
          // localStorage.setItem('token', action.payload.token);
          // localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                isLoading: false,
                user: action.payload,
                token: action.payload.token,
                isAuthenticated: true,
              };
        case LOGIN_FAILURE:
            return { ...state, isLoading: false, error: action.payload };
        case LOGOUT:
          // localStorage.removeItem('token');
          // localStorage.removeItem('user');
          return {...state, user:null, isLoading: false,isAuthenticated: false, }
        default:
            return state;
    }
  };