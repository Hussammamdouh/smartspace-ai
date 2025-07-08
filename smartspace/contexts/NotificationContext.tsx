import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';

interface NotificationContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(2500);

  const showToast = useCallback((msg: string, toastType: ToastType = 'info', dur: number = 2500) => {
    setMessage(msg);
    setType(toastType);
    setDuration(dur);
    setVisible(true);
  }, []);

  const handleHide = () => setVisible(false);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Toast visible={visible} message={message} type={type} onHide={handleHide} duration={duration} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}; 