import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks';

export type WishlistItem = {
  name: string;
  link?: string | null;
};

export const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newLink, setNewLink] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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

  const saveWishlist = async (updated: WishlistItem[]) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { wishlist: updated });
  };

  const handleAdd = async () => {
    if (!user || !newItem.trim()) {
      return;
    }

    if (editingIndex !== null) {
      // Tryb edycji
      const updated = [...wishlist];
      updated[editingIndex] = { name: newItem.trim(), link: newLink.trim() || null };
      setWishlist(updated);
      setEditingIndex(null);
      setNewItem('');
      setNewLink('');
      await saveWishlist(updated);
    } else {
      // Tryb dodawania
      const updated = [...wishlist, { name: newItem.trim(), link: newLink.trim() || null }];
      setWishlist(updated);
      setNewItem('');
      setNewLink('');
      await saveWishlist(updated);
    }
  };

  const handleEdit = (index: number) => {
    const item = wishlist[index];
    setNewItem(item.name);
    setNewLink(item.link || '');
    setEditingIndex(index);
  };

  const handleRemove = async (itemName: string) => {
    if (!user) return;

    const updated = wishlist.filter((i) => i.name !== itemName);
    setWishlist(updated);
    await saveWishlist(updated);
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
      <h2 className='text-2xl font-semibold mb-3'>Moja lista życzeń</h2>

      <div className='flex flex-col gap-2 mb-4'>
        <input
          type='text'
          placeholder='Dodaj prezent...'
          className='flex-1 border rounded p-2'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <input
          type='url'
          placeholder='(opcjonalny link do prezentu)'
          className='flex-1 border rounded p-2'
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
        />
        <button onClick={handleAdd} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 cursor-pointer rounded text-lg'>
          {editingIndex !== null ? 'Zapisz zmiany' : 'Dodaj prezent 🎁'}
        </button>
      </div>

      <div>
        {wishlist.length > 0 ? (
          <>
            <h2 className='text-2xl font-semibold mb-3'>Drogi Mikołaju, w tym roku życzę sobie:</h2>
            <ul className='list-disc mt-4 space-y-2'>
              {wishlist.map((item, index) => (
                <li key={index} className='flex justify-between items-center gap-2'>
                  <div>
                    <span>✔ {item.name}</span>
                    {item.link && (
                      <a href={item.link} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline ml-2 text-sm'>
                        [LINK]
                      </a>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <button onClick={() => handleEdit(index)} className='text-blue-600 hover:underline text-sm cursor-pointer'>
                      Edytuj
                    </button>
                    <button onClick={() => handleRemove(item.name)} className='text-red-500 hover:underline text-sm cursor-pointer'>
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className='text-gray-500 italic mt-1'>Nie dodałeś jeszcze żadnych życzeń 🎅</p>
        )}
      </div>
    </div>
  );
};
