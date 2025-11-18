import type { Part } from "@google/genai";

export type Role = 'user' | 'model';

export interface ExecutableCode {
  language: 'PYTHON';
  code: string;
}

export interface ToolCodeOutput {
  outputs: { stdout?: string; }[];
}

export interface ChatMessage {
  role: Role;
  text: string;
  sources?: { uri: string; title: string }[];
  executableCode?: ExecutableCode;
  toolCodeOutput?: ToolCodeOutput;
}

export type Intent = 'CLEAN' | 'SCAN_VIRUS' | 'OPTIMIZE' | 'OPEN_APP' | 'GREETING' | 'UNKNOWN' | 'WRITE_DOCUMENT' | 'INSTALL_APP' | 'GENERAL_QUERY' | 'BROWSE_WEB' | 'GENERATE_CODE' | 'CONNECT_TO_NETWORK' | 'CLOSE_ACTION' | 'CREATE_PROJECT' | 'DEPLOY_PROJECT' | 'SEARCH_FILES' | 'OPEN_FILE_EXPLORER' | 'SCAN_DRIVERS' | 'SYSTEM_SETUP' | 'CREATE_SCRIPT' | 'SWITCH_MODE' | 'SEARCH_WEB_FOR_ANSWER';

export interface AIResponse {
  intent: string;
  response: string;
  appName?: string;
  content?: string;
  url?: string;
  mode?: AppMode;
  groundingMetadata?: any; // To receive from search
  functionCalls?: any[]; // For Gemini Function Calling
}

// Represents a part of a Gemini response
export interface ResponsePart extends Part {}

export interface GeminiResponse {
    text: string;
    functionCalls?: any[]; // from @google/genai FunctionCall
    parts?: ResponsePart[];
}


export interface Action {
    intent: Intent;
    appName?: string;
    content?: string;
    url?: string;
}

export type AppStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'acting';

export type AppMode = 'ASSISTANT' | 'BROWSER' | 'CODE_EDITOR' | 'NETWORK' | 'LOGIN' | 'DEPLOY' | 'FILE_EXPLORER' | 'DRIVERS' | 'SETUP' | 'SCRIPT_WRITER' | 'EMAIL' | 'ANALYZER' | 'VOICE_CHAT' | 'YOUTUBE_VIEW' | 'INSTALLER_CREATOR' | 'CALENDAR' | 'ADMOB' | 'FACEBOOK_ADS' | 'SYSTEM_ANALYZER' | 'MAP';

// Types for Script Writer
export interface Scene {
    title: string;
    description: string;
}

export interface Script {
    title: string;
    logline: string;
    scenes: Scene[];
}

export interface ProjectFile {
    name: string;
    content: string;
}

export interface CodeProject {
    id: string;
    name: string;
    files: ProjectFile[];
    lastModified: number;
}

// Types for virtual file system
export type VFSNode = VFSFile | VFSDirectory;

export interface VFSBase {
    name: string;
    path: string;
}

export interface VFSFile extends VFSBase {
    type: 'file';
    content: string;
    size: number; // in bytes
}

export interface VFSDirectory extends VFSBase {
    type: 'directory';
    children: VFSNode[];
}

// Types for Native File System Access API
export type NativeFSNode = NativeFSFile | NativeFSDirectory;

export interface NativeFSBase {
    name: string;
    kind: 'file' | 'directory';
    handle: FileSystemHandle;
}

export interface NativeFSFile extends NativeFSBase {
    kind: 'file';
    handle: FileSystemFileHandle;
    size: number;
    lastModified: number;
}

export interface NativeFSDirectory extends NativeFSBase {
    kind: 'directory';
    handle: FileSystemDirectoryHandle;
}

// Types for hardware and drivers
export interface DriverInfo {
    id: string;
    name: string;
    version: string;
    releaseDate: string;
    status: 'up_to_date' | 'outdated';
    latestVersion?: string;
}

export interface HardwareComponent {
    id:string;
    type: 'CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'Audio' | 'Network';
    name: string;
    driver: DriverInfo;
}

// Types for Email
export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  unread: boolean;
  timestamp: string;
}

// Types for Voice Chat
export type VoiceSessionStatus = 'idle' | 'connecting' | 'active' | 'error' | 'stopped';

export interface TranscriptionTurn {
    user: string;
    model: string;
    timestamp: number;
}

// Types for YouTube View
export interface YouTubeVideoThumbnail {
    url: string;
    width: number;
    height: number;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
        default: YouTubeVideoThumbnail;
        medium: YouTubeVideoThumbnail;
        high: YouTubeVideoThumbnail;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
    };
    contentDetails: {
        duration: string;
    };
}

// Types for PC Builder
export interface PCBuildComponent {
    type: string; // e.g., 'CPU', 'GPU'
    name: string; // e.g., 'Intel Core i5-13600K'
    reasoning: string; // e.g., 'Great value for gaming and productivity.'
}

export interface PCBuild {
    title: string; // e.g., 'Mid-Range Gaming PC'
    purpose: string; // e.g., 'Gaming in 1440p'
    totalPrice: string; // e.g., 'R$ 7500'
    components: PCBuildComponent[];
}

// Types for Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

// Types for AdMob View
export interface AdMobMetrics {
    day: string;
    revenue: number;
}

export interface AdMobApp {
    id: string;
    name: string;
    platform: 'Android' | 'iOS';
    earnings: number;
    impressions: number;
    requests: number;
}

// Types for Map View
export interface MapPlace {
    uri: string;
    title: string;
}

export interface MapResult {
    text: string;
    places: MapPlace[];
}

// Types for Google Drive
export interface GoogleDriveNode {
    id: string;
    name: string;
    kind: 'file' | 'folder';
    mimeType?: string;
}
