import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InstitutesList from './pages/InstitutesList';
import DepartmentsList from './pages/DepartmentsList';
import EventsManager from './pages/EventsManager';
import EventDetails from './pages/EventDetails';
import GroupsManager from './pages/GroupsManager';
import WinnersManager from './pages/WinnersManager';
import UsersManager from './pages/UsersManager';
import MyGroups from './pages/MyGroups';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="container py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Any authenticated user can see My Groups */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'instituteCoord', 'departmentCoord', 'eventCoord', 'student', 'participant']} />}>
                <Route path="/my-groups" element={<MyGroups />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'instituteCoord', 'departmentCoord', 'eventCoord']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events-manager" element={<EventsManager />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/institutes" element={<InstitutesList />} />
                <Route path="/users-manager" element={<UsersManager />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin', 'instituteCoord']} />}>
                <Route path="/departments" element={<DepartmentsList />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'eventCoord']} />}>
                <Route path="/groups-manager" element={<GroupsManager />} />
                <Route path="/winners-manager" element={<WinnersManager />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
