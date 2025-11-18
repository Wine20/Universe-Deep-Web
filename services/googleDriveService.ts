import { GOOGLE_CLIENT_ID } from '../config';
import type { GoogleDriveNode } from '../types';

// This is a mock implementation of the Google Drive API for demonstration purposes.
// It does not make real API calls but simulates the authentication and file listing flow.

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

// --- Initialization ---

const initGapiClient = () => new Promise<void>((resolve, reject) => {
    window.gapi.load('client', async () => {
        try {
            await window.gapi.client.init({
                clientId: GOOGLE_CLIENT_ID,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            resolve();
        } catch (e) { reject(e); }
    });
});

const initGisClient = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
};

export const initDriveClient = async () => {
    if (gapiInited && gisInited) return;
    await new Promise<void>((resolve) => {
        const checkGis = () => window.google ? (initGisClient(), resolve()) : setTimeout(checkGis, 100);
        checkGis();
    });
    await new Promise<void>((resolve) => {
        const checkGapi = () => window.gapi ? initGapiClient().then(resolve) : setTimeout(checkGapi, 100);
        checkGapi();
    });
};

// --- Authentication ---

export const signInToDrive = (): Promise<void> => new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error("Google Drive client not initialized."));

    const callback = (resp: any) => {
        if (resp.error) return reject(resp);
        resolve();
    };

    if (window.gapi.client.getToken() === null) {
        tokenClient.callback = callback;
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        resolve();
    }
});

export const signOutFromDrive = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null);
        });
    }
};

export const getIsSignedIn = (): boolean => window.gapi?.client?.getToken() !== null;

// --- Mock Data & API Simulation ---

// Fix: Define a local recursive type for the mock data to allow nested children.
// The original GoogleDriveNode type does not have a 'children' property, causing type errors.
type MockDriveNodeWithChildren = GoogleDriveNode & { children?: MockDriveNodeWithChildren[] };

const mockDriveFiles: MockDriveNodeWithChildren = {
    id: 'root',
    name: 'Meu Drive',
    kind: 'folder',
    children: [
        { id: '1', name: 'Documentos do Projeto', kind: 'folder', children: [
            { id: '1a', name: 'Proposta_v2.docx', kind: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { id: '1b', name: 'Cronograma.xlsx', kind: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { id: '1c', name: 'Apresentação.pptx', kind: 'file', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
        ]},
        { id: '2', name: 'Fotos de Férias', kind: 'folder', children: [
            { id: '2a', name: 'praia.jpg', kind: 'file', mimeType: 'image/jpeg' },
            { id: '2b', name: 'montanha.png', kind: 'file', mimeType: 'image/png' },
        ]},
        { id: '3', name: 'Relatório Anual.pdf', kind: 'file', mimeType: 'application/pdf' },
        { id: '4', name: 'Notas da Reunião.txt', kind: 'file', mimeType: 'text/plain' },
    ]
};

const findNodeByPath = (path: string[]): MockDriveNodeWithChildren | null => {
    let currentNode: MockDriveNodeWithChildren = mockDriveFiles;
    for (const part of path) {
        if (currentNode.kind === 'folder' && currentNode.children) {
            const found = currentNode.children.find(child => child.name === part);
            if (found) {
                currentNode = found;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    return currentNode;
}

/** Simulates listing files from Google Drive */
export const listDriveFiles = (path: string[] = []): Promise<GoogleDriveNode[]> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const node = findNodeByPath(path);
            if (node && node.kind === 'folder' && node.children) {
                resolve(node.children);
            } else {
                resolve([]);
            }
        }, 500);
    });
};
