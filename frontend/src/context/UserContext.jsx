// UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    avatarUrl: localStorage.getItem("avatarUrl") || null,
    userName: localStorage.getItem("userName") || null,
    backgroundUrl: localStorage.getItem("backgroundUrl") || null,
  });

  useEffect(() => {
    // Cập nhật state khi localStorage thay đổi
    const updateUserFromLocalStorage = () => {
      setUser((prev) => ({
        ...prev,
        avatarUrl: localStorage.getItem("avatarUrl") || prev.avatarUrl,
        userName: localStorage.getItem("userName") || prev.userName,
        backgroundUrl:
          localStorage.getItem("backgroundUrl") || prev.backgroundUrl,
      }));
    };

    window.addEventListener("storage", updateUserFromLocalStorage);

    return () =>
      window.removeEventListener("storage", updateUserFromLocalStorage);
  }, []);

  const customSetUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem("avatarUrl", newUser.avatarUrl || "");
    localStorage.setItem("userName", newUser.userName || "");
    localStorage.setItem("backgroundUrl", newUser.backgroundUrl || "");
    window.dispatchEvent(new Event("storage")); // Trigger storage event
  };

  return (
    <UserContext.Provider value={{ user, setUser: customSetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
