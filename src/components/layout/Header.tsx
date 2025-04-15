import React, { memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

// Component for the logo to avoid re-renders
const Logo = memo(() => (
  <Navbar.Brand className="d-flex align-items-center">
    <div 
      className="bg-success rounded-circle d-flex align-items-center justify-content-center me-2" 
      style={{ width: 40, height: 40 }}
    >
      <span className="text-white fw-bold">MM</span>
    </div>
    <span className="fw-bold text-success">MealMatch</span>
  </Navbar.Brand>
));

Logo.displayName = 'Logo';

// Component for unauthenticated links
const UnauthenticatedLinks = memo(() => (
  <>
    <Link href="/login" passHref legacyBehavior>
      <Nav.Link 
        className="ms-lg-2"
        active={useRouter().pathname === '/login'}
      >
        Login
      </Nav.Link>
    </Link>
    
    <Link href="/register" passHref legacyBehavior>
      <Button 
        variant="success" 
        className="ms-lg-2"
      >
        Register
      </Button>
    </Link>
  </>
));

UnauthenticatedLinks.displayName = 'UnauthenticatedLinks';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom shadow-sm py-3">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Logo />
        </Link>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link active={router.pathname === '/'}>Home</Nav.Link>
            </Link>
            
            <Link href="/about" passHref legacyBehavior>
              <Nav.Link active={router.pathname === '/about'}>About</Nav.Link>
            </Link>

            {!currentUser ? (
              <UnauthenticatedLinks />
            ) : (
              <>
                {currentUser.role === 'donor' && (
                  <>
                    <Link href="/donor/dashboard" passHref legacyBehavior>
                      <Nav.Link active={router.pathname.startsWith('/donor')}>
                        Dashboard
                      </Nav.Link>
                    </Link>
                    <Link href="/donor/post" passHref legacyBehavior>
                      <Nav.Link active={router.pathname === '/donor/post'}>
                        Post Food
                      </Nav.Link>
                    </Link>
                  </>
                )}
                
                {currentUser.role === 'ngo' && (
                  <>
                    <Link href="/ngo/dashboard" passHref legacyBehavior>
                      <Nav.Link active={router.pathname.startsWith('/ngo')}>
                        Dashboard
                      </Nav.Link>
                    </Link>
                    <Link href="/ngo/browse" passHref legacyBehavior>
                      <Nav.Link active={router.pathname === '/ngo/browse'}>
                        Browse Food
                      </Nav.Link>
                    </Link>
                  </>
                )}
                
                <NavDropdown 
                  title={currentUser.name || 'Account'} 
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <Link href="/profile" passHref legacyBehavior>
                    <NavDropdown.Item active={router.pathname === '/profile'}>
                      Profile
                    </NavDropdown.Item>
                  </Link>
                  
                  <Link href="/messages" passHref legacyBehavior>
                    <NavDropdown.Item active={router.pathname === '/messages'}>
                      Messages
                    </NavDropdown.Item>
                  </Link>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 