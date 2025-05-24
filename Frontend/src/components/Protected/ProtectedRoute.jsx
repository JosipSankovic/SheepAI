import { useNavigate, Outlet } from "react-router-dom";
import { useContext, useEffect, useRef } from "react";
import { AuthContext, UserContext } from "../../utils";
import axios from "axios";
import { UserAPI } from "../../api/User";
import { tokenloginAndFetchUser } from "../../api/Common";
function ProtectedRoute() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const {authTokenRef}=useContext(AuthContext)
  const didRunRef = useRef(false);

  useEffect(() => {
    const axiosInterceptorRequest = axios.interceptors.request.use((config) => {
      const token = authTokenRef.current;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    const axiosInterceptor = axios.interceptors.response.use(
      (request) => request,
      async (error) => {
        let originalRequest = error.config;
        if(error?.response?.status==401&&(error?.response?.data?.code =="ACCESS_TOKEN_MISSING"||
          error?.response?.data?.code =="ACCESS_TOKEN_INVALID_FORMAT"||
          error?.response?.data?.code === "ACCESS_TOKEN_TAMPERED"||
          error?.response?.data?.code =="REFRESH_TOKEN_MISSING"||
          error?.response?.data?.code =="REFRESH_TOKEN_EXPIRED"||
          error?.response?.data?.code =="REFRESH_TOKEN_TAMPERED"
        )){
            console.log("REmove token",error.response.data);
            authTokenRef.current=null;
            console.log("Navigate");
            navigate("/");
            setU(null);
            return Promise.reject(err); 
        }
        else if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true; // Mark the original request as retried
            const res_refresh = await UserAPI.refreshAccessToken();
            const token = res_refresh.data.token;
            authTokenRef.current=token;
            return axios(originalRequest); // Retry the original request
        }
        return Promise.reject(error);
      }
    );
  
    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
      axios.interceptors.request.eject(axiosInterceptorRequest);
    };
  }, [navigate]);
  
  useEffect(() => {
    if (didRunRef.current) return;
        didRunRef.current = true;
    const checkAndLogin = async () => {
      try {
        if (user) return; // No need to check if both are already set
        await fetchNewToken();
        await checkTokenAndLogin(); // Await the login function
      } catch (err) {
        handleLoginError(err);
        console.error("Error with fetching token:", err); // Log the error
      }
    };
    checkAndLogin();
  }, [user]);
  const fetchNewToken = async () => {
    try {
      const res_refresh_token = await UserAPI.refreshAccessToken();
      const token = res_refresh_token.data.token;
      axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
      authTokenRef.current=token;
    } catch (err) {
      throw new Error("Cant fetch new token");
    }
  };
  const checkTokenAndLogin = async () => {
    try {
      const token = authTokenRef.current;
      if (!token) throw new Error("Token missing");
      const [returned_token,user_fetched] = await tokenloginAndFetchUser(token);
      setUser(user_fetched);
      authTokenRef.current=returned_token;
    } catch (err) {
      console.error(err)
      throw new Error("Something went wrong");
    }
  };
  const handleLoginError = (err) => {
    console.error("Login failed:", err.message);
    navigate("/");
    setUser(null);
  };

  return user ? <Outlet /> : null;
}

export default ProtectedRoute;
