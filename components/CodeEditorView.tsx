import React, { useState, useEffect, useCallback } from 'react';
import { CodeIcon, ProjectIcon, FileIcon, ProcessingIcon } from './Icons';
import type { CodeProject, ProjectFile } from '../types';
import { getProjects, addProject, updateProject } from '../services/projectService';

interface CodeEditorViewProps {
  userId: string | null;
  initialCode: string;
  projectNameFromAI: string;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({ userId, initialCode, projectNameFromAI }) => {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProjectCreated, setIsAiProjectCreated] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      getProjects(userId).then(cloudProjects => {
        setProjects(cloudProjects);
        if (cloudProjects.length > 0) {
          setActiveProjectId(cloudProjects[0].id);
        }
        setIsLoading(false);
      });
    } else {
      setProjects([]);
      setActiveProjectId(null);
      setIsLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
      setIsAiProjectCreated(false);
  }, [initialCode, projectNameFromAI]);

  useEffect(() => {
    const handleAiProject = async (name: string, files: ProjectFile[], isProject: boolean) => {
        if (!userId) return;
        const newProjectData = { name, files };
        const newProject = await addProject(userId, newProjectData);
        if (newProject) {
            setProjects(prev => [newProject, ...(isProject ? prev.filter(p => p.name !== name) : prev)]);
            setActiveProjectId(newProject.id);
        }
    };
    
    if (initialCode && userId && !isAiProjectCreated) {
        setIsAiProjectCreated(true);
        if (projectNameFromAI) {
            try {
                const files = JSON.parse(initialCode) as ProjectFile[];
                if (Array.isArray(files) && files.every(f => 'name' in f && 'content' in f)) {
                    handleAiProject(projectNameFromAI, files, true);
                }
            } catch (e) { console.error("Failed to parse AI project files:", e) }
        } else {
            const newFile: ProjectFile = { name: 'index.html', content: initialCode };
            handleAiProject('Projeto Gerado', [newFile], false);
        }
    }
  }, [initialCode, projectNameFromAI, userId, isAiProjectCreated]);


  const activeProject = projects.find(p => p.id === activeProjectId);
  
  useEffect(() => {
    if (activeProject) {
        if (activeProject.files.length > 0) {
            const currentFileExists = activeProject.files.some(f => f.name === activeFile);
            const fileToSelect = currentFileExists && activeFile ? activeFile : activeProject.files[0].name;
            setActiveFile(fileToSelect);
        } else {
            setActiveFile(null);
            setCode('');
        }
    } else {
        setActiveFile(null);
        setCode('');
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
      if (activeProject && activeFile) {
          const file = activeProject.files.find(f => f.name === activeFile);
          setCode(file?.content || '');
      } else if (!activeFile) {
          setCode('');
      }
  }, [activeFile, activeProject]);

  const handleFileContentChange = (newContent: string) => {
    setCode(newContent);
    setProjects(projects.map(p => {
        if (p.id === activeProjectId) {
            return {
                ...p,
                files: p.files.map(f => f.name === activeFile ? { ...f, content: newContent } : f),
            };
        }
        return p;
    }));
  };
  
  const handleSaveCurrentProject = async () => {
    if (!userId || !activeProject) return;
    setIsSaving(true);
    const projectToSave = { ...activeProject };
    await updateProject(userId, projectToSave);
    setProjects(projects.map(p => 
        p.id === activeProjectId ? {...p, lastModified: Date.now()} : p
    ).sort((a,b) => b.lastModified - a.lastModified));
    setIsSaving(false);
  };

  const handleRunCode = () => {
    const htmlFile = activeProject?.files.find(f => f.name.endsWith('.html'));
    setPreviewContent(htmlFile?.content || '<h3>Nenhum arquivo HTML encontrado para visualização.</h3>');
  };

  const handleCreateProject = async () => {
      if (!userId) return;
      const newProjectName = prompt("Digite o nome do novo projeto:", `Novo Projeto ${projects.length + 1}`);
      if (newProjectName) {
          const newProjectData: Omit<CodeProject, 'id' | 'lastModified'> = {
              name: newProjectName,
              files: [{name: 'index.html', content: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Olá, Mundo!</h1>\n  </body>\n</html>'}],
          };
          const newProject = await addProject(userId, newProjectData);
          if (newProject) {
            setProjects([newProject, ...projects]);
            setActiveProjectId(newProject.id);
          }
      }
  }
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
          <ProcessingIcon />
          <p className="ml-3">Carregando projetos...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black/20 rounded-lg flex flex-col lg:flex-row animate-fade-in">
        <div className="w-full lg:w-1/4 h-auto lg:h-full bg-gray-900/50 rounded-t-lg lg:rounded-tr-none lg:rounded-l-lg p-2 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-300 p-2">Projetos</h3>
            <button onClick={handleCreateProject} disabled={!userId} className="bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 text-sm font-semibold mb-2 disabled:bg-gray-600 disabled:cursor-not-allowed">Novo Projeto</button>
            <select aria-label="Selecionar projeto" value={activeProjectId || ''} onChange={e => setActiveProjectId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mb-2 text-white">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex-grow overflow-y-auto max-h-40 lg:max-h-full">
                {activeProject?.files.map(file => (
                    <button key={file.name} onClick={() => setActiveFile(file.name)} className={`w-full text-left p-2 rounded-md flex items-center space-x-2 ${activeFile === file.name ? 'bg-blue-500/30' : 'hover:bg-gray-700/50'}`}>
                        <FileIcon className="h-4 w-4" />
                        <span>{file.name}</span>
                    </button>
                ))}
            </div>
        </div>
        <div className="w-full lg:w-3/4 h-full p-2 flex flex-col space-y-2">
            <div className="flex flex-col md:flex-row w-full h-full space-y-2 md:space-y-0 md:space-x-2">
                <div className="flex flex-col w-full md:w-1/2 space-y-2 h-1/2 md:h-full">
                    <div className="flex justify-between items-center flex-shrink-0">
                        <h3 className="text-lg font-semibold text-gray-300 flex items-center"><CodeIcon className="h-5 w-5 mr-2"/> Editor</h3>
                        <div className="flex space-x-2">
                            <button onClick={handleSaveCurrentProject} disabled={isSaving || !activeProject} className="bg-gray-600 hover:bg-gray-500 rounded-md px-4 py-1.5 text-sm font-semibold disabled:bg-gray-500 disabled:cursor-wait">
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button onClick={handleRunCode} disabled={!activeProject} className="bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-1.5 text-sm font-semibold disabled:bg-gray-600">
                                Executar
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => handleFileContentChange(e.target.value)}
                        className="w-full flex-grow bg-gray-900 border border-gray-700 rounded-md p-3 font-mono text-sm text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder={userId ? "Selecione um projeto e um arquivo para começar." : "Faça login para criar e ver seus projetos."}
                        spellCheck="false"
                        aria-label="Editor de código"
                        disabled={!activeFile}
                    />
                </div>
                
                <div className="flex flex-col w-full md:w-1/2 space-y-2 h-1/2 md:h-full">
                    <h3 className="text-lg font-semibold text-gray-300 flex-shrink-0">Visualização</h3>
                    <div className="flex-grow border border-gray-700 rounded-md overflow-hidden bg-white">
                        <iframe
                            srcDoc={previewContent}
                            className="w-full h-full border-0"
                            title="Visualização de Código"
                            sandbox="allow-scripts allow-same-origin"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};