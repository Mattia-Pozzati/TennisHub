import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function TournamentPage() {
    const [tournaments, setTournaments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const defaultTournaments = [
        {
            id: 1,
            name: "Torneo di Roma",
            startDate: "2024-01-01",
            endDate: "2024-01-07",
            location: "Roma",
            image: "https://via.placeholder.com/300x200?text=Torneo+di+Roma"
        },
        {
            id: 2,
            name: "Torneo di Milano",
            location: "Milano",
            startDate: "2024-01-01",
            endDate: "2024-01-07",
            image: "https://via.placeholder.com/300x200?text=Torneo+di+Milano"
        },
        {
            id: 3,
            name: "Torneo di Napoli",
            location: "Napoli",
            startDate: "2024-01-01",
            endDate: "2024-01-07",
            image: "https://via.placeholder.com/300x200?text=Torneo+di+Napoli"
        },
        {
            id: 4,
            name: "Torneo di Palermo",
            location: "Palermo",
            startDate: "2024-01-01",
            endDate: "2024-01-07",
            image: "https://via.placeholder.com/300x200?text=Torneo+di+Palermo"
        }

    ];

    const fetchTournaments = async (term = '') => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:8000/tournaments?search=${term}`);
            if (!response.ok) throw new Error('Errore nella richiesta');
            const data = await response.json();
            setTournaments(data);
        } catch (err) {
          /* TODO: */   
          const filtered = defaultTournaments.filter(tournament => tournament.name.toLowerCase().includes(term.toLowerCase()));
            setTournaments(filtered);
            //setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchTournaments(value);
    };

    return (
        <Container className="my-5">
            <h1>Tornei</h1>

            <Form className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Cerca per nome o città..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </Form>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                {tournaments.length > 0 ? (
                    tournaments.map((tournament, index) => (
                        <Col key={index} xs={12} md={12}>
                            <Card className="h-100 shadow-sm">
                                <Card.Img variant="top" src={tournament.image} alt={tournament.name} />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{tournament.name}</Card.Title>
                                    <Card.Text>{tournament.startDate.split('T')[0]} / {tournament.endDate.split('T')[0]}</Card.Text>
                                    <div className="mt-auto">
                                        <Button as={Link} to={`/tournament/${tournament.id}`} variant="primary">Vai</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    !loading && <p>Nessun torneo trovato.</p>
                )}
            </Row>
        </Container>
    );
}

export default TournamentPage;