import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Table, Alert, Accordion } from 'react-bootstrap';
import { MapPin, Users, IndianRupee, Trophy, Award, Phone, Mail, UserPlus, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  // My groups — participant management
  const [myGroupsData, setMyGroupsData] = useState({}); // { groupId: { participants: [], loading: false } }
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [partForm, setPartForm] = useState({ name: '', enrollmentNumber: '', instituteName: '', city: '', phone: '', email: '', isGroupLeader: false });
  const [partError, setPartError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, groupsRes, winnersRes] = await Promise.all([
        axios.get(`/events/${id}`),
        axios.get(`/events/${id}/groups`),
        axios.get(`/events/${id}/winners`)
      ]);
      setEvent(eventRes.data.data);
      setGroups(groupsRes.data.data || []);
      setWinners(winnersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get groups that belong to the current user
  const myGroups = user ? groups.filter(g => g.createdBy?._id === user._id || g.createdBy === user._id) : [];
  const otherGroups = user ? groups.filter(g => g.createdBy?._id !== user._id && g.createdBy !== user._id) : groups;

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      if (!user) return alert('Please login first');
      await axios.post(`/events/${id}/groups`, { groupName });
      setShowGroupModal(false);
      setGroupName('');
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating group');
    }
  };

  // Toggle expand a group to show/add participants
  const toggleGroupExpand = async (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }
    setExpandedGroup(groupId);
    setPartError('');
    setPartForm({ name: '', enrollmentNumber: '', instituteName: '', city: '', phone: '', email: '', isGroupLeader: false });
    await fetchParticipants(groupId);
  };

  const fetchParticipants = async (groupId) => {
    setMyGroupsData(prev => ({ ...prev, [groupId]: { ...prev[groupId], loading: true } }));
    try {
      const res = await axios.get(`/groups/${groupId}/participants`);
      setMyGroupsData(prev => ({ ...prev, [groupId]: { participants: res.data.data || [], loading: false } }));
    } catch (err) {
      setMyGroupsData(prev => ({ ...prev, [groupId]: { participants: [], loading: false } }));
    }
  };

  const handleAddParticipant = async (e, groupId) => {
    e.preventDefault();
    setPartError('');
    try {
      await axios.post(`/groups/${groupId}/participants`, partForm);
      setPartForm({ name: '', enrollmentNumber: '', instituteName: '', city: '', phone: '', email: '', isGroupLeader: false });
      await fetchParticipants(groupId);
      // Refresh groups to update participant counts
      const groupsRes = await axios.get(`/events/${id}/groups`);
      setGroups(groupsRes.data.data || []);
    } catch (err) {
      setPartError(err.response?.data?.message || 'Error adding participant');
    }
  };

  const handleDeleteParticipant = async (participantId, groupId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axios.delete(`/participants/${participantId}`);
      await fetchParticipants(groupId);
      const groupsRes = await axios.get(`/events/${id}/groups`);
      setGroups(groupsRes.data.data || []);
    } catch (err) {
      alert('Error removing participant');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group and all its participants?')) return;
    try {
      await axios.delete(`/groups/${groupId}`);
      setExpandedGroup(null);
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting group');
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!event) return <div className="text-center mt-5">Event not found.</div>;

  return (
    <Container>
      {/* Banner */}
      <div 
        className="event-banner mb-4"
        style={{ backgroundImage: `url(${event.eventImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'})` }}
      >
        <div className="event-banner-overlay">
          <div>
            <Badge bg="info" className="mb-2">
              {event.departmentId?.departmentName || 'Event'}
              {event.departmentId?.instituteId?.instituteName && ` • ${event.departmentId.instituteId.instituteName}`}
            </Badge>
            <h1 className="fw-bold mb-1 text-white">{event.eventName}</h1>
            <p className="lead mb-0 text-white" style={{ opacity: 0.9 }}>{event.tagline}</p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4 fade-in-up">
            <Card.Body>
              <h4 className="fw-bold mb-3">About The Event</h4>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>{event.description}</p>
            </Card.Body>
          </Card>

          {/* Prizes section */}
          {event.prizes && (
            <Card className="border-0 shadow-sm mb-4 fade-in-up fade-in-up-delay-1" style={{ borderLeft: '4px solid var(--warning)' }}>
              <Card.Body>
                <h5 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: 'var(--warning)' }}>
                  <Award size={20} /> Prizes
                </h5>
                <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>{event.prizes}</p>
              </Card.Body>
            </Card>
          )}
          
          {/* Winners section */}
          {winners.length > 0 && (
            <Card className="border-0 shadow-sm mb-4 fade-in-up fade-in-up-delay-2" style={{ borderLeft: '4px solid var(--primary)' }}>
              <Card.Body>
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Trophy size={24} /> Results
                </h4>
                <Row>
                  {winners.map(w => (
                    <Col md={4} key={w._id} className="text-center mb-3">
                      <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-section)' }}>
                        <div className="fw-bold text-uppercase text-muted small">
                          {w.sequence === 1 ? '🥇 1st' : w.sequence === 2 ? '🥈 2nd' : '🥉 3rd'} Place
                        </div>
                        <div className="fs-5 fw-bold text-dark">{w.groupId?.groupName}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* ========== MY GROUPS — PARTICIPANT MANAGEMENT ========== */}
          {user && myGroups.length > 0 && (
            <Card className="border-0 shadow-sm mb-4 fade-in-up fade-in-up-delay-3" style={{ borderLeft: '4px solid var(--success)' }}>
              <Card.Body>
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--success)' }}>
                  <Users size={24} /> My Groups
                </h4>
                <p className="text-muted small mb-3">
                  Each group needs <strong>{event.groupMinParticipants}–{event.groupMaxParticipants}</strong> members. Click a group to manage members.
                </p>

                {myGroups.map(group => {
                  const isExpanded = expandedGroup === group._id;
                  const groupData = myGroupsData[group._id] || { participants: [], loading: false };
                  const currentCount = group.participantCount || 0;
                  const minReached = currentCount >= event.groupMinParticipants;
                  const maxReached = currentCount >= event.groupMaxParticipants;

                  return (
                    <div key={group._id} className="border rounded-3 mb-3 overflow-hidden">
                      {/* Group header — clickable */}
                      <div 
                        className="d-flex justify-content-between align-items-center p-3" 
                        style={{ backgroundColor: isExpanded ? 'var(--bg-section)' : 'white', cursor: 'pointer' }}
                        onClick={() => toggleGroupExpand(group._id)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <strong className="fs-6">{group.groupName}</strong>
                          <Badge bg={minReached ? 'success' : 'warning'} className="px-2 py-1">
                            {currentCount}/{event.groupMaxParticipants} members
                          </Badge>
                          {group.isPaymentDone && <Badge bg="info" className="px-2 py-1">Paid</Badge>}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button variant="outline-danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id); }}>
                            <Trash2 size={14} />
                          </Button>
                          <ChevronDown size={18} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
                        </div>
                      </div>

                      {/* Expanded: participant list + add form */}
                      {isExpanded && (
                        <div className="p-3 border-top" style={{ backgroundColor: '#fafbfc' }}>
                          {groupData.loading ? (
                            <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                          ) : (
                            <>
                              {/* Current participants table */}
                              {groupData.participants.length > 0 ? (
                                <Table size="sm" hover className="bg-white rounded mb-3">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Enrollment</th>
                                      <th>Institute</th>
                                      <th>Phone</th>
                                      <th>Role</th>
                                      <th></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groupData.participants.map(p => (
                                      <tr key={p._id}>
                                        <td className="fw-medium">{p.name}</td>
                                        <td className="text-muted">{p.enrollmentNumber}</td>
                                        <td className="text-muted">{p.instituteName}</td>
                                        <td className="text-muted">{p.phone}</td>
                                        <td>{p.isGroupLeader ? <Badge bg="primary">Leader</Badge> : <Badge bg="secondary">Member</Badge>}</td>
                                        <td className="text-end">
                                          <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteParticipant(p._id, group._id)}>
                                            <Trash2 size={14} />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <Alert variant="info" className="mb-3">No members yet. Add your team members below.</Alert>
                              )}

                              {/* Add participant form */}
                              {!maxReached ? (
                                <>
                                  <h6 className="fw-bold mb-2"><UserPlus size={16} className="me-1" /> Add Member</h6>
                                  {partError && <Alert variant="danger" className="py-2">{partError}</Alert>}
                                  <Form onSubmit={(e) => handleAddParticipant(e, group._id)} className="row g-2 align-items-end">
                                    <div className="col-md-4">
                                      <Form.Control size="sm" placeholder="Full Name *" required value={partForm.name} onChange={(e) => setPartForm({...partForm, name: e.target.value})} />
                                    </div>
                                    <div className="col-md-4">
                                      <Form.Control size="sm" placeholder="Enrollment No *" required value={partForm.enrollmentNumber} onChange={(e) => setPartForm({...partForm, enrollmentNumber: e.target.value})} />
                                    </div>
                                    <div className="col-md-4">
                                      <Form.Control size="sm" placeholder="Phone *" required value={partForm.phone} onChange={(e) => setPartForm({...partForm, phone: e.target.value})} />
                                    </div>
                                    <div className="col-md-4">
                                      <Form.Control size="sm" placeholder="Email *" type="email" required value={partForm.email} onChange={(e) => setPartForm({...partForm, email: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                      <Form.Control size="sm" placeholder="Institute *" required value={partForm.instituteName} onChange={(e) => setPartForm({...partForm, instituteName: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                      <Form.Control size="sm" placeholder="City *" required value={partForm.city} onChange={(e) => setPartForm({...partForm, city: e.target.value})} />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center gap-2">
                                      <Form.Check type="checkbox" label="Leader" checked={partForm.isGroupLeader} onChange={(e) => setPartForm({...partForm, isGroupLeader: e.target.checked})} />
                                      <Button type="submit" variant="primary" size="sm" className="ms-auto">
                                        <UserPlus size={14} className="me-1" />Add
                                      </Button>
                                    </div>
                                  </Form>
                                </>
                              ) : (
                                <Alert variant="success" className="mb-0">✅ Team is full ({event.groupMaxParticipants} members)</Alert>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          )}

          {/* All Registered Groups */}
          <Card className="border-0 shadow-sm fade-in-up fade-in-up-delay-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">All Registered Groups</h4>
                <Badge bg="info" className="px-3 py-2">{groups.length} / {event.maxGroupsAllowed}</Badge>
              </div>
              {groups.length === 0 ? (
                <p className="text-muted">No groups registered yet. Be the first!</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {groups.map(g => {
                    const isMine = user && (g.createdBy?._id === user._id || g.createdBy === user._id);
                    return (
                      <Badge 
                        key={g._id} 
                        bg={isMine ? 'success' : 'light'} 
                        text={isMine ? 'white' : 'dark'} 
                        className="px-3 py-2 fw-normal border"
                      >
                        {g.groupName}
                        <span className={`ms-1 ${isMine ? '' : 'text-muted'}`}>({g.participantCount || 0})</span>
                        {isMine && <span className="ms-1">★</span>}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Quick Details */}
          <Card className="border-0 shadow-sm mb-4 fade-in-up fade-in-up-delay-1">
            <Card.Body>
              <h5 className="fw-bold mb-3">Quick Details</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex align-items-center gap-2">
                  <MapPin size={20} style={{ color: 'var(--primary)' }} />
                  <span>{event.eventLocation || 'TBA'}</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2">
                  <Users size={20} style={{ color: 'var(--success)' }} />
                  <span>{event.groupMinParticipants} - {event.groupMaxParticipants} participants per team</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2">
                  <IndianRupee size={20} style={{ color: 'var(--warning)' }} />
                  <span className="fw-bold fs-5">₹{event.fees}</span>
                  <span className="text-muted small">per team</span>
                </li>
              </ul>
            </Card.Body>
            <div className="p-3 pt-0">
              {user ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 fw-bold rounded-pill" 
                  disabled={groups.length >= event.maxGroupsAllowed}
                  onClick={() => setShowGroupModal(true)}
                >
                  {groups.length >= event.maxGroupsAllowed ? 'Registration Full' : 'Register a Group'}
                </Button>
              ) : (
                <Button as={Link} to="/login" variant="outline-primary" size="lg" className="w-100 rounded-pill">Login to Register</Button>
              )}
            </div>
          </Card>

          {/* Coordinators */}
          <Card className="border-0 shadow-sm fade-in-up fade-in-up-delay-2" style={{ backgroundColor: 'var(--bg-section)' }}>
            <Card.Body>
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Coordinators</h6>
              <div className="mb-3">
                <strong className="small">Faculty Coordinator</strong><br />
                <span style={{ color: 'var(--text-secondary)' }}>{event.coordinatorId?.name || 'TBA'}</span>
              </div>
              <div className="mb-2">
                <strong className="small">Student Coordinator</strong><br />
                <span style={{ color: 'var(--text-secondary)' }}>{event.studentCoordinatorName || 'TBA'}</span>
              </div>
              {event.studentCoordinatorPhone && (
                <div className="d-flex align-items-center gap-1 small text-muted mb-1">
                  <Phone size={14} /> {event.studentCoordinatorPhone}
                </div>
              )}
              {event.studentCoordinatorEmail && (
                <div className="d-flex align-items-center gap-1 small text-muted">
                  <Mail size={14} /> {event.studentCoordinatorEmail}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Register Group Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)}>
        <Form onSubmit={handleCreateGroup}>
          <Modal.Header closeButton>
            <Modal.Title>Register New Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Group Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter an awesome team name"
              />
            </Form.Group>
            <div className="text-muted small mt-2">
              After creating the group, you can add {event.groupMinParticipants}–{event.groupMaxParticipants} team members.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Group</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EventDetails;
