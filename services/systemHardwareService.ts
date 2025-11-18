import type { HardwareComponent, DriverInfo } from '../types';

const MOCK_HARDWARE_DB: HardwareComponent[] = [
    {
        id: 'cpu-01',
        type: 'CPU',
        name: 'Intel Core i9-13900K',
        driver: {
            id: 'intel-chipset-01',
            name: 'Intel Chipset Device Software',
            version: '10.1.18838.8284',
            releaseDate: '2023-01-15',
            status: 'up_to_date',
        }
    },
    {
        id: 'gpu-01',
        type: 'GPU',
        name: 'NVIDIA GeForce RTX 4090',
        driver: {
            id: 'nvidia-grd-01',
            name: 'NVIDIA Game Ready Driver',
            version: '536.23',
            releaseDate: '2023-06-14',
            status: 'outdated',
            latestVersion: '551.23'
        }
    },
    {
        id: 'mb-01',
        type: 'Motherboard',
        name: 'ASUS ROG MAXIMUS Z790 HERO',
        driver: {
            id: 'asus-bios-01',
            name: 'ROG MAXIMUS Z790 HERO BIOS',
            version: '0813',
            releaseDate: '2023-02-22',
            status: 'up_to_date',
        }
    },
     {
        id: 'audio-01',
        type: 'Audio',
        name: 'Realtek ALC4082 CODEC',
        driver: {
            id: 'realtek-audio-01',
            name: 'Realtek High Definition Audio Driver',
            version: '6.0.9403.1',
            releaseDate: '2022-11-08',
            status: 'outdated',
            latestVersion: '6.0.9593.1'
        }
    },
    {
        id: 'net-01',
        type: 'Network',
        name: 'Intel I226-V Ethernet Controller',
        driver: {
            id: 'intel-net-01',
            name: 'Intel Ethernet Adapter Complete Driver Pack',
            version: '28.0',
            releaseDate: '2023-03-20',
            status: 'up_to_date',
        }
    }
];

// Helper to get GPU info
const getGpuInfo = (): Promise<string> => {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl && gl instanceof WebGLRenderingContext) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    resolve(renderer);
                    return;
                }
            }
            resolve('N/A');
        } catch (e) {
            console.error("Could not get GPU info:", e);
            resolve('N/A');
        }
    });
};


// Simulates a quick system scan, now with real data
export const getSystemInfo = async (): Promise<HardwareComponent[]> => {
    const gpuName = await getGpuInfo();
    const realHardware: Partial<Record<HardwareComponent['type'], string>> = {
        CPU: `${navigator.hardwareConcurrency || 'N/A'} Cores`,
        // @ts-ignore
        RAM: `${navigator.deviceMemory || 'N/A'} GB RAM`,
        GPU: gpuName,
    };

    // Merge real data with mock data, prioritizing real data
    const updatedHardware = MOCK_HARDWARE_DB.map(component => {
        if (realHardware[component.type]) {
            return {
                ...component,
                name: realHardware[component.type] as string,
            };
        }
        return component;
    });
    
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return updatedHardware;
};


export const scanForDrivers = (): Promise<HardwareComponent[]> => {
    // In a real app, this would check online for latest versions.
    // Here, we just return the mock data from getSystemInfo.
    return getSystemInfo();
};

// Simulates downloading and installing a driver
export const installDriver = (driverId: string): Promise<{ success: boolean; newVersion?: string }> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const currentHardware = await getSystemInfo(); // get latest info
            const component = currentHardware.find(c => c.driver.id === driverId);
            if (component && component.driver.status === 'outdated') {
                // Here you would update the "database" or state.
                // For this simulation, we just resolve successfully.
                resolve({ success: true, newVersion: component.driver.latestVersion });
            } else if (component) {
                 resolve({ success: true, newVersion: component.driver.version }); // Already up to date
            }
            else {
                reject(new Error("Driver not found."));
            }
        }, 4000); // 4 second delay for installation
    });
};