import { GOOGLE_CLIENT_ID } from '../config';
import type { AdMobMetrics, AdMobApp } from '../types';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const DISCOVERY_DOC = 'https://adsense.googleapis.com/$discovery/rest?version=v2';
const SCOPES = 'https://www.googleapis.com/auth/adsense.readonly';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

const initGapiClient = () => new Promise<void>((resolve, reject) => {
    window.gapi.load('client', async () => {
        try {
            await window.gapi.client.init({
                clientId: GOOGLE_CLIENT_ID,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

const initGisClient = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // The callback is handled by the promise
    });
    gisInited = true;
};

export const initAdSenseClient = async () => {
    if (gapiInited && gisInited) return;

    await new Promise<void>((resolve) => {
        const checkGis = () => {
            if (window.google) {
                initGisClient();
                resolve();
            } else {
                setTimeout(checkGis, 100);
            }
        };
        checkGis();
    });
    
    await new Promise<void>((resolve) => {
         const checkGapi = () => {
            if (window.gapi) {
                initGapiClient().then(resolve);
            } else {
                setTimeout(checkGapi, 100);
            }
        };
        checkGapi();
    });
};

export const signIn = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            return reject(new Error("AdSense client not initialized."));
        }

        const callback = (resp: any) => {
            if (resp.error) {
                reject(resp);
            } else {
                resolve();
            }
        };

        if (window.gapi.client.getToken() === null) {
            tokenClient.callback = callback;
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            resolve();
        }
    });
};

export const signOut = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null);
        });
    }
};

export const getIsSignedIn = (): boolean => {
    return window.gapi?.client?.getToken() !== null;
};

const getAdSenseAccount = async (): Promise<string | null> => {
    try {
        const response = await window.gapi.client.adsense.accounts.list({});
        if (response.result.accounts && response.result.accounts.length > 0) {
            // Find the first active, open account to prevent errors with closed accounts.
            const openAccount = response.result.accounts.find((acc: any) => acc.state === 'OPEN');
            if (openAccount) {
                return openAccount.name;
            }
        }
        return null;
    } catch (e) {
        console.error("Error fetching AdSense accounts:", e);
        throw new Error("Não foi possível encontrar uma conta do AdSense válida. Verifique se você está logado na conta correta e tem as permissões necessárias.");
    }
};

export const getWeeklyReport = async (): Promise<AdMobMetrics[]> => {
    const account = await getAdSenseAccount();
    if (!account) throw new Error("Conta do AdSense não encontrada.");
    
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6); // 7 days including today
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const response = await window.gapi.client.adsense.accounts.reports.generate({
        parent: account,
        dateRange: 'CUSTOM',
        'startDate.year': lastWeek.getFullYear(),
        'startDate.month': lastWeek.getMonth() + 1,
        'startDate.day': lastWeek.getDate(),
        'endDate.year': today.getFullYear(),
        'endDate.month': today.getMonth() + 1,
        'endDate.day': today.getDate(),
        metrics: ['ESTIMATED_EARNINGS'],
        dimensions: ['DATE'],
    });

    if (!response.result.rows) return [];

    const headers = response.result.headers.map((h: any) => h.name);
    const dateIndex = headers.indexOf('DATE');
    const revenueIndex = headers.indexOf('ESTIMATED_EARNINGS');

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const reportData = response.result.rows.map((row: any) => {
        const dateStr = row.cells[dateIndex].value as string;
        const date = new Date(dateStr);
        const dayOfWeek = new Date(date.getTime() + date.getTimezoneOffset() * 60000).getDay();
        const revenueValue = parseFloat(String(row.cells[revenueIndex]?.value ?? '0'));
        return {
            day: dayNames[dayOfWeek],
            revenue: isNaN(revenueValue) ? 0 : revenueValue
        };
    });

    // Ensure we have 7 days, even if some have 0 revenue
    const metricsMap = new Map(reportData.map(d => [d.day, d.revenue]));
    const fullWeekData: AdMobMetrics[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayName = dayNames[date.getDay()];
        if (!fullWeekData.some(d => d.day === dayName)) {
            const revenueFromMap = metricsMap.get(dayName);
            fullWeekData.push({
                day: dayName,
                revenue: typeof revenueFromMap === 'number' ? revenueFromMap : 0,
            });
        }
    }

    return fullWeekData.reverse();
};

export const getAppsReport = async (): Promise<AdMobApp[]> => {
    const account = await getAdSenseAccount();
    if (!account) throw new Error("Conta do AdSense não encontrada.");

    const response = await window.gapi.client.adsense.accounts.reports.generate({
        parent: account,
        dateRange: 'LAST_30_DAYS',
        metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'AD_REQUESTS'],
        dimensions: ['APP_NAME', 'PLATFORM_TYPE'],
        orderBy: ['-ESTIMATED_EARNINGS'],
    });

    if (!response.result.rows) return [];

    const headers = response.result.headers.map((h: any) => h.name);
    const appNameIndex = headers.indexOf('APP_NAME');
    const platformIndex = headers.indexOf('PLATFORM_TYPE');
    const earningsIndex = headers.indexOf('ESTIMATED_EARNINGS');
    const impressionsIndex = headers.indexOf('IMPRESSIONS');
    const requestsIndex = headers.indexOf('AD_REQUESTS');
    
    return response.result.rows.map((row: any, index: number) => {
        const earningsValue = parseFloat(String(row.cells[earningsIndex]?.value ?? '0'));
        const impressionsValue = parseInt(String(row.cells[impressionsIndex]?.value ?? '0'), 10);
        const requestsValue = parseInt(String(row.cells[requestsIndex]?.value ?? '0'), 10);

        return {
            id: `app-${index}`,
            name: row.cells[appNameIndex].value as string,
            platform: (row.cells[platformIndex].value as string) === 'ANDROID' ? 'Android' : 'iOS',
            earnings: isNaN(earningsValue) ? 0 : earningsValue,
            impressions: isNaN(impressionsValue) ? 0 : impressionsValue,
            requests: isNaN(requestsValue) ? 0 : requestsValue,
        };
    });
};