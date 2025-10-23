import { MyRecipient, Profile, Wishlist } from '../components';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks';
import { isAdmin } from '../utils';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className='max-w-md mx-auto p-6 flex flex-col gap-6'>
      <h1 className='text-2xl font-bold'>Panel użytkownika 🎄</h1>
      <Profile />
      <Wishlist />
      <MyRecipient />
      {isAdmin(user?.uid) && (
        <button onClick={() => navigate('/admin')} className='bg-blue-800 text-white px-4 py-2 cursor-pointer rounded hover:bg-blue-700 mt-4'>
          Panel Admina
        </button>
      )}
      <button onClick={() => signOut(auth)} className='bg-red-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-red-600'>
        Wyloguj
      </button>
    </div>
  );
}
