import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ departmentName: '', departmentImage: '', instituteId: '', coordinatorId: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  
  const { user } = useAuth();

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchDepartments();
        const instRes = await axios.get('/institutes');
        setInstitutes(instRes.data.data || []);
        
        if (user?.role === 'admin' || user?.role === 'instituteCoord') {
          const usersRes = await axios.get('/users');
          setUsers(usersRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    fetchData();
  }, [fetchDepartments, user]);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingId(dept._id);
      setFormData({ 
        departmentName: dept.departmentName, 
        departmentImage: dept.departmentImage || '', 
        instituteId: dept.instituteId?._id || '',
        coordinatorId: dept.coordinatorId?._id || '',
        description: dept.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({ departmentName: '', departmentImage: '', instituteId: '', coordinatorId: '', description: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`/departments/${editingId}`, formData);
      } else {
        await axios.post('/departments', formData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving department');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting department');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Departments</h2>
        {['admin', 'instituteCoord'].includes(user?.role) && (
          <Button variant="primary" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2">
            <Plus size={18} /> Add Department
          </Button>
        )}
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <Table hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>Institute</th>
              <th>Coordinator</th>
              {['admin', 'instituteCoord'].includes(user?.role) && <th className="text-end">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No departments found</td></tr>
            ) : (
              departments.map(dept => (
                <tr key={dept._id}>
                  <td className="align-middle fw-medium">{dept.departmentName}</td>
                  <td className="align-middle text-muted">{dept.instituteId?.instituteName || 'N/A'}</td>
                  <td className="align-middle text-muted">{dept.coordinatorId?.name || 'Unassigned'}</td>
                  {['admin', 'instituteCoord'].includes(user?.role) && (
                    <td className="text-end">
                      <Button variant="light" size="sm" onClick={() => handleOpenModal(dept)} className="me-2 text-primary">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="light" size="sm" onClick={() => handleDelete(dept._id)} className="text-danger">
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
            <Modal.Title>{editingId ? 'Edit' : 'Add'} Department</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Department Name</Form.Label>
              <Form.Control type="text" required value={formData.departmentName} onChange={(e) => setFormData({...formData, departmentName: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Institute</Form.Label>
              <Form.Select required value={formData.instituteId} onChange={(e) => setFormData({...formData, instituteId: e.target.value})}>
                <option value="">-- Select Institute --</option>
                {institutes.map(i => (
                  <option key={i._id} value={i._id}>{i.instituteName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Department description" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control type="text" value={formData.departmentImage} onChange={(e) => setFormData({...formData, departmentImage: e.target.value})} />
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

export default DepartmentsList;
