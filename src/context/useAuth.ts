import { useContext } from 'react';
import { AuthContext } from './authModel';

export const useAuth = () => useContext(AuthContext);
