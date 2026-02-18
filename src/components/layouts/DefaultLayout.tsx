import React, { ReactNode } from 'react';

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
};

export default DefaultLayout;
