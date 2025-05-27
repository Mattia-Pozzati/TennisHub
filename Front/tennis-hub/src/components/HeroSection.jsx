import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Solo se usi React Router
import backgroundImage from '../assets/tennisPlayer.jpg';

function HeroSection({ children }) {
  const sectionStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    color: 'white',
    textShadow: '1px 1px 5px rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <section style={sectionStyle}>
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={8}>
            <h1 className="display-3">TennisHub</h1>
            <p className="lead">Scopri di più su quello che facciamo</p>
          </Col>
        </Row>
        {children}
      </Container>
    </section>
  );
}

export default HeroSection;