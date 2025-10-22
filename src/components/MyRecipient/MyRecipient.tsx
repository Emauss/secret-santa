import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';

type Recipient = {
  firstName: string;
  lastName: string;
  wishlist: string[];
};

export const MyRecipient = () => {
  const { user, loading: authLoading } = useAuth();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecipient = async () => {
    if (!user) {
      return;
    }

    // we're checking the 'pairs' collection to find the recipient assigned to the current user
    const pairRef = doc(db, 'pairs', user.uid);
    const pairSnap = await getDoc(pairRef);

    if (pairSnap.exists()) {
      const { recipientId } = pairSnap.data() as { recipientId: string };
      if (recipientId) {
        const recipientRef = doc(db, 'users', recipientId);
        const recipientSnap = await getDoc(recipientRef);
        if (recipientSnap.exists()) {
          const data = recipientSnap.data();
          setRecipient({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            wishlist: data.wishlist || [],
          });
        }
      }
    }

    setLoading(false);
  };

  const drawRecipient = async () => {
    setIsDrawing(true);
    const userRef = doc(db, 'users', user!.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (!data?.firstName || !data?.lastName || !data?.wishlist?.length) {
      setIsDrawing(false);
      return alert('Uzupełnij najpierw swój profil oraz listę życzeń, aby móc wylosować osobę.');
    }

    alert('Funkcja losowania wylosowanej osoby nie jest jeszcze zaimplementowana.');
    setIsDrawing(false);
  };

  useEffect(() => {
    if (!authLoading) {
      void fetchRecipient();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return <p>Ładowanie wylosowanej osoby...</p>;
  }

  if (isDrawing) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow'>
        <p>Losowanie w toku...</p>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow'>
        <p>Nie masz jeszcze wylosowanej osoby 🎅</p>
        <button onClick={drawRecipient} className='bg-red-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-red-700 mt-3'>
          Wylosuj 🎲
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded p-4 mb-6'>
      <h2 className='text-lg font-semibold mb-2'>Twoja wylosowana osoba 🎁</h2>
      <p className='mb-2'>
        <span className='font-bold'>
          {recipient.firstName} {recipient.lastName}
        </span>
      </p>
      <h3 className='font-semibold mb-1'>Lista życzeń:</h3>
      {recipient.wishlist.length > 0 ? (
        <ul className='list-disc pl-5'>
          {recipient.wishlist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-500'>Brak życzeń dodanych</p>
      )}
    </div>
  );
};
