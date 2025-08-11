import React, { createContext, useContext, ReactNode } from 'react';

interface PostContextType {
  author: string;
  host: string;
  source: string;
  commandType?: string;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

interface PostProviderProps {
  children: ReactNode;
  value: PostContextType;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children, value }) => (
  <PostContext.Provider value={value}>
    {children}
  </PostContext.Provider>
);

export const usePostContext = (): PostContextType => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
