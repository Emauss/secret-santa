import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../hooks';
import { db } from '../firebase';
import { Spinner } from '../components';
import { toast } from 'sonner';

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  wishlist?: string[];
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserData[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        wishlist: data.wishlist || [],
      });
    });
    setUsers(list);
    setLoading(false);
  };

  const drawPairs = (users: UserData[]) => {
    const available = [...users];
    const pairs: Record<string, string> = {};

    for (const giver of users) {
      const possibleRecipients = available.filter(
        (r) =>
          r.id !== giver.id &&
          !r.lastName.toLowerCase().includes(giver.lastName.toLowerCase()) &&
          !giver.lastName.toLowerCase().includes(r.lastName.toLowerCase())
      );

      if (possibleRecipients.length === 0) {
        throw new Error(`Nie udało się wylosować dla ${giver.firstName} ${giver.lastName}`);
      }

      const randomIndex = Math.floor(Math.random() * possibleRecipients.length);
      const recipient = possibleRecipients[randomIndex];
      pairs[giver.id] = recipient.id;

      available.splice(
        available.findIndex((r) => r.id === recipient.id),
        1
      );
    }

    return pairs;
  };

  const handleDrawAll = async () => {
    if (users.length < 2) {
      return alert('Potrzebujesz co najmniej 2 uczestników, aby rozpocząć losowanie.');
    }

    setIsDrawing(true);

    try {
      const pairs = drawPairs(users);

      for (const [giverId, recipientId] of Object.entries(pairs)) {
        await setDoc(doc(db, 'pairs', giverId), {
          recipientId,
          revealed: false,
        });
      }

      toast.success('Losowanie zakończone pomyślnie! 🎅 Wszystkie pary zapisane.');
    } catch (err) {
      console.error(err);
      alert('Błąd podczas losowania. Spróbuj ponownie.');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Czy na pewno chcesz zresetować losowanie? Wszystkie przypisania zostaną usunięte!')) {
      return;
    }

    setIsResetting(true);
    try {
      const snap = await getDocs(collection(db, 'pairs'));
      const deletions = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletions);

      toast.success('Losowanie zostało zresetowane 🎄');
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas resetowania losowania.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (user) {
      void fetchUsers();
    }
  }, [user]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin – Losowanie Tajemniczego Mikołaja 🎅</h1>

      <div className='bg-white rounded shadow p-4 mb-4'>
        <h2 className='font-semibold mb-2'>Lista uczestników ({users.length})</h2>
        <ul className='list-disc pl-5'>
          {users.map((u) => (
            <li key={u.id} className='flex items-center gap-2'>
              <span>
                {u.firstName} {u.lastName} <span className='text-gray-400 text-sm'>({u.id})</span>
              </span>
              <div className='ml-auto'>{u.wishlist && u.wishlist.length > 0 ? '✔️' : '❌'}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex gap-3'>
        <button
          disabled={isDrawing}
          onClick={handleDrawAll}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer ${isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDrawing ? 'Losowanie...' : 'Wylosuj wszystkich 🎲'}
        </button>

        <button
          disabled={isResetting}
          onClick={handleReset}
          className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isResetting ? 'Resetuję...' : 'Resetuj losowanie ♻️'}
        </button>
      </div>
    </div>
  );
}
