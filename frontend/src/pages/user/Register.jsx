import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import { register } from "../../context/authContext";
import logo from "../../assets/logo.png";
import illustration from "../../assets/illustration.jpg";
import "../../styles/user/register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({
    general: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const progressRef = useRef(null);
  const { triggerSuccess } = useContext(NotificationContext);

  const validateFullName = (value) => {
    return value && value.length < 6
      ? "Tên đăng nhập phải có ít nhất 6 ký tự"
      : "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return value && !emailRegex.test(value)
      ? "Email phải có định dạng @gmail.com"
      : "";
  };

  const validatePassword = (value) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return value && !passwordRegex.test(value)
      ? "Mật khẩu phải có ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt và dài 6 ký tự"
      : "";
  };

  const validateConfirmPassword = (value, passwordValue) => {
    return value && value !== passwordValue
      ? "Mật khẩu xác nhận không khớp"
      : "";
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/check-email",
        { email }
      );
      return response.data.exists;
    } catch (error) {
      console.error("Lỗi kiểm tra email:", error);
      throw error.response?.data?.message || "Không thể kiểm tra email";
    }
  };

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setError((prev) => ({
      ...prev,
      name:
        value === "" ? "Vui lòng nhập tên đăng nhập" : validateFullName(value),
      general: "",
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError((prev) => ({
      ...prev,
      email: value === "" ? "Vui lòng nhập email" : validateEmail(value),
      general: "",
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError((prev) => ({
      ...prev,
      password:
        value === "" ? "Vui lòng nhập mật khẩu" : validatePassword(value),
      confirmPassword: confirmPassword
        ? validateConfirmPassword(confirmPassword, value)
        : prev.confirmPassword,
      general: "",
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setError((prev) => ({
      ...prev,
      confirmPassword:
        value === ""
          ? "Vui lòng nhập lại mật khẩu"
          : validateConfirmPassword(value, password),
      general: "",
    }));
  };

  const shakeInputs = () => {
    const inputGroups = document.querySelectorAll(".input-group-register");
    inputGroups.forEach((group) => {
      const input = group.querySelector("input");
      const label = group.querySelector("label");
      const errDiv = group.querySelector(".err");
      if (input) input.classList.add("shake");
      if (label) label.classList.add("shake");
      if (errDiv) errDiv.classList.add("shake");
      setTimeout(() => {
        if (input) input.classList.remove("shake");
        if (label) label.classList.remove("shake");
        if (errDiv) errDiv.classList.remove("shake");
      }, 300);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({
      general: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const fullNameError = !name
      ? "Vui lòng nhập tên đăng nhập"
      : validateFullName(name);
    const emailError = !email ? "Vui lòng nhập email" : validateEmail(email);
    const passwordError = !password
      ? "Vui lòng nhập mật khẩu"
      : validatePassword(password);
    const confirmPasswordError = !confirmPassword
      ? "Vui lòng nhập lại mật khẩu"
      : validateConfirmPassword(confirmPassword, password);

    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      setError((prev) => ({
        ...prev,
        name: fullNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      }));
      shakeInputs();
      return;
    }

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError((prev) => ({
          ...prev,
          email: "Email đã được sử dụng, vui lòng thử lại",
        }));
        shakeInputs();
        return;
      }

      await register(name, email, password);
      triggerSuccess("Đăng ký thành công");
      navigate("/login", { replace: true });
    } catch (err) {
      setError((prev) => ({
        ...prev,
        general: err.message || "Đăng ký thất bại. Vui lòng thử lại.",
      }));
      shakeInputs();
    }
  };

  const handleLoginClick = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/login");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.1s linear";
        }
      }, 100);
    }
  };

  const handleHomePage = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/homepage");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.3s linear";
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const textRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const titleElement = textRefs[0].current;
    const support1Element = textRefs[1].current;
    const support2Element = textRefs[2].current;
    const texts = [
      "Chào mừng bạn đến với PMS! Hãy tạo tài khoản để bắt đầu hành trình quản lý dự án của bạn !",
      "Tùy chỉnh cách thức làm việc của nhóm bạn.",
      "Thiết lập, dọn dẹp và tự động hóa ngay cả những quy trình làm việc phức tạp nhất của dự án.",
    ];
    let indices = [0, 0, 0];
    let isPaused = [false, false, false];
    let blinkIntervals = [null, null, null];

    const type = (element, text, index, pausedIndex) => {
      if (isPaused[pausedIndex]) return;

      if (indices[pausedIndex] < text.length) {
        element.textContent = text.slice(0, indices[pausedIndex] + 1) + "|";
        indices[pausedIndex]++;
        setTimeout(() => type(element, text, index, pausedIndex), 150);
      } else if (indices[pausedIndex] === text.length) {
        isPaused[pausedIndex] = true;
        element.textContent = text + "|";
        setTimeout(() => {
          blinkCursor(element, text, pausedIndex);
          setTimeout(() => {
            isPaused[pausedIndex] = false;
            indices[pausedIndex] = 0;
            element.textContent = "|";
            type(element, text, index, pausedIndex);
          }, 3000);
        }, 500);
      }
    };

    const blinkCursor = (element, text, pausedIndex) => {
      let blinkCount = 0;
      const maxBlinks = 6;
      blinkIntervals[pausedIndex] = setInterval(() => {
        element.textContent = element.textContent.includes("|")
          ? text + " "
          : text + "|";
        blinkCount++;
        if (blinkCount >= maxBlinks) clearInterval(blinkIntervals[pausedIndex]);
      }, 500);
    };

    if (titleElement) type(titleElement, texts[0], 0, 0);
    if (support1Element) type(support1Element, texts[1], 1, 1);
    if (support2Element) type(support2Element, texts[2], 2, 2);

    return () => {
      blinkIntervals.forEach((interval) => interval && clearInterval(interval));
    };
  }, []);

  return (
    <div className="register-page-container" onKeyPress={handleKeyPress}>
      <div className="progress-bar" ref={progressRef}></div>
      <div className="homepage-navbar-login">
        <div className="homepage-navbar-logo-login">
          <img src={logo} alt="Logo" className="logo-navbar" />
        </div>
        <div className="homepage-navbar-support-login">
          <ul className="homepage-navbar-support-list-login">
            <li className="homepage-navbar-support-item-login">
              <a href="#" className="home" onClick={handleHomePage}>
                TRANG CHỦ
              </a>
            </li>
            <li className="homepage-navbar-support-item-login">
              <a href="#" className="about_us">
                ABOUT US
              </a>
            </li>
          </ul>
        </div>
        <div className="homepage-navbar-login-btn">
          <button
            type="submit"
            className="homepage-btn-login"
            onClick={handleLoginClick}
          >
            ĐĂNG NHẬP
          </button>
        </div>
      </div>
      <div className="register-home">
        <div className="register-home-1">
          <div className="register-home-1-content-example">
            <img
              src={illustration}
              alt="Example Logo"
              className="example"
              id="example-1"
            />
          </div>
        </div>

        <div className="register-home-2">
          <div className="register-form-container">
            <div className="register-home-1-content">
              <div className="register-home-1-content-title">
                <p ref={textRefs[0]} className="typing-text"></p>
              </div>
            </div>
            <form className="register-form">
              <div className="register-input">
                <div className="input-group-register">
                  <input
                    type="text"
                    id="fullName"
                    placeholder=" "
                    value={name}
                    onChange={handleFullNameChange}
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="fullName">Tên đăng nhập</label>
                  <div className="err">
                    {error.name && (
                      <p className="error-message">{error.name}</p>
                    )}
                  </div>
                </div>

                <div className="input-group-register">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={email}
                    onChange={handleEmailChange}
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="email">Email</label>
                  <div className="err">
                    {error.email && (
                      <p className="error-message">{error.email}</p>
                    )}
                  </div>
                </div>
                <div className="input-group-register">
                  <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="password">Mật khẩu</label>
                  <div className="err">
                    {error.password && (
                      <p className="error-message">{error.password}</p>
                    )}
                  </div>
                </div>

                <div className="input-group-register">
                  <input
                    type="password"
                    id="password-indentity"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="password-indentity">Nhập lại mật khẩu</label>
                  <div className="err">
                    {error.confirmPassword && (
                      <p className="error-message">{error.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="register-button">
                <button
                  className="btn-register"
                  type="submit"
                  onClick={handleSubmit}
                >
                  ĐĂNG KÝ
                </button>
              </div>
              <div className="err-general">
                {error.general && (
                  <div className="general-error">
                    <p className="error-message">{error.general}</p>
                  </div>
                )}
              </div>

              <div className="login">
                <p>Bạn đã có tài khoản?</p>
                <a href="#" onClick={handleLoginClick}>
                  Đăng nhập ngay !
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
