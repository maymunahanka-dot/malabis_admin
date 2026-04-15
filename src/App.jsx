import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Payments from './pages/Payments';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Subscriptions from './pages/Subscriptions';
import BridalPortfolio from './pages/BridalPortfolio';
import Messages from './pages/Messages';
import Login from './pages/Login';
import ConsultationPackages from './pages/ConsultationPackages';
import GalleryPage from './pages/Gallery';
import TestimonialsPage from './pages/Testimonials';
import Other from './pages/Other';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="payments" element={<Payments />} />
              <Route path="clients" element={<Clients />} />
              <Route path="reports" element={<Reports />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="bridal-portfolio" element={<BridalPortfolio />} />
              <Route path="messages" element={<Messages />} />
              <Route path="consultation-packages" element={<ConsultationPackages />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="other" element={<Other />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
