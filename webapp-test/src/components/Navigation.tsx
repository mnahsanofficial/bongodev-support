import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: 'blue' }}>
        MurmurApp
      </Link>

      {isAuthenticated && (
        <Link to="/" style={{ marginRight: '10px' }}>Timeline</Link>
      )}
      
      {isAuthenticated && user && (
        <Link to={`/profile`} style={{ marginRight: '10px' }}> {/* Changed from /users/:id to /profile for simplicity for now */}
          My Profile ({user.name})
        </Link>
      )}

      <div style={{ marginLeft: 'auto' }}> {/* Pushes auth links to the right */}
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
