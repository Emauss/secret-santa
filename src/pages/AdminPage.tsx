import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks';
import { db } from '../firebase';
import { Spinner } from '../components';

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserData[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      });
    });
    setUsers(list);
    setLoading(false);
  };

  const handleAssign = async (giverId: string, recipientId: string) => {
    await setDoc(doc(db, 'pairs', giverId), { recipientId });
    setPairs((prev) => ({ ...prev, [giverId]: recipientId }));
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchUsers();
  }, [user]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin – przypisywanie 🎅</h1>
      {users.map((u) => (
        <div key={u.id} className='flex items-center justify-between bg-white p-3 rounded shadow mb-2'>
          <span>
            {u.firstName} {u.lastName} ({u.id})
          </span>
          <select className='border rounded p-1' value={pairs[u.id] || ''} onChange={(e) => handleAssign(u.id, e.target.value)}>
            <option value=''>-- wybierz --</option>
            {users
              .filter((cand) => cand.id !== u.id)
              .map((cand) => (
                <option key={cand.id} value={cand.id}>
                  {cand.firstName} {cand.lastName}
                </option>
              ))}
          </select>
        </div>
      ))}
    </div>
  );
}
