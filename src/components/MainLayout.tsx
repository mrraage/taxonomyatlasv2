import React from 'react';
import { Outlet } from 'react-router'; // Corrected import path
import Header from './header'; // Import the redesigned header

const MainLayout: React.FC = () => {
  return (
    <div>
      <Header />
      <main> {/* Optional: wrap outlet in main for semantics */}
        <Outlet /> {/* This will render the matched child route's component */}
      </main>
    </div>
  );
};

export default MainLayout;