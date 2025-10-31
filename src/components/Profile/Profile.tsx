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

    if (isCollapsed) {
      setIsCollapsed(false);
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
      <h2 className='text-2xl font-semibold mb-3'>Profil</h2>
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
        </>
      )}
      <button onClick={handleSave} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 cursor-pointer rounded'>
        {isCollapsed ? 'Edytuj' : 'Zapisz'} profil
      </button>
    </div>
  );
};
