import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Building2, Layers, CalendarRange, Users, Trophy, UserCog } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ institutes: 0, departments: 0, events: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = [
          axios.get('/institutes').catch(() => ({ data: { count: 0 } })),
          axios.get('/departments').catch(() => ({ data: { count: 0 } })),
          axios.get('/events').catch(() => ({ data: { count: 0 } })),
        ];

        if (user?.role === 'admin') {
          promises.push(axios.get('/users').catch(() => ({ data: { count: 0 } })));
        }

        const results = await Promise.all(promises);

        setStats({
          institutes: results[0].data.count || results[0].data.data?.length || 0,
          departments: results[1].data.count || results[1].data.data?.length || 0,
          events: results[2].data.count || results[2].data.data?.length || 0,
          users: results[3]?.data.count || results[3]?.data.data?.length || 0,
        });
      } catch (err) {
        console.error('Error loading stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: 'Institutes', icon: Building2, link: '/institutes', color: '#4F46E5', count: stats.institutes, roles: ['admin'] },
    { title: 'Departments', icon: Layers, link: '/departments', color: '#10B981', count: stats.departments, roles: ['admin', 'instituteCoord'] },
    { title: 'Events', icon: CalendarRange, link: '/events-manager', color: '#06B6D4', count: stats.events, roles: ['admin', 'instituteCoord', 'departmentCoord', 'eventCoord'] },
    { title: 'Groups & Participants', icon: Users, link: '/groups-manager', color: '#F59E0B', count: '—', roles: ['admin', 'eventCoord'] },
    { title: 'Winners', icon: Trophy, link: '/winners-manager', color: '#EF4444', count: '—', roles: ['admin', 'eventCoord'] },
    { title: 'Users', icon: UserCog, link: '/users-manager', color: '#8B5CF6', count: stats.users, roles: ['admin'] }
  ];

  const allowedCards = cards.filter(card => user?.role && card.roles.includes(user.role));

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0 small">Welcome back, <strong>{user?.name}</strong></p>
        </div>
        <span className="badge bg-primary text-capitalize fs-6 px-3 py-2 rounded-pill">{user?.role}</span>
      </div>
      
      <Row className="g-4">
        {allowedCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Col md={6} lg={4} key={index}>
              <Card 
                as={Link} 
                to={card.link} 
                className={`h-100 card-hover text-decoration-none dash-stat-card fade-in-up fade-in-up-delay-${index + 1}`}
                style={{ borderLeft: `4px solid ${card.color}` }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div
                    className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: `${card.color}12`, color: card.color, minWidth: '56px', minHeight: '56px' }}
                  >
                    <Icon size={28} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: card.color }}>
                      {card.count !== '—' ? card.count : '—'}
                    </div>
                    <div className="stat-label">{card.title}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default Dashboard;
