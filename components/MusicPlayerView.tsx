import React, { useState, useEffect, useCallback } from 'react';
import { searchYouTubeVideos } from '../services/youtubeService';
import type { YouTubeVideo } from '../types';
import { YouTubeIcon, SearchIcon, PlayIcon, ChevronLeftIcon, ViewsIcon, LikesIcon, ProcessingIcon } from './Icons';

interface MusicPlayerViewProps {
  query: string;
  onClose: () => void;
}

const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(num);
};

const formatDuration = (isoDuration: string) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';
    const hours = parseInt(match[1]?.slice(0, -1) || '0', 10);
    const minutes = parseInt(match[2]?.slice(0, -1) || '0', 10);
    const seconds = parseInt(match[3]?.slice(0, -1) || '0', 10);

    const parts = [];
    if (hours > 0) {
        parts.push(hours);
    }
    parts.push(minutes.toString().padStart(hours > 0 ? 2 : 1, '0'));
    parts.push(seconds.toString().padStart(2, '0'));
    
    return parts.join(':');
};


const VideoCard: React.FC<{ video: YouTubeVideo; onSelect: () => void }> = ({ video, onSelect }) => (
    <div
        onClick={onSelect}
        className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-gray-700/80 hover:scale-105"
    >
        <div className="relative">
            <img src={video.thumbnails.medium.url} alt={video.title} className="w-full h-auto object-cover aspect-video" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="h-12 w-12 text-white/80" />
            </div>
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(video.contentDetails.duration)}
            </span>
        </div>
        <div className="p-3">
            <h3 className="font-semibold text-sm text-gray-200 line-clamp-2 h-10">{video.title}</h3>
            <p className="text-xs text-gray-400 mt-1 truncate">{video.channelTitle}</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(video.statistics.viewCount)} visualizações</p>
        </div>
    </div>
);

const PlayerView: React.FC<{ video: YouTubeVideo; onBack: () => void }> = ({ video, onBack }) => (
    <div className="w-full h-full flex flex-col animate-fade-in p-2">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-blue-300 hover:underline mb-3 self-start">
            <ChevronLeftIcon />
            <span>Voltar para os resultados</span>
        </button>
        <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg shadow-2xl border border-blue-500/30">
             <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
        <div className="w-full max-w-4xl mx-auto mt-4 text-left overflow-y-auto pr-2">
            <h2 className="text-xl font-bold text-gray-100">{video.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{video.channelTitle}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                <span className="flex items-center"><ViewsIcon className="mr-1.5" /> {formatNumber(video.statistics.viewCount)} visualizações</span>
                <span className="flex items-center"><LikesIcon className="mr-1.5" /> {formatNumber(video.statistics.likeCount)} likes</span>
            </div>
            <p className="text-xs text-gray-300 mt-3 whitespace-pre-wrap">{video.description}</p>
        </div>
    </div>
);


export const MusicPlayerView: React.FC<MusicPlayerViewProps> = ({ query, onClose }) => {
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [results, setResults] = useState<YouTubeVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setSelectedVideo(null);
        setResults([]);
        const videos = await searchYouTubeVideos(q);
        setResults(videos);
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query, performSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    if (selectedVideo) {
        return <PlayerView video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
    }

    return (
        <div className="w-full h-full bg-slate-900/50 rounded-lg p-4 flex flex-col animate-fade-in">
            <header className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 mb-4">
                 <h2 className="text-2xl font-bold text-gray-200 flex items-center">
                    <YouTubeIcon className="mr-2" />
                    <span>YouTube Search</span>
                </h2>
                <form onSubmit={handleSearch} className="w-full sm:w-1/2 flex items-center space-x-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pesquisar vídeos..."
                        aria-label="Campo de pesquisa do YouTube"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-md p-2">
                        <SearchIcon />
                    </button>
                </form>
                 <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Fechar</button>
            </header>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {isLoading && (
                     <div className="flex items-center justify-center h-full">
                        <ProcessingIcon />
                    </div>
                )}
                {!isLoading && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.map(video => (
                            <VideoCard key={video.id} video={video} onSelect={() => setSelectedVideo(video)} />
                        ))}
                    </div>
                )}
                {!isLoading && results.length === 0 && query && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Nenhum resultado encontrado para "{query}". Tente uma nova busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};