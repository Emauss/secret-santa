import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';
import { auth } from '../firebase';

type Mode = 'login' | 'register' | 'reset';

const RESET_SENT_MESSAGE =
  'Jeśli konto z tym adresem istnieje, wysłaliśmy link do zmiany hasła. Sprawdź też folder spam.';

const resetErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Podaj poprawny adres email';
    case 'auth/too-many-requests':
      return 'Za dużo prób, spróbuj później';
    case 'auth/unauthorized-continue-uri':
      return 'Ta domena nie jest dodana w ustawieniach Firebase (Authorized domains). Daj znać administratorowi.';
    default:
      return 'Nie udało się wysłać linku. Spróbuj ponownie.';
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('login');

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleReset = async () => {
    try {
      // After setting the new password, Firebase's page links back to the app (current URL without the hash route)
      await sendPasswordResetEmail(auth, email, {
        url: window.location.href.split('#')[0],
      });
      toast.success(RESET_SENT_MESSAGE);
      switchMode('login');
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      // Same message as success, so the form doesn't reveal which emails have accounts
      if (code === 'auth/user-not-found') {
        toast.success(RESET_SENT_MESSAGE);
        switchMode('login');
        return;
      }
      setError(resetErrorMessage(code));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      await handleReset();
      return;
    }
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  const linkClass =
    'block w-full text-center text-blue-500 cursor-pointer text-sm hover:underline';

  return (
    <div className='flex h-screen items-center justify-center relative'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-6 rounded-xl shadow-md w-80'
      >
        <h1 className='text-3xl font-bold mb-4 text-center'>Secret Santa</h1>
        {mode === 'reset' && (
          <p className='text-sm text-gray-600 mb-3 text-center'>
            Podaj swój email, a wyślemy Ci link do ustawienia nowego hasła.
          </p>
        )}
        {error && <p className='text-red-500 mb-2 text-sm'>{error}</p>}

        <input
          type='email'
          placeholder='Email'
          required={mode === 'reset'}
          className={`w-full p-2 border rounded ${mode === 'reset' ? 'mb-4' : 'mb-2'}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode !== 'reset' && (
          <input
            type='password'
            placeholder='Hasło'
            className={`w-full p-2 border rounded ${mode === 'login' ? 'mb-1' : 'mb-4'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {mode === 'login' && (
          <button
            type='button'
            onClick={() => switchMode('reset')}
            className='block ml-auto mb-3 text-blue-500 cursor-pointer text-xs hover:underline'
          >
            Nie pamiętasz hasła?
          </button>
        )}

        <button className='w-full bg-blue-500 text-white py-2 cursor-pointer rounded mb-2 hover:bg-blue-600'>
          {mode === 'register'
            ? 'Zarejestruj'
            : mode === 'reset'
              ? 'Wyślij link'
              : 'Zaloguj'}
        </button>

        {mode === 'reset' ? (
          <button
            type='button'
            onClick={() => switchMode('login')}
            className={linkClass}
          >
            Wróć do logowania
          </button>
        ) : (
          <button
            type='button'
            onClick={() =>
              switchMode(mode === 'register' ? 'login' : 'register')
            }
            className={linkClass}
          >
            {mode === 'register'
              ? 'Masz już konto? Zaloguj się'
              : 'Nie masz konta? Zarejestruj się'}
          </button>
        )}
      </form>
    </div>
  );
}
