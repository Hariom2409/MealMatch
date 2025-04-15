import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaCarrot, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={6}>
            <div className="mb-4">
              <Link href="/" className="text-decoration-none d-flex align-items-center mb-3">
                <div className="logo-container-sm me-2">
                  <FaCarrot className="text-white" />
                </div>
                <span className="h4 mb-0 text-white fw-bold">MealMatch</span>
              </Link>
              <p className="text-gray-300 mb-4">
                Connecting food donors with organizations to reduce waste and help those in need.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="social-icon" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-icon" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </Col>
          
          <Col lg={2} md={6}>
            <h5 className="text-white mb-4 fw-semibold">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link href="/" className="footer-link">Home</Link>
              </li>
              <li className="mb-2">
                <Link href="/about" className="footer-link">About Us</Link>
              </li>
              <li className="mb-2">
                <Link href="/login" className="footer-link">Login</Link>
              </li>
              <li className="mb-2">
                <Link href="/register" className="footer-link">Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h5 className="text-white mb-4 fw-semibold">For Users</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link href="/register?role=donor" className="footer-link">Become a Donor</Link>
              </li>
              <li className="mb-2">
                <Link href="/register?role=ngo" className="footer-link">Register as NGO</Link>
              </li>
              <li className="mb-2">
                <Link href="/donor/dashboard" className="footer-link">Donor Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link href="/recipient/dashboard" className="footer-link">Recipient Dashboard</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h5 className="text-white mb-4 fw-semibold">Contact Us</h5>
            <ul className="list-unstyled footer-contact">
              <li className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="contact-icon mt-1" />
                <span className="ms-2">123 Food Street, Hunger City, 90210, United States</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaEnvelope className="contact-icon" />
                <span className="ms-2">info@mealmatch.example</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaPhone className="contact-icon" />
                <span className="ms-2">+1 (555) 123-4567</span>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="mt-4 mb-4 border-gray-700" />
        
        <div className="text-center text-gray-400">
          <p className="mb-0">&copy; {currentYear} MealMatch. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 