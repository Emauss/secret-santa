import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks';
import { db } from '../firebase';
import { Spinner } from '../components';
import { toast } from 'sonner';

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  wishlist?: string[];
  excludedIds?: string[];
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
        excludedIds: data.excludedIds || [],
      });
    });
    setUsers(list);
    setLoading(false);
  };

  const handleExcludeChange = async (userId: string, selectedIds: string[]) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, excludedIds: selectedIds } : u)));
    await updateDoc(doc(db, 'users', userId), { excludedIds: selectedIds });
  };

  const drawPairs = (users: UserData[]) => {
    const available = [...users];
    const pairs: Record<string, string> = {};

    for (const giver of users) {
      const possibleRecipients = available.filter((r) => {
        const sameLastName =
          r.lastName.toLowerCase().includes(giver.lastName.toLowerCase()) || giver.lastName.toLowerCase().includes(r.lastName.toLowerCase());
        const excluded = giver.excludedIds?.includes(r.id);
        return r.id !== giver.id && !sameLastName && !excluded;
      });

      if (possibleRecipients.length === 0) {
        throw new Error(`Nie udało się wylosować dla ${giver.firstName} ${giver.lastName}`);
      }

      const randomIndex = Math.floor(Math.random() * possibleRecipients.length);
      const recipient = possibleRecipients[randomIndex];
      pairs[giver.id] = recipient.id;

      // remove the selected recipient from available list
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
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin – Losowanie Tajemniczego Mikołaja 🎅</h1>

      <div className='bg-white rounded shadow p-4 mb-4'>
        <h2 className='font-semibold mb-2'>Lista uczestników ({users.length})</h2>
        <ul className='space-y-3'>
          {users.map((u) => (
            <li key={u.id} className='border p-3 rounded'>
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <span className='font-medium'>
                    {u.firstName} {u.lastName}
                  </span>{' '}
                  <span className='text-gray-400 text-sm'>({u.id})</span>
                </div>
                <div>{u.wishlist && u.wishlist.length > 0 ? '✔️' : '❌'}</div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Nie może wylosować:</label>
                <select
                  multiple
                  value={u.excludedIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    void handleExcludeChange(u.id, selected);
                  }}
                  className='border rounded w-full p-2 text-sm h-24'
                >
                  {users
                    .filter((cand) => cand.id !== u.id)
                    .map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        {cand.firstName} {cand.lastName}
                      </option>
                    ))}
                </select>
              </div>
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
