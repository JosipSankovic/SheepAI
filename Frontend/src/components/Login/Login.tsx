import { useContext, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import "./Login.css";
import { AuthContext, UserContext } from "../../utils";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserAPI } from "../../api/User";
import { tokenloginAndFetchUser } from "../../api/Common";
import Fingerprint from "./Fingerprint";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [animateFootprint, setAnimateFootprint] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const {authTokenRef}=useContext(AuthContext);
  const didRunRef = useRef(false);
  function validateLogin(form) {
    let errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email) || form.email.length > 60) {
      errors.push("Invalid email format");
    }
    if (form.password.length < 5 || form.password.length > 30)
      errors.push("Wrong password");
    return errors;
  }

  function changeForm(event) {
    setErrors([]);
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleLogin() {
    setErrors([]);
    const validationErrors = validateLogin(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    const form_to_send = {
      email: DOMPurify.sanitize(form.email),
      password: form.password,
    };

    try {
      const user_f = await loginUser(form_to_send);
      setUser(user_f);
      setAnimateFootprint(true);
    } catch (err) {
      console.error(err);
    }
  }

  const handleFootprintClick = () => {
    handleLogin();
  };

  const handleFootprintAnimationEnd = () => {
    navigate("/home");
  };

  async function loginUser(form_to_send) {
    try {
      const res_login = await UserAPI.login(form_to_send);
      if (!res_login.data.token || !res_login.data.user)
        throw new Error("Login can't be performed");
      authTokenRef.current = res_login.data.token;
      axios.defaults.headers.common["authorization"] = `Bearer ${res_login.data.token}`;
      return res_login.data.user;
    } catch (err) {
      if (err.response && err.response.status === 401)
        setErrors((prev) => [...prev, "Wrong email or password"]);
      else setErrors((prev) => [...prev, "Something went wrong"]);
      throw new Error("Login can't be performed");
    }
  }

  useEffect(() => {
    //koristi se kako checkTokenAndLogin vise nebi bila asinkrona pa da se moze koristit try...catch
    if (didRunRef.current) return;
        didRunRef.current = true;
    console.log(didRunRef.current)
    
    const checkTokenAndLoginWrapper = async () => {

      try {
        console.log("refresh access login effect")
        const res_refresh=await UserAPI.refreshAccessToken();
        const token = res_refresh.data.token;
        authTokenRef.current = token;
        await checkTokenAndLogin();
      } catch (err) {
        handleLoginError(err);
      }
    };
    checkTokenAndLoginWrapper();
  }, []);
  const checkTokenAndLogin = async () => {
    try {
      const token = authTokenRef.current;
      if (!token) return;
      axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
      const [returned_token,user_fetched] = await tokenloginAndFetchUser(token);
      setUser(user_fetched);
      authTokenRef.current=returned_token;
      navigate("/home");
    } catch (err) {
      console.error(err);
      throw new Error("Something went wrong");
    }
  };
 
  const handleLoginError = (err) => {
    console.error("Login failed:", err.message);
    setUser(null);
  };

  return (
    <>
      <div className="login-container">
        <div className="login-content">
          <div className="left-column">
            <h1>Login</h1>
            <p className="message">
              Access your bank accout
            </p>
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={changeForm}
                autoComplete="email"
                placeholder="Email"
                required
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={changeForm}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
               <Fingerprint
                active={animateFootprint}
                onClick={handleFootprintClick}
                onAnimationEnd={handleFootprintAnimationEnd}
              />
              
              {errors.length > 0 &&
                errors.map((error, index) => (
                  <p key={index} className="error-message-login">
                    {error}
                  </p>
                ))}
            </form>
          </div>

          <div className="right-column">
            <h2 className="right-column-header">Welcome to Our Service</h2>
            <p className="right-column-text">
              Manage your bank account easily with our
              secure platform.
            </p>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
