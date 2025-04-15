import React from 'react'; // Import the React library to enable JSX and component functionality
import './Header.css';     // Import the CSS file to style the header component

// Define a functional component called Header using TypeScript's React.FC for functional component type checking
const Header: React.FC = () => {
  // The component returns JSX that defines the structure and content of the header
  return (
    // The <header> element serves as the semantic container for the header content
    // The "main-header" class name is applied for styling purposes as defined in Header.css
    <header className="main-header">
      {/* <h3> displays the text "Cover to Cover" as the title within the header */}
      <h3>Cover to Cover</h3>
    </header>
  );
};

// Export the Header component to make it available for import in other parts of the application
export default Header;