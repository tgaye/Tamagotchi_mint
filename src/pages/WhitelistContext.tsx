// Create a file named WhitelistContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WhitelistContextType {
  isWhitelisted: boolean;
  setWhitelisted: (status: boolean) => void;
}

const WhitelistContext = createContext<WhitelistContextType | undefined>(undefined);

export const WhitelistProvider = ({ children }: { children: ReactNode }) => {
  const [isWhitelisted, setWhitelisted] = useState(false);

  return (
    <WhitelistContext.Provider value={{ isWhitelisted, setWhitelisted }}>
      {children}
    </WhitelistContext.Provider>
  );
};

export const useWhitelist = () => {
  const context = useContext(WhitelistContext);
  if (context === undefined) {
    throw new Error('useWhitelist must be used within a WhitelistProvider');
  }
  return context;
};
