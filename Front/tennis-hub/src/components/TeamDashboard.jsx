import React from 'react';
import { Container, Row, Col, ListGroup, Card, Nav} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const torneiAttivi = [
  'Torneo Open Primavera 2025',
  'Champions Tennis League',
  'Coppa Regionale Sud',
];

const posizioneClassifica = {
  ranking: 3,
  punti: 1520,
  campionato: 'Serie A Tennis Club 2025',
};

const TeamDashboard = () => {
  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={3} className="bg-dark text-white min-vh-100 p-3">
          <h4 className="mb-4">Team Dashboard</h4>
          <ListGroup variant="flush">
            <ListGroup.Item action href="#" className="bg-dark text-white border-0">Panoramica</ListGroup.Item>
            <ListGroup.Item action href="#" className="bg-dark text-white border-0">Tornei</ListGroup.Item>
            <ListGroup.Item action href="#" className="bg-dark text-white border-0">Classifica</ListGroup.Item>
            <ListGroup.Item action href="#" className="bg-dark text-white border-0">Impostazioni</ListGroup.Item>
          </ListGroup>
        </Col>

        {/* Main Content */}
        <Col md={9} className="p-4">
          <h2 className="mb-4">Benvenuto, Team TennisHub!</h2>

          {/* Tornei attivi */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">Tornei Attivi</Card.Header>
            <Card.Body>
              <ul className="list-group">
                {torneiAttivi.map((torneo, idx) => (
                  <Link to={`/tournament/${idx}`} key={idx}>{torneo}</Link>
                ))}
              </ul>
            </Card.Body>
          </Card>

          {/* Classifica */}
          <Card>
            <Card.Header className="bg-success text-white">Posizione in Classifica</Card.Header>
            <Card.Body>
              <p><strong>Campionato:</strong> {posizioneClassifica.campionato}</p>
              <p><strong>Ranking Attuale:</strong> #{posizioneClassifica.ranking}</p>
              <p><strong>Punti Totali:</strong> {posizioneClassifica.punti}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeamDashboard;