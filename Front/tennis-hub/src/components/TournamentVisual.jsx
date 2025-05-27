import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';


// Esempio dati fittizi per ogni turno
const tornei = {
  ottavi: [
    ['Player 1', 'Player 2'],
    ['Player 3', 'Player 4'],
    ['Player 5', 'Player 6'],
    ['Player 7', 'Player 8'],
    ['Player 9', 'Player 10'],
    ['Player 11', 'Player 12'],
    ['Player 13', 'Player 14'],
    ['Player 15', 'Player 16']
  ],
  quarti: [
    ['Player 1', 'Player 3'],
    ['Player 5', 'Player 7'],
    ['Player 9', 'Player 11'],
    ['Player 13', 'Player 15']
  ],
  semifinali: [
    ['Player 1', 'Player 5'],
    ['Player 9', 'Player 13']
  ],
  finale: [
    ['Player 1', 'Player 9']
  ],
};

const Turno = ({ titolo, partite }) => (
  <Col>
    <h6 className="text-center">{titolo}</h6>
    {partite.map((match, i) => (
      <Card key={i} className="mb-3 text-center">
        <Card.Body className="p-2">
          <div>{match[0]}</div>
          <div className="text-muted" style={{ fontSize: '0.9em' }}>vs</div>
          <div>{match[1]}</div>
        </Card.Body>
      </Card>
    ))}
  </Col>
);

const TournamentVisual = ()=> {
  return (
    <Container fluid className="my-5">
      <h2 className="text-center mb-4">Tabellone </h2>
      <Row className="overflow-auto">
        <Turno titolo="Ottavi" partite={tornei.ottavi} />
        <Turno titolo="Quarti" partite={tornei.quarti} />
        <Turno titolo="Semifinali" partite={tornei.semifinali} />
        <Turno titolo="Finale" partite={tornei.finale} />
      </Row>
    </Container>
  );
};

export default TournamentVisual;