import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const Profile = () => {
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);

  const userRef = user ? doc(db, 'users', user.uid) : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userRef) return;
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
      } else {
        await setDoc(userRef, { firstName: '', lastName: '', wishlist: [] });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userRef]);

  const handleSave = async () => {
    if (!userRef) return;
    await updateDoc(userRef, { firstName, lastName });
  };

  if (loading) return <p>Ładowanie profilu...</p>;

  return (
    <div className='bg-white shadow rounded p-4 mb-6'>
      <h2 className='text-lg font-semibold mb-2'>Profil</h2>
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
      <button onClick={handleSave} className='bg-blue-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-blue-600'>
        Zapisz profil
      </button>
    </div>
  );
};
