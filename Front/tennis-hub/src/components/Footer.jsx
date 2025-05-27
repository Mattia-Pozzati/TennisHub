import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-4">
          <Col md={4}>
            <h5>TennisHub</h5>
            <p>Il tuo punto di riferimento per il tennis.</p>
          </Col>
        </Row>


        <hr className="border-secondary" />

        <p className="text-center mb-0">&copy; {new Date().getFullYear()} TennisHub. Tutti i diritti riservati.</p>
      </Container>
    </footer>
  );
};

export default Footer;