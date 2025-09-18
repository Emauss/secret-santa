import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Spinner } from './components';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return (
    <Routes>
      {!user ? (
        <Route path='*' element={<Login />} />
      ) : (
        <>
          <Route path='/' element={<Dashboard />} />
          <Route path='*' element={<Navigate to='/' />} />
        </>
      )}
    </Routes>
  );
}
