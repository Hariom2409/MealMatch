import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Nav, Tab, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaRegClock, FaMapMarkerAlt, FaCheck, FaEye } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getFoodPosts, deleteFoodPost, updateFoodPostStatus } from '@/services/foodPostService';
import { FoodPost } from '@/types';
import AuthCheck from '@/components/auth/AuthCheck';

// Custom CSS for enhanced UI
const styles = {
  navIconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
  },
  gradientSuccess: {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  },
  bgSuccess10: {
    background: 'rgba(40, 167, 69, 0.1)',
  },
  bgWarning10: {
    background: 'rgba(255, 193, 7, 0.1)',
  },
  bgPrimary10: {
    background: 'rgba(13, 110, 253, 0.1)',
  },
  bgDanger10: {
    background: 'rgba(220, 53, 69, 0.1)',
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: '0 0 0.5rem 0.5rem',
  },
  tableModern: {
    borderCollapse: 'separate',
    borderSpacing: '0 10px',
  },
  mobileCard: {
    marginBottom: '1rem',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mobileCardHeader: {
    borderBottom: 'none',
    backgroundColor: 'transparent',
    padding: '1rem 1rem 0.5rem',
  },
  mobileCardBody: {
    padding: '0.5rem 1rem',
  },
  mobileCardFooter: {
    borderTop: 'none',
    backgroundColor: 'transparent',
    padding: '0.5rem 1rem 1rem',
  },
  mobileItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  mobileLabel: {
    width: '100px',
    color: '#6c757d',
    fontWeight: '500',
    fontSize: '0.8rem',
  },
  mobileValue: {
    flex: 1,
    fontWeight: '500',
  },
};

// Format date for display
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format relative time (like "2 hours ago")
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
};

// Status Badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant = 'primary';
  let label = status;
  let icon = null;
  
  switch (status) {
    case 'available':
      variant = 'success';
      label = 'Available';
      icon = <FaPlus size={10} className="me-1" />;
      break;
    case 'claimed':
      variant = 'warning';
      label = 'Claimed';
      icon = <FaRegClock size={10} className="me-1" />;
      break;
    case 'picked_up':
    case 'picked':
      variant = 'primary';
      label = 'Picked Up';
      icon = <FaCheck size={10} className="me-1" />;
      break;
    case 'expired':
      variant = 'danger';
      label = 'Expired';
      icon = <FaExclamationTriangle size={10} className="me-1" />;
      break;
    default:
      break;
  }
  
  return (
    <Badge 
      bg={variant} 
      className="d-inline-flex align-items-center py-2 px-3 rounded-pill"
    >
      {icon}
      <span>{label}</span>
    </Badge>
  );
};

// First, let's add a Claim type or use optional properties
type FoodPostWithClaim = FoodPost & {
  claimedBy?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  pickupTime?: Date | null;
};

const DonorDashboard = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Only run the media query on the client side
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mediaQuery.matches);
      
      const handleResize = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleResize);
      return () => mediaQuery.removeEventListener('change', handleResize);
    }
  }, []);
  
  // Stats calculations
  const totalDonations = posts.length;
  const activeListings = posts.filter(post => post.status === 'available').length;
  const claimedDonations = posts.filter(post => post.status === 'claimed' || post.status === 'picked').length;
  const expiredDonations = posts.filter(post => post.status === 'expired').length;
  
  // Fetch real food posts from Firebase
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching posts for user:', currentUser);
      console.log('User ID:', currentUser?.id);
      
      if (!currentUser || !currentUser.id) {
        setError('You must be logged in to view your donations');
        setLoading(false);
        return;
      }
      
      // Get posts for the current user - TEMPORARY WORKAROUND: don't filter by user until index is ready
      try {
        // First try with the user filter (requires an index)
        const userPosts = await getFoodPosts({ userId: currentUser.id });
        console.log('Fetched food posts with user filter:', userPosts);
        console.log('Number of posts returned:', userPosts.length);
        
        // Check for expired posts and update their status if needed
        const updatedPosts = await Promise.all(userPosts.map(async post => {
          const now = new Date();
          if (post.status === 'available' && post.expiryTime < now) {
            console.log(`Post ${post.id} has expired, updating status in Firestore`);
            // Update in Firestore
            await updateFoodPostStatus(post.id, 'expired');
            // Update local object
            post.status = 'expired';
          }
          return post;
        }));
        
        setPosts(updatedPosts);
      } catch (err: any) {
        console.error('Error with user filter, trying without filters:', err);
        // If that fails, try without any filters (will get all posts)
        const allPosts = await getFoodPosts();
        // Manually filter the posts by user ID in JavaScript
        const filteredPosts = allPosts.filter(post => post.postedBy === currentUser.id);
        
        // Also check for expired posts here
        const updatedPosts = await Promise.all(filteredPosts.map(async post => {
          const now = new Date();
          if (post.status === 'available' && post.expiryTime < now) {
            console.log(`Post ${post.id} has expired, updating status in Firestore`);
            // Update in Firestore
            await updateFoodPostStatus(post.id, 'expired');
            // Update local object
            post.status = 'expired';
          }
          return post;
        }));
        
        console.log('Fetched all posts and filtered client-side:', updatedPosts);
        console.log('Number of filtered posts:', updatedPosts.length);
        setPosts(updatedPosts);
      }
    } catch (err: any) {
      console.error('Error fetching food posts:', err);
      setError('Failed to load your donations: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/donor/dashboard');
      return;
    }
    
    if (currentUser.role !== 'donor') {
      router.push('/');
      return;
    }
    
    fetchPosts();
  }, [currentUser, router]);
  
  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (postToDelete) {
      try {
        setDeleteLoading(true);
        
        // Delete the post from Firebase
        await deleteFoodPost(postToDelete);
        
        // Update local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
        
        // Show success toast or message here if desired
        
      } catch (err: any) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post: ' + (err.message || 'Unknown error'));
      } finally {
        setDeleteLoading(false);
        setShowDeleteModal(false);
        setPostToDelete(null);
      }
    }
  };
  
  // Render table rows for mobile view
  const renderMobileCard = (post: FoodPost) => {
    return (
      <Card key={post.id} style={styles.mobileCard}>
        <Card.Header style={styles.mobileCardHeader}>
          <div className="d-flex align-items-center">
            {post.imageUrl && (
              <div className="me-3">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  width="48" 
                  height="48" 
                  className="rounded-3 object-fit-cover"
                  style={{ objectFit: 'cover' }} 
                />
              </div>
            )}
            <div>
              <h6 className="mb-0 fw-semibold">{post.title}</h6>
              <div className="small text-muted">{post.quantity}</div>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={styles.mobileCardBody}>
          <div style={styles.mobileItem}>
            <div style={styles.mobileLabel}>Posted:</div>
            <div style={styles.mobileValue}>
              {post.createdAt instanceof Date 
                ? post.createdAt.toLocaleDateString() 
                : new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div style={styles.mobileItem}>
            <div style={styles.mobileLabel}>Expires:</div>
            <div style={styles.mobileValue}>
              {post.expiryTime instanceof Date 
                ? post.expiryTime.toLocaleDateString() 
                : new Date(post.expiryTime).toLocaleDateString()}
            </div>
          </div>
          <div style={styles.mobileItem}>
            <div style={styles.mobileLabel}>Status:</div>
            <div style={styles.mobileValue}>
              <StatusBadge status={post.status} />
            </div>
          </div>
        </Card.Body>
        <Card.Footer style={styles.mobileCardFooter}>
          <div className="d-flex gap-2 justify-content-end">
            <Button 
              size="sm" 
              variant="outline-danger"
              onClick={() => handleDeleteClick(post.id)}
            >
              <FaTrash className="me-1" /> Delete
            </Button>
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => router.push(`/donor/post/${post.id}`)}
            >
              <FaEye className="me-1" /> View
            </Button>
          </div>
        </Card.Footer>
      </Card>
    );
  };

  if (!currentUser || currentUser.role !== 'donor') {
    return (
      <Layout title="Loading - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
        </Container>
      </Layout>
    );
  }
  
  if (loading) {
    return (
      <Layout title="Loading Dashboard - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading your dashboard...</p>
        </Container>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Error - MealMatch">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title="Donor Dashboard - MealMatch" description="Manage your food donations">
      <Container fluid className="py-4 px-4 px-lg-5">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-success rounded-3 shadow-sm p-4 mb-4 text-white">
          <Row className="align-items-center">
            <Col>
              <h1 className="display-6 fw-bold mb-1">Welcome, {currentUser.name}!</h1>
              <p className="lead mb-0">Manage your food donations and track their status.</p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-3">
                <Button variant="light" className="shadow-sm" onClick={fetchPosts}>
                  <FaRegClock className="me-2" /> Refresh
                </Button>
                <Button variant="light" className="shadow-sm" onClick={() => router.push('/donor/post')}>
                  <FaPlus className="me-2" /> Post Food Donation
                </Button>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col sm={6} xl={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3 position-relative overflow-hidden">
              <div className="position-absolute bg-success opacity-10 rounded-circle" 
                style={{width: "120px", height: "120px", top: "-30px", right: "-30px"}}></div>
              <Card.Body className="p-4 text-center">
                <h3 className="display-4 fw-bold text-success">{totalDonations}</h3>
                <p className="mb-0 text-muted">Total Donations</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} xl={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3 position-relative overflow-hidden">
              <div className="position-absolute bg-success opacity-10 rounded-circle" 
                style={{width: "120px", height: "120px", top: "-30px", right: "-30px"}}></div>
              <Card.Body className="p-4 text-center">
                <h3 className="display-4 fw-bold text-success">{activeListings}</h3>
                <p className="mb-0 text-muted">Active Listings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} xl={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3 position-relative overflow-hidden">
              <div className="position-absolute bg-success opacity-10 rounded-circle" 
                style={{width: "120px", height: "120px", top: "-30px", right: "-30px"}}></div>
              <Card.Body className="p-4 text-center">
                <h3 className="display-4 fw-bold text-success">{claimedDonations}</h3>
                <p className="mb-0 text-muted">Claimed/Picked Up</p>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} xl={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3 position-relative overflow-hidden">
              <div className="position-absolute bg-danger opacity-10 rounded-circle" 
                style={{width: "120px", height: "120px", top: "-30px", right: "-30px"}}></div>
              <Card.Body className="p-4 text-center">
                <h3 className="display-4 fw-bold text-danger">{expiredDonations}</h3>
                <p className="mb-0 text-muted">Expired</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Donation Tabs */}
        <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
          <Card.Body className="p-0">
            <Tab.Container defaultActiveKey="active">
              <Nav variant="tabs" className="border-bottom nav-tabs-modern">
                <Nav.Item>
                  <Nav.Link eventKey="active" className="px-4 py-3 border-0 rounded-0 text-success">
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-circle bg-success-subtle me-2 d-flex align-items-center justify-content-center">
                        <FaPlus size={14} className="text-success" />
                      </div>
                      Active Listings
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="scheduled" className="px-4 py-3 border-0 rounded-0 text-warning">
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-circle bg-warning-subtle me-2 d-flex align-items-center justify-content-center">
                        <FaRegClock size={14} className="text-warning" />
                      </div>
                      Scheduled Pickups
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="completed" className="px-4 py-3 border-0 rounded-0 text-primary">
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-circle bg-primary-subtle me-2 d-flex align-items-center justify-content-center">
                        <FaCheck size={14} className="text-primary" />
                      </div>
                      Completed
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="expired" className="px-4 py-3 border-0 rounded-0 text-danger">
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-circle bg-danger-subtle me-2 d-flex align-items-center justify-content-center">
                        <FaExclamationTriangle size={14} className="text-danger" />
                      </div>
                      Expired
                    </div>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              
              <Tab.Content>
                {/* Active Listings Tab */}
                <Tab.Pane eventKey="active" className="p-4">
                  {posts.filter(post => post.status === 'available').length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-state-icon mb-4">
                        <div className="bg-success-subtle p-3 d-inline-block rounded-circle mb-2">
                          <FaExclamationTriangle size={36} className="text-success" />
                        </div>
                      </div>
                      <h3 className="h4 mb-3">No Active Listings</h3>
                      <p className="text-muted mb-4 col-md-6 mx-auto">You don't have any active food donations at the moment. Start sharing your extra food with those in need.</p>
                      <Link href="/donor/post">
                        <Button variant="success" className="px-4 py-2 shadow-sm">
                          <FaPlus className="me-2" /> Create New Donation
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    isMobile ? (
                      <div className="p-3">
                        {posts.filter(post => post.status === 'available').map(post => renderMobileCard(post))}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle table-modern">
                          <thead className="text-muted">
                            <tr>
                              <th>Donation</th>
                              <th>Posted</th>
                              <th>Expires</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {posts.filter(post => post.status === 'available').map(post => (
                              <tr key={post.id} className="align-middle">
                                <td>
                                  <div className="d-flex align-items-center">
                                    {post.imageUrl && (
                                      <div className="me-3">
                                        <img 
                                          src={post.imageUrl} 
                                          alt={post.title} 
                                          width="48" 
                                          height="48" 
                                          className="rounded-3 object-fit-cover"
                                          style={{ objectFit: 'cover' }} 
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <h6 className="mb-1 fw-semibold">{post.title}</h6>
                                      <div className="small text-muted">{post.quantity}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="small text-success">{formatRelativeTime(post.createdAt)}</div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center small">
                                    <FaRegClock className="me-1 text-warning" />
                                    <span>{formatDate(post.expiryTime)}</span>
                                  </div>
                                </td>
                                <td><StatusBadge status={post.status} /></td>
                                <td>
                                  <div className="d-flex">
                                    <Link href={`/donor/edit/${post.id}`}>
                                      <Button variant="outline-primary" size="sm" className="me-2 rounded-pill px-3">
                                        <FaEdit className="me-1" /> Edit
                                      </Button>
                                    </Link>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      className="rounded-pill px-3"
                                      onClick={() => handleDeleteClick(post.id)}
                                    >
                                      <FaTrash className="me-1" /> Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )
                  )}
                </Tab.Pane>
                
                {/* Scheduled Pickups Tab */}
                <Tab.Pane eventKey="scheduled" className="p-4">
                  {posts.filter(post => post.status === 'claimed').length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-state-icon mb-4">
                        <div className="bg-warning-subtle p-3 d-inline-block rounded-circle mb-2">
                          <FaRegClock size={36} className="text-warning" />
                        </div>
                      </div>
                      <h3 className="h4 mb-3">No Scheduled Pickups</h3>
                      <p className="text-muted mb-4 col-md-6 mx-auto">None of your donations have been claimed yet. Once recipients claim your food, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle table-modern">
                        <thead className="text-muted">
                          <tr>
                            <th>Donation</th>
                            <th>Claimed By</th>
                            <th>Pickup Time</th>
                            <th>Contact</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.filter(post => post.status === 'claimed').map(post => (
                            <tr key={post.id} className="align-middle">
                              <td>
                                <div className="d-flex align-items-center">
                                  {post.imageUrl && (
                                    <div className="me-3">
                                      <img 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        width="48" 
                                        height="48" 
                                        className="rounded-3 object-fit-cover"
                                        style={{ objectFit: 'cover' }} 
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{post.title}</h6>
                                    <div className="small text-muted">{post.quantity}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{(post as any).claimedBy ? (post as any).claimedBy.name : '-'}</td>
                              <td>
                                {(post as any).pickupTime ? (
                                  <div className="d-flex align-items-center small">
                                    <FaRegClock className="me-1 text-warning" />
                                    <span>{formatDate((post as any).pickupTime)}</span>
                                  </div>
                                ) : 'Not scheduled'}
                              </td>
                              <td>{(post as any).claimedBy ? (post as any).claimedBy.phone : '-'}</td>
                              <td><StatusBadge status={post.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab.Pane>
                
                {/* Completed Tab */}
                <Tab.Pane eventKey="completed" className="p-4">
                  {posts.filter(post => post.status === 'picked').length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-state-icon mb-4">
                        <div className="bg-primary-subtle p-3 d-inline-block rounded-circle mb-2">
                          <FaCheck size={36} className="text-primary" />
                        </div>
                      </div>
                      <h3 className="h4 mb-3">No Completed Donations</h3>
                      <p className="text-muted mb-4 col-md-6 mx-auto">None of your donations have been picked up yet. Once recipients collect your food, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle table-modern">
                        <thead className="text-muted">
                          <tr>
                            <th>Donation</th>
                            <th>Claimed By</th>
                            <th>Picked Up</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.filter(post => post.status === 'picked').map(post => (
                            <tr key={post.id} className="align-middle">
                              <td>
                                <div className="d-flex align-items-center">
                                  {post.imageUrl && (
                                    <div className="me-3">
                                      <img 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        width="48" 
                                        height="48" 
                                        className="rounded-3 object-fit-cover"
                                        style={{ objectFit: 'cover' }} 
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{post.title}</h6>
                                    <div className="small text-muted">{post.quantity}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{(post as any).claimedBy ? (post as any).claimedBy.name : '-'}</td>
                              <td>
                                {(post as any).pickupTime ? (
                                  <div className="d-flex align-items-center small">
                                    <FaCheck className="me-1 text-primary" />
                                    <span>{formatDate((post as any).pickupTime)}</span>
                                  </div>
                                ) : 'Not recorded'}
                              </td>
                              <td><StatusBadge status={post.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab.Pane>
                
                {/* Expired Tab */}
                <Tab.Pane eventKey="expired" className="p-4">
                  {posts.filter(post => post.status === 'expired').length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-state-icon mb-4">
                        <div className="bg-danger-subtle p-3 d-inline-block rounded-circle mb-2">
                          <FaExclamationTriangle size={36} className="text-danger" />
                        </div>
                      </div>
                      <h3 className="h4 mb-3">No Expired Donations</h3>
                      <p className="text-muted mb-4 col-md-6 mx-auto">None of your donations have expired. Great job keeping your listings current!</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle table-modern">
                        <thead className="text-muted">
                          <tr>
                            <th>Donation</th>
                            <th>Posted</th>
                            <th>Expired</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.filter(post => post.status === 'expired').map(post => (
                            <tr key={post.id} className="align-middle">
                              <td>
                                <div className="d-flex align-items-center">
                                  {post.imageUrl && (
                                    <div className="me-3">
                                      <img 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        width="48" 
                                        height="48" 
                                        className="rounded-3 object-fit-cover"
                                        style={{ objectFit: 'cover' }} 
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{post.title}</h6>
                                    <div className="small text-muted">{post.quantity}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="small text-muted">{formatRelativeTime(post.createdAt)}</div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center small">
                                  <FaExclamationTriangle className="me-1 text-danger" />
                                  <span>{formatDate(post.expiryTime)}</span>
                                </div>
                              </td>
                              <td><StatusBadge status={post.status} /></td>
                              <td>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  className="rounded-pill px-3"
                                  onClick={() => handleDeleteClick(post.id)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card.Body>
        </Card>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Delete Donation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-1">Are you sure you want to delete this food donation?</p>
          <p className="text-muted small">This action cannot be undone. All data associated with this donation will be permanently removed.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete} 
            disabled={deleteLoading}
            className="px-4"
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Deleting...
              </>
            ) : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

// Replace the commented out EmailVerificationGuard with AuthCheck
export default function DonorDashboardPage() {
  return (
    <AuthCheck requireVerified={true}>
      <DonorDashboard />
    </AuthCheck>
  );
} 