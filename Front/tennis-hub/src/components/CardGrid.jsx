import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const cardData = [
  {
    title: 'Tornei',
    text: 'Visualizza i tornei',
    link: '/tournament',
    img: 'https://via.placeholder.com/300x200?text=Tornei'
  },
  {
    title: 'Aggiungi un torneo',
    text: 'Prenota sessioni di allenamento con i coach.',
    link: '/allenamenti',
    img: 'https://via.placeholder.com/300x200?text=Allenamenti'
  },
  {
    title: 'Aggiungi un team',
    text: 'Conosci i membri del nostro team.',
    link: '/team-home-page',
    img: 'https://via.placeholder.com/300x200?text=Team'
  },
  {
    title: 'Proponiti come arbitro',
    text: 'Hai domande? Mettiti in contatto con noi.',
    link: '/contatti',
    img: 'https://via.placeholder.com/300x200?text=Contattaci'
  }
];

const CardGrid = () => {
  return (
    <Container className="my-5">
      <Row className="g-4">
        {cardData.map((card, index) => (
          <Col key={index} xs={12} md={6}>
            <Card className="h-100 shadow-sm">
              <Card.Img variant="top" src={card.img} alt={card.title} />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{card.title}</Card.Title>
                <Card.Text>{card.text}</Card.Text>
                <div className="mt-auto">
                  <Button as={Link} to={card.link} variant="primary">Vai</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CardGrid;