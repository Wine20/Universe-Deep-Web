
import React, { useState, useEffect, useCallback } from 'react';
import { connectToDirectory, getDirectoryContents, checkPermissions, readFileContent, writeFileContent, createNewFile, createNewFolder } from '../services/nativeFileSystem';
import { initDriveClient, signInToDrive, signOutFromDrive, listDriveFiles, getIsSignedIn } from '../services/googleDriveService';
import type { NativeFSNode, NativeFSFile, GoogleDriveNode } from '../types';
import { FolderIcon, FileIconV2, FileExplorerIcon, ProcessingIcon, GoogleDriveIcon } from './Icons';

type FileSource = 'local' | 'gdrive' | null;

// Helper to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileExplorerView: React.FC = () => {
    const [source, setSource] = useState<FileSource>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for Local File System
    const [rootDirectoryHandle, setRootDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [contents, setContents] = useState<NativeFSNode[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);

    // State for Google Drive
    const [gdriveSignedIn, setGdriveSignedIn] = useState(false);
    const [gdriveContents, setGdriveContents] = useState<GoogleDriveNode[]>([]);
    const [gdriveCurrentPath, setGdriveCurrentPath] = useState<string[]>([]);

    // State for file editor (local only)
    const [editingFileHandle, setEditingFileHandle] = useState<FileSystemFileHandle | null>(null);
    const [editingFileContent, setEditingFileContent] = useState<string>('');
    const [isEditorLoading, setIsEditorLoading] = useState<boolean>(false);

    // --- Local File System Logic ---
    const loadLocalDirectory = useCallback(async (rootHandle: FileSystemDirectoryHandle, path: string[] = []) => {
        setIsLoading(true);
        setError(null);
        try {
            let currentHandle = rootHandle;
            for (const part of path) {
                currentHandle = await (currentHandle as any).getDirectoryHandle(part);
            }
            const dirContents = await getDirectoryContents(currentHandle);
            setContents(dirContents);
            setCurrentPath(path);
        } catch (e: any) {
            console.error("Error loading directory:", e);
            setError(`Não foi possível carregar o diretório: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- Google Drive Logic ---
    const loadDriveDirectory = useCallback(async (path: string[] = []) => {
        setIsLoading(true);
        setError(null);
        try {
            const files = await listDriveFiles(path);
            setGdriveContents(files);
            setGdriveCurrentPath(path);
        } catch (e: any) {
            console.error("Error listing Drive files:", e);
            setError(`Não foi possível listar os arquivos do Drive: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // --- Effects ---
    useEffect(() => {
        // Init Google Drive client on mount
        initDriveClient().catch(err => {
            console.error("Failed to initialize Google Drive client:", err);
            setError("Não foi possível carregar a integração com o Google Drive.");
        });
        
        // Check for existing local directory permissions
        checkPermissions().then(handle => {
            if(handle) {
                 setRootDirectoryHandle(handle);
                 setSource('local');
                 loadLocalDirectory(handle);
            } else {
                setIsLoading(false);
            }
        });
    }, [loadLocalDirectory]);

    // --- Event Handlers ---
    const handleConnectLocal = async () => {
        const handle = await connectToDirectory();
        if (handle) {
            setRootDirectoryHandle(handle);
            setSource('local');
            loadLocalDirectory(handle);
        }
    };
    
    const handleDriveConnect = async () => {
        setIsLoading(true);
        try {
            await signInToDrive();
            setGdriveSignedIn(true);
            setSource('gdrive');
            loadDriveDirectory();
        } catch(e: any) {
            console.error("Drive sign-in error:", e);
            setError("Falha ao conectar ao Google Drive. Verifique o popup e tente novamente.");
            setIsLoading(false);
        }
    };

    const handleDriveDisconnect = () => {
        signOutFromDrive();
        setGdriveSignedIn(false);
        setSource(null);
        setGdriveContents([]);
        setGdriveCurrentPath([]);
    }

    const handleNodeDoubleClick = async (node: NativeFSNode | GoogleDriveNode) => {
        if (source === 'local' && rootDirectoryHandle) {
            const localNode = node as NativeFSNode;
            if (localNode.kind === 'directory') {
                loadLocalDirectory(rootDirectoryHandle, [...currentPath, localNode.name]);
            } else if (localNode.kind === 'file') {
                 const isEditable = /\.(txt|md|json|js|ts|html|css|jsx|tsx|py|c|cpp|java|go|rs|rb|php|log|xml|yaml|yml|toml)$/i.test(localNode.name);
                if (isEditable) {
                    setIsEditorLoading(true);
                    setEditingFileHandle(localNode.handle as FileSystemFileHandle);
                    try {
                        const content = await readFileContent(localNode.handle as FileSystemFileHandle);
                        setEditingFileContent(content);
                    } catch (e: any) {
                        setError(`Não foi possível ler o conteúdo do arquivo: ${e.message}`);
                        setEditingFileHandle(null);
                    } finally {
                        setIsEditorLoading(false);
                    }
                } else {
                    alert("A edição deste tipo de arquivo ainda não é suportada.");
                }
            }
        } else if (source === 'gdrive') {
            const driveNode = node as GoogleDriveNode;
            if (driveNode.kind === 'folder') {
                loadDriveDirectory([...gdriveCurrentPath, driveNode.name]);
            } else {
                alert(`Visualização do arquivo '${driveNode.name}' não implementada nesta simulação.`);
            }
        }
    };
    
    const handleBreadcrumbClick = (index: number) => {
        if (source === 'local' && rootDirectoryHandle) {
            loadLocalDirectory(rootDirectoryHandle, currentPath.slice(0, index + 1));
        } else if (source === 'gdrive') {
            loadDriveDirectory(gdriveCurrentPath.slice(0, index + 1));
        }
    }
    
    const goBack = () => {
        if (source === 'local' && currentPath.length > 0 && rootDirectoryHandle) {
            loadLocalDirectory(rootDirectoryHandle, currentPath.slice(0, -1));
        } else if (source === 'gdrive' && gdriveCurrentPath.length > 0) {
            loadDriveDirectory(gdriveCurrentPath.slice(0, -1));
        }
    }
    
    // --- Local FS specific actions ---
    const handleSaveFile = async () => {
        if (!editingFileHandle) return;
        setIsEditorLoading(true);
        try {
            await writeFileContent(editingFileHandle, editingFileContent);
        } catch (e: any) {
            setError(`Não foi possível salvar o arquivo: ${e.message}`);
        } finally {
            setIsEditorLoading(false);
        }
    };
     const handleNewFile = async () => {
        const currentHandle = await getCurrentDirectoryHandle();
        if (!currentHandle) return;
        const fileName = prompt("Digite o nome do novo arquivo (ex: notas.txt):");
        if (fileName?.trim()) {
            await createNewFile(currentHandle, fileName.trim());
            loadLocalDirectory(rootDirectoryHandle!, currentPath);
        }
    };
    const handleNewFolder = async () => {
        const currentHandle = await getCurrentDirectoryHandle();
        if (!currentHandle) return;
        const folderName = prompt("Digite o nome da nova pasta:");
        if (folderName?.trim()) {
            await createNewFolder(currentHandle, folderName.trim());
            loadLocalDirectory(rootDirectoryHandle!, currentPath);
        }
    };
    const getCurrentDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
        if (!rootDirectoryHandle) return null;
        let currentHandle = rootDirectoryHandle;
        for (const part of currentPath) {
            currentHandle = await (currentHandle as any).getDirectoryHandle(part);
        }
        return currentHandle;
    }
    const closeEditor = () => {
        setEditingFileHandle(null);
        setEditingFileContent('');
        setError(null);
    };

    // --- RENDER LOGIC ---

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center">
                <ProcessingIcon />
                <p className="ml-3">Carregando...</p>
            </div>
        )
    }

    if (isEditorLoading) {
         return (
            <div className="w-full h-full flex items-center justify-center text-center">
                <ProcessingIcon />
                <p className="ml-3">Processando arquivo...</p>
            </div>
        )
    }

    if (editingFileHandle) {
        return (
            <div className="w-full h-full bg-black/20 rounded-lg p-4 flex flex-col animate-fade-in space-y-3">
                <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-200 truncate">Editando: <span className="text-blue-300">{editingFileHandle.name}</span></h3>
                    <div className="space-x-2 flex-shrink-0">
                        <button onClick={handleSaveFile} className="bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-1.5 text-sm font-semibold">Salvar</button>
                        <button onClick={closeEditor} className="bg-gray-600 hover:bg-gray-500 rounded-md px-4 py-1.5 text-sm font-semibold">Voltar</button>
                    </div>
                </div>
                <textarea
                    value={editingFileContent}
                    onChange={(e) => setEditingFileContent(e.target.value)}
                    className="w-full flex-grow bg-gray-900 border border-gray-700 rounded-md p-3 font-mono text-sm text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    spellCheck="false"
                    aria-label="Editor de arquivo"
                />
            </div>
        );
    }

    if (!source) {
        return (
            <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center animate-fade-in space-y-6">
                <FileExplorerIcon className="h-20 w-20 text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-200">Explorador de Arquivos</h2>
                <p className="text-gray-400 max-w-md">
                    Conecte-se a uma pasta local no seu computador ou ao seu Google Drive para gerenciar seus arquivos.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                     <button
                        onClick={handleConnectLocal}
                        className="bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-3 font-semibold text-lg transition-colors"
                    >
                        Conectar a uma Pasta Local
                    </button>
                    <button
                        onClick={handleDriveConnect}
                        className="bg-white hover:bg-gray-200 text-gray-800 font-semibold rounded-lg px-6 py-3 text-lg transition-colors flex items-center space-x-2"
                    >
                        <GoogleDriveIcon className="h-6 w-6"/>
                        <span>Conectar ao Google Drive</span>
                    </button>
                </div>
                 <p className="text-xs text-gray-500 max-w-sm pt-4">
                    Sua privacidade é importante. O acesso é limitado apenas à pasta que você selecionar ou aos dados do Drive que você autorizar, e é controlado pelo seu navegador.
                </p>
            </div>
        );
    }
    
    const items = source === 'local' ? [...contents] : [...gdriveContents];
    items.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'folder' || a.kind === 'directory' ? -1 : 1;
    });

    const path = source === 'local' ? currentPath : gdriveCurrentPath;
    const rootName = source === 'local' ? rootDirectoryHandle?.name : 'Meu Drive';

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-4 flex flex-col animate-fade-in space-y-3">
             <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-1 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-md overflow-x-auto">
                    <button onClick={() => source === 'local' ? loadLocalDirectory(rootDirectoryHandle!, []) : loadDriveDirectory()} className="hover:underline font-semibold flex-shrink-0 flex items-center space-x-1.5">
                        {source === 'gdrive' && <GoogleDriveIcon className="h-4 w-4" />}
                        <span>{rootName}</span>
                    </button>
                    {path.map((part, index) => (
                        <React.Fragment key={index}>
                            <span className="flex-shrink-0">/</span>
                            <button onClick={() => handleBreadcrumbClick(index)} className="hover:underline flex-shrink-0">{part}</button>
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    {source === 'local' && (
                        <>
                            <button onClick={handleNewFile} className="bg-gray-600 hover:bg-gray-500 rounded-md px-3 py-1.5 text-xs font-semibold">Novo Arquivo</button>
                            <button onClick={handleNewFolder} className="bg-gray-600 hover:bg-gray-500 rounded-md px-3 py-1.5 text-xs font-semibold">Nova Pasta</button>
                        </>
                    )}
                     {source === 'gdrive' && <button onClick={handleDriveDisconnect} className="bg-gray-600 hover:bg-gray-500 rounded-md px-3 py-1.5 text-xs font-semibold">Desconectar</button>}
                </div>
            </div>
            <div className="flex-grow border border-gray-700 rounded-md overflow-y-auto p-2 bg-gray-900/30">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="p-2">Nome</th>
                            <th className="p-2 hidden md:table-cell">Tipo</th>
                            <th className="p-2 hidden md:table-cell">Tamanho</th>
                        </tr>
                    </thead>
                    <tbody>
                         {path.length > 0 && (
                            <tr onDoubleClick={goBack} className="hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <td className="p-2 flex items-center space-x-2">
                                    <FolderIcon className="h-5 w-5 text-yellow-400" /> <span>..</span>
                                </td>
                                <td className="p-2 hidden md:table-cell">Pasta Pai</td>
                                <td className="p-2 hidden md:table-cell">--</td>
                            </tr>
                        )}
                        {items.map(node => (
                             <tr key={node.name} onDoubleClick={() => handleNodeDoubleClick(node)} className={'cursor-pointer hover:bg-gray-700/50 transition-colors'}>
                                <td className="p-2 flex items-center space-x-2">
                                    {node.kind === 'directory' || node.kind === 'folder'
                                        ? <FolderIcon className="h-5 w-5 text-yellow-400" /> 
                                        : <FileIconV2 className="h-5 w-5 text-gray-300" />
                                    }
                                    <span className="truncate">{node.name}</span>
                                </td>
                                <td className="p-2 hidden md:table-cell text-gray-300">
                                    {node.kind === 'directory' || node.kind === 'folder' ? 'Pasta' : (source === 'gdrive' ? (node as GoogleDriveNode).mimeType : 'Arquivo')}
                                </td>
                                <td className="p-2 hidden md:table-cell text-gray-300">
                                    {node.kind === 'file' && source === 'local' ? formatFileSize((node as NativeFSFile).size) : '--'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {error && <p className="text-red-400 p-4 text-center">{error}</p>}
                 {items.length === 0 && !error && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Esta pasta está vazia.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};
