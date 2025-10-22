import { MyRecipient, Profile, Wishlist } from '../components';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Dashboard() {
  return (
    <div className='max-w-md mx-auto p-6 flex flex-col gap-6'>
      <h1 className='text-2xl font-bold'>Panel użytkownika 🎄</h1>
      <Profile />
      <MyRecipient />
      <Wishlist />
      <button onClick={() => signOut(auth)} className='bg-red-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-red-600'>
        Wyloguj
      </button>
    </div>
  );
}
