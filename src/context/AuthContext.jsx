import { createContext, useContext, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('auth_user'));

  const login = async (email, password) => {
    const q = query(collection(db, 'admins'), where('email', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) throw new Error('Invalid credentials');

    const adminDoc = snap.docs[0].data();

    if (adminDoc.password !== password) throw new Error('Invalid credentials');

    sessionStorage.setItem('auth_user', email);
    setUser(email);
  };

  const logout = () => {
    sessionStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
