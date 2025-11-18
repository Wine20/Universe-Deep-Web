import { db } from './firebaseService';
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { CodeProject } from '../types';

interface FirestoreProject extends Omit<CodeProject, 'id' | 'lastModified'> {
    lastModified: Timestamp;
}

export const getProjects = async (userId: string): Promise<CodeProject[]> => {
    if (!userId || userId === 'demo-user-id') return [];
    try {
        const projectsRef = collection(db, 'users', userId, 'projects');
        const q = query(projectsRef, orderBy('lastModified', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data() as FirestoreProject;
            return {
                ...data,
                id: doc.id,
                lastModified: data.lastModified.toMillis(),
            } as CodeProject;
        });
    } catch (error) {
        console.error("Error getting projects from Firestore: ", error);
        return [];
    }
};

export const updateProject = async (userId: string, project: CodeProject): Promise<void> => {
    if (!userId || !project.id || userId === 'demo-user-id') return;
    try {
        const projectRef = doc(db, 'users', userId, 'projects', project.id);
        const { id, ...projectData } = project;
        // Firebase updateDoc doesn't accept undefined values from optional types, so we must clean the object.
        const cleanProjectData = JSON.parse(JSON.stringify(projectData));
        await updateDoc(projectRef, {
            ...cleanProjectData,
            lastModified: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating project in Firestore: ", error);
    }
};

export const addProject = async (userId: string, projectData: Omit<CodeProject, 'id' | 'lastModified'>): Promise<CodeProject | null> => {
     if (!userId || userId === 'demo-user-id') {
        // For demo user, simulate creating a project in-memory
         return {
             ...projectData,
             id: `demo-${Date.now()}`,
             lastModified: Date.now()
         };
     }
     try {
        const projectsRef = collection(db, 'users', userId, 'projects');
        const docRef = await addDoc(projectsRef, {
            ...projectData,
            lastModified: serverTimestamp(),
        });
         return {
             ...projectData,
             id: docRef.id,
             lastModified: Date.now()
         };
     } catch(error) {
         console.error("Error adding project to Firestore: ", error);
         return null;
     }
}