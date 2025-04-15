// src/ts/LeftNav.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LeftNav.css';
import * as FaIcons from 'react-icons/fa';

const LeftNav: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleNav = () => {
    setExpanded(!expanded);
  };

  const handleNavClick = () => {
    setExpanded(false); // collapse on link click
  };

  return (
    <div className={`left-nav ${expanded ? 'expanded' : 'collapsed'}`}>
      <button className="hamburger" onClick={toggleNav}>
        &#9776;
      </button>
      <nav>
        <ul>
          <li>
            <Link to="/" onClick={handleNavClick}>
              <span className="icon"><FaIcons.FaHome /></span>
              {expanded && <span className="label">Home</span>}
            </Link>
          </li>
          <li>
            <Link to="/liked" onClick={handleNavClick}>
              <span className="icon"><FaIcons.FaHeart /></span>
              {expanded && <span className="label">Liked</span>}
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={handleNavClick}>
              <span className="icon"><FaIcons.FaUser /></span>
              {expanded && <span className="label">Profile</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftNav;