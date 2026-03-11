import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar as BNavbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Calendar, LayoutDashboard, Building2, Layers, CalendarRange, Users, Trophy, UserCog, FolderOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isCoord = ['admin', 'instituteCoord', 'departmentCoord', 'eventCoord'].includes(user?.role);

  return (
    <BNavbar bg="white" expand="lg" className="shadow-sm py-2 mb-4" sticky="top">
      <Container>
        <BNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <Calendar size={26} className="text-primary" />
          <span>FrolicEvents</span>
        </BNavbar.Brand>
        <BNavbar.Toggle aria-controls="main-nav" />
        <BNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {/* My Groups — visible to all logged-in users */}
            {user && (
              <Nav.Link as={Link} to="/my-groups">
                <FolderOpen size={16} className="me-1" />My Groups
              </Nav.Link>
            )}

            {isCoord && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  <LayoutDashboard size={16} className="me-1" />Dashboard
                </Nav.Link>
                <NavDropdown title="Manage" id="manage-dropdown">
                  {isAdmin && (
                    <>
                      <NavDropdown.Item as={Link} to="/institutes">
                        <Building2 size={14} className="me-2" />Institutes
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/users-manager">
                        <UserCog size={14} className="me-2" />Users
                      </NavDropdown.Item>
                    </>
                  )}
                  {['admin', 'instituteCoord'].includes(user?.role) && (
                    <NavDropdown.Item as={Link} to="/departments">
                      <Layers size={14} className="me-2" />Departments
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/events-manager">
                    <CalendarRange size={14} className="me-2" />Events
                  </NavDropdown.Item>
                  {['admin', 'eventCoord'].includes(user?.role) && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/groups-manager">
                        <Users size={14} className="me-2" />Groups & Participants
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/winners-manager">
                        <Trophy size={14} className="me-2" />Winners
                      </NavDropdown.Item>
                    </>
                  )}
                </NavDropdown>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-lg-block">
                  <div className="fw-semibold small text-dark">{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.role}</div>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="rounded-pill px-3">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">Sign Up</Link>
              </div>
            )}
          </Nav>
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
};

export default Navbar;
