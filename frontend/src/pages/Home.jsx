import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { MapPin, Users, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/events');
        setEvents(res.data.data || []);
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container>
      {/* Hero Section */}
      <div className="hero-section fade-in-up">
        <Row className="align-items-center">
          <Col lg={8}>
            <h1>Discover Amazing Events</h1>
            <p className="mb-4">Explore competitions, hackathons, and workshops across top institutes. Register your team and compete for exciting prizes.</p>
            <div className="d-flex gap-3">
              {user ? (
                <Link to="/dashboard" className="btn btn-light btn-lg fw-bold px-4 rounded-pill" style={{ color: 'var(--primary)' }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-light btn-lg fw-bold px-4 rounded-pill" style={{ color: 'var(--primary)' }}>
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4 rounded-pill">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </Col>
          <Col lg={4} className="text-center d-none d-lg-block">
            <div style={{ fontSize: '6rem', lineHeight: 1 }}>🎉</div>
          </Col>
        </Row>
      </div>

      {/* Events Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Events</h3>
        <Badge bg="secondary" className="px-3 py-2">{events.length} Events</Badge>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {events.length === 0 && !error ? (
          <Col><Alert variant="info" className="text-center">No events found. Create one from the dashboard!</Alert></Col>
        ) : (
          events.map((event, idx) => (
            <Col md={6} lg={4} key={event._id}>
              <Card className={`h-100 card-hover border-0 shadow-sm fade-in-up fade-in-up-delay-${(idx % 4) + 1}`}>
                <div 
                  style={{ 
                    height: '200px', 
                    backgroundColor: '#e9ecef', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundImage: `url(${event.eventImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'})` 
                  }} 
                  className="card-img-top"
                />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg="info" className="fw-normal">{event.departmentId?.departmentName || 'Event'}</Badge>
                    {event.fees > 0 && (
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        <IndianRupee size={12} />{event.fees}
                      </Badge>
                    )}
                  </div>
                  <h5 className="fw-bold mb-1">{event.eventName}</h5>
                  <p className="text-muted small mb-3">{event.tagline}</p>
                  <Card.Text className="text-secondary flex-grow-1 small">
                    {event.description?.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                  </Card.Text>
                  
                  <div className="mt-auto pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2 small text-muted">
                      <div className="d-flex align-items-center gap-1"><MapPin size={14} /> {event.eventLocation || 'TBA'}</div>
                      <div className="d-flex align-items-center gap-1"><Users size={14} /> {event.groupMinParticipants}-{event.groupMaxParticipants} per team</div>
                    </div>
                    <Link to={`/events/${event._id}`} className="btn btn-primary w-100 mt-2 rounded-pill">View Details</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Home;
