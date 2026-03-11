import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { Pencil, Trash2, Search, UserCheck, UserX } from 'lucide-react';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', role: '', isActive: true });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      const res = await axios.get('/users', { params });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/users/${editingUser._id}`, formData);
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const toggleActive = async (user) => {
    try {
      await axios.patch(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert('Error toggling user status');
    }
  };

  const roleColors = {
    admin: 'danger',
    instituteCoord: 'primary',
    departmentCoord: 'info',
    eventCoord: 'warning',
    student: 'success',
    participant: 'secondary'
  };

  const roleLabels = {
    admin: 'Admin',
    instituteCoord: 'Institute Coord',
    departmentCoord: 'Dept Coord',
    eventCoord: 'Event Coord',
    student: 'Student',
    participant: 'Participant'
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="page-header">
        <h2>Users Management</h2>
        <Badge bg="secondary" className="px-3 py-2 fs-6">{users.length} Users</Badge>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <InputGroup>
            <InputGroup.Text className="bg-white"><Search size={16} /></InputGroup.Text>
            <Form.Control
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="col-md-3">
          <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instituteCoord">Institute Coord</option>
            <option value="departmentCoord">Dept Coord</option>
            <option value="eventCoord">Event Coord</option>
            <option value="student">Student</option>
            <option value="participant">Participant</option>
          </Form.Select>
        </div>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted py-4">No users found</td></tr>
            ) : (
              users.map(u => (
                <tr key={u._id}>
                  <td className="fw-medium">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td className="text-muted">{u.phone}</td>
                  <td>
                    <Badge bg={roleColors[u.role] || 'secondary'}>
                      {roleLabels[u.role] || u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={u.isActive ? 'success' : 'danger'} className="px-2">
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="light" size="sm" onClick={() => toggleActive(u)} className="me-1" title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <UserX size={16} className="text-warning" /> : <UserCheck size={16} className="text-success" />}
                    </Button>
                    <Button variant="light" size="sm" onClick={() => handleEdit(u)} className="me-1 text-primary">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="light" size="sm" onClick={() => handleDelete(u._id)} className="text-danger">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="instituteCoord">Institute Coordinator</option>
                <option value="departmentCoord">Department Coordinator</option>
                <option value="eventCoord">Event Coordinator</option>
                <option value="student">Student</option>
                <option value="participant">Participant</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label={formData.isActive ? 'Active' : 'Inactive'}
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
            </Form.Group>
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

export default UsersManager;
