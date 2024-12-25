import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; //Middleware là nơi bạn có thể can thiệp vào dispatch trước khi nó đến reducer.
//Thường dùng để xử lý API calls như redux-thunk
// Redux-Thunk là một middleware được sử dụng trong Redux để xử lý các hành động bất đồng 
// bộ (asynchronous actions). Middleware này cho phép bạn viết các action creators trả về một 
// hàm (thay vì trả về một đối tượng). Với Redux-Thunk, bạn có thể thực hiện các logic phức tạp 
// như gọi API hoặc thực hiện thao tác bất đồng bộ trước khi gửi dispatch một action đến reducer.
import { authReducer } from '../store/reducers/authReducer';

const rootReducer  = combineReducers({
    // combineReducers là một hàm được cung cấp bởi Redux
    //  giúp bạn kết hợp nhiều reducer lại thành một reducer duy nhất để sử dụng trong Redux store
    auth: authReducer,
});
const store = createStore(rootReducer, applyMiddleware(thunk));
export default store;
