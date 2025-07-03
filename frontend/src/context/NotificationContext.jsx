import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const triggerSuccess = useCallback((message = 'Đăng nhập thành công') => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 2000); // Hide after 2 seconds
  }, []);

  return (
    <NotificationContext.Provider value={{ triggerSuccess, showSuccess, successMessage }}>
      {children}
    </NotificationContext.Provider>
  );
};