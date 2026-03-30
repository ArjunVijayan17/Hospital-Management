import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Pharmacy from './pages/Pharmacy';
import Trials from './pages/Trials';
import Billing from './pages/Billing';
import PortalHome from './pages/PortalHome';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes with Sidebar Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="trials" element={<Trials />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* User Portal Routes */}
        <Route path="/portal/home" element={<PortalHome />} />
      </Routes>
    </div>
  );
}

export default App;
