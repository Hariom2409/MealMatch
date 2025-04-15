import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Tab, Nav, Badge, Image } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaHistory, FaCog, FaEdit, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';

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
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    organization: '',
    address: '',
  });

  // Mock activity data - replace with real data from your backend
  const activities = [
    {
      id: 1,
      type: 'claim',
      title: 'Claimed Fresh Produce',
      date: '2024-03-15',
      status: 'completed',
      quantity: '40 kg',
    },
    {
      id: 2,
      type: 'donation',
      title: 'Donated Prepared Meals',
      date: '2024-03-10',
      status: 'completed',
      quantity: '25 servings',
    },
    {
      id: 3,
      type: 'claim',
      title: 'Claimed Bread Assortment',
      date: '2024-03-05',
      status: 'completed',
      quantity: '30 loaves',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your update profile logic here
    setIsEditing(false);
  };

  return (
    <Layout>
      <Container className="py-4">
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <Row className="align-items-center">
            <Col md="auto" className="text-center mb-3 mb-md-0">
              <Image
                src={currentUser?.photoURL || '/images/default-avatar.png'}
                alt="Profile"
                style={styles.avatar}
                className="mb-2"
              />
              <h4 className="mb-0">{currentUser?.displayName || 'User Name'}</h4>
              <p className="mb-0 opacity-75">Member since 2024</p>
            </Col>
            <Col>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="light" text="dark" style={styles.badge}>
                  <FaBuilding className="me-1" /> NGO Member
                </Badge>
                <Badge bg="light" text="dark" style={styles.badge}>
                  12 Successful Claims
                </Badge>
                <Badge bg="light" text="dark" style={styles.badge}>
                  5 Donations Made
                </Badge>
              </div>
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
                        <Button variant="primary" type="submit">
                          Save Changes
                        </Button>
                        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <div style={styles.infoItem}>
                        <div style={styles.icon}>
                          <FaUser />
                        </div>
                        <div>
                          <div className="text-muted small">Full Name</div>
                          <div className="fw-semibold">{formData.name}</div>
                        </div>
                      </div>

                      <div style={styles.infoItem}>
                        <div style={styles.icon}>
                          <FaEnvelope />
                        </div>
                        <div>
                          <div className="text-muted small">Email</div>
                          <div className="fw-semibold">{formData.email}</div>
                        </div>
                      </div>

                      <div style={styles.infoItem}>
                        <div style={styles.icon}>
                          <FaPhone />
                        </div>
                        <div>
                          <div className="text-muted small">Phone Number</div>
                          <div className="fw-semibold">{formData.phone || 'Not provided'}</div>
                        </div>
                      </div>

                      <div style={styles.infoItem}>
                        <div style={styles.icon}>
                          <FaBuilding />
                        </div>
                        <div>
                          <div className="text-muted small">Organization</div>
                          <div className="fw-semibold">{formData.organization || 'Not provided'}</div>
                        </div>
                      </div>

                      <div style={styles.infoItem}>
                        <div style={styles.icon}>
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <div className="text-muted small">Address</div>
                          <div className="fw-semibold">{formData.address || 'Not provided'}</div>
                        </div>
                      </div>

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
                  {activities.map(activity => (
                    <Card key={activity.id} style={styles.activityCard}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{activity.title}</h6>
                            <div className="text-muted small">
                              {new Date(activity.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg="success" style={styles.badge}>
                              {activity.quantity}
                            </Badge>
                            <div className="text-muted small mt-1">
                              {activity.type === 'claim' ? 'Claimed' : 'Donated'}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
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

export default Profile; 