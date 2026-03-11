import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InstitutesList = () => {
  const [institutes, setInstitutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ instituteName: '', city: '', instituteImage: '', coordinatorId: '' });
  const [editingId, setEditingId] = useState(null);
  
  const { user } = useAuth();

  const fetchInstitutes = async () => {
    try {
      const res = await axios.get('/institutes');
      setInstitutes(res.data.data || []);
      
      if (user?.role === 'admin') {
        const usersRes = await axios.get('/users');
        setUsers(usersRes.data.data || []);
      }
    } catch (err) {
      setError('Failed to load institutes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, [user]);

  const handleOpenModal = (institute = null) => {
    if (institute) {
      setEditingId(institute._id);
      setFormData({ 
        instituteName: institute.instituteName, 
        city: institute.city || '',
        instituteImage: institute.instituteImage || '', 
        coordinatorId: institute.coordinatorId?._id || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ instituteName: '', city: '', instituteImage: '', coordinatorId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/institutes/${editingId}`, formData);
      } else {
        await axios.post('/institutes', formData);
      }
      setShowModal(false);
      fetchInstitutes();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving institute');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institute?')) {
      try {
        await axios.delete(`/institutes/${id}`);
        fetchInstitutes();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting institute');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Institutes</h2>
        {user?.role === 'admin' && (
          <Button variant="primary" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2">
            <Plus size={18} /> Add Institute
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Coordinator</th>
              {user?.role === 'admin' && <th className="text-end">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {institutes.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No institutes found</td></tr>
            ) : (
              institutes.map(inst => (
                <tr key={inst._id}>
                  <td className="align-middle fw-medium">{inst.instituteName}</td>
                  <td className="align-middle text-muted">{inst.city || '-'}</td>
                  <td className="align-middle text-muted">{inst.coordinatorId?.name || 'Unassigned'}</td>
                  {user?.role === 'admin' && (
                    <td className="text-end">
                      <Button variant="light" size="sm" onClick={() => handleOpenModal(inst)} className="me-2 text-primary">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="light" size="sm" onClick={() => handleDelete(inst._id)} className="text-danger">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit' : 'Add'} Institute</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Institute Name</Form.Label>
              <Form.Control type="text" required value={formData.instituteName} onChange={(e) => setFormData({...formData, instituteName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control type="text" value={formData.instituteImage} onChange={(e) => setFormData({...formData, instituteImage: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Assign Coordinator</Form.Label>
              <Form.Select value={formData.coordinatorId} onChange={(e) => setFormData({...formData, coordinatorId: e.target.value})}>
                <option value="">-- Select Coordinator --</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </Form.Select>
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

export default InstitutesList;
