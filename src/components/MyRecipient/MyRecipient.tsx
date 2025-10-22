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
  const [loading, setLoading] = useState(true);

  const fetchRecipient = async () => {
    if (!user) return;

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

  useEffect(() => {
    if (!authLoading) {
      void fetchRecipient();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return <p>Ładowanie wylosowanej osoby...</p>;
  }

  if (!recipient) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow'>
        <p>Nie masz jeszcze wylosowanej osoby 🎅</p>
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
