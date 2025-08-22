import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, User, VerifyData } from '../types';

const messagesCollectionRef = collection(db, 'messages');
const usersCollectionRef = collection(db, 'users');
const verifyCollectionRef = collection(db, 'verify');

// NOUVEAU : Fonction dédiée uniquement aux messages texte
export const addTextMessage = async (userName: string, country: string, content: string) => {
  await addDoc(messagesCollectionRef, {
    userName,
    country,
    content,
    type: 'text', // On s'assure que le type est bien défini
    timestamp: serverTimestamp(),
  });
};

// NOUVEAU : Fonction dédiée uniquement aux messages avec fichier
export const addFileMessage = async (
  userName: string,
  country: string,
  type: 'image' | 'video' | 'audio',
  fileURL: string
) => {
  await addDoc(messagesCollectionRef, {
    userName,
    country,
    fileURL,
    type, // Le type est passé en argument
    timestamp: serverTimestamp(),
  });
};

// Ajout de la fonction addUser pour l'inscription
export const addUser = async (name: string, country: string, flag: string) => {
  try {
    const usersRef = collection(db, 'users');
    const userData = {
      name,
      country,
      flag,
      joinedAt: serverTimestamp(),
    };

    return await addDoc(usersRef, userData);
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Nouvelle fonction pour récupérer la liste des utilisateurs
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('joinedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        country: data.country,
        flag: data.flag,
        joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const subscribeToMessages = (callback: (messages: Message[]) => void) => {
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userName: data.userName,
        country: data.country,
        content: data.content, // Peut être undefined pour les fichiers
        type: data.type,
        fileURL: data.fileURL,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
      };
    });
    callback(messages);
  });

  return unsubscribe;
};

// Ajoute une donnée de vérification
export const addVerifyData = async (data: { name: string; country: string; phoneNumber: string }) => {
  try {
    const verifyRef = collection(db, 'verify');
    const docData = {
      ...data,
      timestamp: serverTimestamp(),
    };
    return await addDoc(verifyRef, docData);
  } catch (error) {
    console.error('Error adding verify data:', error);
    throw error;
  }
};

// Récupère toutes les données de vérification
export const getVerifyData = async () => {
  try {
    const verifyRef = collection(db, 'verify');
    const snapshot = await getDocs(verifyRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VerifyData[];
  } catch (error) {
    console.error('Error getting verify data:', error);
    throw error;
  }
};

// Supprime une donnée de vérification par id
export const deleteVerifyData = async (id: string) => {
  try {
    const verifyRef = doc(db, 'verify', id);
    await deleteDoc(verifyRef);
  } catch (error) {
    console.error('Error deleting verify data:', error);
    throw error;
  }
};

// Supprime un message par son identifiant
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Note: L'ancienne fonction générique `addMessage` a été supprimée et remplacée par les deux ci-dessus.