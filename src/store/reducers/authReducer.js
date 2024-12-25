import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT,
  } from '../actions/authActions.js'

  const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };

  export const authReducer=(state = initialState, action)=>{
    switch(action.type){
        case LOGIN_REQUEST:
            return { ...state, isLoading: true, error: null };
        case LOGIN_SUCCESS:
            return {
                ...state,
                isLoading: false,
                user: action.payload.username,
                token: action.payload.token,
                isAuthenticated: true,
              };
        case LOGIN_FAILURE:
            return { ...state, isLoading: false, error: action.payload };
        case LOGOUT:
          return {...state, user:null, isLoading: false,isAuthenticated: false, }
        default:
            return state;
    }
  }