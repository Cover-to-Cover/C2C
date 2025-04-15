// app/components/LeftNav.tsx
// This file defines a React functional component for a left navigation panel.
// It uses React hooks for state management and displays navigation links using icons from react-icons.

import React, { useState } from 'react'; // Import React and the useState hook
import { Link } from 'react-router-dom'; // Import Link for client-side routing from react-router-dom
import './LeftNav.css'; // Import component-specific CSS for styling
import * as FaIcons from 'react-icons/fa'; // Import FontAwesome icons as FaIcons

// Define the LeftNav functional component with TypeScript typing (React.FC)
const LeftNav: React.FC = () => {
  // Create a state variable 'expanded' that determines if the navigation is expanded or collapsed
  // 'setExpanded' is a function to update the 'expanded' state
  const [expanded, setExpanded] = useState(false);

  // Function to toggle the navigation menu's expanded/collapsed state
  const toggleNav = () => {
    setExpanded(!expanded);
  };

  // Function to handle navigation link clicks
  // It collapses the navigation menu by setting 'expanded' to false when a link is clicked
  const handleNavClick = () => {
    setExpanded(false); // collapse on link click
  };

  // Return the JSX for rendering the component
  return (
    // The outer div uses dynamic class names to switch between 'expanded' and 'collapsed' styles
    <div className={`left-nav ${expanded ? 'expanded' : 'collapsed'}`}>
      
      {/* Button used as a hamburger icon to toggle the navigation menu */}
      <button className="hamburger" onClick={toggleNav}>
        &#9776; {/* Unicode character for hamburger icon */}
      </button>

      {/* Navigation block containing list of links */}
      <nav>
        <ul>
          {/* Home link */}
          <li>
            <Link to="/" onClick={handleNavClick}>
              {/* Icon for Home link */}
              <span className="icon"><FaIcons.FaHome /></span>
              {/* Conditionally render the label "Home" if the nav is expanded */}
              {expanded && <span className="label">Home</span>}
            </Link>
          </li>

          {/* Liked link */}
          <li>
            <Link to="/liked" onClick={handleNavClick}>
              {/* Icon for Liked link */}
              <span className="icon"><FaIcons.FaHeart /></span>
              {/* Conditionally render the label "Liked" if the nav is expanded */}
              {expanded && <span className="label">Liked</span>}
            </Link>
          </li>

          {/* Profile link */}
          <li>
            <Link to="/profile" onClick={handleNavClick}>
              {/* Icon for Profile link */}
              <span className="icon"><FaIcons.FaUser /></span>
              {/* Conditionally render the label "Profile" if the nav is expanded */}
              {expanded && <span className="label">Profile</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Export the component for use in other parts of the application
export default LeftNav;