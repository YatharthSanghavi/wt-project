import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { Trash2, UserPlus, Users, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GroupsManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPartModal, setShowPartModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [partFormData, setPartFormData] = useState({ name: '', enrollmentNumber: '', instituteName: '', city: '', phone: '', email: '', isGroupLeader: false });
  const [participantsList, setParticipantsList] = useState([]);

  // Edit group name
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState(null);

  const { user } = useAuth();

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
    if (selectedEventId) fetchGroups(selectedEventId);
  }, [selectedEventId]);

  const fetchGroups = async (eventId) => {
    try {
      const res = await axios.get(`/events/${eventId}/groups`);
      setGroups(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePayment = async (group) => {
    try {
      await axios.patch(`/groups/${group._id}`, { isPaymentDone: !group.isPaymentDone });
      fetchGroups(selectedEventId);
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  const togglePresence = async (group) => {
    try {
      await axios.patch(`/groups/${group._id}`, { isPresent: !group.isPresent });
      fetchGroups(selectedEventId);
    } catch (err) {
      alert('Error updating attendance status');
    }
  };

  const deleteGroup = async (id) => {
    if (window.confirm('Delete this group and all its participants?')) {
      try {
        await axios.delete(`/groups/${id}`);
        fetchGroups(selectedEventId);
      } catch (err) {
        alert('Error deleting group');
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditGroupId(group._id);
    setEditGroupName(group.groupName);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/groups/${editGroupId}`, { groupName: editGroupName });
      setShowEditModal(false);
      fetchGroups(selectedEventId);
    } catch (err) {
      alert('Error updating group name');
    }
  };

  const handleOpenPartModal = async (groupId) => {
    setActiveGroupId(groupId);
    fetchParticipants(groupId);
    setShowPartModal(true);
  };

  const fetchParticipants = async (groupId) => {
    try {
      const res = await axios.get(`/groups/${groupId}/participants`);
      setParticipantsList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/groups/${activeGroupId}/participants`, partFormData);
      setPartFormData({ name: '', enrollmentNumber: '', instituteName: '', city: '', phone: '', email: '', isGroupLeader: false });
      fetchParticipants(activeGroupId);
      fetchGroups(selectedEventId);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding participant');
    }
  };

  const deleteParticipant = async (id) => {
    if (window.confirm('Remove participant?')) {
      try {
        await axios.delete(`/participants/${id}`);
        fetchParticipants(activeGroupId);
        fetchGroups(selectedEventId);
      } catch (err) {
        alert('Error removing participant');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <Container>
      <div className="page-header">
        <h2>Groups & Participants Manager</h2>
        <Badge bg="secondary" className="px-3 py-2 fs-6">{groups.length} Groups</Badge>
      </div>

      <div className="mb-4">
        <Form.Label className="fw-bold">Select Event to Manage Groups:</Form.Label>
        <Form.Select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} size="lg">
          {events.length === 0 ? <option value="">No events available</option> : null}
          {events.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.eventName}</option>
          ))}
        </Form.Select>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Created By</th>
              <th>Members</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted py-4">No groups for this event</td></tr>
            ) : (
              groups.map(g => (
                <tr key={g._id}>
                  <td className="align-middle fw-medium">{g.groupName}</td>
                  <td className="align-middle text-muted small">{g.createdBy?.name || '—'}</td>
                  <td className="align-middle">
                    <Badge bg={g.participantCount >= (selectedEvent?.groupMinParticipants || 1) ? 'success' : 'warning'}>
                      {g.participantCount || 0} / {selectedEvent?.groupMaxParticipants || '?'}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <Button 
                      variant={g.isPaymentDone ? "success" : "outline-secondary"} 
                      size="sm" 
                      onClick={() => togglePayment(g)}
                      className="me-2 rounded-pill"
                    >
                      {g.isPaymentDone ? <CheckCircle size={14} className="me-1"/> : <XCircle size={14} className="me-1"/>} 
                      Payment
                    </Button>
                    <Button 
                      variant={g.isPresent ? "primary" : "outline-secondary"} 
                      size="sm" 
                      onClick={() => togglePresence(g)}
                      className="rounded-pill"
                    >
                      {g.isPresent ? <CheckCircle size={14} className="me-1"/> : <XCircle size={14} className="me-1"/>} 
                      Present
                    </Button>
                  </td>
                  <td className="align-middle text-end" style={{ minWidth: '140px' }}>
                    <Button variant="light" size="sm" onClick={() => handleOpenPartModal(g._id)} className="me-1 text-info" title="Manage Participants">
                      <Users size={16} />
                    </Button>
                    <Button variant="light" size="sm" onClick={() => handleEditGroup(g)} className="me-1 text-primary" title="Edit Group Name">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="light" size="sm" onClick={() => deleteGroup(g._id)} className="text-danger" title="Delete Group">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Edit Group Name Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Group Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Group Name</Form.Label>
              <Form.Control type="text" required value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Participants Modal */}
      <Modal show={showPartModal} onHide={() => setShowPartModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Participants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5 className="border-bottom pb-2 mb-3">Add New Participant</h5>
            <Form onSubmit={handleAddParticipant} className="row g-3">
              <div className="col-md-6">
                <Form.Control placeholder="Name *" required value={partFormData.name} onChange={(e) => setPartFormData({...partFormData, name: e.target.value})} />
              </div>
              <div className="col-md-6">
                <Form.Control placeholder="Enrollment No *" required value={partFormData.enrollmentNumber} onChange={(e) => setPartFormData({...partFormData, enrollmentNumber: e.target.value})} />
              </div>
              <div className="col-md-4">
                <Form.Control placeholder="Phone *" required value={partFormData.phone} onChange={(e) => setPartFormData({...partFormData, phone: e.target.value})} />
              </div>
              <div className="col-md-4">
                <Form.Control placeholder="Email *" type="email" required value={partFormData.email} onChange={(e) => setPartFormData({...partFormData, email: e.target.value})} />
              </div>
              <div className="col-md-4">
                <Form.Control placeholder="Institute Name *" required value={partFormData.instituteName} onChange={(e) => setPartFormData({...partFormData, instituteName: e.target.value})} />
              </div>
              <div className="col-md-6">
                <Form.Control placeholder="City *" required value={partFormData.city} onChange={(e) => setPartFormData({...partFormData, city: e.target.value})} />
              </div>
              <div className="col-md-6 d-flex align-items-center">
                <Form.Check type="checkbox" label="Is Group Leader?" checked={partFormData.isGroupLeader} onChange={(e) => setPartFormData({...partFormData, isGroupLeader: e.target.checked})} />
              </div>
              <div className="col-12 text-end">
                <Button type="submit" variant="primary" size="sm"><UserPlus size={16} className="me-1"/>Add Participant</Button>
              </div>
            </Form>
          </div>

          <h5 className="border-bottom pb-2 mb-3">Current Participants List</h5>
          <Table size="sm" hover className="bg-white">
            <thead>
              <tr>
                <th>Name</th>
                <th>Enrollment</th>
                <th>Institute</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {participantsList.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted">No participants added.</td></tr>
              ) : (
                participantsList.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td className="text-muted">{p.enrollmentNumber}</td>
                    <td className="text-muted">{p.instituteName}</td>
                    <td className="text-muted">{p.phone}</td>
                    <td>{p.isGroupLeader ? <Badge bg="primary">Leader</Badge> : <Badge bg="secondary">Member</Badge>}</td>
                    <td className="text-center">
                      <Button variant="link" size="sm" className="text-danger p-0" onClick={() => deleteParticipant(p._id)}><Trash2 size={16}/></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GroupsManager;
