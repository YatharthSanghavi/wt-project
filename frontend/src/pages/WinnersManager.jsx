import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Spinner, Row, Col, Card, Modal, Badge } from 'react-bootstrap';
import { Trophy, Trash2, Pencil } from 'lucide-react';

const WinnersManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [winners, setWinners] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ groupId: '', sequence: '1' });

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWinner, setEditingWinner] = useState(null);
  const [editFormData, setEditFormData] = useState({ groupId: '', sequence: '1' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events');
      setEvents(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedEventId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchWinners(selectedEventId);
      fetchGroups(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchWinners = async (eventId) => {
    try {
      const res = await axios.get(`/events/${eventId}/winners`);
      setWinners(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroups = async (eventId) => {
    try {
      const res = await axios.get(`/events/${eventId}/groups`);
      setGroups(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclareWinner = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/events/${selectedEventId}/winners`, {
        groupId: formData.groupId,
        sequence: Number(formData.sequence)
      });
      setFormData({ groupId: '', sequence: '1' });
      fetchWinners(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error declaring winner');
    }
  };

  const handleEditClick = (winner) => {
    setEditingWinner(winner);
    setEditFormData({
      groupId: winner.groupId?._id || '',
      sequence: String(winner.sequence)
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/winners/${editingWinner._id}`, {
        groupId: editFormData.groupId,
        sequence: Number(editFormData.sequence)
      });
      setShowEditModal(false);
      setEditingWinner(null);
      fetchWinners(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating winner');
    }
  };

  const deleteWinner = async (id) => {
    if (window.confirm('Remove this winner?')) {
      try {
        await axios.delete(`/winners/${id}`);
        fetchWinners(selectedEventId);
      } catch (err) {
        alert('Error removing winner');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  // Figure out which sequences are already taken
  const takenSequences = winners.map(w => w.sequence);

  return (
    <Container>
      <div className="page-header">
        <h2>Winners Manager</h2>
        <Badge bg="secondary" className="px-3 py-2 fs-6">{winners.length} Winners</Badge>
      </div>

      <div className="mb-4">
        <Form.Label className="fw-bold">Select Event:</Form.Label>
        <Form.Select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} size="lg">
          {events.length === 0 ? <option value="">No events available</option> : null}
          {events.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.eventName}</option>
          ))}
        </Form.Select>
      </div>

      <Row className="g-4">
        <Col md={8}>
          {/* Current Winners */}
          <div className="table-responsive bg-white rounded shadow-sm">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Group Name</th>
                  <th>Participants</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted py-4">No winners declared yet for this event.</td></tr>
                ) : (
                  winners.sort((a, b) => a.sequence - b.sequence).map(w => (
                    <tr key={w._id}>
                      <td className="align-middle fw-bold h5 mb-0 text-primary">
                        {w.sequence === 1 ? '🥇 1st' : w.sequence === 2 ? '🥈 2nd' : '🥉 3rd'} Place
                      </td>
                      <td className="align-middle fs-5">{w.groupId?.groupName}</td>
                      <td className="align-middle text-muted">{w.groupId?.participantCount || '-'}</td>
                      <td className="text-end align-middle">
                        <Button variant="light" size="sm" onClick={() => handleEditClick(w)} className="me-1 text-primary">
                          <Pencil size={16} />
                        </Button>
                        <Button variant="light" size="sm" onClick={() => deleteWinner(w._id)} className="text-danger">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col md={4}>
          {/* Declare Winner Form */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold border-bottom pb-2 mb-3 text-primary d-flex align-items-center gap-2">
                <Trophy size={20} /> Declare Winner
              </Card.Title>
              {takenSequences.length >= 3 ? (
                <p className="text-muted">All 3 places have been declared for this event.</p>
              ) : (
                <Form onSubmit={handleDeclareWinner}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Place</Form.Label>
                    <Form.Select value={formData.sequence} onChange={(e) => setFormData({...formData, sequence: e.target.value})} required>
                      {[1, 2, 3].filter(s => !takenSequences.includes(s)).map(s => (
                        <option key={s} value={s}>{s === 1 ? '1st' : s === 2 ? '2nd' : '3rd'} Place</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Select Group</Form.Label>
                    <Form.Select value={formData.groupId} onChange={(e) => setFormData({...formData, groupId: e.target.value})} required>
                      <option value="">-- Choose Group --</option>
                      {groups.map(g => (
                        <option key={g._id} value={g._id}>{g.groupName} ({g.participantCount || 0} members)</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 fw-bold">Declare Winner</Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Winner Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Winner</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Place</Form.Label>
              <Form.Select value={editFormData.sequence} onChange={(e) => setEditFormData({...editFormData, sequence: e.target.value})} required>
                <option value="1">1st Place</option>
                <option value="2">2nd Place</option>
                <option value="3">3rd Place</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Group</Form.Label>
              <Form.Select value={editFormData.groupId} onChange={(e) => setEditFormData({...editFormData, groupId: e.target.value})} required>
                <option value="">-- Choose Group --</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.groupName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default WinnersManager;
