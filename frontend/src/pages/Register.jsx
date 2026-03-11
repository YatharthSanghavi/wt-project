import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, loginWithToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await register(formData.name, formData.email, formData.phone, formData.password);
      // Auto-login after successful registration
      loginWithToken(data.token, data.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card p-5" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'var(--primary)' }}>Create Account</h2>
          <p className="text-muted">Join Frolic events today</p>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control 
              type="text" 
              name="name"
              placeholder="Enter your name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
              type="email" 
              name="email"
              placeholder="Enter email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control 
              type="text" 
              name="phone"
              placeholder="Enter phone number" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <div className="text-center text-muted small">
            Already have an account? <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
