import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');

      if (!!data?.firstName && !!data?.lastName) {
        setIsCollapsed(true);
      }
    } else {
      await setDoc(userRef, { firstName: '', lastName: '', wishlist: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      void fetchProfile();
    }
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    try {
      await updateDoc(userRef, { firstName, lastName });
      toast.success('Profil zapisany pomyślnie');

      void fetchProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error('Wystąpił problem z zapisaniem profilu: ' + e.message);
    }
  };

  if (loading || authLoading) {
    return <p>Ładowanie profilu...</p>;
  }

  return (
    <div className='bg-white shadow rounded p-4'>
      <h2 className='text-xl font-semibold mb-2'>Profil</h2>
      {firstName && lastName && isCollapsed && (
        <div className='flex items-center gap-2'>
          <p className='text-2xl fancy-font'>
            {firstName} {lastName}
          </p>
          <button
            type='button'
            onClick={() => setIsCollapsed(false)}
            aria-label='Edytuj profil'
            title='Edytuj profil'
            className='text-blue-700 hover:text-blue-600 cursor-pointer p-1 rounded'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-4 h-4'
              aria-hidden='true'
            >
              <path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' />
              <path d='m15 5 4 4' />
            </svg>
          </button>
        </div>
      )}
      {!isCollapsed && (
        <>
          <input
            type='text'
            placeholder='Imię'
            className='w-full border rounded p-2 mb-2'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type='text'
            placeholder='Nazwisko'
            className='w-full border rounded p-2 mb-2'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <button
            onClick={handleSave}
            className='bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 cursor-pointer rounded'
          >
            Zapisz profil
          </button>
        </>
      )}
    </div>
  );
};
