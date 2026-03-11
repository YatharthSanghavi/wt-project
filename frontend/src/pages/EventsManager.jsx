import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Spinner, Badge } from 'react-bootstrap';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    eventName: '', tagline: '', description: '', eventImage: '', fees: 0, prizes: '',
    groupMinParticipants: 1, groupMaxParticipants: 1, maxGroupsAllowed: 10, 
    eventLocation: '', departmentId: '', coordinatorId: '',
    studentCoordinatorName: '', studentCoordinatorPhone: '', studentCoordinatorEmail: ''
  });
  const [editingId, setEditingId] = useState(null);
  
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get('/events');
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEvents();
        const deptRes = await axios.get('/departments');
        setDepartments(deptRes.data.data || []);
        
        if (['admin', 'instituteCoord', 'departmentCoord'].includes(user?.role)) {
          try {
            const usersRes = await axios.get('/users');
            setUsers(usersRes.data.data || []);
          } catch (e) {
            // non-admin users can't fetch users list, that's fine
          }
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    fetchData();
  }, [fetchEvents, user]);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingId(event._id);
      setFormData({ 
        eventName: event.eventName || '',
        tagline: event.tagline || '',
        description: event.description || '',
        eventImage: event.eventImage || '',
        fees: event.fees || 0,
        prizes: event.prizes || '',
        groupMinParticipants: event.groupMinParticipants || 1,
        groupMaxParticipants: event.groupMaxParticipants || 1,
        maxGroupsAllowed: event.maxGroupsAllowed || 10,
        eventLocation: event.eventLocation || '',
        departmentId: event.departmentId?._id || '',
        coordinatorId: event.coordinatorId?._id || '',
        studentCoordinatorName: event.studentCoordinatorName || '',
        studentCoordinatorPhone: event.studentCoordinatorPhone || '',
        studentCoordinatorEmail: event.studentCoordinatorEmail || '',
      });
    } else {
      setEditingId(null);
      setFormData({ 
        eventName: '', tagline: '', description: '', eventImage: '', fees: 0, prizes: '',
        groupMinParticipants: 1, groupMaxParticipants: 1, maxGroupsAllowed: 10, 
        eventLocation: '', departmentId: '', coordinatorId: '',
        studentCoordinatorName: '', studentCoordinatorPhone: '', studentCoordinatorEmail: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/events/${editingId}`, formData);
      } else {
        await axios.post('/events', formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      try {
        await axios.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting event');
      }
    }
  };

  const canEdit = ['admin', 'instituteCoord', 'departmentCoord', 'eventCoord'].includes(user?.role);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events Manager</h2>
        {['admin', 'instituteCoord', 'departmentCoord'].includes(user?.role) && (
          <Button variant="primary" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2">
            <Plus size={18} /> Add Event
          </Button>
        )}
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Coordinator</th>
              <th>Limits</th>
              <th>Fee</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted py-4">No events found</td></tr>
            ) : (
              events.map(ev => (
                <tr key={ev._id}>
                  <td className="align-middle fw-medium">
                    {ev.eventName} <br />
                    <small className="text-muted"><Badge bg="info">{ev.eventLocation}</Badge></small>
                  </td>
                  <td className="align-middle text-muted">{ev.departmentId?.departmentName || 'N/A'}</td>
                  <td className="align-middle text-muted">{ev.coordinatorId?.name || 'Unassigned'}</td>
                  <td className="align-middle">
                    <div className="small">Grp limit: {ev.maxGroupsAllowed}</div>
                    <div className="small">Size: {ev.groupMinParticipants}-{ev.groupMaxParticipants}</div>
                  </td>
                  <td className="align-middle fw-bold text-success">₹{ev.fees}</td>
                  <td className="text-end align-middle">
                    <Button as={Link} to={`/events/${ev._id}`} variant="light" size="sm" className="me-2 text-info" title="View Public Page">
                      <Eye size={16} />
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="light" size="sm" onClick={() => handleOpenModal(ev)} className="me-2 text-primary">
                          <Pencil size={16} />
                        </Button>
                        <Button variant="light" size="sm" onClick={() => handleDelete(ev._id)} className="text-danger">
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit' : 'Add'} Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control type="text" required value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select required value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})}>
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </Form.Select>
              </div>
              
              <div className="col-md-12 mb-3">
                <Form.Label>Tagline</Form.Label>
                <Form.Control type="text" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} />
              </div>

              <div className="col-md-12 mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="col-md-4 mb-3">
                <Form.Label>Fees</Form.Label>
                <Form.Control type="number" min="0" value={formData.fees} onChange={(e) => setFormData({...formData, fees: Number(e.target.value)})} />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Min Participants</Form.Label>
                <Form.Control type="number" min="1" value={formData.groupMinParticipants} onChange={(e) => setFormData({...formData, groupMinParticipants: Number(e.target.value)})} />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Max Participants</Form.Label>
                <Form.Control type="number" min="1" value={formData.groupMaxParticipants} onChange={(e) => setFormData({...formData, groupMaxParticipants: Number(e.target.value)})} />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Max Groups Allowed</Form.Label>
                <Form.Control type="number" min="1" value={formData.maxGroupsAllowed} onChange={(e) => setFormData({...formData, maxGroupsAllowed: Number(e.target.value)})} />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control type="text" required value={formData.eventLocation} onChange={(e) => setFormData({...formData, eventLocation: e.target.value})} />
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label>Event Coordinator (Faculty)</Form.Label>
                <Form.Select value={formData.coordinatorId} onChange={(e) => setFormData({...formData, coordinatorId: e.target.value})}>
                  <option value="">-- Select Coordinator --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Student Coordinator Name</Form.Label>
                <Form.Control type="text" value={formData.studentCoordinatorName} onChange={(e) => setFormData({...formData, studentCoordinatorName: e.target.value})} />
              </div>
              <div className="col-md-3 mb-3">
                <Form.Label>Student Coord Phone</Form.Label>
                <Form.Control type="text" value={formData.studentCoordinatorPhone} onChange={(e) => setFormData({...formData, studentCoordinatorPhone: e.target.value})} />
              </div>
              <div className="col-md-3 mb-3">
                <Form.Label>Student Coord Email</Form.Label>
                <Form.Control type="email" value={formData.studentCoordinatorEmail} onChange={(e) => setFormData({...formData, studentCoordinatorEmail: e.target.value})} />
              </div>

              <div className="col-md-12 mb-3">
                <Form.Label>Prizes</Form.Label>
                <Form.Control type="text" placeholder="e.g. 1st: ₹5000, 2nd: ₹3000, 3rd: ₹1000" value={formData.prizes} onChange={(e) => setFormData({...formData, prizes: e.target.value})} />
              </div>
              
              <div className="col-md-12 mb-3">
                <Form.Label>Image URL (Optional)</Form.Label>
                <Form.Control type="text" value={formData.eventImage} onChange={(e) => setFormData({...formData, eventImage: e.target.value})} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EventsManager;
