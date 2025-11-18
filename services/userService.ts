

import { auth, db } from './firebaseService';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed import
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Export the type directly for use in components
export type { FirebaseUser };

// Wrapper function for onAuthStateChanged that passes the auth instance
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};

// Creates a user profile document in Firestore upon first sign-in
const createUserDocument = async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        const { uid, email, displayName, photoURL } = user;
        await setDoc(userRef, {
            uid,
            email,
            displayName: displayName || 'Novo Usuário',
            photoURL,
            createdAt: new Date().toISOString(),
        }, { merge: true });
    }
};

// Sign up with email and password
export const signUpWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean, message: string }> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set the user's display name
        await updateProfile(userCredential.user, { displayName: name });
        // Create their profile in Firestore
        await createUserDocument(userCredential.user);
        return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (error: any) {
        const message = error.code === 'auth/email-already-in-use'
            ? 'Este email já está registrado.'
            : `Erro de registro: ${error.message}`;
        return { success: false, message };
    }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean, message: string }> => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true, message: 'Login bem-sucedido!' };
    } catch (error: any) {
         const message = (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
            ? 'Email ou senha incorretos.'
            : `Erro de login: ${error.message}`;
        return { success: false, message };
    }
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<{ success: boolean, message: string }> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Create their profile in Firestore if it's their first time
        await createUserDocument(result.user);
        return { success: true, message: 'Login com Google bem-sucedido!' };
    } catch (error: any) {
         const message = error.code === 'auth/popup-closed-by-user'
            ? 'O popup de login foi fechado.'
            : `Erro de login com Google: ${error.message}`;
        return { success: false, message };
    }
};

// Sign in with Facebook Popup
export const signInWithFacebook = async (): Promise<{ success: boolean, message: string }> => {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Create their profile in Firestore if it's their first time
        await createUserDocument(result.user);
        return { success: true, message: 'Login com Facebook bem-sucedido!' };
    } catch (error: any) {
        // Handle specific Facebook auth errors
        if (error.code === 'auth/account-exists-with-different-credential') {
            return { success: false, message: 'Já existe uma conta com este email. Tente fazer login com outro provedor (ex: Google).' };
        }
        const message = error.code === 'auth/popup-closed-by-user'
            ? 'O popup de login foi fechado.'
            : `Erro de login com Facebook: ${error.message}`;
        return { success: false, message };
    }
};

// Sign out the current user
export const logoutUser = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

// Get current user synchronously
export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser;
};