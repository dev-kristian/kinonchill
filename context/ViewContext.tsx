// context/ViewContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ViewContextType {
  initialPollsCount: number;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialPollsCount, setInitialPollsCount] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setInitialPollsCount(4); // xl
      } else if (window.innerWidth >= 1024) {
        setInitialPollsCount(3); // lg
      } else if (window.innerWidth >= 768) {
        setInitialPollsCount(2); // md
      } else {
        setInitialPollsCount(1); // sm
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ViewContext.Provider value={{ initialPollsCount }}>
      {children}
    </ViewContext.Provider>
  );
};