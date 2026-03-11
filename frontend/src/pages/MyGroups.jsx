import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CalendarRange, Users, MapPin, IndianRupee, CheckCircle, XCircle } from 'lucide-react';

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const res = await axios.get('/groups/my');
        setGroups(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyGroups();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="page-header">
        <h2>My Groups</h2>
        <Badge bg="secondary" className="px-3 py-2 fs-6">{groups.length} Registrations</Badge>
      </div>

      {groups.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <CalendarRange size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Groups Yet</h5>
            <p className="text-muted">You haven't registered for any events. <Link to="/">Browse events</Link> and create a group!</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {groups.map((group, idx) => {
            const event = group.eventId;
            return (
              <Col md={6} lg={4} key={group._id}>
                <Card className={`h-100 card-hover border-0 shadow-sm fade-in-up fade-in-up-delay-${(idx % 4) + 1}`}>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="info" className="fw-normal">{event?.eventName || 'Unknown Event'}</Badge>
                      <div className="d-flex gap-1">
                        {group.isPaymentDone ? (
                          <Badge bg="success" className="d-flex align-items-center gap-1"><CheckCircle size={12} /> Paid</Badge>
                        ) : (
                          <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1"><XCircle size={12} /> Unpaid</Badge>
                        )}
                      </div>
                    </div>
                    
                    <h5 className="fw-bold mb-2">{group.groupName}</h5>
                    
                    <div className="text-muted small mb-3">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <Users size={14} /> {group.participantCount || 0} / {event?.groupMaxParticipants || '?'} members
                      </div>
                      {event?.eventLocation && (
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <MapPin size={14} /> {event.eventLocation}
                        </div>
                      )}
                      {event?.fees > 0 && (
                        <div className="d-flex align-items-center gap-1">
                          <IndianRupee size={14} /> ₹{event.fees} per team
                        </div>
                      )}
                    </div>

                    {/* Status indicators */}
                    {event && (group.participantCount || 0) < event.groupMinParticipants && (
                      <div className="alert alert-warning py-1 px-2 mb-2 small">
                        ⚠️ Need at least {event.groupMinParticipants} members
                      </div>
                    )}

                    <div className="mt-auto">
                      <Link 
                        to={`/events/${event?._id}`} 
                        className="btn btn-primary w-100 rounded-pill btn-sm"
                      >
                        Manage Team Members
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default MyGroups;
