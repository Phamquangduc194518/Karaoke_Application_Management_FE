import React, { Component } from 'react';
import './Login.scss';
import { connect } from 'react-redux';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { withRouter } from '../Login/withRouter'; // Đường dẫn đúng với dự án của bạn
import { login } from '../../store/actions/authActions'; // Đường dẫn đúng tới file actions


class Login extends Component {
    constructor(props) {
        super(props);
        //khai báo trang thái của form login
        this.state = {
            //giá trị của props có thể là int String hoặc Object nhưng đối với 
            //state thì props luôn là object
            //cần 2 biến để component quản lý là usename và pass được nhập vào 
            email: '',
            password: '',
            passwordShown: false,
            errMessage: '',
        }
    }

    //xử lý sự kiện
    handleOnChangeEmailInput = (event) => {
        //khi thao tác thay đổi input username trên web ta thấy nó in ra console
        //từng thay đổi (nhưng vì ko thể thay đổi chữ trong input nên nếu để lâu lại trở về ban đầu)
        //vì vậy ta cần hàm react xử lí việc cho phép thay đổi nôij dung nhập vào
        this.setState({
            email: event.target.value,
        })
    }

    handleOnChangePasswordInput = (event) => {
        this.setState({
            password: event.target.value,
        })
    }

    handleShowAndHidePassword = (event) => {
        this.setState({
            passwordShown: !this.state.passwordShown,
        })
    }

    handleEnterKeyPressed = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.handleLoginButtonClicked();
        }
    }

   // Xử lý khi nhấn nút Login
    handleLoginButtonClicked = async () => {
    const { email, password } = this.state;

    if (!email || !password) {
      this.setState({ errMessage: 'Please enter both email and password.' });
      return;
    }

    this.setState({ errMessage: '' }); // Reset lỗi
    try {
      await this.props.login({ email, password }); // Dispatch action login
      console.log("Authentication state after login:", this.props.isAuthenticated);
      console.log("Token in localStorage:", localStorage.getItem('token'));
      if (this.props.isAuthenticated) {
        this.props.navigate('/feedBack'); // Điều hướng sau khi đăng nhập thành công
      }else {
        this.setState({ errMessage: 'Authentication failed. Please try again.' });
    }
    } catch (error) {
      this.setState({ errMessage: error.response?.data?.message || 'Login failed' });
    }
  };


    render() {
        //JSX
        return (
            //hàm render chỉ render ra một khối, ví dụ thêm một <div> ở dưới nữa thì cần bọc 2 <div>
            //vào trong một <div> lớn hơn
            // <>
            //     <div>Hello i'm login page</div>
            //     <div>Please login here to continue</div>
            // </>
            //Bắt đầu code một trang login
            // khi code HTML thuần mà muốn cho chúng vào một lớp thì sử dụng thuộc tính class,
            // nhưng code react thì sử dụng thuộc tính className
            <div className="login-background">
                <div className="login-container">
                    <div className="login-contents row">
                        <div className="col-12 text-center login-text">Login</div>
                        <div className="col-12 form-group login-input">
                            <label>Email</label>
                            <input type="text"
                                className="form-control input-place"
                                placeholder=""
                                value={this.state.email}
                                onChange={(event) => this.handleOnChangeEmailInput(event)} />
                            {/* value khiến cho ô input username luôn hiện gia trị của
                            biến username của state và không thể bị thay đổi
                            - onChange xử lý sự kiện */}
                        </div>

                        <div className="col-12 form-group login-input">
                            <label>Password</label>
                            <div className="password-input-and-eye">
                                <input type={this.state.passwordShown ? 'text' : 'password'}
                                    className="form-control input-place"
                                    placeholder=""
                                    value={this.state.password}
                                    onChange={(event) => this.handleOnChangePasswordInput(event)}
                                    onKeyDown={(event) => this.handleEnterKeyPressed(event)}
                                />
                                <span
                                    onClick={(event) => { this.handleShowAndHidePassword() }}>
                                    <i className={this.state.passwordShown ? "far fa-eye" : "far fa-eye-slash"}></i>
                                </span>

                            </div>
                        </div>
                        <div className="col-12 error-message-while-login">
                            {this.state.errMessage}
                        </div>
                        <div className="col-6">
                            <div className="wrapper">
                            <a href="#" onClick={(event) => { this.handleLoginButtonClicked() }}><span>Login</span></a>
                            </div>
                        </div>

                        <div className="or-login-with-options">
                            <span>Or login with:</span>
                        </div>
                        <div className="more-login-options">
                            <div className="icon-container">
                                <i className="fab fa-google-plus-g"></i>
                            </div>
                            <div className="icon-container">
                                <i className="fab fa-facebook-f"></i>
                            </div>
                            <div className="icon-container">
                                <i className="fab fa-apple"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.isAuthenticated,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        login: (credentials) => dispatch(login(credentials)),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
