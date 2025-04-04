import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [minimized, setMinimized] = useState(false);

  const toggleSidebar = () => {
    setMinimized(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ minimized, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
