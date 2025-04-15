import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaLeaf, FaHandsHelping, FaUsers } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout title="About - MealMatch" description="Learn about MealMatch and our mission">
      <Container className="py-5">
        <Row className="mb-5">
          <Col>
            <h1 className="display-4 fw-bold text-center mb-4">Our Mission</h1>
            <div className="text-center mb-5">
              <div className="d-inline-block position-relative mb-4">
                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: 100, height: 100 }}>
                  <span className="text-white fw-bold fs-1">MM</span>
                </div>
              </div>
              <p className="lead mb-0 mx-auto" style={{ maxWidth: '800px' }}>
                At MealMatch, we're committed to reducing food waste and fighting hunger in our communities
                by connecting food donors with local non-profit organizations and charities.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4 text-center">
                <div className="mb-3 text-success">
                  <FaLeaf size={50} />
                </div>
                <Card.Title className="fw-bold h4">Reduce Food Waste</Card.Title>
                <Card.Text>
                  Every year, millions of tons of food are wasted while people go hungry. 
                  We help businesses and individuals redirect their excess food to where it's needed most.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4 text-center">
                <div className="mb-3 text-success">
                  <FaHandsHelping size={50} />
                </div>
                <Card.Title className="fw-bold h4">Support Communities</Card.Title>
                <Card.Text>
                  By connecting donors with local organizations, we strengthen community bonds and
                  ensure that nutritious food reaches those experiencing food insecurity.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4 text-center">
                <div className="mb-3 text-success">
                  <FaUsers size={50} />
                </div>
                <Card.Title className="fw-bold h4">Build Networks</Card.Title>
                <Card.Text>
                  Our platform facilitates meaningful connections between food donors and organizations,
                  creating a sustainable ecosystem for ongoing food rescue and distribution.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                <h2 className="fw-bold mb-4">How MealMatch Works</h2>
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <span className="fw-bold">1</span>
                    </div>
                    <div>
                      <h3 className="h5 fw-bold">Food Donors Register</h3>
                      <p className="mb-0">
                        Restaurants, grocery stores, event venues, and individuals can create an account
                        to list available excess food for donation.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <span className="fw-bold">2</span>
                    </div>
                    <div>
                      <h3 className="h5 fw-bold">Post Available Food</h3>
                      <p className="mb-0">
                        Donors provide details about available food, including quantity, type, 
                        preparation time, expiration, and pickup information.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <span className="fw-bold">3</span>
                    </div>
                    <div>
                      <h3 className="h5 fw-bold">NGOs Claim Food</h3>
                      <p className="mb-0">
                        Local non-profits and charities can browse available food donations
                        and claim items that meet their needs.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <span className="fw-bold">4</span>
                    </div>
                    <div>
                      <h3 className="h5 fw-bold">Coordinate Pickup</h3>
                      <p className="mb-0">
                        The donor and organization coordinate food pickup through our 
                        streamlined communication system.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex">
                    <div className="flex-shrink-0 bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                      <span className="fw-bold">5</span>
                    </div>
                    <div>
                      <h3 className="h5 fw-bold">Track Impact</h3>
                      <p className="mb-0">
                        Both donors and organizations can track their contributions and impact
                        through detailed analytics and reporting.
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="text-center py-4">
              <h2 className="fw-bold mb-4">Join Our Community</h2>
              <p className="lead mb-0 mx-auto" style={{ maxWidth: '800px' }}>
                Whether you're a restaurant with surplus food, a grocery store with excess inventory,
                or a non-profit organization serving those in need, MealMatch provides the platform
                to connect and make a difference in our communities.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AboutPage; 