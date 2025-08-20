import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Message, VerifyData } from '../types';

// Service pour les utilisateurs
export const addUser = async (name: string, country: string, flag: string) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name,
      country,
      flag,
      joinedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date()
    })) as User[];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Service pour les messages
export const addMessage = async (userName: string, content: string, country: string) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      userName,
      content,
      country,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    throw error;
  }
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Message[];
    callback(messages);
  });
};

export const deleteMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    throw error;
  }
};

// Service pour les données de vérification
export const addVerifyData = async (data: Omit<VerifyData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'verify'), data);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données de vérification:', error);
    throw error;
  }
};

export const getVerifyData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'verify'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VerifyData[];
  } catch (error) {
    console.error('Erreur lors de la récupération des données de vérification:', error);
    throw error;
  }
};

export const deleteVerifyData = async (dataId: string) => {
  try {
    await deleteDoc(doc(db, 'verify', dataId));
  } catch (error) {
    console.error('Erreur lors de la suppression des données de vérification:', error);
    throw error;
  }
};