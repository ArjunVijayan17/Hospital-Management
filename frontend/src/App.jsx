import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import PatientLayout from './components/PatientLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Pharmacy from './pages/Pharmacy';
import Trials from './pages/Trials';
import Billing from './pages/Billing';

// Portal Pages
import PortalAppointments from './pages/PortalAppointments';
import PortalMedicines from './pages/PortalMedicines';
import PortalTests from './pages/PortalTests';
import PortalBills from './pages/PortalBills';

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

        {/* User Portal Routes with Sidebar Layout */}
        <Route path="/portal" element={<PatientLayout />}>
          <Route index element={<Navigate to="appointments" replace />} />
          <Route path="appointments" element={<PortalAppointments />} />
          <Route path="medicines" element={<PortalMedicines />} />
          <Route path="tests" element={<PortalTests />} />
          <Route path="bills" element={<PortalBills />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
