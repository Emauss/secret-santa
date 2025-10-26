import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <form onSubmit={handleSubmit} className='bg-white p-6 rounded-xl shadow-md w-80'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Secret Santa 🎅</h1>
        {error && <p className='text-red-500 mb-2 text-sm'>{error}</p>}

        <input type='email' placeholder='Email' className='w-full mb-2 p-2 border rounded' value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type='password'
          placeholder='Hasło'
          className='w-full mb-4 p-2 border rounded'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className='w-full bg-blue-500 text-white py-2 cursor-pointer rounded mb-2 hover:bg-blue-600'>
          {isRegister ? 'Zarejestruj' : 'Zaloguj'}
        </button>
        <p onClick={() => setIsRegister(!isRegister)} className='text-center text-blue-500 cursor-pointer text-sm'>
          {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
        </p>
      </form>
    </div>
  );
}
