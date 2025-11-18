import { db } from './firebaseService';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { ChatMessage, Role } from '../types';

interface FirestoreMessage {
    role: Role;
    text: string;
    timestamp: Timestamp;
}

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
    if (!userId || userId === 'demo-user-id') return [];
    try {
        const messagesRef = collection(db, 'users', userId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const history: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreMessage;
            history.push({
                role: data.role,
                text: data.text,
            });
        });
        return history;
    } catch (error) {
        console.error("Error getting chat history: ", error);
        // Return a default welcome message on error to prevent app crash
        return [{ role: 'model', text: 'Desculpe, não consegui carregar seu histórico. Vamos começar uma nova conversa.' }];
    }
};

export const saveChatMessage = async (userId: string, message: Pick<ChatMessage, 'role' | 'text'>): Promise<void> => {
    if (!userId || userId === 'demo-user-id') return;
    try {
        const messagesRef = collection(db, 'users', userId, 'messages');
        await addDoc(messagesRef, {
            role: message.role,
            text: message.text,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving chat message: ", error);
    }
};