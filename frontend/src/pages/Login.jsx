import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await login(email, password);
      const role = data.user?.role;
      // Redirect admins/coordinators to dashboard, students to home
      if (['admin', 'instituteCoord', 'departmentCoord', 'eventCoord'].includes(role)) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card p-5" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'var(--primary)' }}>Welcome Back</h2>
          <p className="text-muted">Sign in to your Frolic account</p>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Enter email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-muted small">
            Don't have an account? <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--primary)' }}>Sign up</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
