import type { YouTubeVideo } from '../types';

const mockVideoDatabase: YouTubeVideo[] = [
    // Tech & Education
    {
      id: 'M7lc1UVf-VE',
      title: "Official Introduction to Gemini API",
      description: "Learn about the Gemini API from Google, a new way to build generative AI applications.",
      channelTitle: "Google AI",
      publishedAt: "2023-12-06T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/M7lc1UVf-VE/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/M7lc1UVf-VE/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "1250345", likeCount: "45000" },
      contentDetails: { duration: "PT2M15S" }
    },
    {
      id: 'bMknfKXIFA8',
      title: "React JS Crash Course",
      description: "Learn the fundamentals of React JS in this crash course for beginners.",
      channelTitle: "Traversy Media",
      publishedAt: "2021-01-18T15:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/bMknfKXIFA8/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/bMknfKXIFA8/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "4500123", likeCount: "135000" },
      contentDetails: { duration: "PT1H39M56S" }
    },
     {
      id: "DEa_u0s3V2o",
      title: "O que acontece quando você morre?",
      description: "Uma viagem para a coisa mais misteriosa que os humanos experimentam. O que acontece quando morremos?",
      channelTitle: "Kurzgesagt – In a Nutshell",
      publishedAt: "2017-10-01T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/DEa_u0s3V2o/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/DEa_u0s3V2o/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/DEa_u0s3V2o/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "23000000", likeCount: "1100000" },
      contentDetails: { duration: "PT7M38S" }
    },
    // Music (Replaced with embeddable NCS tracks)
    {
      id: '_z-hEyVQDRA',
      title: "Alan Walker - Fade [NCS Release]",
      description: "NoCopyrightSounds, music without limitations. Our playlist on Spotify → http://spoti.fi/NCS",
      channelTitle: "NoCopyrightSounds",
      publishedAt: "2014-08-19T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/_z-hEyVQDRA/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/_z-hEyVQDRA/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/_z-hEyVQDRA/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "445000000", likeCount: "3900000" },
      contentDetails: { duration: "PT4M24S" }
    },
     {
      id: '_Al_4V_F6sY',
      title: "Tobu - Hope [NCS Release]",
      description: "NoCopyrightSounds, music without limitations. Our playlist on Spotify → http://spoti.fi/NCS",
      channelTitle: "NoCopyrightSounds",
      publishedAt: "2013-12-25T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/_Al_4V_F6sY/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/_Al_4V_F6sY/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/_Al_4V_F6sY/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "135000000", likeCount: "1500000" },
      contentDetails: { duration: "PT4M48S" }
    },
    {
      id: 'b-xcSzIqFHo',
      title: "Cartoon - On & On (feat. Daniel Levi) [NCS Release]",
      description: "NoCopyrightSounds, music without limitations. Our playlist on Spotify → http://spoti.fi/NCS",
      channelTitle: "NoCopyrightSounds",
      publishedAt: "2015-07-30T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/b-xcSzIqFHo/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/b-xcSzIqFHo/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/b-xcSzIqFHo/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "430000000", likeCount: "4800000" },
      contentDetails: { duration: "PT3M28S" }
    },
    {
      id: 'jfKfPfyJRdk',
      title: "lofi hip hop radio - beats to relax/study to",
      description: "A 24/7 stream of lofi hip hop beats to relax, study, or focus to.",
      channelTitle: "Lofi Girl",
      publishedAt: "2022-02-22T22:22:22.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/jfKfPfyJRdk/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "50345678", likeCount: "1200000" },
      contentDetails: { duration: "P1D" } // Live stream
    },
     {
      id: 'r_p9IqWpY_E',
      title: "Classical Music for Brain Power - Mozart",
      description: "Listen to the best classical music for studying and concentration. This playlist features the greatest works of Mozart.",
      channelTitle: "HALIDONMUSIC",
      publishedAt: "2015-03-24T10:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/r_p9IqWpY_E/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/r_p9IqWpY_E/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/r_p9IqWpY_E/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "130987654", likeCount: "1500000" },
      contentDetails: { duration: "PT3H15M20S" }
    },
    // Gaming
    {
      id: "QdBZY2fkU-0",
      title: "Grand Theft Auto VI Trailer 1",
      description: "Rockstar Games presents Grand Theft Auto VI Trailer 1.",
      channelTitle: "Rockstar Games",
      publishedAt: "2023-12-04T22:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/QdBZY2fkU-0/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/QdBZY2fkU-0/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/QdBZY2fkU-0/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "189000000", likeCount: "11000000" },
      contentDetails: { duration: "PT1M31S" }
    },
    {
      id: 'eXebO3E2dGA',
      title: 'Minecraft Speedrunner VS 5 Hunters FINALE',
      description: "Minecraft Speedrunner VS 5 Hunters FINALE. This was INSANE. Patreon: https://www.patreon.com/DreamWasTaken",
      channelTitle: 'Dream',
      publishedAt: '2021-08-01T20:00:00Z',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/eXebO3E2dGA/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/eXebO3E2dGA/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/eXebO3E2dGA/hqdefault.jpg', width: 480, height: 360 }
      },
      statistics: { viewCount: '115254879', likeCount: '4900000' },
      contentDetails: { duration: 'PT47M59S' }
    },
    // Howto & Style
    {
      id: "iYddk_B5z-s",
      title: "BOLO DE CHOCOLATE FOFINHO E MOLHADINHO | RECEITAS DA CRIS",
      description: "Aprenda a fazer um bolo de chocolate delicioso, fofinho e molhadinho com essa receita fácil.",
      channelTitle: "Receitas da Cris",
      publishedAt: "2018-04-10T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/iYddk_B5z-s/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/iYddk_B5z-s/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/iYddk_B5z-s/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "25000000", likeCount: "1500000" },
      contentDetails: { duration: "PT6M45S" }
    },
    // Film & Animation
    {
      id: "4INla_q_w_c",
      title: "Cuerdas - Curta metragem de animação",
      description: "Curta-metragem de animação vencedor do Goya em 2014, escrito e dirigido por Pedro Solís García.",
      channelTitle: "Anima Mundi",
      publishedAt: "2014-02-10T10:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/4INla_q_w_c/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/4INla_q_w_c/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/4INla_q_w_c/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "44000000", likeCount: "800000" },
      contentDetails: { duration: "PT10M53S" }
    },
    // Sports (Replaced)
    {
      id: 'K4w_022_b4E',
      title: "BEST OF PEOPLE ARE AWESOME 2023 | Top Videos of the Year!",
      description: "What a year! We're celebrating the end of 2023 with a look back at the most amazing, inspiring and awesome videos of the year!",
      channelTitle: "People Are Awesome",
      publishedAt: "2023-12-23T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/K4w_022_b4E/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/K4w_022_b4E/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/K4w_022_b4E/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "12000000", likeCount: "250000" },
      contentDetails: { duration: "PT20M1S" }
    },
    // Comedy & Entertainment
    {
      id: "s_p-eHxUh5w",
      title: "AZEITONA - Whindersson Nunes",
      description: "Parte do meu show novo 'Proparoxítona'. Me siga nas redes sociais!",
      channelTitle: "whinderssonnunes",
      publishedAt: "2018-12-22T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/s_p-eHxUh5w/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/s_p-eHxUh5w/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/s_p-eHxUh5w/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "105000000", likeCount: "4300000" },
      contentDetails: { duration: "PT14M45S" }
    },
    {
      id: 'dQw4w9WgXcQ',
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      description: "The official video for “Never Gonna Give You Up” by Rick Astley.",
      channelTitle: "Rick Astley",
      publishedAt: "2009-10-25T06:57:33.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "1500000000", likeCount: "16000000" },
      contentDetails: { duration: "PT3M33S" }
    },
    // New Additions
    {
      id: 'y_morqV2w9M',
      title: '4K Relaxation Film - The Most Beautiful Places in the World',
      description: 'A cinematic journey to the most beautiful places on Earth in stunning 4K resolution. Perfect for relaxation and meditation.',
      channelTitle: 'Scenic Relaxation',
      publishedAt: '2022-05-20T15:00:00Z',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/y_morqV2w9M/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/y_morqV2w9M/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/y_morqV2w9M/hqdefault.jpg', width: 480, height: 360 }
      },
      statistics: { viewCount: '45890123', likeCount: '980000' },
      contentDetails: { duration: 'PT1H30M45S' }
    },
    // Replaced Netflix
    {
      id: '6zOarcL1BSc',
      title: "JELLYFISH 4K • The Most Beautiful Jellyfish in the World",
      description: "JELLYFISH 4K • The Most Beautiful Jellyfish in the World • 10 HOURS Music for Relaxation & Sleep",
      channelTitle: "TheSilentWatcher",
      publishedAt: "2021-03-20T12:00:00.000Z",
      thumbnails: {
        default: { url: "https://i.ytimg.com/vi/6zOarcL1BSc/default.jpg", width: 120, height: 90 },
        medium: { url: "https://i.ytimg.com/vi/6zOarcL1BSc/mqdefault.jpg", width: 320, height: 180 },
        high: { url: "https://i.ytimg.com/vi/6zOarcL1BSc/hqdefault.jpg", width: 480, height: 360 }
      },
      statistics: { viewCount: "8900000", likeCount: "95000" },
      contentDetails: { duration: "PT10H0M0S" }
    },
    {
      id: 'UwsrzCVZAb8',
      title: 'How The Economic Machine Works by Ray Dalio',
      description: 'In 30 minutes, Ray Dalio explains how the economy works. This simple but not simplistic video shows the basic driving forces behind the economy, and explains why economic cycles occur by breaking down concepts such as credit, interest rates and deleveraging.',
      channelTitle: 'Principles by Ray Dalio',
      publishedAt: '2013-09-22T12:00:00Z',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/UwsrzCVZAb8/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/UwsrzCVZAb8/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/UwsrzCVZAb8/hqdefault.jpg', width: 480, height: 360 }
      },
      statistics: { viewCount: '25890123', likeCount: '750000' },
      contentDetails: { duration: 'PT31M19S' }
    }
];

// This function simulates a call to the YouTube Search API.
export const searchYouTubeVideos = (query: string): Promise<YouTubeVideo[]> => {
  console.log(`Simulating YouTube search for: "${query}"`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (!query.trim()) {
        // Return a default popular list if query is empty
        resolve(mockVideoDatabase.slice(0, 8));
        return;
      }
      
      const lowerQuery = query.toLowerCase();
      const keywords = lowerQuery.split(' ').filter(k => k.length > 1);

      const results = mockVideoDatabase.filter(video => {
        const videoText = `${video.title.toLowerCase()} ${video.channelTitle.toLowerCase()}`;
        // Every keyword must be present in the video text
        return keywords.every(keyword => videoText.includes(keyword));
      });

      if (results.length > 0) {
        // Simple relevance sort: title matches are better
        results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
            const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
        });
        resolve(results);
      } else {
        // If no matches, return a shuffled subset of the database
        resolve([...mockVideoDatabase].sort(() => 0.5 - Math.random()).slice(0, 8));
      }
    }, 800); // Simulate network latency
  });
};