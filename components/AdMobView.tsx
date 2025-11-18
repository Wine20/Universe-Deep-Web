import React, { useState, useEffect, useCallback } from 'react';
import type { AdMobMetrics, AdMobApp } from '../types';
import { ChartBarIcon, GoogleIcon, ProcessingIcon } from './Icons';
import { initAdSenseClient, signIn, signOut, getIsSignedIn, getWeeklyReport, getAppsReport } from '../services/adsenseService';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
    </div>
);

const RevenueChart: React.FC<{ data: AdMobMetrics[] }> = ({ data }) => {
    if (data.length === 0) return <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-center h-full"><p className="text-gray-500">Dados insuficientes para o gráfico.</p></div>
    const maxRevenue = Math.max(...data.map(d => d.revenue), 0.01);
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
             <h4 className="text-md font-semibold text-gray-200 mb-4">Receita por Dia (Últimos 7 dias)</h4>
             <div className="flex justify-around items-end h-48 space-x-2">
                {data.map(item => (
                    <div key={item.day} className="flex flex-col items-center flex-grow">
                        <div className="w-full bg-blue-500 rounded-t-md hover:bg-blue-400 transition-colors" style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}></div>
                        <p className="text-xs text-gray-400 mt-1">{item.day}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdMobView: React.FC = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weeklyData, setWeeklyData] = useState<AdMobMetrics[]>([]);
    const [appsData, setAppsData] = useState<AdMobApp[]>([]);
    const [totals, setTotals] = useState({ earnings: 0, impressions: 0, ecpm: 0 });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [weekly, apps] = await Promise.all([getWeeklyReport(), getAppsReport()]);
            setWeeklyData(weekly);
            setAppsData(apps);

            const totalEarnings = apps.reduce((sum, app) => sum + app.earnings, 0);
            const totalImpressions = apps.reduce((sum, app) => sum + app.impressions, 0);
            const ecpm = totalImpressions > 0 ? (totalEarnings / totalImpressions) * 1000 : 0;
            setTotals({ earnings: totalEarnings, impressions: totalImpressions, ecpm });
        } catch (e: any) {
             setError(e.message || "Ocorreu um erro ao buscar os dados do AdSense.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initAdSenseClient().then(() => {
            const signedIn = getIsSignedIn();
            setIsSignedIn(signedIn);
            if (signedIn) {
                fetchData();
            } else {
                setIsLoading(false);
            }
        }).catch(err => {
            setError("Falha ao inicializar o cliente do Google. Verifique o console para mais detalhes.");
            setIsLoading(false);
        });
    }, [fetchData]);

    const handleSignIn = async () => {
        try {
            await signIn();
            setIsSignedIn(true);
            fetchData();
        } catch (e) {
            setError("Falha ao fazer login. Por favor, tente novamente.");
            console.error(e);
        }
    };
    
    const handleSignOut = () => {
        signOut();
        setIsSignedIn(false);
        setWeeklyData([]);
        setAppsData([]);
        setTotals({ earnings: 0, impressions: 0, ecpm: 0 });
    }
    
    const renderConnectView = () => (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <ChartBarIcon className="h-16 w-16 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-200">Conecte sua Conta do Google AdSense</h3>
            <p className="text-gray-400 max-w-sm mt-2 mb-6">Para visualizar seus relatórios de monetização, autorize o acesso à sua conta do AdSense.</p>
            <button
                onClick={handleSignIn}
                className="flex items-center space-x-2 bg-white text-gray-800 font-semibold rounded-lg px-6 py-3 hover:bg-gray-200 transition-colors"
            >
                <GoogleIcon />
                <span>Conectar com o Google</span>
            </button>
        </div>
    );
    
    const renderLoading = () => (
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <ProcessingIcon />
            <p className="mt-4 text-gray-400">Buscando dados do AdSense...</p>
        </div>
    );

    const renderError = () => (
        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300 font-semibold">Ocorreu um Erro</p>
            <p className="text-red-400 mt-2 text-sm max-w-md">{error}</p>
            <button onClick={handleSignIn} className="mt-4 bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2 text-sm font-semibold">
                Tentar Novamente
            </button>
        </div>
    );
    
    const renderDashboard = () => (
        <>
            <div className="flex-shrink-0 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-gray-200 flex items-center">
                    <ChartBarIcon className="h-7 w-7 mr-3" />
                    Painel de Monetização
                </h2>
                <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-white hover:underline">Desconectar</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <KpiCard title="Ganhos Estimados (30d)" value={formatCurrency(totals.earnings)} />
                <KpiCard title="Impressões (30d)" value={formatNumber(totals.impressions)} />
                <KpiCard title="eCPM (30d)" value={formatCurrency(totals.ecpm)} />
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                <RevenueChart data={weeklyData} />

                <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col">
                     <h4 className="text-md font-semibold text-gray-200 mb-2 flex-shrink-0">Desempenho por App (Últimos 30 dias)</h4>
                     <div className="flex-grow overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400">
                                    <th className="p-2">App</th>
                                    <th className="p-2 text-right">Ganhos</th>
                                    <th className="p-2 text-right">Impressões</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appsData.length > 0 ? appsData.map(app => (
                                    <tr key={app.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-2">
                                            <p className="font-semibold text-gray-200">{app.name}</p>
                                            <p className="text-xs text-gray-500">{app.platform}</p>
                                        </td>
                                        <td className="p-2 text-right font-mono text-green-400">{formatCurrency(app.earnings)}</td>
                                        <td className="p-2 text-right font-mono text-gray-300">{formatNumber(app.impressions)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center p-4 text-gray-500">Nenhum dado de aplicativo encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="w-full h-full bg-black/20 rounded-lg p-6 flex flex-col animate-fade-in space-y-4">
            {isLoading ? renderLoading() : 
             error ? renderError() :
             isSignedIn ? renderDashboard() :
             renderConnectView()}
        </div>
    );
};
