import type { VFSDirectory, VFSNode, VFSFile } from '../types';

const VFS_STORAGE_KEY = 'bluewhite_vfs';

const createDefaultVFS = (): VFSDirectory => {
    const createContent = (title: string) => `Conteúdo do arquivo de exemplo para ${title}.`;
    const createFile = (name: string, path: string): VFSFile => {
        const content = createContent(name);
        return { name, path: `${path}/${name}`, type: 'file', content, size: content.length };
    };

    const root: VFSDirectory = {
        name: 'C:',
        path: 'C:',
        type: 'directory',
        children: [
            {
                name: 'Users',
                path: 'C:/Users',
                type: 'directory',
                children: [
                    {
                        name: 'Guest',
                        path: 'C:/Users/Guest',
                        type: 'directory',
                        children: [
                            {
                                name: 'Documents',
                                path: 'C:/Users/Guest/Documents',
                                type: 'directory',
                                children: [
                                    createFile('currículo.docx', 'C:/Users/Guest/Documents'),
                                    createFile('relatório financeiro.pdf', 'C:/Users/Guest/Documents'),
                                    { name: 'Projetos', path: 'C:/Users/Guest/Documents/Projetos', type: 'directory', children: [
                                        createFile('plano_de_negócios.pptx', 'C:/Users/Guest/Documents/Projetos'),
                                    ]}
                                ],
                            },
                            {
                                name: 'Downloads',
                                path: 'C:/Users/Guest/Downloads',
                                type: 'directory',
                                children: [
                                    createFile('instalador_app.exe', 'C:/Users/Guest/Downloads'),
                                    createFile('manual_usuario.pdf', 'C:/Users/Guest/Downloads'),
                                ],
                            },
                             {
                                name: 'Pictures',
                                path: 'C:/Users/Guest/Pictures',
                                type: 'directory',
                                children: [
                                    createFile('ferias_2023.jpg', 'C:/Users/Guest/Pictures'),
                                    createFile('logo_empresa.png', 'C:/Users/Guest/Pictures'),
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                name: 'Program Files',
                path: 'C:/Program Files',
                type: 'directory',
                children: [
                     { name: 'Bluewhite AI', path: 'C:/Program Files/Bluewhite AI', type: 'directory', children: [
                        createFile('Blue.exe', 'C:/Program Files/Bluewhite AI'),
                     ]},
                     { name: 'Common Files', path: 'C:/Program Files/Common Files', type: 'directory', children: []},
                ]
            },
            createFile('boot.ini', 'C:'),
        ],
    };
    return root;
};


export const initializeVFS = (): void => {
    if (!localStorage.getItem(VFS_STORAGE_KEY)) {
        const defaultVFS = createDefaultVFS();
        localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(defaultVFS));
    }
};

export const getVFS = (): VFSDirectory => {
    const vfsData = localStorage.getItem(VFS_STORAGE_KEY);
    if (!vfsData) {
        initializeVFS();
        return JSON.parse(localStorage.getItem(VFS_STORAGE_KEY)!);
    }
    return JSON.parse(vfsData);
};

export const searchFileVFS = (filename: string): VFSFile[] => {
    const root = getVFS();
    const results: VFSFile[] = [];
    const lowerFilename = filename.toLowerCase();

    const search = (node: VFSNode) => {
        if (node.type === 'file') {
            if (node.name.toLowerCase().includes(lowerFilename)) {
                results.push(node);
            }
        } else if (node.type === 'directory') {
            node.children.forEach(search);
        }
    };

    search(root);
    return results;
};

export const getNodeFromPath = (path: string): VFSNode | null => {
    const root = getVFS();
    if (path === root.path) return root;

    const parts = path.replace('C:/', 'C:').split('/').slice(1);
    let currentNode: VFSNode = root;

    for (const part of parts) {
        if (currentNode.type === 'directory') {
            const nextNode = currentNode.children.find(child => child.name === part);
            if (nextNode) {
                currentNode = nextNode;
            } else {
                return null; // Path part not found
            }
        } else {
            return null; // Tried to traverse into a file
        }
    }
    return currentNode;
};