import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!isAdminRoute) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <Link to="/admin/dashboard" style={styles.brandLink}>
            Missing Person System
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div style={styles.menu}>
              <Link
                to="/admin/dashboard"
                style={{
                  ...styles.menuLink,
                  ...(location.pathname === '/admin/dashboard' ? styles.menuLinkActive : {})
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/register"
                style={{
                  ...styles.menuLink,
                  ...(location.pathname === '/admin/register' ? styles.menuLinkActive : {})
                }}
              >
                Register Case
              </Link>
              <Link
                to="/admin/matches"
                style={{
                  ...styles.menuLink,
                  ...(location.pathname === '/admin/matches' ? styles.menuLinkActive : {})
                }}
              >
                Matches
              </Link>
              <Link
                to="/admin/cases"
                style={{
                  ...styles.menuLink,
                  ...(location.pathname === '/admin/cases' ? styles.menuLinkActive : {})
                }}
              >
                Cases
              </Link>
            </div>

            <div style={styles.userSection}>
              <span style={styles.username}>{user?.username}</span>
              <button onClick={logout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#1f2937',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px'
  },
  brand: {
    fontSize: '18px',
    fontWeight: '600'
  },
  brandLink: {
    color: 'white',
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    gap: '30px',
    flex: 1,
    justifyContent: 'center'
  },
  menuLink: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  menuLinkActive: {
    color: 'white'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  username: {
    color: '#d1d5db',
    fontSize: '14px'
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Navbar;
