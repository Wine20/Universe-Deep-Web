import type { NativeFSNode } from '../types';
import { openDB } from 'idb';

// --- IndexedDB setup for persisting directory handles ---

const DB_NAME = 'bluewhite-fs-access';
const STORE_NAME = 'directory-handles';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

async function storeDirectoryHandle(handle: FileSystemDirectoryHandle) {
  const db = await dbPromise;
  await db.put(STORE_NAME, handle, 'root');
}

async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await dbPromise;
  return await db.get(STORE_NAME, 'root') || null;
}

// --- File System Access API service functions ---

/**
 * Checks if a stored directory handle exists and verifies permission.
 * @returns The handle if permission is granted, otherwise null.
 */
export async function checkPermissions(): Promise<FileSystemDirectoryHandle | null> {
    try {
        const handle = await getStoredDirectoryHandle();
        if (handle) {
            // Request readwrite permission check.
            const permission = await (handle as any).queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
                return handle;
            }
        }
        return null;
    } catch (e) {
        console.error("Error checking permissions:", e);
        return null;
    }
}

/**
 * Prompts the user to select a directory and stores the handle.
 * @returns The selected directory handle or null if cancelled.
 */
export async function connectToDirectory(): Promise<FileSystemDirectoryHandle | null> {
    try {
        // Request readwrite permission on picker.
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        await storeDirectoryHandle(handle);
        return handle;
    } catch (e) {
        console.log("User cancelled directory picker or an error occurred.", e);
        return null;
    }
}

/**
 * Gets the contents of a given directory handle.
 * @param directoryHandle The handle to the directory to read.
 * @returns A promise that resolves to an array of NativeFSNode objects.
 */
export async function getDirectoryContents(directoryHandle: FileSystemDirectoryHandle): Promise<NativeFSNode[]> {
    const contents: NativeFSNode[] = [];
    // @ts-ignore - values() is an async iterator
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
             const file = await (entry as FileSystemFileHandle).getFile();
             contents.push({
                name: entry.name,
                kind: 'file',
                handle: entry as FileSystemFileHandle,
                size: file.size,
                lastModified: file.lastModified,
            });
        } else {
            contents.push({
                name: entry.name,
                kind: 'directory',
                handle: entry as FileSystemDirectoryHandle,
            });
        }
    }
    return contents;
}

/**
 * Reads the content of a file handle as text.
 * @param fileHandle The handle of the file to read.
 * @returns A promise that resolves to the text content of the file.
 */
export async function readFileContent(fileHandle: FileSystemFileHandle): Promise<string> {
    const file = await fileHandle.getFile();
    return await file.text();
}

/**
 * Writes text content to a file handle.
 * @param fileHandle The handle of the file to write to.
 * @param content The text content to write.
 */
export async function writeFileContent(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
    // createWritable is a non-standard method, so we cast to any.
    const writable = await (fileHandle as any).createWritable();
    await writable.write(content);
    await writable.close();
}

/**
 * Creates a new, empty file in a given directory.
 * @param directoryHandle The directory to create the file in.
 * @param fileName The name of the new file.
 * @returns The handle of the newly created file.
 */
export async function createNewFile(directoryHandle: FileSystemDirectoryHandle, fileName: string): Promise<FileSystemFileHandle> {
    // getFileHandle is a non-standard method.
    const fileHandle = await (directoryHandle as any).getFileHandle(fileName, { create: true });
    return fileHandle;
}

/**
 * Creates a new sub-directory.
 * @param directoryHandle The directory to create the folder in.
 * @param folderName The name of the new folder.
 * @returns The handle of the newly created folder.
 */
export async function createNewFolder(directoryHandle: FileSystemDirectoryHandle, folderName: string): Promise<FileSystemDirectoryHandle> {
    // getDirectoryHandle is a non-standard method.
    const dirHandle = await (directoryHandle as any).getDirectoryHandle(folderName, { create: true });
    return dirHandle;
}