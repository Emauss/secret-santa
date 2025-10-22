import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';

export const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      setWishlist(data.wishlist || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user || !newItem.trim()) {
      return;
    }
    const userRef = doc(db, 'users', user.uid);

    const updated = [...wishlist, newItem.trim()];
    setWishlist(updated);
    setNewItem('');
    await updateDoc(userRef, { wishlist: updated });
  };

  const handleRemove = async (item: string) => {
    if (!user) {
      return;
    }
    const userRef = doc(db, 'users', user.uid);

    const updated = wishlist.filter((i) => i !== item);
    setWishlist(updated);
    await updateDoc(userRef, { wishlist: updated });
  };

  useEffect(() => {
    if (!authLoading) {
      void fetchWishlist();
    }
  }, [user, authLoading]);

  if (loading) {
    return <p>Ładowanie listy życzeń...</p>;
  }

  return (
    <div className='bg-white shadow rounded p-4'>
      <h2 className='text-lg font-semibold mb-2'>Moja lista życzeń 🎁</h2>
      <div className='flex gap-2 mb-2'>
        <input
          type='text'
          placeholder='Dodaj prezent...'
          className='flex-1 border rounded p-2'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button onClick={handleAdd} className='bg-green-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-green-600'>
          +
        </button>
      </div>
      <ul className='list-disc mt-4'>
        {wishlist.map((item) => (
          <li key={item} className='flex justify-between items-center mb-1'>
            <span>✅&nbsp;{item}</span>
            <button onClick={() => handleRemove(item)} className='text-red-500 cursor-pointer hover:underline text-sm'>
              usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
