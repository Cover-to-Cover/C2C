import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <p>&copy; {new Date().getFullYear()} Cover to Cover. All rights reserved.</p>
    </footer>
  );
};

export default Footer;