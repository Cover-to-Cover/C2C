import React from 'react'; // Import React to enable the use of JSX and React components.
import './Footer.css';    // Import the CSS file to apply styles to the footer component.

const Footer: React.FC = () => {
  // Define the Footer functional component using TypeScript's React.FC type.
  return (
    // The footer element serves as a semantic container for footer content.
    <footer className="main-footer">
      {/* Display a paragraph containing the copyright notice.
          The expression new Date().getFullYear() dynamically renders the current year. */}
      <p>&copy; {new Date().getFullYear()} Cover to Cover. All rights reserved.</p>
    </footer>
  );
};

export default Footer; // Export the Footer component so it can be imported and used in other parts of the application.
