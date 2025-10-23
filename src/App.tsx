import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Spinner } from './components';
import { Toaster } from 'sonner';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='h-full'>
      <Routes>
        {!user ? (
          <Route path='*' element={<Login />} />
        ) : (
          <>
            <Route path='/' element={<Dashboard />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path='*' element={<Navigate to='/' />} />
          </>
        )}
      </Routes>
      <Toaster position='bottom-center' richColors />
    </div>
  );
}
