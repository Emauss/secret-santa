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

type PairData = {
  recipientId: string;
  revealed: boolean;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pairs, setPairs] = useState<Record<string, PairData>>({});
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
  };

  const fetchPairs = async () => {
    const snap = await getDocs(collection(db, 'pairs'));
    const map: Record<string, PairData> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as PairData;
      map[docSnap.id] = { recipientId: data.recipientId, revealed: !!data.revealed };
    });
    setPairs(map);
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

      // usuń wylosowanego z listy
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
      await fetchPairs();
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas losowania. Spróbuj ponownie.');
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
      setPairs({});
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas resetowania losowania.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (user) {
      void (async () => {
        await fetchUsers();
        await fetchPairs();
        setLoading(false);
      })();
    }
  }, [user]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='max-w-5xl mx-auto p-6 relative z-10'>
      <h1 className='text-2xl font-bold mb-6 text-center text-white'>🎅 Admin – Losowanie Tajemniczego Mikołaja</h1>

      <div className='overflow-x-auto bg-white shadow rounded-lg mb-6 border'>
        <table className='min-w-full text-sm text-left border-collapse'>
          <thead>
            <tr className='bg-gray-100 border-b'>
              <th className='px-4 py-2 font-semibold'>Imię i nazwisko</th>
              <th className='px-4 py-2 font-semibold text-center'>Lista życzeń 🎁</th>
              <th className='px-4 py-2 font-semibold text-center'>Odkrył osobę 👀</th>
              <th className='px-4 py-2 font-semibold'>Nie może wylosować</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const hasWishlist = u.wishlist && u.wishlist.length > 0;
              const revealed = pairs[u.id]?.revealed;

              return (
                <tr key={u.id} className='[&:not(:last-child)]:border-b hover:bg-gray-50'>
                  <td className='px-4 py-2'>
                    <span className='font-medium'>
                      {u.firstName} {u.lastName}
                    </span>
                    <span className='text-gray-400 text-xs block'>{u.id}</span>
                  </td>
                  <td className='px-4 py-2 text-center'>
                    {hasWishlist ? <span className='text-green-600'>✔️</span> : <span className='text-gray-400'>❌</span>}
                  </td>
                  <td className='px-4 py-2 text-center'>
                    {revealed ? <span className='text-green-600 font-semibold'>✅ TAK</span> : <span className='text-gray-400'>—</span>}
                  </td>
                  <td className='px-4 py-2'>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className='flex gap-3 justify-center'>
        <button
          disabled={isDrawing}
          onClick={handleDrawAll}
          className={`bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 cursor-pointer ${isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDrawing ? 'Losowanie...' : 'Wylosuj wszystkich 🎲'}
        </button>

        <button
          disabled={isResetting}
          onClick={handleReset}
          className={`bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 cursor-pointer ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isResetting ? 'Resetuję...' : 'Resetuj losowanie ♻️'}
        </button>
      </div>
    </div>
  );
}
