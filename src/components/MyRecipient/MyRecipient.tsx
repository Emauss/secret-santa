import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import type { WishlistItem } from '..';

type Recipient = {
  firstName: string;
  lastName: string;
  wishlist: WishlistItem[];
};

export const MyRecipient = () => {
  const { user, loading: authLoading } = useAuth();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasPairDoc, setHasPairDoc] = useState<boolean | null>(null);

  const fetchRecipient = async () => {
    if (!user) return;

    const pairRef = doc(db, 'pairs', user.uid);
    const pairSnap = await getDoc(pairRef);

    if (!pairSnap.exists()) {
      setHasPairDoc(false);
      setLoading(false);
      return;
    }

    setHasPairDoc(true);

    const { recipientId, revealed } = pairSnap.data() as {
      recipientId: string;
      revealed?: boolean;
    };

    if (!recipientId) {
      setLoading(false);
      return;
    }

    // if not revealed, do not fetch recipient data
    if (!revealed) {
      setRecipient(null);
      setLoading(false);
      return;
    }

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

    setLoading(false);
  };

  const launchConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 9999 };

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 80 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 200);
  };

  const drawRecipient = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (!data?.wishlist?.length) {
      setIsDrawing(false);
      return toast.info('Przed wylosowaniem uzupełnij swoją listę życzeń.');
    }

    setIsDrawing(true);

    const pairRef = doc(db, 'pairs', user.uid);
    const pairSnap = await getDoc(pairRef);

    if (!pairSnap.exists()) {
      setIsDrawing(false);
      return alert('Nie masz jeszcze przypisanej osoby. Admin musi najpierw przeprowadzić losowanie.');
    }

    const { revealed } = pairSnap.data() as {
      recipientId: string;
      revealed?: boolean;
    };

    if (revealed) {
      setIsDrawing(false);
      return alert('Twoja wylosowana osoba jest już odkryta 🎁');
    }

    // show recipient
    await updateDoc(pairRef, { revealed: true });
    await fetchRecipient();
    setIsDrawing(false);

    toast.success('Wylosowałeś/aś swoją osobę 🎅');
    launchConfetti();
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

  // If there's no drawn pair document
  if (hasPairDoc === false) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow text-center'>
        <p className='text-gray-700'>Losowanie jeszcze się nie odbyło. 🎁</p>
        <p className='text-gray-700'>Uzupełnij profil i przygotuj swoją listę życzeń</p>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow text-center'>
        <p>Nie znasz jeszcze osoby której robisz prezent!</p>
        <button onClick={drawRecipient} className='bg-red-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-red-700 mt-3'>
          Wylosuj osobę 🎲
        </button>
      </div>
    );
  }

  return (
    <div className='bg-blue-500 text-white shadow rounded p-4 mb-6'>
      <h2 className='text-2xl font-semibold mb-3'>Twoja wylosowana osoba</h2>
      <p className='mb-3'>
        <span className='font-bold'>
          {recipient.firstName} {recipient.lastName}
        </span>
      </p>

      <h3 className='mb-1'>Wymarzony prezent to:</h3>
      {recipient.wishlist.length > 0 ? (
        <ul className='list-disc pl-5'>
          {recipient.wishlist.map((item) => (
            <li key={item.name}>
              <div>
                {item.name}{' '}
                {item.link && (
                  <a href={item.link} target='_blank' rel='noopener noreferrer' className='text-yellow-500 hover:underline ml-2 text-sm'>
                    [LINK]
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-200'>Brak dodanych życzeń</p>
      )}
    </div>
  );
};
