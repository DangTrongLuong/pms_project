export const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.result.authenticated) {
      console.log("data", data.result);
      localStorage.setItem("accessToken", data.result.accessToken);
      localStorage.setItem(
        "tokenExpiresAt",
        Date.now() + data.result.expiresIn * 1000
      );
      localStorage.setItem("userId", data.result.userId);
      localStorage.setItem("userEmail", data.result.email || email);
      localStorage.setItem("userName", data.result.name || "User"); // Lưu tên
      localStorage.setItem(
        "avatarUrl",
        data.result.avatarUrl ||
          "http://localhost:8080/uploads/avatars/default-avatar.png"
      ); // Lưu avatar
      localStorage.setItem("role", data.result.role || "USER");
      localStorage.setItem(
        "created_at",
        data.result.createdAt || new Date().toISOString().split("T")[0]
      );
      localStorage.setItem("backgroundUrl", data.result.backgroundUrl || null);
      localStorage.setItem("authProvider", "email"); // Lưu authProvider
      return data.result;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok && data.result) {
      return data.result; // Return user data if needed
    } else {
      throw new Error(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
