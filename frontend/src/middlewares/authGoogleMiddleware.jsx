import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import "../styles/login.css";
import { useUser } from "../context/UserContext";
const AuthMiddleware = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
  const { triggerSuccess } = useContext(NotificationContext);
  const hasFetched = useRef(false);
  const isProcessingLoginSuccess = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const publicRoutes = ["/", "/register", "/login", "/homepage"];

  useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken || refreshToken === "") {
        console.log("No valid refresh token available");
        return false;
      }

      try {
        const response = await fetch(
          "http://localhost:8080/api/auth/refresh-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem(
            "tokenExpiresAt",
            Date.now() + data.expires_in * 1000
          );
          console.log("Access token refreshed successfully");
          return true;
        } else {
          console.error("Failed to refresh token:", data.error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiresAt");
          return false;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiresAt");
        return false;
      }
    };

    const checkAuth = async () => {
      if (isProcessingLoginSuccess.current) {
        console.log("Skipping checkAuth during loginSuccess processing");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      const authProvider = localStorage.getItem("authProvider");

      if (!accessToken || !expiresAt) {
        console.log(
          "No access token or expiration time, redirecting to /login"
        );
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
        return;
      }

      const isTokenExpired = () => {
        const expiresAtNum = parseInt(expiresAt, 10);
        return expiresAtNum < Date.now();
      };

      if (isTokenExpired() && authProvider === "google") {
        console.log("Token expired, attempting to refresh");
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          console.log("Token refresh failed, redirecting to /login");
          navigate("/login", { replace: true });
          return;
        }
      } else if (isTokenExpired() && authProvider === "email") {
        console.log("Token expired for email login, redirecting to /login");
        navigate("/login", { replace: true });
        return;
      }
    };

    if (publicRoutes.includes(location.pathname)) {
      console.log("Skipping auth check for public route:", location.pathname);
      return;
    }

    if (location.pathname === "/loginSuccess") {
      console.log("=== PROCESSING /loginSuccess ===");
      console.log("hasFetched.current:", hasFetched.current);
      console.log(
        "isProcessingLoginSuccess.current:",
        isProcessingLoginSuccess.current
      );

      if (hasFetched.current || isProcessingLoginSuccess.current) {
        console.log("Already processing loginSuccess, skipping...");
        setDebugInfo("Already processing loginSuccess, skipping...");
        return;
      }

      hasFetched.current = true;
      isProcessingLoginSuccess.current = true;
      setIsLoading(true);
      setDebugInfo("Starting user info fetch...");

      fetch("http://localhost:8080/api/auth/user-info", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          console.log("User info response status:", response.status);
          console.log("User info response headers:", response.headers);
          setDebugInfo(`Response status: ${response.status}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Received user info:", data);
          setDebugInfo(`Received data: ${JSON.stringify(data, null, 2)}`);

          if (data.error) {
            console.error("Error in user info response:", data.error);
            setDebugInfo(`Error in response: ${data.error}`);
            navigate("/login?error=session_expired", { replace: true });
            return;
          }

          if (!data.accessToken) {
            console.error("No accessToken in response, redirecting to /login");
            setDebugInfo("No accessToken in response");
            navigate("/login?error=no_token", { replace: true });
            return;
          }

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("authProvider", "google");
          const expiresIn = data.expiresIn || 3600;
          localStorage.setItem("tokenExpiresAt", Date.now() + expiresIn * 1000);

          if (data.refreshToken && data.refreshToken !== "") {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("userName", data.name || "User");
          localStorage.setItem("userEmail", data.email || "user@example.com");
          localStorage.setItem("avatarUrl", data.avatarUrl || "");
          localStorage.setItem("role", data.role || "USER");
          localStorage.setItem(
            "created_at",
            data.created_at || new Date().toISOString().split("T")[0]
          );
          localStorage.setItem("backgroundUrl", data.backgroundUrl || null);

          setUser({
            avatarUrl: data.avatarUrl || null,
            userName: data.name || null,
            backgroundUrl: data.backgroundUrl || null,
          });

          console.log("=== STORED IN LOCALSTORAGE ===");
          console.log(
            "accessToken:",
            localStorage.getItem("accessToken")?.substring(0, 20) + "..."
          );
          console.log("userId", localStorage.getItem("userId"));
          console.log("userName:", localStorage.getItem("userName"));
          console.log("userEmail:", localStorage.getItem("userEmail"));
          console.log("avatarUrl:", localStorage.getItem("avatarUrl"));
          console.log("role:", localStorage.getItem("role"));
          console.log("created_at:", localStorage.getItem("created_at"));
          console.log("backgroundUrl:", localStorage.getItem("backgroundUrl"));

          console.log("Login success, navigating to dashboard");
          setDebugInfo("Navigating to dashboard...");
          triggerSuccess();
          setIsLoading(false);
          navigate("/dashboard", { replace: true });
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
          setDebugInfo(`Error: ${error.message}`);
          setIsLoading(false);
          // Retry once before redirecting to login
          if (!hasFetched.current) {
            hasFetched.current = true;
            fetch("http://localhost:8080/api/auth/user-info", {
              method: "GET",
              credentials: "include",
              headers: {
                Accept: "application/json",
              },
            })
              .then((retryResponse) => {
                if (!retryResponse.ok)
                  throw new Error(`Retry failed: ${retryResponse.status}`);
                return retryResponse.json();
              })
              .then((retryData) => {
                localStorage.setItem("accessToken", retryData.accessToken);
                localStorage.setItem("authProvider", "google");
                const expiresIn = retryData.expiresIn || 3600;
                localStorage.setItem(
                  "tokenExpiresAt",
                  Date.now() + expiresIn * 1000
                );
                if (retryData.refreshToken && retryData.refreshToken !== "") {
                  localStorage.setItem("refreshToken", retryData.refreshToken);
                }
                localStorage.setItem("userId", retryData.userId || "");
                localStorage.setItem("userName", retryData.name || "User");
                localStorage.setItem(
                  "userEmail",
                  retryData.email || "user@example.com"
                );
                localStorage.setItem("avatarUrl", retryData.avatarUrl || "");
                localStorage.setItem("role", retryData.role || "USER");
                localStorage.setItem(
                  "created_at",
                  retryData.created_at || new Date().toISOString().split("T")[0]
                );
                localStorage.setItem(
                  "backgroundUrl",
                  retryData.backgroundUrl || null
                );
                setUser({
                  avatarUrl: retryData.avatarUrl || null,
                  userName: retryData.name || null,
                  backgroundUrl: retryData.backgroundUrl || null,
                });
                triggerSuccess();
                navigate("/dashboard", { replace: true });
              })
              .catch((retryError) => {
                console.error("Retry failed:", retryError);
                navigate("/login?error=fetch_failed", { replace: true });
              });
          } else {
            navigate("/login?error=fetch_failed", { replace: true });
          }
        })
        .finally(() => {
          console.log("=== CLEANUP ===");
          isProcessingLoginSuccess.current = false;
        });

      return;
    }

    checkAuth();
  }, [location.pathname, navigate]);

  if (location.pathname === "/loginSuccess") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          {isLoading ? "Đang xử lý đăng nhập..." : "Chuyển hướng..."}
        </div>
      </div>
    );
  }

  return children;
};

export default AuthMiddleware;
