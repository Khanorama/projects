import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import UserProvider from './context/UserContext.jsx';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Welcome from './pages/Welcome';
import Workshop from './pages/Workshop';
import './App.css';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workshop" element={<Workshop />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
