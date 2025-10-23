import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

type Recipient = {
  firstName: string;
  lastName: string;
  wishlist: string[];
};

export const MyRecipient = () => {
  const { user, loading: authLoading } = useAuth();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  const fetchRecipient = async () => {
    if (!user) return;

    const pairRef = doc(db, 'pairs', user.uid);
    const pairSnap = await getDoc(pairRef);

    if (pairSnap.exists()) {
      const { recipientId, revealed } = pairSnap.data() as {
        recipientId: string;
        revealed?: boolean;
      };

      if (!recipientId) {
        setLoading(false);
        return;
      }

      // If not revealed, do not fetch recipient details
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

    // Set pair as revealed
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

  if (!recipient) {
    return (
      <div className='bg-yellow-100 p-4 rounded shadow'>
        <p>Nie znasz jeszcze swojej wylosowanej osoby 🎅</p>
        <button onClick={drawRecipient} className='bg-red-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-red-700 mt-3'>
          Wylosuj osobę 🎲
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
