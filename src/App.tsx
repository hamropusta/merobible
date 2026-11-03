/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeftRight,
  Bell,
  BellRing,
  BookOpen,
  Building2,
  Calendar,
  Coins,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  Facebook,
  FileText,
  Film,
  FolderOpen,
  Globe,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Info,
  Instagram,
  Keyboard,
  Lock,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Music,
  Newspaper,
  Pause,
  Phone,
  Play,
  Plus,
  Radio,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  StickyNote,
  Sun,
  Trophy,
  Trash2,
  User,
  Users,
  Video,
  Volume2,
  WifiOff,
  Wrench,
  X,
  Youtube,
} from 'lucide-react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { BhajanModuleView } from './components/BhajanModuleView';
import { BibleModuleView } from './components/BibleModuleView';
import { BibleQuizView } from './components/BibleQuizView';
import { CalendarConverterView } from './components/CalendarConverterView';
import { CommunityModulesView } from './components/CommunityModulesView';
import { LegalAndAboutView, LegalTabType } from './components/LegalAndAboutView';
import { LifeNotesPodcastsView } from './components/LifeNotesPodcastsView';
import { NepaliUnicodeView } from './components/NepaliUnicodeView';
import { NewsPortalView } from './components/NewsPortalView';
import { PrayerWallView } from './components/PrayerWallView';
import { VerseImageShareModal } from './components/VerseImageShareModal';
import { CPanelDeployModal } from './components/CPanelDeployModal';
import { GooglePickerModal } from './components/GooglePickerModal';
import { auth, googleProvider, db, testConnection, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import {
  ADMIN_USERS,
  AdminUserRecord,
  AuditLogItem,
  BIBLE_STUDY_ARTICLES,
  BibleVerse,
  ChristianEventItem,
  CURATED_BIBLE_VERSES,
  GalleryAlbum,
  GoldSilverRateData,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CHRISTIAN_EVENTS,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_GOLD_SILVER_RATES,
  INITIAL_NEWS_ARTICLES,
  INITIAL_PRAYER_REQUESTS,
  INITIAL_RADIO_STATIONS,
  NEPAL_CHURCH_DIRECTORY,
  NewsArticle,
  PrayerRequestItem,
  RadioStation,
} from './data/susamacharDatabase';
import { convertADToBS, toNepaliDigits } from './utils/nepaliDateEngine';
import { sacredRadioEngine } from './utils/sacredAudioSynthesizer';
import { useOnlineStatus, usePWAInstall } from './utils/usePWAInstall';

type PrimarySection =
  | 'home'
  | 'bible'
  | 'quiz'
  | 'bhajan'
  | 'daily_word'
  | 'calendar'
  | 'converter'
  | 'news'
  | 'prayer'
  | 'radio'
  | 'rates'
  | 'gallery'
  | 'events'
  | 'churches'
  | 'notes'
  | 'podcasts'
  | 'healthtips'
  | 'forex'
  | 'unicode'
  | 'tools'
  | 'admin'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'delete-account'
  | 'community';

export interface HomeVideoItem {
  id: string;
  titleNe: string;
  titleEn: string;
  youtubeEmbedUrl: string;
  type: 'video' | 'short';
  speakerNe: string;
}

const DEFAULT_HOME_VIDEOS: HomeVideoItem[] = [
  {
    id: 'vid-1',
    titleNe: 'येशू ख्रीष्टको जीवनी, क्रूसको प्रेम र मुक्तिको सन्देश (The Gospel of Jesus)',
    titleEn: 'The Gospel of Jesus Christ & Living Hope',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/2J46a9H99UU',
    type: 'video',
    speakerNe: 'सुसमाचार भिडियो सेवा',
  },
  {
    id: 'vid-2',
    titleNe: 'नेपाली ख्रीष्टिय आराधना र भजन संगति (Nepali Christian Worship)',
    titleEn: 'Nepali Christian Worship & Praise Session',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    type: 'video',
    speakerNe: 'सुसमाचार आराधना सेवा',
  },
  {
    id: 'short-1',
    titleNe: 'आजको १ मिनेट बाइबल वचन — यूहन्ना ३:१६ (Bible Short)',
    titleEn: '1-Minute Daily Scripture — John 3:16',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/DWcJFNfaw9c',
    type: 'short',
    speakerNe: 'बाइबल सन्देश Shorts',
  },
  {
    id: 'short-2',
    titleNe: 'भजनसंग्रह २३ — परमप्रभु मेरो गोठाला हुनुहुन्छ (Psalm 23 Short)',
    titleEn: 'Psalm 23 — The Lord is My Shepherd Short',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    type: 'short',
    speakerNe: 'सुसमाचार Shorts',
  },
];

export default function App() {
  const [lang, setLang] = useState<'ne' | 'en'>('ne');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const resolveSectionFromUrl = (rawPathOrHash?: string): PrimarySection => {
    const raw =
      rawPathOrHash ||
      (typeof window !== 'undefined' ? window.location.hash || window.location.pathname : '');
    const clean = raw.toLowerCase().replace(/^[#/]+/, '').trim().split('?')[0].split('/')[0];
    if (clean === 'privacy') return 'privacy';
    if (clean === 'terms') return 'terms';
    if (clean === 'about') return 'about';
    if (clean === 'delete-account' || clean === 'delete_account') return 'delete-account';
    if (clean === 'community') return 'community';
    if (clean === 'unicode' || clean === 'nepali-unicode') return 'unicode';
    if (clean === 'notes') return 'notes';
    if (clean === 'tools') return 'tools';
    if (clean === 'churches' || clean === 'church' || clean === 'mandali') return 'churches';
    if (clean === 'bible') return 'bible';
    if (clean === 'bhajan') return 'bhajan';
    if (clean === 'prayer') return 'prayer';
    if (clean === 'news') return 'news';
    if (clean === 'quiz') return 'quiz';
    if (clean === 'daily_word' || clean === 'daily-word' || clean === 'bachan') return 'daily_word';
    if (clean === 'calendar') return 'calendar';
    if (clean === 'converter') return 'converter';
    if (clean === 'radio') return 'radio';
    if (clean === 'rates') return 'rates';
    if (clean === 'gallery') return 'gallery';
    if (clean === 'events') return 'events';
    if (clean === 'podcasts') return 'podcasts';
    if (clean === 'healthtips') return 'healthtips';
    if (clean === 'forex') return 'forex';
    if (clean === 'admin') return 'admin';
    return 'home';
  };

  const [activeSection, setActiveSection] = useState<PrimarySection>(() => {
    if (typeof window !== 'undefined') {
      const full = window.location.hash || window.location.pathname;
      return resolveSectionFromUrl(full);
    }
    return 'home';
  });

  const navigateToSection = (section: PrimarySection) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      const targetPath = section === 'home' ? '/' : `/${section}`;
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState({ section }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser popstate (back/forward) and automatically clean any legacy '#' hash from URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        const target = resolveSectionFromUrl(window.location.hash);
        const targetPath = target === 'home' ? '/' : `/${target}`;
        window.history.replaceState({ section: target }, '', targetPath);
        setActiveSection(target);
      }
    }

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const target = resolveSectionFromUrl(window.location.pathname);
        setActiveSection(target);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically update document title, description, and canonical link for top Google SEO ranking
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const titles: Record<PrimarySection, string> = {
      home: 'बाइबल सन्देश (सुसमाचार) – पवित्र बाइबल, भजन, आजको बचन, मण्डली निर्देशिका | biblesandes.com',
      bible: 'पवित्र बाइबल (Holy Bible - 66 Books) – नेपाली र अंग्रेजी बाइबल | बाइबल सन्देश',
      bhajan: 'ख्रीष्टिय भजन र कोरस (Christian Hymns & Songs) – नेपाली र हिन्दी भजन | बाइबल सन्देश',
      daily_word: 'आजको बचन (Today’s Word) – दैनिक बाइबल वचन र आत्मिक मनन | बाइबल सन्देश',
      prayer: 'प्रार्थना पर्खाल (Prayer Wall) – प्रार्थना निवेदन तथा साझा बिन्ती | बाइबल सन्देश',
      news: 'इसाई समाचार (Christian News Nepal) – ताजा सुसमाचार, मण्डली गतिविधि | बाइबल सन्देश',
      churches: 'नेपाल मण्डली निर्देशिका (Nepal Church Directory) – मण्डली खोज्नुहोस् | बाइबल सन्देश',
      quiz: 'बाइबल क्विज (Timed Bible Quiz) – ६६ पुस्तक ज्ञान परीक्षण | बाइबल सन्देश',
      unicode: 'नेपाली युनिकोड (Nepali Unicode Converter) – सजिलो युनिकोड टाइप | बाइबल सन्देश',
      notes: 'नोट र रिमाइन्डर (Personal Spiritual Notes & Reminders) | बाइबल सन्देश',
      tools: 'डिजिटल इसाई उपकरणहरू (Christian Tools Hub) – युनिकोड, क्यालेन्डर, विनिमय | बाइबल सन्देश',
      calendar: 'नेपाली पात्रो (Bikram Sambat BS Calendar) – इसाई चाडपर्व तथा विदाहरू | बाइबल सन्देश',
      converter: 'मिति परिवर्तन (BS ↔ AD Date Converter) – बिक्रम संवत र इस्वी संवत | बाइबल सन्देश',
      radio: 'ख्रीष्टिय एफ.एम. रेडियो र भजन संगीत (Christian FM Radio Stream) | बाइबल सन्देश',
      rates: 'सुनचाँदीको आजको दर (Gold & Silver Rates Nepal) | बाइबल सन्देश',
      forex: 'आजको विदेशी विनिमय दर (Forex Rates Nepal) | बाइबल सन्देश',
      gallery: 'फोटो ग्यालरी (Christian Event Photo Gallery) | बाइबल सन्देश',
      events: 'इसाई सम्मेलन तथा संगति कार्यक्रमहरू (Christian Events) | बाइबल सन्देश',
      podcasts: 'ख्रीष्टिय पोडकास्ट (Christian Audio Podcasts) | बाइबल सन्देश',
      healthtips: 'जीवन र स्वास्थ्य उपयोगी टिप्स (Life & Health Tips) | बाइबल सन्देश',
      about: 'हाम्रो बारेमा (About Bible Sandesh) – इसाई डिजिटल मञ्च | biblesandes.com',
      privacy: 'गोपनीयता नीति (Privacy Policy & AdMob Compliance) – बाइबल सन्देश',
      terms: 'सेवाका सर्तहरू (Terms & Conditions) – बाइबल सन्देश | biblesandes.com',
      community: 'समुदाय निर्देशिका (Community Guidelines) – बाइबल सन्देश',
      'delete-account': 'खाता मेटाउने अनुरोध (Delete Account) – बाइबल सन्देश',
      admin: 'व्यवस्थापक लगइन (Admin CMS Dashboard) – बाइबल सन्देश',
    };

    const targetTitle = titles[activeSection] || titles.home;
    document.title = targetTitle;

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const cleanPath = activeSection === 'home' ? '/' : `/${activeSection}`;
    if (canonical) {
      canonical.href = `https://biblesandes.com${cleanPath}`;
    }
  }, [activeSection]);

  // Application Data State (pre-written Christian news removed; only user-posted items when added)
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [prayers, setPrayers] = useState<PrayerRequestItem[]>(INITIAL_PRAYER_REQUESTS);
  const [radioStations, setRadioStations] = useState<RadioStation[]>(INITIAL_RADIO_STATIONS);
  const [rates, setRates] = useState<GoldSilverRateData>(INITIAL_GOLD_SILVER_RATES);
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CALENDAR_EVENTS);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('susamachar_uploaded_photos') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        return [...saved, ...INITIAL_GALLERY_ALBUMS];
      }
    } catch {
      // ignore
    }
    return INITIAL_GALLERY_ALBUMS;
  });
  const [wallpaperBgUrl, setWallpaperBgUrl] = useState<string | null>(null);
  const [events] = useState<ChristianEventItem[]>(INITIAL_CHRISTIAN_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUserRecord>(ADMIN_USERS[0]);

  // Home Page Videos & Short Videos State
  const [homeVideos, setHomeVideos] = useState<HomeVideoItem[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('susamachar_home_videos') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_HOME_VIDEOS;
  });
  const [showAddHomeVideoForm, setShowAddHomeVideoForm] = useState<boolean>(false);
  const [newVideoTitle, setNewVideoTitle] = useState<string>('');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoType, setNewVideoType] = useState<'video' | 'short'>('video');

  // Home Page FM Radio YouTube Music Link Player State
  const [homeYtMusicUrl, setHomeYtMusicUrl] = useState<string>('');
  const [activeHomeYtEmbed, setActiveHomeYtEmbed] = useState<string | null>(null);

  // User Personalization & Auth State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('susamachar_bookmarks') || '["43-3-16","19-23-1"]');
    } catch {
      return ['43-3-16', '19-23-1'];
    }
  });
  const [savedNewsIds, setSavedNewsIds] = useState<number[]>([1]);
  const [favoriteStationIds, setFavoriteStationIds] = useState<number[]>([1]);

  // Live FM Radio Audio State + Real HTML5 Audio Stream Element
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.75);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals & Drawers
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showIOSInstallModal, setShowIOSInstallModal] = useState<boolean>(false);
  const [showMobileMenuDrawer, setShowMobileMenuDrawer] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [showGooglePickerModal, setShowGooglePickerModal] = useState<boolean>(false);
  const [activeFooterModal, setActiveFooterModal] = useState<
    'about' | 'privacy' | 'terms' | 'tools' | 'whatsapp' | 'ai' | null
  >(null);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'जय मसीह! म सुसमाचार बाइबलीय AI सहायक हुँ। मलाई केवल पवित्र बाइबल, प्रभु येशू ख्रीष्टको जीवनी र शिक्षा, मुक्तिको योजना (Salvation) र प्रार्थनासम्बन्धी बाइबलीय विषयमा मात्र लेख्न र जवाफ दिन अनुमति छ।\n\nJai Masih! I am the Susamachar Biblical AI Assistant. I am strictly authorized to answer only questions about the Holy Bible, Lord Jesus Christ, Salvation, and Biblical truth.',
    },
  ]);
  const [shareHomeVerse, setShareHomeVerse] = useState<BibleVerse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAskAiAssistant = async (customPrompt?: string) => {
    const promptText = (customPrompt ?? aiInput).trim();
    if (!promptText || aiLoading) return;
    setAiMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    if (!customPrompt) setAiInput('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, lang }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            data.reply ||
            'येशूले भन्नुभयो: "बाटो, सत्य र जीवन म नै हुँ। मद्वारा बाहेक कोही पनि पिताकहाँ आउन सक्दैन।" (यूहन्ना १४:६)',
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'परमेश्वरको वचनले भन्दछ: "किनभने परमेश्वरले संसारलाई यस्तो प्रेम गर्नुभयो, कि उहाँले आफ्ना एकमात्र पुत्र दिनुभयो, ताकि उहाँमाथि विश्वास गर्ने कोही पनि नाश नहोस्, तर त्यसले अनन्त जीवन पाओस्।" (यूहन्ना ३:१६ / John 3:16)',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // User Auth & Notification Preferences
  const [userSession, setUserSession] = useState<{
    fullName: string;
    email: string;
    churchName: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authChurch, setAuthChurch] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({
    dailyVerse: true,
    prayerReminders: true,
    christianNews: true,
    upcomingEvents: true,
    radioPrograms: false,
    christianFestivals: true,
  });

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const nowDate = useMemo(() => new Date(), []);
  const todayBS = useMemo(
    () => convertADToBS(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate()),
    [nowDate]
  );
  const todayADFormatted = useMemo(
    () =>
      nowDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [nowDate]
  );
  const todayADShort = useMemo(
    () =>
      nowDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [nowDate]
  );

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial API hydration from Express backend (/api/*)
  useEffect(() => {
    Promise.all([
      fetch('/api/news?admin=true').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/prayers?admin=true').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/rates').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/radio').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/calendar/events').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/admin/dashboard').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([newsRes, prayersRes, ratesRes, radioRes, calRes, dashRes]) => {
        if (newsRes?.articles) {
          setNews(newsRes.articles.filter((a: NewsArticle) => a.id > 100));
        }
        if (prayersRes?.prayers) setPrayers(prayersRes.prayers);
        if (ratesRes?.rates) setRates(ratesRes.rates);
        if (radioRes?.stations) setRadioStations(radioRes.stations);
        if (calRes?.events) setCalendarEvents(calRes.events);
        if (dashRes?.auditLogs) setAuditLogs(dashRes.auditLogs);
      })
      .catch(() => {
        // Uses preloaded offline-capable state when offline
      });
  }, []);

  // Firebase connection test, Auth state listener & Firestore synchronization
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        setUserSession({
          fullName: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          churchName: 'Susamachar Christian Fellowship',
        });
        // Sync user profile to Firestore /users/{uid} if not present
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const existingSnap = await getDoc(userRef);
          if (!existingSnap.exists()) {
            await setDoc(userRef, {
              uid: fbUser.uid.slice(0, 128),
              email: fbUser.email.slice(0, 254),
              displayName: (fbUser.displayName || fbUser.email.split('@')[0] || 'Believer').slice(0, 120),
              photoURL: (fbUser.photoURL || '').slice(0, 1024),
              churchName: 'Susamachar Christian Fellowship',
              role: fbUser.email === 'dipimafauja@gmail.com' ? 'admin' : 'user',
              createdAt: new Date().toISOString().slice(0, 64),
            });
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
            handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
          }
        }
      }
    });

    async function hydrateFirestorePrayers() {
      try {
        const publicPrayersQuery = query(
          collection(db, 'prayers'),
          where('visibility', '==', 'public')
        );
        const snap = await getDocs(publicPrayersQuery);
        if (!snap.empty) {
          const fsPrayers: PrayerRequestItem[] = snap.docs.map((docSnap, index) => {
            const data = docSnap.data();
            return {
              id: Date.now() + index,
              requesterName: data.author || 'विश्वासी (Believer)',
              location: data.location || 'नेपाल',
              category: (data.category as any) || 'healing',
              titleEn: data.title || 'Prayer Request',
              titleNe: data.title || 'प्रार्थना अनुरोध',
              requestTextEn: data.prayerText || '',
              requestTextNe: data.prayerText || '',
              visibility: (data.visibility as any) || 'public',
              moderationStatus: 'approved',
              prayerStatus: 'active',
              prayedCount: data.prayerCount || 1,
              createdAtBs: data.date || todayBS.formattedNe,
              createdAtAd: data.createdAt ? data.createdAt.split('T')[0] : '2026-10-31',
            };
          });
          setPrayers((prev) => {
            const combined = [...fsPrayers, ...prev];
            const seen = new Set<string>();
            return combined.filter((p) => {
              if (seen.has(p.titleNe)) return false;
              seen.add(p.titleNe);
              return true;
            });
          });
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.LIST, 'prayers');
        }
        console.warn('Firestore prayers fallback:', err);
      }
    }
    hydrateFirestorePrayers();

    return () => unsubscribeAuth();
  }, [todayBS.formattedNe]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const extractYoutubeEmbedUrl = (rawUrl: string): string | null => {
    const url = rawUrl.trim();
    if (!url) return null;
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    return null;
  };

  const handleAddHomeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const embed = extractYoutubeEmbedUrl(newVideoUrl);
    if (!embed) {
      notify(lang === 'ne' ? 'कृपया सही YouTube भिडियो वा Short लिङ्क राख्नुहोस्।' : 'Please enter a valid YouTube Video or Short link.');
      return;
    }
    const isShortUrl = newVideoUrl.includes('/shorts/') || newVideoType === 'short';
    const item: HomeVideoItem = {
      id: `vid-${Date.now()}`,
      titleNe: newVideoTitle.trim() || (isShortUrl ? 'बाइबल सन्देश YouTube Short' : 'सुसमाचार YouTube भिडियो'),
      titleEn: newVideoTitle.trim() || (isShortUrl ? 'Bible Sandes YouTube Short' : 'Susamachar YouTube Video'),
      youtubeEmbedUrl: embed,
      type: isShortUrl ? 'short' : 'video',
      speakerNe: 'सुसमाचार मिडिया',
    };
    setHomeVideos((prev) => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem('susamachar_home_videos', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
    setShowAddHomeVideoForm(false);
    notify(lang === 'ne' ? 'भिडियो गृहपृष्ठमा सफलतापूर्वक थपियो!' : 'Video added to Home page!');
  };

  const handlePlayHomeYoutubeMusic = (e: React.FormEvent) => {
    e.preventDefault();
    const embed = extractYoutubeEmbedUrl(homeYtMusicUrl);
    if (!embed) {
      notify(lang === 'ne' ? 'कृपया सही YouTube संगीत लिङ्क राख्नुहोस्।' : 'Please enter a valid YouTube music link.');
      return;
    }
    // Pause FM stream if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    sacredRadioEngine.stop();
    setIsPlayingRadio(false);
    setActiveHomeYtEmbed(`${embed}?autoplay=1`);
    notify(lang === 'ne' ? 'YouTube भजन तथा संगीत बज्दैछ!' : 'Playing YouTube worship music!');
  };

  // Real Live FM Radio Playback Handler (HTML5 Audio Stream + Sacred Audio Fallback)
  const handlePlayStation = (station: RadioStation) => {
    if (activeStationId === station.id && isPlayingRadio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      sacredRadioEngine.stop();
      setIsPlayingRadio(false);
      notify(lang === 'ne' ? `${station.nameNe} रोकियो।` : `Paused ${station.nameEn}`);
    } else {
      setActiveHomeYtEmbed(null);
      setActiveStationId(station.id);
      setIsPlayingRadio(true);
      sacredRadioEngine.stop();

      if (audioRef.current && station.streamUrl) {
        audioRef.current.src = station.streamUrl;
        audioRef.current.volume = radioVolume;
        audioRef.current
          .play()
          .then(() => {
            notify(
              lang === 'ne'
                ? `प्रत्यक्ष एफ.एम. प्रसारण: ${station.nameNe} (${station.frequency})`
                : `Live FM Stream: ${station.nameEn} (${station.frequency})`
            );
          })
          .catch(() => {
            // Automatic fallback to built-in worship synthesizer if stream is blocked/offline
            sacredRadioEngine.start(station.melodyPreset, radioVolume);
            notify(
              lang === 'ne'
                ? `प्रत्यक्ष आराधना प्रसारण: ${station.nameNe} (${station.frequency})`
                : `Now Playing: ${station.nameEn} (${station.frequency})`
            );
          });
      } else {
        sacredRadioEngine.start(station.melodyPreset, radioVolume);
        notify(
          lang === 'ne'
            ? `प्रत्यक्ष प्रसारण: ${station.nameNe} (${station.frequency})`
            : `Now Playing: ${station.nameEn} (${station.frequency})`
        );
      }
    }
  };

  const handleVolumeChange = (vol: number) => {
    setRadioVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    sacredRadioEngine.setVolume(vol);
  };

  const handleToggleBookmark = (verseId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(verseId) ? prev.filter((id) => id !== verseId) : [...prev, verseId];
      localStorage.setItem('susamachar_bookmarks', JSON.stringify(next));
      return next;
    });
    notify(lang === 'ne' ? 'बाइबल बुकमार्क अद्यावधिक गरियो।' : 'Bible bookmark updated.');
  };

  const handleToggleSaveNews = (id: number) => {
    setSavedNewsIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    notify(lang === 'ne' ? 'समाचार बुकमार्क सुरक्षित गरियो।' : 'News article bookmark updated.');
  };

  const handleAddGalleryPhoto = (payload: {
    titleNe: string;
    titleEn: string;
    category: GalleryAlbum['category'];
    locationNe: string;
    locationEn: string;
    coverImage: string;
    descriptionNe: string;
    descriptionEn: string;
  }) => {
    const newAlbum: GalleryAlbum = {
      id: Date.now(),
      titleNe: payload.titleNe,
      titleEn: payload.titleEn,
      category: payload.category,
      locationNe: payload.locationNe,
      locationEn: payload.locationEn,
      dateBs: todayBS.formattedNe,
      photosCount: 1,
      coverImage: payload.coverImage,
      descriptionNe: payload.descriptionNe,
      descriptionEn: payload.descriptionEn,
      items: [
        {
          id: Date.now(),
          mediaType: 'image',
          mediaUrl: payload.coverImage,
          captionEn: payload.titleEn,
          captionNe: payload.titleNe,
        },
      ],
    };
    setGalleryAlbums((prev) => {
      const updated = [newAlbum, ...prev];
      try {
        const customOnly = updated.filter(
          (a) => !INITIAL_GALLERY_ALBUMS.some((init) => init.id === a.id)
        );
        localStorage.setItem('susamachar_uploaded_photos', JSON.stringify(customOnly.slice(0, 12)));
      } catch {
        // ignore storage quota
      }
      return updated;
    });
    notify(
      lang === 'ne'
        ? 'तस्बिर सफलतापूर्वक वेबसाइट ग्यालरीमा थपियो! (biblesandes.com)'
        : 'Photo published to website gallery! (biblesandes.com)'
    );
  };

  const handleOpenWallpaperWithPhoto = (bgUrl?: string) => {
    setWallpaperBgUrl(bgUrl || null);
    setShareHomeVerse(dailyVerse);
  };

  const handleSubmitPrayer = async (data: {
    requesterName: string;
    location: string;
    category: PrayerRequestItem['category'];
    title: string;
    requestText: string;
    visibility: 'public' | 'private';
  }) => {
    // Persist to Firebase Firestore when authenticated
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'prayers'), {
          title: (data.title || 'प्रार्थना निवेदन').slice(0, 200),
          author: (data.requesterName || 'विश्वासी').slice(0, 100),
          location: (data.location || 'नेपाल').slice(0, 120),
          category: (data.category || 'healing').slice(0, 64),
          prayerText: (data.requestText || '').slice(0, 2000),
          date: todayBS.formattedNe.slice(0, 64),
          prayerCount: 1,
          visibility: data.visibility === 'private' ? 'private' : 'public',
          userId: auth.currentUser.uid.slice(0, 128),
          createdAt: new Date().toISOString().slice(0, 64),
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, 'prayers');
        }
        console.warn('Firestore prayer write note:', err);
      }
    }

    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        setPrayers((prev) => [json.prayer, ...prev]);
        return;
      }
    } catch {
      // Offline fallback
    }
    const fallbackPrayer: PrayerRequestItem = {
      id: Date.now(),
      requesterName: data.requesterName,
      location: data.location,
      category: data.category,
      titleEn: data.title,
      titleNe: data.title,
      requestTextEn: data.requestText,
      requestTextNe: data.requestText,
      visibility: data.visibility,
      moderationStatus: 'approved',
      prayerStatus: 'active',
      prayedCount: 1,
      createdAtBs: '२०८३ कार्तिक १५',
      createdAtAd: '2026-10-31',
    };
    setPrayers((prev) => [fallbackPrayer, ...prev]);
  };

  const handlePrayForRequest = async (id: number) => {
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p)));
    try {
      await fetch(`/api/prayers/${id}/pray`, { method: 'POST' });
    } catch {
      // ignore offline
    }
  };

  // Create News / Social Post / YouTube Video / YouTube Short handler
  const handleCreateNews = async (payload: Partial<NewsArticle>) => {
    const fallbackArticle: NewsArticle = {
      id: Date.now(),
      slug: `post-${Date.now()}`,
      categorySlug: payload.categorySlug || 'christian-news-nepal',
      categoryNameEn: payload.categoryNameEn || 'Christian News Nepal',
      categoryNameNe: payload.categoryNameNe || 'नेपाल इसाई समाचार',
      portalSlug: payload.portalSlug || 'hamropusta',
      portalNameNe: payload.portalNameNe || 'बाइबल सन्देश (Bible Sandes)',
      portalNameEn: payload.portalNameEn || 'Bible Sandes',
      sourceUrl: payload.sourceUrl || 'https://biblesandes.com',
      youtubeUrl: payload.youtubeUrl,
      postType: payload.postType || 'social',
      likesCount: payload.likesCount ?? 1,
      authorNameEn: payload.authorNameEn || 'Bible Sandes',
      authorNameNe: payload.authorNameNe || 'बाइबल सन्देश',
      authorRoleEn: payload.authorRoleEn || 'Editorial Desk',
      titleEn: payload.titleEn || payload.titleNe || 'Bible Sandes Post',
      titleNe: payload.titleNe || payload.titleEn || 'बाइबल सन्देश पोस्ट',
      summaryEn: payload.summaryEn || payload.summaryNe || '',
      summaryNe: payload.summaryNe || payload.summaryEn || '',
      contentEn: payload.contentEn || payload.contentNe || '',
      contentNe: payload.contentNe || payload.contentEn || '',
      featuredImage: payload.featuredImage || '/assets/aistudio/image_fed91b50.png',
      isFeatured: true,
      isTrending: true,
      status: 'published',
      viewsCount: 1,
      publishedAtAd: payload.publishedAtAd || '2026-10-31',
      publishedAtBs: payload.publishedAtBs || todayBS.formattedNe,
    };

    setNews((prev) => {
      const next = [fallbackArticle, ...prev];
      try {
        const customOnly = next.filter(
          (item) => !INITIAL_NEWS_ARTICLES.some((init) => init.id === item.id)
        );
        localStorage.setItem('biblesandes_social_posts', JSON.stringify(customOnly.slice(0, 20)));
      } catch {
        // ignore quota
      }
      return next;
    });

    try {
      await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // already updated in local state
    }
  };

  const handleUpdateNews = async (id: number, payload: Partial<NewsArticle>) => {
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...payload } : n))
    );
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.article) {
          setNews((prev) =>
            prev.map((n) => (n.id === id ? json.article : n))
          );
        }
      }
    } catch {
      // local state already updated
    }
  };

  const handleDeleteNews = async (id: number) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  const handleModeratePrayer = async (
    id: number,
    moderationStatus: 'approved' | 'rejected',
    prayerStatus?: 'active' | 'answered'
  ) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, moderationStatus, prayerStatus: prayerStatus || p.prayerStatus }
          : p
      )
    );
    try {
      await fetch(`/api/admin/prayers/${id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationStatus, prayerStatus }),
      });
    } catch {
      // ignore
    }
  };

  const handleUpdateRates = async (payload: {
    fineGoldTola: number;
    tejabiGoldTola: number;
    silverTola: number;
    rateDateBs: string;
  }) => {
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setRates(json.rates);
      }
    } catch {
      // ignore
    }
  };

  const handleAddRadioStation = async (payload: {
    nameEn: string;
    nameNe: string;
    frequency: string;
    locationEn: string;
    locationNe: string;
    streamUrl: string;
  }) => {
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setRadioStations((prev) => [...prev, json.station]);
      }
    } catch {
      // ignore
    }
  };

  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'reset') {
      notify(lang === 'ne' ? `पासवर्ड रिसेट लिंक ${authEmail} मा पठाइयो।` : `Password reset link sent to ${authEmail}`);
      setAuthMode('login');
      return;
    }
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: authFullName || 'विश्वासी सदस्य',
          email: authEmail,
          password: authPassword,
          churchName: authChurch || 'Local Fellowship',
        }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.isAdmin && json.admin) {
          setCurrentAdmin(json.admin);
          setActiveSection('admin');
          setShowAccountModal(false);
          notify(`Signed in as Admin: ${json.admin.roleNameEn}`);
          return;
        }
        setUserSession({
          fullName: json.user?.fullName || authFullName || 'आशिष गुरुङ',
          email: json.user?.email || authEmail,
          churchName: json.user?.churchName || authChurch || 'Patan Koinonia Church',
        });
        setShowAccountModal(false);
        notify(lang === 'ne' ? 'सफलतापूर्वक लगइन भयो!' : 'Signed in successfully!');
      } else {
        notify(json.error || 'Authentication failed');
      }
    } catch {
      setUserSession({
        fullName: authFullName || 'आशिष गुरुङ (Ashish Gurung)',
        email: authEmail || 'member@susamachar.org',
        churchName: authChurch || 'Patan Koinonia Church',
      });
      setShowAccountModal(false);
      notify(lang === 'ne' ? 'अफलाइन प्रोफाइल सक्रिय भयो।' : 'Signed in to local profile.');
    }
  };

  const handleGoogleFirebaseLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (fbUser) {
        setUserSession({
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'विश्वासी सदस्य',
          email: fbUser.email || '',
          churchName: 'Susamachar Christian Fellowship',
        });
        if (fbUser.email === 'dipimafauja@gmail.com') {
          setCurrentAdmin(ADMIN_USERS[0]);
        }
        setShowAccountModal(false);
        notify(
          lang === 'ne'
            ? `Google मार्फत सफलतापूर्वक लगइन भयो: ${fbUser.displayName || fbUser.email}`
            : `Signed in with Google: ${fbUser.displayName || fbUser.email}`
        );
      }
    } catch (err) {
      console.warn('Google Firebase login cancelled or failed:', err);
      notify(
        lang === 'ne'
          ? 'Google लगइन रद्द गरियो वा असफल भयो।'
          : 'Google sign-in was cancelled or failed.'
      );
    }
  };

  // Global search results
  const globalSearchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return { verses: [], news: [], study: [], churches: [] };
    return {
      verses: CURATED_BIBLE_VERSES.filter(
        (v) => v.textNe.toLowerCase().includes(q) || v.textEn.toLowerCase().includes(q) || v.bookNameNe.includes(q) || v.bookNameEn.toLowerCase().includes(q)
      ),
      news: news.filter(
        (n) => n.titleNe.includes(q) || n.titleEn.toLowerCase().includes(q) || n.summaryNe.includes(q)
      ),
      study: BIBLE_STUDY_ARTICLES.filter(
        (s) => s.titleNe.includes(q) || s.titleEn.toLowerCase().includes(q)
      ),
      churches: NEPAL_CHURCH_DIRECTORY.filter(
        (c) => c.nameNe.includes(q) || c.nameEn.toLowerCase().includes(q) || c.cityEn.toLowerCase().includes(q)
      ),
    };
  }, [globalSearchQuery, news]);

  const dailyVerse = CURATED_BIBLE_VERSES.find((v) => v.id === '43-3-16') || CURATED_BIBLE_VERSES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Hidden Real HTML5 Audio Element for Live FM Radio Streams */}
      <audio ref={audioRef} className="hidden" preload="none" />

      {/* =====================================================================
          HEADER SYSTEM (Serene Clean Header Styled with Image 3 Palette)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#FAF6EC]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#BC986A]/25 dark:border-slate-800 shadow-xs">
        {/* -----------------------------------------------------------------
            DESKTOP VIEW (md and up):
            1. Top Utility Bar: Polished Bilingual Date Pill on left | Search, Eng/Nep, Notifications, Account, About on right
            2. Main Navbar: Logo, Navigation Links, Primary CTA
           ----------------------------------------------------------------- */}
        <div className="hidden md:block">
          {/* Row 1: Clean Utility Bar — Single-line non-wrapping Nep/Eng Date on left | Search, Eng/Nep, Alerts, Account, Theme on right */}
          <div className="bg-gradient-to-r from-[#FAF6EC] via-[#FBEEC1]/40 to-[#FAF6EC] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-[#BC986A]/20 dark:border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4 text-xs">
              {/* Left: Single-line Nep/Eng Date Pill (never wraps) */}
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 whitespace-nowrap shrink-0 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#8D8741] dark:text-[#659DBD] shrink-0" />
                  {lang === 'ne' ? (
                    <span className="font-bold text-[#8D8741] dark:text-[#FBEEC1] whitespace-nowrap">
                      वि.सं. {todayBS.formattedNe}
                      <span className="mx-1.5 text-[#BC986A]/40 dark:text-slate-600">|</span>
                      <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                        {todayADShort}
                      </span>
                    </span>
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-[#FBEEC1] whitespace-nowrap">
                      {todayADFormatted}
                      <span className="mx-1.5 text-[#BC986A]/40 dark:text-slate-600">|</span>
                      <span className="font-medium text-[#8D8741] dark:text-[#659DBD]">
                        BS {todayBS.formattedEn}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Clean Utility Controls (Search, Eng/Nep, Notifications, Account, Theme) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Search */}
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5 hover:border-[#659DBD] dark:hover:border-[#659DBD] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-[#8D8741] dark:text-[#659DBD]" />
                  <span>{lang === 'ne' ? 'खोज्नुहोस् (Search)' : 'Search'}</span>
                </button>

                {/* Eng / नेप Language Switcher */}
                <button
                  onClick={() => setLang((l) => (l === 'ne' ? 'en' : 'ne'))}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 hover:border-[#659DBD] dark:hover:border-[#659DBD] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  title="Switch Language (English / नेपाली)"
                >
                  <Globe className="w-3.5 h-3.5 text-[#8D8741] dark:text-[#659DBD]" />
                  <span>
                    <span className={lang === 'en' ? 'text-[#659DBD] font-bold' : 'opacity-75'}>
                      Eng
                    </span>
                    <span className="mx-1 text-[#BC986A]/60">/</span>
                    <span className={lang === 'ne' ? 'text-[#8D8741] font-bold' : 'opacity-75'}>
                      नेप
                    </span>
                  </span>
                </button>

                {/* सूचना (Notifications) */}
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:border-[#659DBD] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5 text-[#8D8741] dark:text-[#659DBD]" />
                  <span>{lang === 'ne' ? 'सूचना' : 'Alerts'}</span>
                </button>

                {/* खाता (Account) */}
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:border-[#659DBD] transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-[#8D8741] dark:text-[#659DBD]" />
                  <span>
                    {userSession
                      ? userSession.fullName.split(' ')[0]
                      : lang === 'ne'
                      ? 'खाता (Account)'
                      : 'Account'}
                  </span>
                </button>

                {/* Admin CMS Access Button */}
                <button
                  onClick={() => setActiveSection('admin')}
                  className={`h-7 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-2xs ${
                    activeSection === 'admin'
                      ? 'bg-[#8D8741] text-white border-[#746F33]'
                      : 'bg-white dark:bg-slate-900 border-[#BC986A]/30 dark:border-slate-700 text-[#8D8741] dark:text-[#DAAD86] hover:border-[#8D8741]'
                  }`}
                  title="Admin Dashboard (CMS)"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{lang === 'ne' ? 'एडमिन' : 'Admin'}</span>
                </button>

                {/* Subtle Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-[#659DBD] transition-colors shrink-0 shadow-2xs"
                  aria-label="Toggle Dark Mode"
                  title="Dark / Light Mode"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-[#FBEEC1]" /> : <Moon className="w-3.5 h-3.5 text-[#8D8741]" />}
                </button>

                {/* Optional PWA Install Pill */}
                {!isInstalled && (isInstallable || isIOS) && (
                  <button
                    onClick={() => {
                      if (isInstallable) {
                        install();
                      } else if (isIOS) {
                        setShowIOSInstallModal(true);
                      }
                    }}
                    className="h-7 px-2.5 rounded-lg bg-[#659DBD] hover:bg-[#5289A8] text-white font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>{lang === 'ne' ? 'एप इन्स्टल' : 'Install App'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 (Main Desktop Navbar): Logo, Navigation Links, Primary CTA (आजको बचन) */}
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 lg:gap-6 px-4 sm:px-6 h-16">
            {/* Brand Logo Only */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('home');
              }}
              className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
              title={lang === 'ne' ? 'गृहपृष्ठ (Home)' : 'Home'}
            >
              <img
                src="/assets/aistudio/Bible_Sandesh__Radiant_Faith_Emblem_c37247e4.png"
                alt="बाइबल सन्देश · Bible Sandesh Logo"
                className="h-12 w-auto object-contain shrink-0 drop-shadow-2xs"
              />
            </a>

            {/* Navigation Links with Icons & Names (Home, Bible, Bhajan, Prayer, News, Church, Tools) */}
            <nav
              aria-label="Main Navigation"
              className="flex items-center justify-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              {[
                { id: 'home', icon: Home, ne: 'गृहपृष्ठ', en: 'Home' },
                { id: 'bible', icon: BookOpen, ne: 'बाइबल', en: 'Bible' },
                { id: 'bhajan', icon: Music, ne: 'भजन', en: 'Bhajan' },
                { id: 'prayer', icon: HeartHandshake, ne: 'प्रार्थना', en: 'Prayer' },
                { id: 'news', icon: Newspaper, ne: 'समाचार', en: 'News' },
                { id: 'churches', icon: Building2, ne: 'मण्डली', en: 'Church' },
                { id: 'tools', icon: Wrench, ne: 'उपकरणहरू', en: 'Tools' },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSection(item.id as PrimarySection)}
                    className={`px-2.5 lg:px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#659DBD] text-white font-bold shadow-xs'
                        : 'hover:text-[#659DBD] dark:hover:text-[#FBEEC1] hover:bg-[#FBEEC1]/50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{lang === 'ne' ? item.ne : item.en}</span>
                  </button>
                );
              })}
            </nav>

            {/* Primary Right CTA Buttons: बाइबल क्विज (Bible Quiz) + आजको बचन (Today's Word Page) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigateToSection('quiz')}
                className={`px-3.5 py-2 text-xs lg:text-sm font-bold rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[38px] flex items-center gap-1.5 border shadow-2xs ${
                  activeSection === 'quiz'
                    ? 'bg-[#8D8741] text-white border-[#746F33] shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-[#BC986A]/30 dark:border-slate-700 text-[#8D8741] dark:text-[#FBEEC1] hover:bg-[#FAF6EC] dark:hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'ne' ? 'बाइबल क्विज' : 'Bible Quiz'}</span>
              </button>

              <button
                onClick={() => navigateToSection('daily_word')}
                className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[38px] flex items-center gap-1.5 shadow-xs ${
                  activeSection === 'daily_word'
                    ? 'bg-[#8D8741] text-white ring-2 ring-[#BC986A]/50'
                    : 'text-white bg-[#659DBD] hover:bg-[#5289A8]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBEEC1] shrink-0" />
                <span>{lang === 'ne' ? 'आजको बचन' : 'Today’s Word'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            MOBILE VIEW (below md):
            Line 1: Logo on left | Search + Notes + Three-line menu icon on right
            Line 2: Polished Date Badge on left | Eng/Nep + Sign In on right
           ----------------------------------------------------------------- */}
        <div className="md:hidden">
          {/* Mobile Single Clean Navbar: Logo on left | Search & Menu Drawer on right */}
          <div className="px-4 h-14 flex items-center justify-between gap-2 border-b border-[#BC986A]/20 dark:border-slate-800 bg-[#FAF6EC] dark:bg-slate-900">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateToSection('home');
              }}
              className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
              title={lang === 'ne' ? 'गृहपृष्ठ (Home)' : 'Home'}
            >
              <img
                src="/assets/aistudio/Bible_Sandesh__Radiant_Faith_Emblem_c37247e4.png"
                alt="बाइबल सन्देश · Bible Sandesh Logo"
                className="h-10 w-auto object-contain shrink-0"
              />
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-[#BC986A]/30 dark:border-slate-700 text-[#8D8741] dark:text-[#659DBD] flex items-center justify-center hover:bg-[#FBEEC1]/50 transition-colors shadow-2xs"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMobileMenuDrawer(true)}
                className="h-9 w-9 rounded-xl bg-[#659DBD] hover:bg-[#5289A8] text-white flex items-center justify-center shadow-xs transition-colors"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Three-Line Hamburger Navigation Drawer */}
      {showMobileMenuDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-80 max-w-[85vw] bg-[#FAF6EC] dark:bg-slate-900 h-full shadow-2xl border-l border-[#BC986A]/25 dark:border-slate-800 flex flex-col justify-between overflow-y-auto p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#BC986A]/20 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/Bible_Sandesh__Radiant_Faith_Emblem_c37247e4.png"
                    alt="बाइबल सन्देश"
                    className="h-10 w-auto object-contain shrink-0 drop-shadow-2xs"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#8D8741] dark:text-[#FBEEC1]">biblesandes.com</p>
                    <p className="text-[11px] text-slate-500 font-mono">वि.सं. {todayBS.formattedNe}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenuDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Quick Action Row: Eng/नेप Switcher + Login/Account */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setLang((l) => (l === 'ne' ? 'en' : 'ne'))}
                  className="h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-[#BC986A]/30 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#8D8741]" />
                  <span>{lang === 'ne' ? 'English (Eng)' : 'नेपाली (नेप)'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenuDrawer(false);
                    setShowAccountModal(true);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#659DBD] hover:bg-[#5289A8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {userSession
                      ? userSession.fullName.split(' ')[0]
                      : lang === 'ne'
                      ? 'लगइन'
                      : 'Sign In'}
                  </span>
                </button>
              </div>

              {/* Google Drive / Picker Launch in Drawer */}
              <button
                onClick={() => {
                  setShowMobileMenuDrawer(false);
                  setShowGooglePickerModal(true);
                }}
                className="w-full h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Google Drive / Picker खोल्नुहोस्</span>
              </button>

              {/* Admin Dashboard CMS Quick Launcher */}
              <button
                onClick={() => {
                  setShowMobileMenuDrawer(false);
                  navigateToSection('admin');
                }}
                className="w-full h-9 px-3 rounded-xl bg-[#8D8741] hover:bg-[#787334] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#FBEEC1]" />
                <span>{lang === 'ne' ? '🔐 एडमिन ड्यासबोर्ड (CMS)' : '🔐 Admin CMS Dashboard'}</span>
              </button>

              <div className="space-y-1 text-xs font-semibold">
                {[
                  { id: 'home', ne: 'गृहपृष्ठ (Home)', en: 'Home', icon: Home },
                  { id: 'daily_word', ne: 'आजको बचन (Today’s Word)', en: 'Today’s Word', icon: Sparkles },
                  { id: 'bible', ne: 'पवित्र बाइबल (Holy Bible)', en: 'Holy Bible', icon: BookOpen },
                  { id: 'quiz', ne: 'बाइबल क्विज (Bible Quiz)', en: 'Bible Quiz (66 Books)', icon: Trophy },
                  { id: 'bhajan', ne: 'ख्रीष्टिय भजन (Bhajan)', en: 'Christian Bhajan', icon: Music },
                  { id: 'notes', ne: 'नोट र रिमाइन्डर (Notes & Reminder)', en: 'Personal Notes & Reminders', icon: StickyNote },
                  { id: 'unicode', ne: 'नेपाली युनिकोड (Nepali Unicode)', en: 'Nepali Unicode Converter', icon: Keyboard },
                  { id: 'podcasts', ne: 'ख्रीष्टिय पोडकास्ट (Podcasts)', en: 'Christian Podcasts', icon: Mic },
                  { id: 'healthtips', ne: 'जीवन र स्वास्थ्य टिप्स (Life & Health)', en: 'Life & Health Tips', icon: Activity },
                  { id: 'forex', ne: 'आजको विदेशी विनिमय दर (Forex Rates)', en: 'Foreign Exchange Rates', icon: DollarSign },
                  { id: 'prayer', ne: 'प्रार्थना पर्खाल (Prayer Wall)', en: 'Prayer Wall', icon: HeartHandshake },
                  { id: 'news', ne: 'इसाई समाचार (Christian News)', en: 'Christian News Portal', icon: Newspaper },
                  { id: 'churches', ne: 'मण्डली निर्देशिका (Church)', en: 'Church Directory', icon: Building2 },
                  { id: 'radio', ne: 'एफ.एम. रेडियो र YouTube संगीत', en: 'FM Radio & YouTube Music', icon: Radio },
                  { id: 'rates', ne: 'सुनचाँदी दर (Gold & Silver Rates)', en: 'Gold & Silver Rates', icon: Coins },
                  { id: 'gallery', ne: 'फोटो ग्यालरी (Photo Gallery)', en: 'Photo Gallery', icon: ImageIcon },
                  { id: 'converter', ne: 'मिति परिवर्तन (Date Converter)', en: 'BS ↔ AD Date Converter', icon: ArrowLeftRight },
                  { id: 'privacy', ne: 'गोपनीयता नीति (Privacy Policy)', en: 'Privacy Policy', icon: Lock },
                  { id: 'community', ne: 'समुदाय निर्देशिका (Community)', en: 'Community Guidelines', icon: Users },
                  { id: 'terms', ne: 'सेवाका सर्तहरू (Terms & Conditions)', en: 'Terms & Conditions', icon: FileText },
                  { id: 'about', ne: 'हाम्रो बारेमा (About Us)', en: 'About Us', icon: Info },
                  { id: 'delete-account', ne: 'खाता मेटाउने (Delete Account)', en: 'Delete Account', icon: Trash2 },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigateToSection(item.id as PrimarySection);
                        setShowMobileMenuDrawer(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-[#659DBD] text-white font-bold shadow-xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-[#FBEEC1]/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ne' ? item.ne : item.en}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2 text-xs">
                <button
                  onClick={() => {
                    setShowMobileMenuDrawer(false);
                    setShowNotificationsModal(true);
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-800 dark:text-amber-400" />
                    {lang === 'ne' ? 'सूचना सेटिङ (Notifications)' : 'Notification Settings'}
                  </span>
                </button>

                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    {lang === 'ne' ? 'डार्क / लाइट मोड (Theme)' : 'Toggle Dark / Light Mode'}
                  </span>
                  <span>{darkMode ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Connectivity Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            {lang === 'ne'
              ? 'अफलाइन मोड सक्रिय छ — सुरक्षित गरिएको बाइबल र पात्रो प्रयोग हुँदैछ।'
              : 'Offline Mode Active — Reading from cached Bible, Calendar, and News data.'}
          </span>
        </div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE CONTENT CONTAINER
         ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ===================================================================
            HOME SCREEN
           =================================================================== */}
        {activeSection === 'home' && (
          <div className="space-y-10">
            {/* 1. Christian Hero Banner & 2. Daily Bible Verse Split */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 Columns: Serene Himalayan Sky-Blue Hero Banner (Inspired by Image 3) */}
              <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#659DBD] via-[#568FA7] to-[#457991] min-h-[340px] flex flex-col justify-end p-6 sm:p-8 text-white shadow-md border border-[#659DBD]/30">
                <img
                  src="/assets/aistudio/image_fed91b50.png"
                  alt="बाइबल सन्देश (Bible Sandes)"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#365E73]/95 via-[#659DBD]/50 to-transparent" />

                <div className="relative z-10 space-y-3 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white font-editorial">
                    {lang === 'ne'
                      ? 'बाइबल सन्देश – नेपाली इसाई संजाल तथा डिजिटल मञ्च'
                      : 'Bible Sandes – Nepali Christian Community & Scripture Platform'}
                  </h1>
                  <p className="text-sm text-white/90 leading-relaxed font-sans">
                    {lang === 'ne'
                      ? 'पवित्र बाइबल (नेपाली, हिन्दी, अंग्रेजी), भजन संग्रह, आजको बचन, बाइबल क्विज (समयसहित), नोट र रिमाइन्डर, पोडकास्ट, जीवन र स्वास्थ्य टिप्स तथा एफ.एम. रेडियो।'
                      : 'Share the Gospel • Grow in Faith • Serve with Love — Multilingual Holy Bible, Hymns, Timed Bible Quiz, Notes & Reminders, Podcasts, and Live FM Radio.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => navigateToSection('bible')}
                      className="h-11 px-5 rounded-xl bg-[#8D8741] hover:bg-[#787334] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{lang === 'ne' ? 'पवित्र बाइबल पढ्नुहोस्' : 'Read Holy Bible'}</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('quiz')}
                      className="h-11 px-5 rounded-xl bg-[#FBEEC1] hover:bg-[#FAF3DC] text-slate-900 text-xs font-bold flex items-center gap-2 transition-all shadow-xs whitespace-nowrap shrink-0"
                    >
                      <Trophy className="w-4 h-4 text-[#8D8741]" />
                      <span>
                        {lang === 'ne' ? 'बाइबल क्विज (Timed Quiz)' : 'Play Bible Quiz'}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveSection('notes')}
                      className="h-11 px-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white border border-white/30 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0"
                    >
                      <StickyNote className="w-4 h-4 text-[#FBEEC1]" />
                      <span>
                        {lang === 'ne' ? 'नोट र रिमाइन्डर' : 'Notes & Reminders'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Daily Bible Verse Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-[#BC986A]/30 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-[#8D8741] dark:text-[#659DBD]">
                      {lang === 'ne' ? 'आजको बाइबल पद (Daily Verse)' : 'Daily Scripture Verse'}
                    </span>
                    <span className="font-mono tabular-nums">{todayBS.formattedNe} · Oct 31, 2026</span>
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed font-editorial">
                    “{dailyVerse.textNe}”
                  </blockquote>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    “{dailyVerse.textEn}”
                  </p>

                  <p className="text-xs font-mono tabular-nums font-bold text-[#BC986A]">
                    — {dailyVerse.bookNameNe} {toNepaliDigits(dailyVerse.chapter)}:{toNepaliDigits(dailyVerse.verse)} ({dailyVerse.bookNameEn} {dailyVerse.chapter}:{dailyVerse.verse})
                  </p>
                </div>

                <div className="pt-4 border-t border-[#BC986A]/20 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`"${dailyVerse.textNe}" — ${dailyVerse.bookNameNe} ३:१६`);
                        notify(lang === 'ne' ? 'आजको बाइबल पद कपी गरियो!' : 'Daily verse copied!');
                      }}
                      className="h-9 px-3 rounded-xl border border-[#BC986A]/30 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-[#FAF6EC] dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'कपी' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(dailyVerse.id)}
                      className="h-9 px-3 rounded-xl border border-[#BC986A]/30 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-[#FAF6EC] dark:hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'बुकमार्क' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setShareHomeVerse(dailyVerse)}
                      className="h-9 px-3 rounded-xl bg-[#659DBD]/15 text-[#659DBD] hover:bg-[#659DBD] hover:text-white dark:hover:bg-[#659DBD] dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'तस्बिर सेयर' : 'Share as Image'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveSection('bible')}
                    className="text-xs font-bold text-[#659DBD] dark:text-[#FBEEC1] hover:underline whitespace-nowrap shrink-0"
                  >
                    {lang === 'ne' ? 'पूरै अध्याय पढ्नुहोस् →' : 'Read Full Chapter →'}
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Access Strip: Personal Notes & Reminders, Nepali Unicode, Podcasts, Life & Health Tips, Foreign Exchange Rates */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  id: 'unicode' as PrimarySection,
                  icon: Keyboard,
                  badgeNe: 'Roman & Preeti → युनिकोड',
                  badgeEn: 'nepali-unicode',
                  titleNe: 'नेपाली युनिकोड (Nepali Unicode)',
                  titleEn: 'Nepali Unicode Converter',
                  descNe: 'रोमनाइज्ड नेपाली र प्रिती फन्टलाई शुद्ध नेपाली युनिकोडमा रूपान्तरण गर्नुहोस्।',
                  descEn: 'Convert Romanized Nepali & Preeti font to Devanagari Unicode with keyboard.',
                },
                {
                  id: 'notes' as PrimarySection,
                  icon: StickyNote,
                  badgeNe: 'नयाँ सुविधा • Save & Remind',
                  badgeEn: 'Save & Set Reminder',
                  titleNe: 'नोट लेख्ने र रिमाइन्डर (Notes)',
                  titleEn: 'Personal Notes & Reminders',
                  descNe: 'प्रवचन वा बाइबल अध्ययन नोट लेखेर सुरक्षित गर्नुहोस् र अलर्ट राख्नुहोस्।',
                  descEn: 'Write sermon & Bible notes, save offline, and schedule reminders.',
                },
                {
                  id: 'podcasts' as PrimarySection,
                  icon: Mic,
                  badgeNe: 'अडियो र भिडियो मनन',
                  badgeEn: 'Audio & Video Devotion',
                  titleNe: 'ख्रीष्टिय पोडकास्ट (Podcasts)',
                  titleEn: 'Christian Podcasts',
                  descNe: 'येशूको जीवनी, मुक्तिको सन्देश र पारिवारिक जीवनका पोडकास्ट सुन्नुहोस्।',
                  descEn: 'Listen to Gospel teachings, youth discussions, and Christian podcasts.',
                },
                {
                  id: 'healthtips' as PrimarySection,
                  icon: Activity,
                  badgeNe: 'आत्मिक र शारीरिक स्वास्थ्य',
                  badgeEn: 'Holistic Wellness',
                  titleNe: 'जीवन र स्वास्थ्य टिप्स (Life & Health)',
                  titleEn: 'Biblical Life & Health Tips',
                  descNe: 'बाइबलीय सिद्धान्त अनुसार स्वस्थ जीवनशैली, शान्ति र स्वास्थ्य टिप्स।',
                  descEn: 'Biblical wisdom for physical health, peaceful mind, and daily living.',
                },
                {
                  id: 'forex' as PrimarySection,
                  icon: DollarSign,
                  badgeNe: 'नेपाल राष्ट्र बैंक दर',
                  badgeEn: 'NRB Official Rates',
                  titleNe: 'आजको विदेशी विनिमय दर (Forex)',
                  titleEn: 'Foreign Exchange Rates',
                  descNe: 'USD, EUR, GBP, AUD, JPY, SAR, QAR, MYR र KRW को आजको विनिमय दर।',
                  descEn: 'Today’s buying & selling NPR exchange rates + currency converter.',
                },
              ].map((card) => {
                const CardIcon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => setActiveSection(card.id)}
                    className="bg-white dark:bg-slate-900 border border-[#BC986A]/25 dark:border-slate-800 hover:border-[#659DBD] dark:hover:border-[#659DBD] rounded-2xl p-5 text-left transition-all flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-10 h-10 rounded-xl bg-[#659DBD]/15 text-[#659DBD] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <CardIcon className="w-5 h-5" />
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6EC] dark:bg-slate-800 text-[10px] font-bold text-[#8D8741] dark:text-[#FBEEC1]">
                        {lang === 'ne' ? card.badgeNe : card.badgeEn}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#659DBD] dark:group-hover:text-[#659DBD] transition-colors">
                        {lang === 'ne' ? card.titleNe : card.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {lang === 'ne' ? card.descNe : card.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </section>


            {/* Christian News Portal Highlights + Live FM Radio (with YouTube Music Player) & Gold/Silver Snapshot */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: Christian News (Empty by default until posted later per user instruction) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-[#BC986A]/25 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#BC986A]/20 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-[#8D8741] dark:text-[#659DBD]">
                      {lang === 'ne' ? 'नेपाल तथा विश्व इसाई समाचार' : 'Christian News Portal'}
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {lang === 'ne' ? 'इसाई समाचार तथा मण्डली गतिविधि' : 'Christian News & Community Updates'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveSection('news')}
                    className="text-xs font-bold text-[#659DBD] hover:underline whitespace-nowrap shrink-0"
                  >
                    {lang === 'ne' ? '+ समाचार पोस्ट गर्नुहोस् →' : '+ Post News →'}
                  </button>
                </div>

                {news.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl bg-[#FAF6EC] dark:bg-slate-950 border border-dashed border-[#BC986A]/30 dark:border-slate-800 space-y-3">
                    <Newspaper className="w-8 h-8 text-[#8D8741]/60 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {lang === 'ne'
                          ? 'अहिले कुनै इसाई समाचार लेख राखिएको छैन (पछि पोस्ट गरिनेछ)'
                          : 'No Christian news articles posted yet (Will be posted later)'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {lang === 'ne'
                          ? 'तपाईंले समाचार पृष्ठबाट जुनसुकै बेला नयाँ नेपाली वा अंग्रेजी समाचार, लेख वा सोसल पोस्ट प्रकाशन गर्न सक्नुहुन्छ।'
                          : 'You can publish new Nepali or English Christian news articles and social posts anytime from the News Portal.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('news')}
                      className="h-9 px-4 rounded-xl bg-[#8D8741] hover:bg-[#787334] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'नयाँ समाचार / पोस्ट थप्नुहोस्' : 'Create News Post'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200/75 dark:divide-slate-800">
                    {news.slice(0, 4).map((art) => {
                      const title = lang === 'ne' ? art.titleNe : art.titleEn;
                      const summary = lang === 'ne' ? art.summaryNe : art.summaryEn;
                      const baseUrl =
                        typeof window !== 'undefined' ? window.location.origin : 'https://biblesandes.com';
                      const shareUrl =
                        art.sourceUrl && art.sourceUrl.startsWith('http')
                          ? art.sourceUrl
                          : `${baseUrl}/#news-${art.id}`;
                      const shareText = `${title}\n${summary}\n— सुसमाचार · बाइबल सन्देश (${shareUrl})`;

                      return (
                        <div
                          key={art.id}
                          onClick={() => setActiveSection('news')}
                          className="news-card py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 cursor-pointer group"
                        >
                          <img
                            src={art.featuredImage}
                            alt={title}
                            referrerPolicy="no-referrer"
                            className="w-full sm:w-36 h-24 rounded-xl object-cover shrink-0 bg-slate-900"
                          />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-[#8D8741] dark:text-[#659DBD]">
                                {lang === 'ne' ? art.categoryNameNe : art.categoryNameEn}
                              </span>
                              <span>·</span>
                              <span>
                                {art.publishedAtBs} ({art.publishedAtAd})
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#659DBD] dark:group-hover:text-[#659DBD] transition-colors leading-snug">
                              {title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {summary}
                            </p>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]"
                            >
                              <button
                                type="button"
                                onClick={async () => {
                                  if (typeof navigator !== 'undefined' && navigator.share) {
                                    try {
                                      await navigator.share({ title, text: shareText, url: shareUrl });
                                      return;
                                    } catch {
                                      // fallback to copy
                                    }
                                  }
                                  navigator.clipboard?.writeText(`${title}\n${shareUrl}`);
                                  notify(
                                    lang === 'ne'
                                      ? 'समाचार लिंक क्लिपबोर्डमा कपी गरियो!'
                                      : 'Article link copied to clipboard!'
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#8D8741]/15 hover:bg-[#8D8741] text-[#8D8741] dark:text-[#FBEEC1] hover:text-white font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title={lang === 'ne' ? 'डिभाइसमा सेयर वा लिंक कपी गर्नुहोस्' : 'Share via Native Share or Copy Link'}
                              >
                                <Share2 className="w-3 h-3" />
                                <span>{lang === 'ne' ? 'सेयर (Share)' : 'Share'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                                className="px-2 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Share on WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                                className="px-2 py-1 rounded-lg bg-blue-600/15 hover:bg-[#1877F2] text-blue-700 dark:text-blue-400 hover:text-white font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Share on Facebook"
                              >
                                <Facebook className="w-3 h-3" />
                                <span>Facebook</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right 5 Columns: Live FM Radio + YouTube Channel Link + Daily Gold/Silver Card */}
              <div className="lg:col-span-5 space-y-6">
                {/* Live FM Radio + YouTube Channel Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-[#BC986A]/20 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#FBEEC1] font-semibold">
                        {lang === 'ne'
                          ? 'प्रत्यक्ष एफ.एम. रेडियो र YouTube'
                          : 'Live Christian FM & YouTube'}
                      </p>
                      <h3 className="text-lg font-bold mt-0.5">
                        {lang === 'ne' ? 'आत्मिक भजन र बाइबल वचन प्रसारण' : 'Real FM Stream & Worship'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSection('radio')}
                      className="text-xs font-semibold text-[#DAAD86] hover:underline"
                    >
                      {lang === 'ne' ? 'सबै स्टेशन →' : 'All Stations →'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {radioStations.slice(0, 2).map((st) => {
                      const active = activeStationId === st.id && isPlayingRadio;
                      return (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-mono tabular-nums text-[#FBEEC1]">
                              {st.frequency} · {lang === 'ne' ? st.locationNe : st.locationEn}
                            </p>
                            <p className="text-sm font-bold truncate">
                              {lang === 'ne' ? st.nameNe : st.nameEn}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePlayStation(st)}
                            className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                              active ? 'bg-[#BC986A] text-slate-950' : 'bg-[#8D8741] hover:bg-[#787334] text-white'
                            }`}
                          >
                            {active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{active ? (lang === 'ne' ? 'रोक्नुहोस्' : 'Pause') : lang === 'ne' ? 'बजाउनुहोस्' : 'Play'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Official YouTube Channel Link */}
                  <div className="pt-3 border-t border-slate-800">
                    <a
                      href="https://www.youtube.com/@susamacharnp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs group"
                    >
                      <Youtube className="w-4 h-4 text-white group-hover:scale-110 transition-transform shrink-0" />
                      <span>{lang === 'ne' ? 'YouTube मा भजन तथा बचन हेर्नुहोस् (@susamacharnp)' : 'Watch on YouTube (@susamacharnp)'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Daily Gold & Silver Rates Snapshot Card */}
                <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/25 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#8D8741] dark:text-[#659DBD]">
                        {lang === 'ne' ? 'दैनिक सुनचाँदी दर (FENEGOSIDA)' : 'Nepal Gold & Silver Rates (NPR)'}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {rates.rateDateBs} ({rates.rateDateAd})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSection('rates')}
                      className="text-xs font-bold text-[#659DBD] hover:underline"
                    >
                      {lang === 'ne' ? 'इतिहास र ग्राम दर →' : 'Full History →'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-[#FAF6EC] dark:bg-slate-950 border border-[#BC986A]/20 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'छापावाल सुन (तोला)' : 'Fine Gold / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.fineGoldTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF6EC] dark:bg-slate-950 border border-[#BC986A]/20 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'तेजाबी सुन (तोला)' : 'Tejabi / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.tejabiGoldTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'असल चाँदी (तोला)' : 'Silver / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.silverTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Website Photo Gallery & Bible Wallpaper Maker Showcase (biblesandes.com) */}
            <section className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-red-800 dark:text-amber-400">
                    biblesandes.com · वेबसाइट तस्बिर ग्यालरी र बाइबल वालपेपर स्टुडियो
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ne'
                      ? 'ख्रीष्टिय तस्बिरहरू र बाइबल वचन वालपेपर (Photos & Wallpapers)'
                      : 'Christian Photo Gallery & Bible Verse Wallpaper Maker'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowGooglePickerModal(true)}
                    className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'ne'
                        ? 'Google Drive बाट तस्बिर छान्नुहोस्'
                        : 'Pick from Google Drive'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleOpenWallpaperWithPhoto()}
                    className="h-9 px-3.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {lang === 'ne'
                        ? 'फोटो अपलोड गरी वालपेपर बनाउनुहोस्'
                        : 'Upload Photo & Make Wallpaper'}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSection('gallery')}
                    className="h-9 px-3.5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                    <span>
                      {lang === 'ne'
                        ? '+ वेबसाइटमा फोटो थप्नुहोस् / सबै हेर्नुहोस् →'
                        : '+ Add Photo to Website / View All →'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {galleryAlbums.slice(0, 4).map((album) => (
                  <div
                    key={album.id}
                    className="group rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 flex flex-col justify-between"
                  >
                    <div
                      onClick={() => setActiveSection('gallery')}
                      className="h-40 bg-slate-900 overflow-hidden relative cursor-pointer"
                    >
                      <img
                        src={album.coverImage}
                        alt={album.titleEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {lang === 'ne' ? album.titleNe : album.titleEn}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 truncate">
                          {lang === 'ne' ? album.locationNe : album.locationEn}
                        </span>
                        <button
                          onClick={() => handleOpenWallpaperWithPhoto(album.coverImage)}
                          className="px-2 py-1 rounded-lg bg-red-800/10 dark:bg-amber-400/15 text-red-800 dark:text-amber-300 hover:bg-red-800 hover:text-white text-[11px] font-bold whitespace-nowrap transition-colors"
                        >
                          {lang === 'ne' ? 'वालपेपर बनाउनुहोस्' : 'Make Wallpaper'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================
            BIBLE MODULE VIEW
           =================================================================== */}
        {activeSection === 'bible' && (
          <BibleModuleView
            lang={lang}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            BIBLE QUIZ MODULE VIEW (66 Books · 11,982+ Questions)
           =================================================================== */}
        {activeSection === 'quiz' && (
          <BibleQuizView
            lang={lang}
            onNotify={notify}
            onOpenBible={() => setActiveSection('bible')}
          />
        )}

        {/* ===================================================================
            आजको बचन (TODAY'S WORD & DAILY DEVOTIONAL PAGE)
           =================================================================== */}
        {activeSection === 'daily_word' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {lang === 'ne'
                      ? `दैनिक बाइबल वचन र आत्मिक मनन · ${todayBS.formattedNe}`
                      : `Daily Scripture & Devotional · ${todayBS.formattedEn}`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? 'आजको बचन (Today’s Word)' : 'Today’s Word (आजको बचन)'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveSection('bible')}
                  className="h-10 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'पवित्र बाइबल पढ्नुहोस्' : 'Read Full Bible'}</span>
                </button>
                <button
                  onClick={() => setActiveSection('calendar')}
                  className="h-10 px-4 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-red-800 dark:text-amber-400" />
                  <span>{lang === 'ne' ? 'नेपाली पात्रो' : 'Nepali Calendar'}</span>
                </button>
              </div>
            </div>

            {/* Main Verse of the Day + Daily Devotional Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 Cols: Featured Verse of the Day in Nepali & English */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-red-800/10 dark:bg-amber-400/15 text-red-800 dark:text-amber-300 text-xs font-bold">
                      {lang === 'ne' ? 'आजको मुख्य बाइबल वचन' : 'Featured Verse of the Day'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {todayBS.formattedNe}
                    </span>
                  </div>

                  <blockquote className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-relaxed font-editorial">
                    “{dailyVerse.textNe}”
                  </blockquote>

                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    “{dailyVerse.textEn}”
                  </p>

                  <p className="text-sm font-mono font-bold text-red-800 dark:text-amber-400">
                    — {dailyVerse.bookNameNe} {toNepaliDigits(dailyVerse.chapter)}:{toNepaliDigits(dailyVerse.verse)} ({dailyVerse.bookNameEn} {dailyVerse.chapter}:{dailyVerse.verse})
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `“${dailyVerse.textNe}” — ${dailyVerse.bookNameNe} ${toNepaliDigits(dailyVerse.chapter)}:${toNepaliDigits(dailyVerse.verse)}`
                        );
                        notify(lang === 'ne' ? 'आजको बचन कपी गरियो!' : 'Today’s Word copied!');
                      }}
                      className="h-10 px-4 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'ne' ? 'कपी गर्नुहोस्' : 'Copy Verse'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(dailyVerse.id)}
                      className="h-10 px-4 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{lang === 'ne' ? 'बुकमार्क' : 'Bookmark'}</span>
                    </button>

                    <button
                      onClick={() => setShareHomeVerse(dailyVerse)}
                      className="h-10 px-4 rounded-xl bg-red-800 text-white hover:bg-red-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{lang === 'ne' ? 'तस्बिर कार्ड बनाउनुहोस् (Share Image)' : 'Share as Image'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Today's Devotional & Guided Prayer */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5 shadow-xs">
                <div className="space-y-3">
                  <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold inline-block">
                    {lang === 'ne' ? 'आजको आत्मिक मनन (Daily Reflection)' : 'Daily Devotional Meditation'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ne'
                      ? 'परमेश्वरको अनन्त प्रेम र अनन्त जीवनको आशा'
                      : 'God’s Unfailing Love & The Living Hope of Salvation'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lang === 'ne'
                      ? 'परमेश्वरले हामीलाई शब्दमा मात्र होइन तर आफ्ना एकमात्र पुत्र येशू ख्रीष्ट क्रूसमा बलिदान दिएर प्रेम प्रकट गर्नुभयो। आजको दिनमा हामी जस्तोसुकै परिस्थिति, चिन्ता वा थकानबाट गुज्रिरहेका भए तापनि, हामी एक्ला छैनौँ। उहाँमाथि विश्वास गर्ने प्रत्येक व्यक्तिले क्षमा, शान्ति र अनन्त जीवनको निश्चयता पाउँदछ।'
                      : 'God demonstrated His love for us not merely in words, but by giving His only Son Jesus Christ. Whatever challenges or burdens you face today, remember that you are deeply loved by the Creator, and in Christ you have forgiveness, peace, and eternal life.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
                  <p className="text-xs font-bold text-red-800 dark:text-amber-400">
                    {lang === 'ne' ? 'आजको प्रार्थना (Today’s Prayer):' : 'Today’s Guided Prayer:'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    {lang === 'ne'
                      ? '“हे प्रेमी स्वर्गीय पिता, आजको नयाँ बिहानी र तपाईंको जीवित वचनको निम्ति धन्यवाद। मलाई र मेरो परिवारलाई आज तपाईंको सत्यता र प्रेममा हिँड्न सहायता गर्नुहोस्। येशू मसीहको उच्च नाउँमा, आमेन।”'
                      : '“Loving Heavenly Father, thank You for this new day and Your living Word. Guide me and my family to walk in Your truth, grace, and love today. In Jesus’ precious name, Amen.”'}
                  </p>
                </div>
              </div>
            </div>

            {/* More Curated Daily Scripture Verses Collection */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'साप्ताहिक आशिषका बाइबल वचनहरू (Daily Promises)' : 'Weekly Scripture Promises & Verses'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ne'
                      ? 'कुनै पनि वचन कपी गर्नुहोस् वा तस्बिर कार्ड बनाएर परिवार र मण्डलीमा सेयर गर्नुहोस्'
                      : 'Copy any verse or generate a shareable image card for your family and church'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURATED_BIBLE_VERSES.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-stone-50/70 dark:bg-slate-950/60 border border-stone-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-red-800 dark:text-amber-400">
                        {v.bookNameNe} {toNepaliDigits(v.chapter)}:{toNepaliDigits(v.verse)} · {v.bookNameEn} {v.chapter}:{v.verse}
                      </span>
                      <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                        “{v.textNe}”
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        “{v.textEn}”
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `“${v.textNe}” — ${v.bookNameNe} ${toNepaliDigits(v.chapter)}:${toNepaliDigits(v.verse)}`
                          );
                          notify(lang === 'ne' ? 'बाइबल वचन कपी गरियो!' : 'Verse copied!');
                        }}
                        className="h-8 px-3 rounded-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:border-red-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'ne' ? 'कपी' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => setShareHomeVerse(v)}
                        className="h-8 px-3 rounded-lg bg-red-800/10 dark:bg-amber-400/15 text-red-800 dark:text-amber-300 hover:bg-red-800 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{lang === 'ne' ? 'तस्बिर कार्ड' : 'Image Card'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            NEPALI CALENDAR & BS/AD DATE CONVERTER VIEW
           =================================================================== */}
        {(activeSection === 'calendar' || activeSection === 'converter') && (
          <CalendarConverterView
            lang={lang}
            calendarEvents={calendarEvents}
            initialSubTab={activeSection === 'converter' ? 'converter' : 'calendar'}
            onNotify={notify}
            onOpenDailyWord={() => setActiveSection('daily_word')}
            onOpenBible={() => setActiveSection('bible')}
          />
        )}

        {/* ===================================================================
            CHRISTIAN NEWS PORTAL VIEW
           =================================================================== */}
        {activeSection === 'news' && (
          <NewsPortalView
            lang={lang}
            articles={news}
            savedNewsIds={savedNewsIds}
            onToggleSaveNews={handleToggleSaveNews}
            onCreatePost={handleCreateNews}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            NEPALI CHRISTIAN BHAJAN & CHORUS VIEW
           =================================================================== */}
        {activeSection === 'bhajan' && (
          <BhajanModuleView lang={lang} onNotify={notify} />
        )}

        {/* ===================================================================
            PRAYER WALL & INTERCESSION VIEW
           =================================================================== */}
        {activeSection === 'prayer' && (
          <PrayerWallView
            lang={lang}
            prayers={prayers}
            onSubmitPrayer={handleSubmitPrayer}
            onPrayForRequest={handlePrayForRequest}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            COMMUNITY RESOURCES (RADIO, GOLD/SILVER, GALLERY, EVENTS, CHURCHES)
           =================================================================== */}
        {(['radio', 'rates', 'gallery', 'events', 'churches'] as const).includes(
          activeSection as 'radio' | 'rates' | 'gallery' | 'events' | 'churches'
        ) && (
          <CommunityModulesView
            lang={lang}
            initialSubTab={activeSection as 'radio' | 'rates' | 'gallery' | 'events' | 'churches'}
            radioStations={radioStations}
            activeStationId={activeStationId}
            isPlayingRadio={isPlayingRadio}
            radioVolume={radioVolume}
            favoriteStationIds={favoriteStationIds}
            onPlayStation={handlePlayStation}
            onChangeVolume={handleVolumeChange}
            onToggleFavoriteStation={(id) =>
              setFavoriteStationIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            rates={rates}
            galleryAlbums={galleryAlbums}
            onAddGalleryPhoto={handleAddGalleryPhoto}
            onMakeWallpaperWithPhoto={handleOpenWallpaperWithPhoto}
            events={events}
            churches={NEPAL_CHURCH_DIRECTORY}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            NOTES & REMINDERS, PODCASTS, LIFE & HEALTH TIPS, AND FOREX RATES VIEW
           =================================================================== */}
        {(['notes', 'podcasts', 'healthtips', 'forex'] as const).includes(
          activeSection as 'notes' | 'podcasts' | 'healthtips' | 'forex'
        ) && (
          <LifeNotesPodcastsView
            lang={lang}
            initialTab={activeSection as 'notes' | 'podcasts' | 'healthtips' | 'forex'}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            NEPALI UNICODE CONVERTER & VIRTUAL KEYBOARD PAGE (nepali-unicode)
           =================================================================== */}
        {activeSection === 'unicode' && (
          <NepaliUnicodeView
            lang={lang}
            onNotify={notify}
            onSaveToNotes={() => {
              notify(
                lang === 'ne'
                  ? 'नेपाली युनिकोड पाठ "नोट र रिमाइन्डर" मा सुरक्षित गरियो!'
                  : 'Nepali Unicode text saved to Personal Notes!'
              );
              setActiveSection('notes');
            }}
          />
        )}

        {/* ===================================================================
            ADMIN DASHBOARD & CMS PORTAL (Content Updates & Management)
           =================================================================== */}
        {activeSection === 'admin' && (
          <AdminDashboardView
            lang={lang}
            currentAdmin={currentAdmin}
            onSelectAdminRole={(role) => setCurrentAdmin(role)}
            news={news}
            onCreateNews={handleCreateNews}
            onUpdateNews={handleUpdateNews}
            onDeleteNews={handleDeleteNews}
            prayers={prayers}
            onModeratePrayer={handleModeratePrayer}
            rates={rates}
            onUpdateRates={handleUpdateRates}
            radioStations={radioStations}
            onAddRadioStation={handleAddRadioStation}
            auditLogs={auditLogs}
            onNotify={notify}
            onExitAdmin={() => setActiveSection('home')}
            onOpenCPanelModal={() => setShowDeployModal(true)}
          />
        )}

        {/* ===================================================================
            PRIVACY POLICY, TERMS & CONDITIONS, AND ABOUT US (PAGES)
           =================================================================== */}
        {(activeSection === 'privacy' ||
          activeSection === 'terms' ||
          activeSection === 'about' ||
          activeSection === 'delete-account' ||
          activeSection === 'community') && (
          <LegalAndAboutView
            lang={lang}
            initialTab={activeSection as LegalTabType}
            onNavigateTab={(tab) => {
              navigateToSection(tab as PrimarySection);
            }}
            onOpenSection={(sec) => {
              navigateToSection(sec as PrimarySection);
            }}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            TOOLS & DIGITAL RESOURCES HUB (उपकरणहरू - #tools)
           =================================================================== */}
        {activeSection === 'tools' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FBEEC1]/50 border border-[#BC986A]/40 text-xs font-bold text-[#8D8741] dark:text-[#DAAD86]">
                <Wrench className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'डिजिटल उपकरणहरू' : 'Digital Christian Tools'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'सुसमाचार दैनिक उपयोगी उपकरणहरू' : 'Susamachar Digital Tools & Utilities'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {lang === 'ne'
                  ? 'नेपाली युनिकोड, व्यक्तिगत नोट र रिमाइन्डर, बाइबल क्विज, पात्रो मिति परिवर्तन, दैनिक सुनचाँदी तथा विदेशी विनिमय दर।'
                  : 'Nepali Unicode converter, personal notes, timed Bible quiz, Bikram Sambat date converter, and financial rates.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'unicode',
                  icon: Keyboard,
                  titleNe: 'नेपाली युनिकोड कन्भर्टर',
                  titleEn: 'Nepali Unicode Converter',
                  descNe: 'रोमन वा परम्परागत नेपाली फन्टलाई शुद्ध नेपाली युनिकोडमा परिवर्तन गर्नुहोस्।',
                  descEn: 'Convert Romanized or Preeti text to clean, universal Nepali Unicode text.',
                  badge: 'Keyboard Tool',
                },
                {
                  id: 'notes',
                  icon: StickyNote,
                  titleNe: 'नोट र रिमाइन्डर (Notes)',
                  titleEn: 'Personal Notes & Reminders',
                  descNe: 'बाइबलीय मनन, व्यक्तिगत प्रार्थना सूची र दैनिक कामहरूको रिमाइन्डर सुरक्षित गर्नुहोस्।',
                  descEn: 'Record spiritual thoughts, prayer lists, and personal reminders with local storage.',
                  badge: 'Productivity',
                },
                {
                  id: 'quiz',
                  icon: Trophy,
                  titleNe: 'बाइबल क्विज (Timed Quiz)',
                  titleEn: 'Timed Bible Quiz (66 Books)',
                  descNe: '६६ वटै पुस्तकका सयौँ प्रश्नहरूसँग आफ्नो बाइबलीय ज्ञान परीक्षण गर्नुहोस्।',
                  descEn: 'Test your Biblical knowledge across all 66 books with timed sessions and resume support.',
                  badge: 'Quiz & Study',
                },
                {
                  id: 'converter',
                  icon: ArrowLeftRight,
                  titleNe: 'नेपाली पात्रो तथा मिति रूपान्तरण',
                  titleEn: 'BS ↔ AD Date Converter',
                  descNe: '२००० देखि २०९० सम्मको आधिकारिक बिक्रम संवत् र ग्रेगोरियन मिति रूपान्तरण।',
                  descEn: 'Convert accurately between Bikram Sambat (BS) and Gregorian (AD) dates from 1943 to 2034.',
                  badge: 'Calendar Engine',
                },
                {
                  id: 'churches',
                  icon: Building2,
                  titleNe: 'मण्डली निर्देशिका (Churches)',
                  titleEn: 'Church Directory & Fellowship',
                  descNe: 'नेपाल र विदेशका नेपाली मण्डलीहरू, पास्टर अगुवा र आराधना संगतिको समय।',
                  descEn: 'Find local congregations, pastor contacts, fellowship times, and addresses.',
                  badge: 'Fellowship',
                },
                {
                  id: 'rates',
                  icon: Coins,
                  titleNe: 'दैनिक सुनचाँदी दर',
                  titleEn: 'Daily Gold & Silver Rates',
                  descNe: 'नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA) को आधिकारिक दैनिक बजार दर।',
                  descEn: 'Official daily fine gold, tejabi gold, and silver rates in Nepalese Rupees.',
                  badge: 'Market Rates',
                },
                {
                  id: 'forex',
                  icon: DollarSign,
                  titleNe: 'विदेशी विनिमय दर (Forex)',
                  titleEn: 'Foreign Currency Rates (NRB)',
                  descNe: 'नेपाल राष्ट्र बैंकद्वारा निर्धारित अमेरिकी डलर, युरो, पाउन्ड र खाडी देशका विनिमय दर।',
                  descEn: 'Daily foreign currency buying and selling rates by Nepal Rastra Bank.',
                  badge: 'Exchange Rates',
                },
                {
                  id: 'podcasts',
                  icon: Mic,
                  titleNe: 'ख्रीष्टिय पोडकास्ट तथा प्रवचन',
                  titleEn: 'Christian Audio & Sermons',
                  descNe: 'नेपाली ख्रीष्टिय अगुवाहरूका आत्मिक सन्देश, शिक्षा र उत्साहजनक पोडकास्ट।',
                  descEn: 'Inspiring biblical teachings, youth sermons, and faith-building podcasts.',
                  badge: 'Audio & Faith',
                },
                {
                  id: 'healthtips',
                  icon: Activity,
                  titleNe: 'जीवन र स्वास्थ्य टिप्स',
                  titleEn: 'Life & Health Tips',
                  descNe: 'शारीरिक, मानसिक र आत्मिक स्वास्थ्यका लागि व्यावहारिक बाइबलीय सुझावहरू।',
                  descEn: 'Practical biblical guidance for family harmony, physical wellness, and mental peace.',
                  badge: 'Wellness',
                },
              ].map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => navigateToSection(tool.id as PrimarySection)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#BC986A]/25 dark:border-slate-800 hover:border-[#659DBD] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 text-[#8D8741] dark:text-[#FBEEC1] group-hover:bg-[#659DBD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <ToolIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {tool.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#659DBD] transition-colors">
                          {lang === 'ne' ? tool.titleNe : tool.titleEn}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {lang === 'ne' ? tool.descNe : tool.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#8D8741] dark:text-[#DAAD86] group-hover:text-[#659DBD]">
                      <span>{lang === 'ne' ? 'उपकरण खोल्नुहोस्' : 'Open Tool'}</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Persistent Background FM Radio Mini-Player Bar */}
      {activeStationId && (
        <div className="fixed bottom-20 right-4 left-4 lg:left-auto lg:w-96 z-40 bg-slate-900 text-white border border-slate-700 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                const st = radioStations.find((s) => s.id === activeStationId);
                if (st) handlePlayStation(st);
              }}
              className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0"
            >
              {isPlayingRadio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-amber-400 font-mono truncate">
                {isPlayingRadio ? 'LIVE FM STREAM' : 'PAUSED'} · {radioStations.find((s) => s.id === activeStationId)?.frequency}
              </p>
              <p className="text-xs font-bold truncate">
                {lang === 'ne'
                  ? radioStations.find((s) => s.id === activeStationId)?.nameNe
                  : radioStations.find((s) => s.id === activeStationId)?.nameEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={radioVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 accent-amber-400"
            />
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                sacredRadioEngine.stop();
                setIsPlayingRadio(false);
                setActiveStationId(null);
              }}
              className="p-1 text-slate-400 hover:text-white"
              title="Close Radio Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          UNIVERSAL FIXED BOTTOM NAVIGATION BAR (Mobile, Tablet & Desktop)
          Displays Icon + Name for: Home, Bible, Bhajan, Prayer, News, Church
         ===================================================================== */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-[#BC986A]/20 dark:border-slate-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 grid grid-cols-6 items-center h-16">
          {[
            { id: 'home', icon: Home, ne: 'गृहपृष्ठ', en: 'Home' },
            { id: 'bible', icon: BookOpen, ne: 'बाइबल', en: 'Bible' },
            { id: 'bhajan', icon: Music, ne: 'भजन', en: 'Bhajan' },
            { id: 'prayer', icon: HeartHandshake, ne: 'प्रार्थना', en: 'Prayer' },
            { id: 'news', icon: Newspaper, ne: 'समाचार', en: 'News' },
            { id: 'churches', icon: Building2, ne: 'मण्डली', en: 'Church' },
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateToSection(item.id as PrimarySection)}
                className={`min-h-[48px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl mx-0.5 sm:mx-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#659DBD] dark:text-[#659DBD] bg-[#659DBD]/15 dark:bg-[#659DBD]/20 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#659DBD] dark:hover:text-[#659DBD] hover:bg-[#FAF6EC] dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <IconComp className="w-5 h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
                  {lang === 'ne' ? item.ne : item.en}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================
          REDESIGNED STRUCTURED FOOTER (Centered on Mobile, Balanced Columns, 1-Line Bottom Bar)
         ===================================================================== */}
      <footer className="relative bg-[#FAF6EC] dark:bg-slate-950 border-t-2 border-[#BC986A]/35 dark:border-slate-800 pt-10 pb-16 mt-16 text-slate-700 dark:text-slate-300 shadow-sm">
        {/* Top Decorative Christian Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8D8741] via-[#BC986A] to-[#659DBD]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#BC986A]/20 dark:border-slate-800">
            {/* Column 1 (4 cols): Platform Branding, Slogan, Contact & Social - Centered on Mobile */}
            <div className="lg:col-span-4 space-y-4 flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <img
                  src="/assets/aistudio/Bible_Sandesh__Radiant_Faith_Emblem_c37247e4.png"
                  alt="बाइबल सन्देश · Bible Sandesh"
                  className="h-16 w-auto object-contain shrink-0 drop-shadow-2xs mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    बाइबल सन्देश (सुसमाचार)
                  </h3>
                  <p className="text-xs text-[#8D8741] dark:text-[#DAAD86] font-semibold mt-0.5">
                    biblesandes.com · इसाई डिजिटल मञ्च
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-md mx-auto sm:mx-0 text-center sm:text-left">
                {lang === 'ne'
                  ? '“सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ” — पवित्र बाइबल, भजन, आजको बचन, प्रार्थना पर्खाल, इसाई समाचार, मण्डली निर्देशिका तथा दैनिक डिजिटल उपकरणहरू।'
                  : '“Share the Gospel • Grow in Faith • Serve with Love” — Multilingual Holy Bible, Christian Hymns, Daily Word, Prayer Wall, News, Church Directory, and Christian tools.'}
              </p>

              {/* Verified Contact Details - Centered on mobile */}
              <div className="space-y-1.5 text-xs flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8D8741] shrink-0" />
                  <span className="text-slate-500">सम्पर्क:</span>
                  <a href="tel:9858064058" className="font-mono font-bold text-slate-900 dark:text-white hover:text-[#659DBD]">
                    ९८५८०६४०५८ (9858064058)
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#8D8741] shrink-0" />
                  <span className="text-slate-500">वेबसाइट:</span>
                  <a href="https://biblesandes.com" className="font-mono font-semibold text-slate-800 dark:text-slate-200 hover:text-[#659DBD]">
                    https://biblesandes.com
                  </a>
                </div>
              </div>

              {/* Social Channels - Centered on mobile */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <a
                  href="https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://www.facebook.com/susamachar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/25 flex items-center gap-1.5 text-xs font-semibold hover:bg-[#1877F2] hover:text-white transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.instagram.com/susamachar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-2.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-500/25 flex items-center gap-1.5 text-xs font-semibold hover:bg-pink-600 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@susamacharnp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/25 flex items-center gap-1.5 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://x.com/susamachar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs font-mono font-bold hover:bg-black hover:text-white transition-colors"
                  title="X"
                >
                  𝕏
                </a>
              </div>
            </div>

            {/* Columns 2, 3, 4 (8 cols): Structured Multi-Column Grid for Links on Mobile & Desktop */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              {/* Column 2: आत्मिक स्रोतहरू (Spiritual Resources) */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-[#BC986A]/20 pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#8D8741]" />
                  <span>{lang === 'ne' ? 'आत्मिक स्रोतहरू' : 'Spiritual Resources'}</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => navigateToSection('home')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'गृहपृष्ठ (Home)' : 'Home'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('bible')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'पवित्र बाइबल (Holy Bible)' : 'Holy Bible (66 Books)'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('daily_word')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'ne' ? 'आजको बचन (Today’s Word)' : 'Today’s Word'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('bhajan')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Music className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'ख्रीष्टिय भजन (Christian Hymns)' : 'Christian Hymns & Songs'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('prayer')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'प्रार्थना पर्खाल (Prayer Wall)' : 'Prayer Wall'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('news')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'इसाई समाचार (Christian News)' : 'Christian News Portal'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('churches')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-semibold text-[#8D8741] dark:text-[#DAAD86] cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'मण्डली निर्देशिका (Churches)' : 'Church Directory'}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: उपयोगी उपकरणहरू (Digital Tools) */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-[#BC986A]/20 pb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#8D8741]" />
                  <span>{lang === 'ne' ? 'डिजिटल उपकरणहरू' : 'Digital Tools'}</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => navigateToSection('unicode')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'नेपाली युनिकोड' : 'Nepali Unicode'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('notes')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'नोट र रिमाइन्डर' : 'Notes & Reminders'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('quiz')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'बाइबल क्विज (Timed Quiz)' : 'Bible Quiz'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('converter')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'मिति परिवर्तन (BS ↔ AD)' : 'BS ↔ AD Converter'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('rates')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'सुनचाँदी दर' : 'Gold & Silver Rates'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('forex')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ne' ? 'विदेशी विनिमय दर' : 'Forex Rates'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('tools')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-bold text-[#8D8741] dark:text-[#DAAD86] cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'सबै उपकरणहरू (Tools) →' : 'All Tools Hub →'}</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: कानुनी तथा नीति (Legal & Policies) - Spans 2 cols on mobile if needed */}
              <div className="col-span-2 sm:col-span-1 space-y-3 pt-2 sm:pt-0">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-[#BC986A]/20 pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#8D8741]" />
                  <span>{lang === 'ne' ? 'कानुनी तथा नीति' : 'Legal & Policies'}</span>
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs">
                  <li>
                    <button
                      onClick={() => navigateToSection('about')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'हाम्रो बारेमा (About Us)' : 'About Us'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('privacy')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'गोपनीयता नीति (Privacy)' : 'Privacy Policy'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('terms')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'सेवाका सर्तहरू (Terms)' : 'Terms & Conditions'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('community')}
                      className="hover:text-[#659DBD] transition-colors flex items-center gap-1.5 text-left font-medium cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'समुदाय निर्देशिका' : 'Community Guidelines'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateToSection('delete-account')}
                      className="hover:text-red-500 transition-colors flex items-center gap-1.5 text-left font-medium text-red-700 dark:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'खाता मेटाउने (Delete Account)' : 'Delete Account'}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright notice & Admin CMS button in strictly 1 clean row without BS date */}
          <div className="pt-5 flex flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 border-t border-[#BC986A]/20 dark:border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate">
                © {new Date().getFullYear()} बाइबल सन्देश (Bible Sandesh) · biblesandes.com
              </span>
            </div>

            <button
              onClick={() => navigateToSection('admin')}
              className="h-8 px-2.5 sm:px-3 rounded-lg bg-white dark:bg-slate-800 border border-[#BC986A]/30 dark:border-slate-700 hover:bg-[#8D8741] hover:text-white text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 text-[11px] sm:text-xs shadow-2xs"
              title="Admin CMS Login"
            >
              <Shield className="w-3.5 h-3.5 text-[#8D8741]" />
              <span className="whitespace-nowrap">{lang === 'ne' ? 'व्यवस्थापक लगइन (Admin)' : 'Admin CMS'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          FOOTER MODALS: ABOUT US, PRIVACY, TERMS, TOOLS, WHATSAPP SUPPORT, AI
         ===================================================================== */}
      {activeFooterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeFooterModal === 'about' && (
                  <>
                    <Info className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'हाम्रो बारेमा (About Susamachar)' : 'About Susamachar – Christian App'}</span>
                  </>
                )}
                {activeFooterModal === 'privacy' && (
                  <>
                    <Lock className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}</span>
                  </>
                )}
                {activeFooterModal === 'terms' && (
                  <>
                    <FileText className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'सेवाका सर्तहरू (Terms & Conditions)' : 'Terms & Conditions'}</span>
                  </>
                )}
                {activeFooterModal === 'tools' && (
                  <>
                    <Wrench className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'दैनिक उपयोगी उपकरणहरू (Susamachar Tools)' : 'Susamachar Christian & Daily Tools'}</span>
                  </>
                )}
                {activeFooterModal === 'whatsapp' && (
                  <>
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'ne' ? 'व्हाट्सएप सहायता (WhatsApp Support)' : 'WhatsApp Community & Technical Support'}</span>
                  </>
                )}
                {activeFooterModal === 'ai' && (
                  <>
                    <Sparkles className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'सुसमाचार बाइबलीय AI सहायक (Biblical AI Only)' : 'Susamachar Biblical AI Assistant'}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveFooterModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeFooterModal === 'about' && (
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/aistudio/Bible_Sandesh__Radiant_Faith_Emblem_c37247e4.png"
                    alt="बाइबल सन्देश · Bible Sandesh Logo"
                    className="h-14 w-auto object-contain shrink-0"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      बाइबल सन्देश · सुसमाचार (Bible Sandesh · biblesandes.com)
                    </p>
                    <p className="text-[11px] text-red-800 dark:text-amber-400 font-semibold">
                      “सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ”
                    </p>
                  </div>
                </div>
                <p>
                  {lang === 'ne'
                    ? 'सुसमाचार (biblesandes.com) परमेश्वरको जीवित वचन, ख्रीष्टिय भजन, दैनिक आत्मिक मनन (आजको बचन), बाइबल क्विज, नोट र रिमाइन्डर, पोडकास्ट तथा जीवन र स्वास्थ्य टिप्सलाई नेपाल र विश्वभरका नेपाली भाषी समुदायमाझ पुर्याउने डिजिटल सेवकाइ र संजाल हो।'
                    : 'Susamachar (biblesandes.com) is a Christian digital ministry and community platform dedicated to sharing the living Word of God, Nepali & Hindi Christian hymns, daily devotionals, timed Bible quiz, personal notes & reminders, podcasts, and health tips.'}
                </p>
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'आधिकारिक सम्पर्क र सामाजिक संजाल:' : 'Official Contact & Social Links:'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-red-800 dark:text-amber-400 shrink-0" />
                    <strong>{lang === 'ne' ? 'सम्पर्क नम्बर (Phone):' : 'Phone:'}</strong>{' '}
                    <a href="tel:9858064058" className="text-red-800 dark:text-amber-400 font-mono font-bold hover:underline">
                      ९८५८०६४०५८ (9858064058)
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <strong>Facebook:</strong>{' '}
                    <a
                      href="https://www.facebook.com/susamachar/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 dark:text-amber-400 font-mono font-bold hover:underline break-all"
                    >
                      https://www.facebook.com/susamachar/
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <strong>WhatsApp Channel:</strong>{' '}
                    <a
                      href="https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 font-mono font-bold hover:underline break-all"
                    >
                      whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <strong>Instagram:</strong>{' '}
                    <a
                      href="https://www.instagram.com/susamachar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-700 dark:text-pink-400 font-mono font-bold hover:underline"
                    >
                      instagram.com/susamachar
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <strong>YouTube:</strong>{' '}
                    <a
                      href="https://www.youtube.com/@susamacharnp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-700 dark:text-red-400 font-mono font-bold hover:underline"
                    >
                      youtube.com/@susamacharnp
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs w-3.5 text-center shrink-0">𝕏</span>
                    <strong>X (Twitter):</strong>{' '}
                    <a
                      href="https://x.com/susamachar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 dark:text-white font-mono font-bold hover:underline"
                    >
                      x.com/susamachar
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-red-800 dark:text-amber-400 shrink-0" />
                    <strong>Email & Website:</strong>{' '}
                    <a
                      href="mailto:info@biblesandes.com"
                      className="text-red-800 dark:text-amber-400 font-mono font-bold hover:underline"
                    >
                      info@biblesandes.com
                    </a>{' '}
                    ·{' '}
                    <a
                      href="https://biblesandes.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-800 dark:text-amber-400 font-mono font-bold hover:underline"
                    >
                      biblesandes.com
                    </a>
                  </p>
                </div>
              </div>
            )}

            {activeFooterModal === 'privacy' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Prayer Request Privacy:</strong> Private prayer requests submitted on Susamachar are strictly confidential and never displayed on the public Prayer Wall without explicit consent and pastoral moderation.
                </p>
                <p>
                  <strong>2. Personal Data Protection:</strong> Your account email, saved Bible bookmarks, personal notes, and notification preferences are stored securely and never sold or shared with third-party advertisers.
                </p>
                <p>
                  <strong>3. Offline Storage:</strong> Bible chapters, personal notes, and reminders cached on your device remain strictly local for offline reading.
                </p>
              </div>
            )}

            {activeFooterModal === 'terms' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Scripture Licensing:</strong> All Nepali, Hindi, and English Bible translations provided in Susamachar are authorized editions for personal devotion and church study.
                </p>
                <p>
                  <strong>2. Community Conduct:</strong> Users submitting prayer requests or social posts agree to uphold Christian love, mutual respect, and truthfulness.
                </p>
                <p>
                  <strong>3. Editorial Verification:</strong> Christian news articles and church events are verified by our editorial and pastoral moderation team before publication.
                </p>
              </div>
            )}

            {activeFooterModal === 'tools' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    id: 'unicode',
                    titleNe: 'नेपाली युनिकोड (Nepali Unicode)',
                    titleEn: 'Nepali Unicode (nepali-unicode)',
                    descNe: 'Romanized र Preeti फन्टबाट नेपाली युनिकोड रूपान्तरण र किबोर्ड',
                    descEn: 'Romanized & Preeti to Nepali Unicode converter + keyboard',
                    icon: Keyboard,
                  },
                  {
                    id: 'forex',
                    titleNe: 'आजको विदेशी विनिमय दर (Forex Rates)',
                    titleEn: 'Today’s Foreign Exchange Rates',
                    descNe: 'नेपाल राष्ट्र बैंकको आजको विदेशी मुद्रा खरिद/बिक्री दर र क्यालकुलेटर',
                    descEn: 'NRB daily currency exchange rates & NPR converter',
                    icon: DollarSign,
                  },
                  {
                    id: 'notes',
                    titleNe: 'नोट र रिमाइन्डर (Notes & Reminder)',
                    titleEn: 'Personal Notes & Reminders',
                    descNe: 'नोट लेखेर सेभ गर्नुहोस् र समय तोकेर रिमाइन्डर राख्नुहोस्',
                    descEn: 'Write & save notes with scheduled reminder alerts',
                    icon: StickyNote,
                  },
                  {
                    id: 'podcasts',
                    titleNe: 'ख्रीष्टिय पोडकास्ट (Podcasts)',
                    titleEn: 'Christian Podcasts',
                    descNe: 'आत्मिक प्रवचन, येशूको जीवनी र युवा पोडकास्ट',
                    descEn: 'Biblical teachings, devotionals & youth podcasts',
                    icon: Mic,
                  },
                  {
                    id: 'healthtips',
                    titleNe: 'जीवन र स्वास्थ्य टिप्स (Life & Health)',
                    titleEn: 'Biblical Life & Health Tips',
                    descNe: 'बाइबलीय जीवनशैली, मानसिक शान्ति र स्वास्थ्य टिप्स',
                    descEn: 'Biblical wellness, peace of mind & daily health tips',
                    icon: Activity,
                  },
                  {
                    id: 'rates',
                    titleNe: 'सुनचाँदी दर (Gold & Silver)',
                    titleEn: 'Gold & Silver Rates (NPR)',
                    descNe: 'दैनिक तोला र १० ग्रामको मूल्य',
                    descEn: 'Daily Fine Gold, Tejabi & Silver',
                    icon: Coins,
                  },
                  {
                    id: 'converter',
                    titleNe: 'मिति परिवर्तन (Date Converter)',
                    titleEn: 'BS ↔ AD Date Converter',
                    descNe: 'विक्रम सम्वत् र ईस्वी सम्वत् रूपान्तरण',
                    descEn: 'Exact Bikram Sambat to Gregorian',
                    icon: ArrowLeftRight,
                  },
                  {
                    id: 'quiz',
                    titleNe: 'बाइबल क्विज (Timed Bible Quiz)',
                    titleEn: '66-Book Timed Bible Quiz',
                    descNe: 'समयसहित ६६ पुस्तक र १,१८९ अध्यायका १२,०००+ प्रश्न',
                    descEn: 'Timed 12,000+ Scripture quiz questions',
                    icon: Trophy,
                  },
                  {
                    id: 'bible',
                    titleNe: 'बाइबल वालपेपर कार्ड (Wallpaper Tool)',
                    titleEn: 'Bible Verse Wallpaper Maker',
                    descNe: 'बाइबल पदलाई आकर्षक तस्बिर कार्डमा सेयर गर्नुहोस्',
                    descEn: 'Create & download verse wallpapers',
                    icon: ImageIcon,
                  },
                ].map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveSection(tool.id as PrimarySection);
                        setActiveFooterModal(null);
                      }}
                      className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 hover:border-red-800 dark:hover:border-amber-400 text-left flex items-start gap-3 transition-colors"
                    >
                      <ToolIcon className="w-5 h-5 text-red-800 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {lang === 'ne' ? tool.titleNe : tool.titleEn}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === 'ne' ? tool.descNe : tool.descEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeFooterModal === 'whatsapp' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    {lang === 'ne'
                      ? 'सुसमाचार २४/७ व्हाट्सएप च्यानल र सहायता डेस्क'
                      : 'Susamachar Official WhatsApp Channel & Support Desk'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lang === 'ne'
                      ? 'प्राविधिक सहयोग, दैनिक बाइबल वचन, मण्डली सूचीकरण वा प्रार्थना निवेदनका लागि हाम्रो आधिकारिक व्हाट्सएप च्यानलमा जोडिनुहोस् वा ९८५८०६४०५८ मा सम्पर्क गर्नुहोस्।'
                      : 'Join our official WhatsApp Channel or contact 9858064058 for technical support, daily Bible verses, and prayer fellowship.'}
                  </p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white break-all">
                    https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L
                  </p>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    📞 Phone / WhatsApp: ९८५८०६४०५८ (9858064058)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'WhatsApp च्यानल खोल्नुहोस्' : 'Join WhatsApp Channel'}</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L');
                      notify(lang === 'ne' ? 'व्हाट्सएप लिङ्क कपी गरियो!' : 'WhatsApp channel link copied!');
                    }}
                    className="h-10 px-4 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'लिङ्क कपी' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeFooterModal === 'ai' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                  {lang === 'ne'
                    ? '✝ बाइबलीय नियम: यस AI सहायकलाई केवल पवित्र बाइबल, प्रभु येशू ख्रीष्ट र मुक्तिको (Salvation) विषयमा मात्र लेख्न अनुमति दिइएको छ।'
                    : '✝ Biblical Rule: This AI Assistant is strictly restricted to writing only about the Holy Bible, Lord Jesus Christ, and Salvation.'}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { ne: 'प्रभु येशू ख्रीष्ट को हुनुहुन्छ?', en: 'Who is Lord Jesus Christ according to the Bible?' },
                    { ne: 'बाइबल अनुसार मुक्ति (Salvation) कसरी पाइन्छ?', en: 'How do we receive Salvation according to the Bible?' },
                    { ne: 'यूहन्ना ३:१६ र १४:६ को अर्थ', en: 'Meaning of John 3:16 and John 14:6' },
                    { ne: 'शान्ति र क्षमाको बाइबल पद', en: 'Bible verses on peace and forgiveness' },
                  ].map((chip) => (
                    <button
                      key={chip.en}
                      onClick={() => handleAskAiAssistant(lang === 'ne' ? chip.ne : chip.en)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-800 hover:text-white transition-colors"
                    >
                      {lang === 'ne' ? chip.ne : chip.en}
                    </button>
                  ))}
                </div>

                <div className="h-64 overflow-y-auto p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-3">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl whitespace-pre-line leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-red-800 text-white ml-8'
                          : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-4'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-500 animate-pulse">
                      {lang === 'ne' ? 'पवित्र धर्मशास्त्र खोजिँदैछ...' : 'Searching Holy Scripture...'}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAiAssistant();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={
                      lang === 'ne'
                        ? 'बाइबल, येशू ख्रीष्ट वा मुक्तिसम्बन्धी प्रश्न सोध्नुहोस्...'
                        : 'Ask about the Bible, Jesus Christ, or Salvation...'
                    }
                    className="flex-1 h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-800"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="h-10 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'सोध्नुहोस्' : 'Ask'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOBAL SEARCH MODAL (Section 15)
         ===================================================================== */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-red-800 dark:text-amber-400" />
              <input
                type="text"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder={lang === 'ne' ? 'बाइबल पद, समाचार, लेख वा मण्डली खोज्नुहोस्...' : 'Search Bible verses, news, study guides, or churches...'}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!globalSearchQuery.trim() ? (
              <div className="py-6 text-center text-xs text-slate-500">
                {lang === 'ne'
                  ? 'खोज्नका लागि शब्द टाइप गर्नुहोस् (उदा: प्रेम, यूहन्ना, पोखरा, गोठालो, प्रार्थना)'
                  : 'Type a keyword to search across Bible verses, Christian News, Study Guides, and Churches.'}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-4 pr-1 text-xs">
                {globalSearchResults.verses.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-red-800 dark:text-amber-400">
                      Holy Bible Verses ({globalSearchResults.verses.length})
                    </p>
                    {globalSearchResults.verses.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setActiveSection('bible');
                          setShowSearchModal(false);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 cursor-pointer hover:border-red-800 border border-transparent"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          {v.bookNameNe} {v.chapter}:{v.verse} ({v.bookNameEn})
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{v.textNe}</p>
                      </div>
                    ))}
                  </div>
                )}

                {globalSearchResults.news.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-red-800 dark:text-amber-400">
                      Christian News ({globalSearchResults.news.length})
                    </p>
                    {globalSearchResults.news.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setActiveSection('news');
                          setShowSearchModal(false);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 cursor-pointer"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">{n.titleNe}</p>
                        <p className="text-slate-500">{n.titleEn}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          USER ACCOUNT & AUTHENTICATION MODAL (Section 13)
         ===================================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {userSession
                  ? lang === 'ne' ? 'प्रयोगकर्ता प्रोफाइल (User Profile)' : 'Member Account Profile'
                  : authMode === 'login'
                  ? lang === 'ne' ? 'सुसमाचार खाता लगइन' : 'Sign In to Susamachar'
                  : authMode === 'register'
                  ? lang === 'ne' ? 'नयाँ खाता खोल्नुहोस् (Register)' : 'Create Member Account'
                  : lang === 'ne' ? 'पासवर्ड रिसेट गर्नुहोस्' : 'Reset Password'}
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!userSession && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ne' ? 'लगइन (Sign In)' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ne' ? 'नयाँ खाता (Register)' : 'Register'}
                </button>
              </div>
            )}

            {userSession ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950 space-y-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{userSession.fullName}</p>
                  <p className="text-slate-500">{userSession.email}</p>
                  <p className="text-red-800 dark:text-amber-400 font-semibold">
                    Fellowship: {userSession.churchName}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{bookmarks.length}</div>
                    <div className="text-[11px] text-slate-500">Saved Verses</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{savedNewsIds.length}</div>
                    <div className="text-[11px] text-slate-500">Saved News</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{favoriteStationIds.length}</div>
                    <div className="text-[11px] text-slate-500">Fav Radio</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await signOut(auth);
                    } catch {
                      // ignore
                    }
                    setUserSession(null);
                    setShowAccountModal(false);
                    notify(lang === 'ne' ? 'लगआउट गरियो।' : 'Logged out.');
                  }}
                  className="w-full h-10 rounded-xl bg-stone-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  {lang === 'ne' ? 'लगआउट (Logout)' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleUserAuthSubmit} className="space-y-3 text-xs">
                <button
                  type="button"
                  onClick={handleGoogleFirebaseLogin}
                  className="w-full h-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>
                    {lang === 'ne'
                      ? 'Google बाट लगइन गर्नुहोस् (Firebase Auth)'
                      : 'Sign in with Google (Firebase Auth)'}
                  </span>
                </button>

                <div className="relative flex items-center py-1">
                  <div className="grow border-t border-stone-200 dark:border-slate-800" />
                  <span className="shrink-0 px-2 text-[10px] text-slate-400 uppercase">
                    {lang === 'ne' ? 'वा इमेल / पासवर्ड' : 'or Email / Password'}
                  </span>
                  <div className="grow border-t border-stone-200 dark:border-slate-800" />
                </div>
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="आशिष गुरुङ (Ashish Gurung)"
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Local Church / Fellowship</label>
                      <input
                        type="text"
                        value={authChurch}
                        onChange={(e) => setAuthChurch(e.target.value)}
                        placeholder="Patan Koinonia Church"
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Email or Admin Username</label>
                  <input
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="member@susamachar.org or superadmin"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                  />
                </div>

                {authMode !== 'reset' && (
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold"
                >
                  {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>

                <div className="flex items-center justify-between pt-2 text-slate-500">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="hover:underline font-semibold text-red-800 dark:text-amber-400"
                  >
                    {authMode === 'login' ? 'Create new account' : 'Back to Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Direct Admin CMS Quick Access Card */}
                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-slate-800 bg-[#FAF6EC] dark:bg-slate-950 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8D8741] dark:text-[#FBEEC1] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#8D8741]" />
                      <span>{lang === 'ne' ? 'एडमिन ड्यासबोर्ड (CMS)' : 'Admin CMS Portal'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountModal(false);
                        setActiveSection('admin');
                        notify(lang === 'ne' ? 'एडमिन ड्यासबोर्डमा स्वागत छ!' : 'Welcome to Admin Dashboard!');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#8D8741] hover:bg-[#787334] text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                    >
                      {lang === 'ne' ? 'ड्यासबोर्ड खोल्नुहोस् →' : 'Open Dashboard →'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'ne'
                      ? 'समाचार, सुनचाँदी दर, प्रार्थना वा भजनहरू अपडेट गर्न सिधै एडमिन ड्यासबोर्ड खोल्न सक्नुहुन्छ।'
                      : 'Update news articles, gold/silver rates, prayers, or hymns.'}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PUSH NOTIFICATIONS PREFERENCES MODAL (Section 14)
         ===================================================================== */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'पुश सूचना सेटिङ (Push Notifications)' : 'Push Notification Categories'}
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'ne'
                ? 'तपाईंले प्राप्त गर्न चाहनुहुने सूचनाका विधाहरू छान्नुहोस्:'
                : 'Enable or disable push notification categories for your device:'}
            </p>
            <div className="divide-y divide-stone-200 dark:divide-slate-800 text-xs">
              {[
                { key: 'dailyVerse', ne: 'दैनिक बाइबल पद (Daily Bible Verse)', en: 'Daily Bible Verse (6:00 AM)' },
                { key: 'prayerReminders', ne: 'प्रार्थना रिमाइन्डर (Prayer Reminders)', en: 'Prayer Wall & Personal Reminders' },
                { key: 'christianNews', ne: 'नयाँ इसाई समाचार (New Christian News)', en: 'Breaking Christian News Nepal' },
                { key: 'upcomingEvents', ne: 'आगामी कार्यक्रम (Upcoming Events)', en: 'Upcoming Conferences & Seminars' },
                { key: 'radioPrograms', ne: 'रेडियो कार्यक्रम (Radio Programs)', en: 'Live FM Radio Broadcast Alerts' },
                { key: 'christianFestivals', ne: 'इसाई पर्व र बिदा (Christian Festivals)', en: 'Nepali Calendar & Festival Alerts' },
              ].map((item) => {
                const enabled = notifPrefs[item.key as keyof typeof notifPrefs];
                return (
                  <div key={item.key} className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'ne' ? item.ne : item.en}
                    </span>
                    <button
                      onClick={() =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifPrefs],
                        }))
                      }
                      className={`px-3 py-1 rounded-lg font-bold ${
                        enabled ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowNotificationsModal(false);
                notify(lang === 'ne' ? 'सूचना प्राथमिकता सुरक्षित गरियो!' : 'Notification preferences saved!');
              }}
              className="w-full h-10 rounded-xl bg-red-800 text-white text-xs font-bold"
            >
              {lang === 'ne' ? 'सुरक्षित गर्नुहोस् (Save Preferences)' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Install Instructions Modal */}
      {showIOSInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-3 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Install Susamachar on iPhone / iPad
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in your Safari toolbar.<br />
              2. Scroll down and select <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSInstallModal(false)}
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share Daily Verse as Image / Custom Photo Wallpaper Studio Modal */}
      <VerseImageShareModal
        verse={shareHomeVerse}
        lang={lang}
        initialBgImageUrl={wallpaperBgUrl}
        galleryPhotos={galleryAlbums}
        onUploadPhotoToWebsite={(photoDataUrl, title) =>
          handleAddGalleryPhoto({
            titleNe: title,
            titleEn: title,
            category: 'worship',
            locationNe: 'नेपाल',
            locationEn: 'Nepal',
            coverImage: photoDataUrl,
            descriptionNe: 'बाइबल वालपेपर स्टुडियो (biblesandes.com) बाट थपिएको तस्बिर।',
            descriptionEn: 'Photo added via Bible Wallpaper Studio (biblesandes.com).',
          })
        }
        onClose={() => {
          setShareHomeVerse(null);
          setWallpaperBgUrl(null);
        }}
        onNotify={notify}
      />

      {/* cPanel Deployment & Google Drive Modal */}
      <CPanelDeployModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />

      {/* Google Picker Modal (Select from Google Drive) */}
      <GooglePickerModal
        isOpen={showGooglePickerModal}
        onClose={() => setShowGooglePickerModal(false)}
        lang={lang}
        onFileSelect={(file) => {
          if (file.mimeType?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            if (file.url) {
              setWallpaperBgUrl(file.url);
              setShareHomeVerse(dailyVerse);
            }
            notify(
              lang === 'ne'
                ? `Google Drive बाट तस्बिर छानियो: ${file.name}`
                : `Picked image from Google Drive: ${file.name}`
            );
          } else {
            notify(
              lang === 'ne'
                ? `Google Drive बाट फाइल छानियो: ${file.name}`
                : `Selected Google Drive file: ${file.name}`
            );
          }
        }}
      />

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
