import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Tab, Nav, Badge, Image, Alert, ProgressBar } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaHistory, FaCog, FaEdit, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaCamera, FaCheck, FaApple, FaBreadSlice, FaCarrot } from 'react-icons/fa';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AuthCheck from '@/components/auth/AuthCheck';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FoodPost } from '@/types';

// Custom styles
const styles = {
  profileHeader: {
    background: 'linear-gradient(135deg, #20b270 0%, #198754 100%)',
    borderRadius: '16px',
    padding: '2rem',
    color: 'white',
    marginBottom: '2rem',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  card: {
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(149, 157, 165, 0.15)',
    transition: 'all 0.3s ease',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(149, 157, 165, 0.2)',
  },
  tabContent: {
    padding: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(13, 110, 253, 0.05)',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
    color: '#0d6efd',
  },
  activityCard: {
    border: 'none',
    borderRadius: '12px',
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa',
  },
  badge: {
    borderRadius: '50px',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    fontSize: '0.75rem',
  },
};

const Profile = () => {
  const { currentUser, updateUserData, refreshUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    organization: currentUser?.organizationName || '',
    address: currentUser?.address || '',
  });
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stats related states
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalClaimed: 0,
    totalExpired: 0,
    savedMeals: 0,
    commonFoodTypes: [] as string[],
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load user data and stats on mount
  useEffect(() => {
    if (currentUser) {
      // Set form data from current user
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        organization: currentUser.organizationName || '',
        address: currentUser.address || '',
      });
      
      // Set avatar preview from profile image if exists
      if (currentUser.profileImage) {
        setAvatarPreview(currentUser.profileImage);
      }
      
      // Load user stats and activities
      loadUserStats();
    }
  }, [currentUser]);

  // Load user statistics from Firestore
  const loadUserStats = async () => {
    if (!currentUser) return;
    
    setLoadingStats(true);
    try {
      const db = getFirestore();
      
      // Query user's food posts
      const postsQuery = query(
        collection(db, 'foodPosts'),
        where('postedBy', '==', currentUser.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FoodPost[];
      
      // Calculate stats
      const totalDonations = posts.length;
      const claimedPosts = posts.filter(post => post.status === 'claimed' || post.status === 'picked');
      const expiredPosts = posts.filter(post => post.status === 'expired');
      
      // Estimate saved meals (rough calculation)
      const savedMeals = claimedPosts.reduce((sum, post) => {
        // Extract number from quantity string if possible
        const match = post.quantity.match(/\d+/);
        return sum + (match ? parseInt(match[0]) : 1);
      }, 0);
      
      // Get most common food types
      const foodTypes: Record<string, number> = {};
      posts.forEach(post => {
        const type = post.foodType || 'other';
        foodTypes[type] = (foodTypes[type] || 0) + 1;
      });
      
      const commonTypes = Object.entries(foodTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
      
      setStats({
        totalDonations,
        totalClaimed: claimedPosts.length,
        totalExpired: expiredPosts.length,
        savedMeals,
        commonFoodTypes: commonTypes,
      });
      
      // Set recent activities
      setRecentActivities(posts.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        organizationName: formData.organization,
      };
      
      // Update user data
      await updateUserData(updateData);
      
      // Upload avatar if selected
      if (avatarFile) {
        await uploadAvatar();
      }
      
      // Refresh user state to get latest data
      await refreshUserState();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // File size validation (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('Image is too large. Maximum size is 2MB.');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setUploadError(null);
    }
  };
  
  const uploadAvatar = async () => {
    if (!avatarFile || !currentUser) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${currentUser.id}/${Date.now()}_${avatarFile.name}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, avatarFile);
      
      // Listen for state changes
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading avatar:', error);
          setUploadError('Failed to upload avatar. Please try again.');
          setIsUploading(false);
        },
        async () => {
          // Get download URL and update user profile
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateUserData({ profileImage: downloadURL });
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error('Error in avatar upload:', error);
      setUploadError('An unexpected error occurred. Please try again.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to render food type icon
  const renderFoodTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fruits':
        return <FaApple className="text-success" />;
      case 'bread':
      case 'bakery':
        return <FaBreadSlice className="text-warning" />;
      case 'vegetables':
        return <FaCarrot className="text-danger" />;
      default:
        return <FaCarrot className="text-primary" />;
    }
  };

  return (
    <Layout>
      <Container className="py-4">
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <Row className="align-items-center">
            <Col md="auto" className="text-center mb-3 mb-md-0 position-relative">
              <div className="position-relative d-inline-block">
                <Image
                  src={avatarPreview || currentUser?.profileImage || '/images/default-avatar.png'}
                  alt="Profile"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    objectFit: 'cover',
                  }}
                  className="mb-2"
                />
                {isEditing && (
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle" 
                    style={{ width: '32px', height: '32px', padding: '0' }}
                    onClick={triggerFileInput}
                  >
                    <FaCamera />
                  </Button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <h4 className="mb-0">{currentUser?.name || 'User Name'}</h4>
              <p className="mb-0 opacity-75">
                {currentUser?.role === 'donor' ? 'Food Donor' : 'Food Recipient'}
              </p>
              {currentUser?.emailVerified && (
                <Badge bg="light" text="dark" pill className="mt-2">
                  <FaCheck className="me-1 text-success" /> Verified
                </Badge>
              )}
            </Col>
            <Col>
              <Row>
                <Col md={4} xs={6} className="text-center mb-3 mb-md-0">
                  <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2">
                    <h3 className="mb-0 fw-bold">{stats.totalDonations}</h3>
                    <p className="mb-0 small">Donations Made</p>
                  </div>
                </Col>
                <Col md={4} xs={6} className="text-center mb-3 mb-md-0">
                  <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2">
                    <h3 className="mb-0 fw-bold">{stats.totalClaimed}</h3>
                    <p className="mb-0 small">Items Claimed</p>
                  </div>
                </Col>
                <Col md={4} xs={12} className="text-center">
                  <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2">
                    <h3 className="mb-0 fw-bold">{stats.savedMeals}</h3>
                    <p className="mb-0 small">Estimated Meals Saved</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')}>
          <Card style={styles.card}>
            <Card.Header className="bg-white border-0">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="border-0">
                    <FaUser className="me-2" /> Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="activity" className="border-0">
                    <FaHistory className="me-2" /> Activity
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="settings" className="border-0">
                    <FaCog className="me-2" /> Settings
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body style={styles.tabContent}>
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  {isEditing ? (
                    <Form onSubmit={handleSubmit}>
                      {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                      {isUploading && (
                        <div className="mb-3">
                          <p className="mb-1">Uploading avatar...</p>
                          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                        </div>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Organization</Form.Label>
                        <Form.Control
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button variant="primary" type="submit" disabled={isUploading}>
                          Save Changes
                        </Button>
                        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <Row>
                        <Col md={6}>
                          <div className="mb-4">
                            <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>
                            
                            <div className="d-flex align-items-center mb-3" style={{
                              background: 'rgba(13, 110, 253, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                color: '#0d6efd',
                              }}>
                                <FaUser />
                              </div>
                              <div>
                                <div className="text-muted small">Full Name</div>
                                <div className="fw-semibold">{formData.name}</div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center mb-3" style={{
                              background: 'rgba(13, 110, 253, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                color: '#0d6efd',
                              }}>
                                <FaEnvelope />
                              </div>
                              <div>
                                <div className="text-muted small">Email</div>
                                <div className="fw-semibold">{formData.email}</div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center mb-3" style={{
                              background: 'rgba(13, 110, 253, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                color: '#0d6efd',
                              }}>
                                <FaPhone />
                              </div>
                              <div>
                                <div className="text-muted small">Phone Number</div>
                                <div className="fw-semibold">{formData.phone || 'Not provided'}</div>
                              </div>
                            </div>
                          </div>
                        </Col>
                        
                        <Col md={6}>
                          <div className="mb-4">
                            <h5 className="border-bottom pb-2 mb-3">Organization & Location</h5>
                            
                            <div className="d-flex align-items-center mb-3" style={{
                              background: 'rgba(13, 110, 253, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                color: '#0d6efd',
                              }}>
                                <FaBuilding />
                              </div>
                              <div>
                                <div className="text-muted small">Organization</div>
                                <div className="fw-semibold">{formData.organization || 'Not provided'}</div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center mb-3" style={{
                              background: 'rgba(13, 110, 253, 0.05)',
                              padding: '0.75rem',
                              borderRadius: '8px',
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem',
                                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                                color: '#0d6efd',
                              }}>
                                <FaMapMarkerAlt />
                              </div>
                              <div>
                                <div className="text-muted small">Address</div>
                                <div className="fw-semibold">{formData.address || 'Not provided'}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="border-bottom pb-2 mb-3">Common Food Types</h5>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              {loadingStats ? (
                                <p className="text-muted">Loading...</p>
                              ) : stats.commonFoodTypes.length > 0 ? (
                                stats.commonFoodTypes.map((type, index) => (
                                  <Badge 
                                    key={index} 
                                    bg="light" 
                                    text="dark" 
                                    className="px-3 py-2"
                                  >
                                    {renderFoodTypeIcon(type)} {type}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-muted">No food types found</p>
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Button
                        variant="outline-primary"
                        className="mt-3"
                        onClick={() => setIsEditing(true)}
                      >
                        <FaEdit className="me-2" /> Edit Profile
                      </Button>
                    </>
                  )}
                </Tab.Pane>

                {/* Activity Tab */}
                <Tab.Pane eventKey="activity">
                  <h5 className="mb-4">Recent Activity</h5>
                  
                  {loadingStats ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">No recent activities found</p>
                    </div>
                  ) : (
                    <div className="timeline-container">
                      {recentActivities.map((activity, index) => (
                        <Card 
                          key={activity.id} 
                          className="mb-3 border-0 shadow-sm"
                          style={{ borderRadius: '12px' }}
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{activity.title}</h6>
                                <div className="text-muted small">
                                  {activity.createdAt instanceof Date 
                                    ? activity.createdAt.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })
                                    : new Date(activity.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                </div>
                              </div>
                              <div className="text-end">
                                <Badge 
                                  bg={activity.status === 'available' ? 'success' : 
                                      activity.status === 'claimed' ? 'primary' : 
                                      activity.status === 'expired' ? 'danger' : 'secondary'}
                                  style={{
                                    borderRadius: '50px',
                                    padding: '0.5rem 1rem',
                                    fontWeight: '600',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </Badge>
                                <div className="text-muted small mt-1">
                                  {activity.quantity}
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab.Pane>

                {/* Settings Tab */}
                <Tab.Pane eventKey="settings">
                  <h5 className="mb-4">Account Settings</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Notifications</Form.Label>
                      <Form.Check
                        type="switch"
                        id="email-notifications"
                        label="Receive email notifications for new food donations"
                        defaultChecked
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Push Notifications</Form.Label>
                      <Form.Check
                        type="switch"
                        id="push-notifications"
                        label="Receive push notifications for nearby donations"
                        defaultChecked
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Privacy Settings</Form.Label>
                      <Form.Check
                        type="switch"
                        id="show-profile"
                        label="Show my profile to other users"
                        defaultChecked
                      />
                    </Form.Group>

                    <Button variant="primary" className="mt-3">
                      Save Settings
                    </Button>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>
    </Layout>
  );
};

export default function ProfilePage() {
  return (
    <AuthCheck>
      <Profile />
    </AuthCheck>
  );
} 