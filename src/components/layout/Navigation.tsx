import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { FaCarrot, FaHome, FaInfoCircle, FaSun, FaMoon, FaUser, FaChevronDown, FaTachometerAlt, FaPlusCircle } from 'react-icons/fa';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Navbar
      expand="lg"
      className={`navbar-transition fixed-top ${scrolled ? 'scrolled-navbar' : 'transparent-navbar'}`}
    >
      <Container fluid className="px-4">
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand className="d-flex align-items-center">
            <div className="logo-container me-2">
              <FaCarrot className="logo-icon" />
            </div>
            <span className="navbar-brand-text fw-bold">MealMatch</span>
          </Navbar.Brand>
        </Link>
        
        <div className="d-flex align-items-center order-lg-3">
          <Button 
            className="theme-toggle-btn me-3"
            onClick={toggleTheme}
            aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <FaSun className="theme-icon sun-icon" />
            ) : (
              <FaMoon className="theme-icon moon-icon" />
            )}
          </Button>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
          
          {!user ? (
            <div className="d-none d-lg-flex header-buttons">
              <Link href="/login" passHref legacyBehavior>
                <Button variant="outline-primary" className="btn-login me-2">Login</Button>
              </Link>
              <Link href="/register" passHref legacyBehavior>
                <Button variant="primary" className="btn-register">Register</Button>
              </Link>
            </div>
          ) : (
            <div className="d-none d-lg-block">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="user-menu-dropdown p-0 text-decoration-none border-0 shadow-none">
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-2">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="user-name d-none d-lg-inline">{user.name || 'User'}</span>
                    <FaChevronDown className="ms-2 dropdown-arrow" />
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu-end shadow-sm dropdown-menu-custom">
                  <Dropdown.Header className="py-2 px-3">
                    <small className="text-muted">Signed in as</small>
                    <p className="mb-0 fw-medium">{user.email}</p>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} href="/profile" className="dropdown-item-custom">
                    <div className="d-flex align-items-center">
                      <div className="dropdown-icon-circle bg-primary-subtle me-2">
                        <FaUser className="text-primary" size={12} />
                      </div>
                      <span>Profile</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} href={user.role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard'} className="dropdown-item-custom">
                    <div className="d-flex align-items-center">
                      <div className="dropdown-icon-circle bg-success-subtle me-2">
                        <FaHome className="text-success" size={12} />
                      </div>
                      <span>Dashboard</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom text-danger">Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </div>

        <Navbar.Collapse id="basic-navbar-nav" className="order-lg-2">
          <Nav className="mx-auto main-nav-links">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link className={`nav-link-custom mx-lg-2 ${router.pathname === '/' ? 'active' : ''}`}>
                <FaHome className="me-2 nav-icon" />
                Home
              </Nav.Link>
            </Link>
            <Link href="/about" passHref legacyBehavior>
              <Nav.Link className={`nav-link-custom mx-lg-2 ${router.pathname === '/about' ? 'active' : ''}`}>
                <FaInfoCircle className="me-2 nav-icon" />
                About
              </Nav.Link>
            </Link>
            
            {/* Show Dashboard and Post Food links for logged-in donor users */}
            {user && user.role === 'donor' && (
              <>
                <Link href="/donor/dashboard" passHref legacyBehavior>
                  <Nav.Link className={`nav-link-custom mx-lg-2 ${router.pathname.includes('/donor/dashboard') ? 'active' : ''}`}>
                    <FaTachometerAlt className="me-2 nav-icon" />
                    Dashboard
                  </Nav.Link>
                </Link>
                <Link href="/donor/post" passHref legacyBehavior>
                  <Nav.Link className={`nav-link-custom mx-lg-2 ${router.pathname.includes('/donor/post') ? 'active' : ''}`}>
                    <FaPlusCircle className="me-2 nav-icon" />
                    Post Food
                  </Nav.Link>
                </Link>
              </>
            )}
            
            {/* Show Dashboard for recipient/NGO users */}
            {user && user.role === 'ngo' && (
              <Link href="/recipient/dashboard" passHref legacyBehavior>
                <Nav.Link className={`nav-link-custom mx-lg-2 ${router.pathname.includes('/recipient/dashboard') ? 'active' : ''}`}>
                  <FaTachometerAlt className="me-2 nav-icon" />
                  Dashboard
                </Nav.Link>
              </Link>
            )}
          </Nav>
          
          <div className="d-lg-none d-flex flex-column mt-3">
            {!user ? (
              <>
                <Link href="/login" passHref legacyBehavior>
                  <Button variant="outline-primary" className="btn-login mb-2 w-100">Login</Button>
                </Link>
                <Link href="/register" passHref legacyBehavior>
                  <Button variant="primary" className="btn-register w-100">Register</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Mobile menu dashboard link for donors */}
                {user.role === 'donor' && (
                  <>
                    <Link href="/donor/dashboard" passHref legacyBehavior>
                      <Button variant="outline-primary" className="mb-2 w-100">
                        <FaTachometerAlt className="me-2" /> Dashboard
                      </Button>
                    </Link>
                    <Link href="/donor/post" passHref legacyBehavior>
                      <Button variant="outline-primary" className="mb-2 w-100">
                        <FaPlusCircle className="me-2" /> Post Food
                      </Button>
                    </Link>
                  </>
                )}
                
                {/* Mobile menu dashboard link for recipients */}
                {user.role === 'ngo' && (
                  <Link href="/recipient/dashboard" passHref legacyBehavior>
                    <Button variant="outline-primary" className="mb-2 w-100">
                      <FaTachometerAlt className="me-2" /> Dashboard
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline-danger" onClick={handleLogout} className="w-100 mt-1">
                  Logout
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 