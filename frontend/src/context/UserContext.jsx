// UserContext.js
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    avatarUrl: localStorage.getItem("avatarUrl") || null,
    userName: localStorage.getItem("userName") || null,
    backgroundUrl: localStorage.getItem("backgroundUrl" || null),
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
