import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Church,
  Code2,
  Coins,
  Database,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  Key,
  Lock,
  LogIn,
  LogOut,
  Newspaper,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Users,
  X,
  XCircle,
  FolderArchive,
  HardDrive,
} from 'lucide-react';
import {
  ADMIN_USERS,
  AdminRoleKey,
  AdminUserRecord,
  AuditLogItem,
  BIBLE_BOOKS,
  ChurchDirectoryItem,
  CURATED_BIBLE_VERSES,
  GoldSilverRateData,
  NEWS_CATEGORIES,
  NewsArticle,
  PrayerRequestItem,
  RadioStation,
} from '../data/susamacharDatabase';
import { BhajanModuleView } from './BhajanModuleView';

interface AdminDashboardViewProps {
  lang: 'ne' | 'en';
  currentAdmin: AdminUserRecord;
  onSelectAdminRole: (admin: AdminUserRecord) => void;
  news: NewsArticle[];
  onCreateNews: (payload: Partial<NewsArticle>) => Promise<void>;
  onUpdateNews?: (id: number, payload: Partial<NewsArticle>) => Promise<void>;
  onDeleteNews: (id: number) => Promise<void>;
  prayers: PrayerRequestItem[];
  onModeratePrayer: (id: number, moderationStatus: 'approved' | 'rejected', prayerStatus?: 'active' | 'answered') => Promise<void>;
  rates: GoldSilverRateData;
  onUpdateRates: (payload: { fineGoldTola: number; tejabiGoldTola: number; silverTola: number; rateDateBs: string }) => Promise<void>;
  radioStations: RadioStation[];
  onAddRadioStation: (payload: { nameEn: string; nameNe: string; frequency: string; locationEn: string; locationNe: string; streamUrl: string }) => Promise<void>;
  auditLogs: AuditLogItem[];
  onNotify: (msg: string) => void;
  onExitAdmin?: () => void;
  onOpenCPanelModal?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  lang,
  currentAdmin,
  onSelectAdminRole,
  news,
  onCreateNews,
  onUpdateNews,
  onDeleteNews,
  prayers,
  onModeratePrayer,
  rates,
  onUpdateRates,
  radioStations,
  onAddRadioStation,
  auditLogs,
  onNotify,
  onExitAdmin,
  onOpenCPanelModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'downloads' | 'news' | 'churches' | 'hymns' | 'prayer' | 'rates' | 'radio' | 'admins' | 'deliverables'
  >('overview');

  // News creation form states
  const [newsTitleNe, setNewsTitleNe] = useState('');
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsCategory, setNewsCategory] = useState('christian-news-nepal');
  const [newsSummaryNe, setNewsSummaryNe] = useState('');
  const [newsSummaryEn, setNewsSummaryEn] = useState('');
  const [newsStatus, setNewsStatus] = useState<'published' | 'draft'>('published');

  // Finance Gold/Silver update states
  const [goldInput, setGoldInput] = useState(String(rates.fineGoldTola));
  const [tejabiInput, setTejabiInput] = useState(String(rates.tejabiGoldTola));
  const [silverInput, setSilverInput] = useState(String(rates.silverTola));
  const [rateDateBsInput, setRateDateBsInput] = useState(rates.rateDateBs);

  // Radio station form states
  const [stationNameNe, setStationNameNe] = useState('');
  const [stationNameEn, setStationNameEn] = useState('');
  const [stationFreq, setStationFreq] = useState('102.4 MHz');
  const [stationLocNe, setStationLocNe] = useState('बुटवल');
  const [stationLocEn, setStationLocEn] = useState('Butwal');
  const [stationUrl, setStationUrl] = useState('https://stream.susamachar.org/butwal-1024.mp3');

  // User & Admin management states
  const [dbUsers, setDbUsers] = useState<Array<{ id: number; fullName: string; email: string; churchName: string; createdAt: string }>>([]);
  const [dbAdmins, setDbAdmins] = useState<AdminUserRecord[]>(ADMIN_USERS);
  const [promoteUserId, setPromoteUserId] = useState<number | ''>('');
  const [promoteRole, setPromoteRole] = useState<AdminRoleKey>('NEWS_ADMIN');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState<boolean>(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRoleKey>('NEWS_ADMIN');

  // News edit states (समाचार सम्पादन तथा अपडेट)
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editTitleNe, setEditTitleNe] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editCategory, setEditCategory] = useState('christian-news-nepal');
  const [editSummaryNe, setEditSummaryNe] = useState('');
  const [editSummaryEn, setEditSummaryEn] = useState('');
  const [editContentNe, setEditContentNe] = useState('');
  const [editContentEn, setEditContentEn] = useState('');
  const [editStatus, setEditStatus] = useState<NewsArticle['status']>('published');

  // Church Directory CMS states (मण्डली व्यवस्थापन)
  const [churches, setChurches] = useState<ChurchDirectoryItem[]>([]);
  const [editingChurch, setEditingChurch] = useState<ChurchDirectoryItem | null>(null);
  const [churchNameNe, setChurchNameNe] = useState('');
  const [churchNameEn, setChurchNameEn] = useState('');
  const [churchPastorNe, setChurchPastorNe] = useState('');
  const [churchCityNe, setChurchCityNe] = useState('काठमाडौं');
  const [churchProvince, setChurchProvince] = useState('बागमती प्रदेश (Bagmati)');
  const [churchServiceTimeNe, setChurchServiceTimeNe] = useState('शनिबार बिहान १०:०० बजे');
  const [churchPhone, setChurchPhone] = useState('');
  const [churchAddressNe, setChurchAddressNe] = useState('');

  // Admin login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchChurches = async () => {
    try {
      const res = await fetch('/api/churches');
      if (res.ok) {
        const data = await res.json();
        if (data.churches) setChurches(data.churches);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  useEffect(() => {
    if (activeTab === 'churches') {
      fetchChurches();
    }
  }, [activeTab]);

  const downloadBlob = (filename: string, content: string, mimeType = 'application/json;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify(lang === 'ne' ? `${filename} डाउनलोड भयो!` : `Downloaded ${filename}`);
  };

  const downloadJson = (filename: string, data: unknown) => {
    downloadBlob(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
  };

  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((v) => {
            const s = String(v ?? '').replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(',')
      ),
    ].join('\n');
    downloadBlob(filename, '\uFEFF' + csvContent, 'text/csv;charset=utf-8');
  };

  const handleDownloadFullBackup = async () => {
    try {
      const res = await fetch('/api/admin/export/all');
      if (res.ok) {
        const data = await res.json();
        downloadJson('susamachar_full_database_backup.json', data);
        return;
      }
    } catch {
      // fallback
    }
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      platform: 'Susamachar - biblesandes.com',
      totalNews: news.length,
      news,
      totalPrayers: prayers.length,
      prayers,
      totalRadioStations: radioStations.length,
      radioStations,
      rates,
      churches,
      totalAdmins: dbAdmins.length,
      admins: dbAdmins,
      users: dbUsers,
      totalAuditLogs: auditLogs.length,
      auditLogs,
      bibleBooksCount: BIBLE_BOOKS.length,
    };
    downloadJson('susamachar_full_database_backup.json', fullBackup);
  };

  const handleDownloadBibleJson = () => {
    downloadJson('nepali_holy_bible_66_books.json', {
      exportedAt: new Date().toISOString(),
      canon: 'Protestant Christian 66 Books',
      oldTestamentCount: 39,
      newTestamentCount: 27,
      books: BIBLE_BOOKS,
      versesSample: CURATED_BIBLE_VERSES,
    });
  };

  const handleDownloadBibleTxt = () => {
    const lines = [
      '========================================================================',
      'पवित्र बाइबल (Holy Bible in Nepali - Complete 66 Books Protestant Canon)',
      'वेबसाइट: https://biblesandes.com · Susamachar Christian Platform',
      '========================================================================',
      '',
      '-- पुरानो करार (Old Testament - 39 Books) --',
      ...BIBLE_BOOKS.filter((b) => b.testament === 'OT').map(
        (b) => `${b.bookNumber}. ${b.nameNe} (${b.nameEn}) - कुल अध्याय: ${b.chaptersCount} [${b.categoryNe}]`
      ),
      '',
      '-- नयाँ करार (New Testament - 27 Books) --',
      ...BIBLE_BOOKS.filter((b) => b.testament === 'NT').map(
        (b) => `${b.bookNumber}. ${b.nameNe} (${b.nameEn}) - कुल अध्याय: ${b.chaptersCount} [${b.categoryNe}]`
      ),
      '',
      '-- चुनिएका मुख्य बाइबल पदहरू (Curated Key Bible Verses) --',
      ...CURATED_BIBLE_VERSES.map(
        (v) => `[${v.bookNameNe} ${v.chapter}:${v.verse}]\n${v.textNe}\n${v.textEn}\n`
      ),
    ];
    downloadBlob('nepali_holy_bible_66_books.txt', lines.join('\n'), 'text/plain;charset=utf-8');
  };

  const handleDownloadNewsJson = () => {
    downloadJson('susamachar_news_export.json', { exportedAt: new Date().toISOString(), count: news.length, news });
  };

  const handleDownloadNewsCsv = () => {
    const headers = ['ID', 'TitleNe', 'TitleEn', 'Category', 'Status', 'DateBS', 'Author'];
    const rows = news.map((n) => [n.id, n.titleNe, n.titleEn, n.categoryNameNe, n.status, n.publishedAtBs, n.authorNameNe]);
    downloadCsv('susamachar_news_articles.csv', headers, rows);
  };

  const handleDownloadPrayersJson = () => {
    downloadJson('susamachar_prayers_export.json', { exportedAt: new Date().toISOString(), count: prayers.length, prayers });
  };

  const handleDownloadPrayersCsv = () => {
    const headers = ['ID', 'Requester', 'Location', 'Category', 'Title', 'Status', 'PrayedCount', 'Date'];
    const rows = prayers.map((p) => [p.id, p.requesterName, p.location, p.category, p.titleNe, p.moderationStatus, p.prayedCount, p.createdAtBs]);
    downloadCsv('prayer_requests_report.csv', headers, rows);
  };

  const handleDownloadChurchesJson = () => {
    downloadJson('nepal_churches_directory.json', { exportedAt: new Date().toISOString(), count: churches.length, churches });
  };

  const handleDownloadChurchesCsv = () => {
    const headers = ['ID', 'NameNe', 'NameEn', 'Pastor', 'City', 'Province', 'Phone', 'ServiceTime', 'Address'];
    const rows = churches.map((c) => [c.id, c.nameNe, c.nameEn, c.pastorNameNe, c.cityNe, c.province, c.phone, c.serviceTimeNe, c.addressNe]);
    downloadCsv('nepal_churches_directory.csv', headers, rows);
  };

  const handleDownloadSqlSchema = () => {
    downloadBlob('susamachar_database_schema.sql', deliverableContent, 'text/sql;charset=utf-8');
  };

  const handleDownloadCpanelInstructions = () => {
    const instructions = [
      '========================================================================',
      'cPanel Node.js Deployment Guide for biblesandes.com',
      '========================================================================',
      '1. cPanel मा जानुहोस् र "Setup Node.js App" खोल्नुहोस्।',
      '2. Create Application मा क्लिक गरी Node version 22 छान्नुहोस्।',
      '3. Application root: susamachar',
      '4. Application startup file: server.js (वा server.ts)',
      '5. आफ्नो कम्प्युटरबाट build भएको dist/ फोल्डर र server.js / server.ts अपलोड गर्नुहोस्।',
      '6. Run NPM Install गर्नुहोस् र Restart Application मा क्लिक गर्नुहोस्।',
      'सम्पर्क: ९८५८०६४०५८ (biblesandes.com)',
    ].join('\n');
    downloadBlob('cpanel_deployment_guide.txt', instructions, 'text/plain;charset=utf-8');
  };

  const handleDownloadCpanelUpdateZip = () => {
    window.location.href = '/api/download/cpanel-update-zip';
    onNotify(
      lang === 'ne'
        ? 'cPanel Update Zip (dist-only.zip) डाउनलोड सुरु भयो! public_html मा Extract गर्नुहोस्।'
        : 'Downloading cPanel update package (dist-only.zip)!'
    );
  };

  const handleDownloadCpanelFullPackage = () => {
    window.location.href = '/api/download/cpanel-full-package';
    onNotify(
      lang === 'ne'
        ? 'cPanel Full Package (susamachar-cpanel-ready.zip) डाउनलोड सुरु भयो!'
        : 'Downloading full cPanel deployment bundle!'
    );
  };

  const handleStartEditNews = (item: NewsArticle) => {
    setEditingNews(item);
    setEditTitleNe(item.titleNe);
    setEditTitleEn(item.titleEn);
    setEditCategory(item.categorySlug);
    setEditSummaryNe(item.summaryNe);
    setEditSummaryEn(item.summaryEn);
    setEditContentNe(item.contentNe || item.summaryNe);
    setEditContentEn(item.contentEn || item.summaryEn);
    setEditStatus(item.status);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSaveEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    if (onUpdateNews) {
      await onUpdateNews(editingNews.id, {
        titleNe: editTitleNe,
        titleEn: editTitleEn,
        categorySlug: editCategory,
        summaryNe: editSummaryNe,
        summaryEn: editSummaryEn,
        contentNe: editContentNe || editSummaryNe,
        contentEn: editContentEn || editSummaryEn,
        status: editStatus,
      });
      onNotify(lang === 'ne' ? 'समाचार सफलतापूर्वक अद्यावधिक गरियो!' : 'News updated successfully!');
      setEditingNews(null);
    }
  };

  const handleCancelEditNews = () => {
    setEditingNews(null);
  };

  const handleStartEditChurch = (item: ChurchDirectoryItem) => {
    setEditingChurch(item);
    setChurchNameNe(item.nameNe);
    setChurchNameEn(item.nameEn);
    setChurchPastorNe(item.pastorNameNe);
    setChurchCityNe(item.cityNe);
    setChurchProvince(item.province);
    setChurchServiceTimeNe(item.serviceTimeNe);
    setChurchPhone(item.phone);
    setChurchAddressNe(item.addressNe);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleChurchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchNameNe) {
      onNotify('कृपया मण्डलीको नाम भर्नुहोस्।');
      return;
    }
    const payload = {
      nameNe: churchNameNe,
      nameEn: churchNameEn || churchNameNe,
      pastorNameNe: churchPastorNe,
      pastorNameEn: churchPastorNe,
      cityNe: churchCityNe,
      cityEn: churchCityNe,
      province: churchProvince,
      serviceTimeNe: churchServiceTimeNe,
      serviceTimeEn: churchServiceTimeNe,
      phone: churchPhone,
      addressNe: churchAddressNe,
      addressEn: churchAddressNe,
    };

    if (editingChurch) {
      try {
        const res = await fetch(`/api/admin/churches/${editingChurch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onNotify(lang === 'ne' ? 'मण्डली विवरण सफलतापूर्वक अपडेट गरियो!' : 'Church updated successfully!');
          setEditingChurch(null);
          fetchChurches();
        }
      } catch {
        onNotify('Update failed');
      }
    } else {
      try {
        const res = await fetch('/api/admin/churches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onNotify(lang === 'ne' ? 'नयाँ मण्डली सफलतापूर्वक थपियो!' : 'Church added successfully!');
          fetchChurches();
        }
      } catch {
        onNotify('Failed to add church');
      }
    }
    setChurchNameNe('');
    setChurchNameEn('');
    setChurchPastorNe('');
    setChurchPhone('');
    setChurchAddressNe('');
  };

  const handleDeleteChurch = async (id: number, name: string) => {
    if (!window.confirm(`के तपाईं निश्चित हुनुहुन्छ: "${name}" लाई हटाउन?`)) return;
    try {
      const res = await fetch(`/api/admin/churches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onNotify(lang === 'ne' ? `"${name}" हटाइयो।` : `Deleted ${name}`);
        fetchChurches();
      }
    } catch {
      onNotify('Failed to delete');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.isAdmin && data.admin) {
        onSelectAdminRole(data.admin);
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        onNotify(lang === 'ne' ? `${data.admin.fullNameNe} को रूपमा लगइन हुनुभयो!` : `Signed in as ${data.admin.fullNameEn}!`);
      } else if (res.ok && !data.isAdmin) {
        setLoginError('यो खाता सामान्य सदस्य खाता हो। कृपया एडमिन विवरण प्रयोग गर्नुहोस्।');
      } else {
        setLoginError(data.error || 'लगइन असफल भयो।');
      }
    } catch {
      setLoginError('लगइन अनुरोधमा समस्या आयो।');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchUsersAndAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) setDbUsers(data.users);
        if (data.admins && data.admins.length > 0) setDbAdmins(data.admins);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchUsersAndAdmins();
    }
  }, [activeTab]);

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteUserId) {
      onNotify('कृपया प्रयोगकर्ता छान्नुहोस् (Please select a user).');
      return;
    }
    try {
      const res = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: promoteUserId, roleKey: promoteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        onNotify(data.message || 'प्रयोगकर्तालाई एडमिन बनाइयो!');
        fetchUsersAndAdmins();
        setPromoteUserId('');
      } else {
        onNotify(data.error || 'Promotion failed');
      }
    } catch {
      onNotify('Error promoting user');
    }
  };

  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername || !newAdminFullName || !newAdminEmail) {
      onNotify('सबै विवरण भर्नुहोस्।');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          fullNameEn: newAdminFullName,
          fullNameNe: newAdminFullName,
          email: newAdminEmail,
          roleKey: newAdminRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onNotify('नयाँ एडमिन सफलतापूर्वक सिर्जना गरियो!');
        setShowCreateAdminModal(false);
        setNewAdminUsername('');
        setNewAdminFullName('');
        setNewAdminEmail('');
        fetchUsersAndAdmins();
      } else {
        onNotify(data.error || 'Failed to create admin');
      }
    } catch {
      onNotify('Error creating admin');
    }
  };

  const handleDeleteUserOrAdmin = async (id: number, name: string) => {
    if (!window.confirm(`के तपाईं निश्चित हुनुहुन्छ: ${name} लाई हटाउन?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onNotify(`${name} हटाइयो।`);
        fetchUsersAndAdmins();
      }
    } catch {
      onNotify('Failed to delete');
    }
  };

  // Deliverable viewer state
  const [deliverableType, setDeliverableType] = useState<'schema' | 'android' | 'cpanel' | 'api'>('schema');
  const [deliverableContent, setDeliverableContent] = useState<string>('Loading deliverable file...');
  const [deliverableFilename, setDeliverableFilename] = useState<string>('schema.sql');

  useEffect(() => {
    if (activeTab === 'deliverables') {
      fetch(`/api/deliverables/${deliverableType}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.content) {
            setDeliverableContent(data.content);
            setDeliverableFilename(data.filename);
          }
        })
        .catch(() => {
          setDeliverableContent('-- Deliverable file available in repository');
        });
    }
  }, [activeTab, deliverableType]);

  const hasAccess = (mod: string) =>
    currentAdmin.roleKey === 'SUPER_ADMIN' || currentAdmin.allowedModules.includes(mod);

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess('news')) {
      onNotify('Access Denied: Current role does not have News Admin permissions.');
      return;
    }
    await onCreateNews({
      titleNe: newsTitleNe,
      titleEn: newsTitleEn,
      categorySlug: newsCategory,
      summaryNe: newsSummaryNe || newsTitleNe,
      summaryEn: newsSummaryEn || newsTitleEn,
      contentNe: newsSummaryNe || newsTitleNe,
      contentEn: newsSummaryEn || newsTitleEn,
      status: newsStatus,
    });
    setNewsTitleNe('');
    setNewsTitleEn('');
    setNewsSummaryNe('');
    setNewsSummaryEn('');
    onNotify(lang === 'ne' ? 'नयाँ समाचार सफलतापूर्वक प्रकाशित गरियो!' : 'News article created successfully!');
  };

  const handleRatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess('rates')) {
      onNotify('Access Denied: Current role does not have Finance Content Admin permissions.');
      return;
    }
    await onUpdateRates({
      fineGoldTola: Number(goldInput),
      tejabiGoldTola: Number(tejabiInput),
      silverTola: Number(silverInput),
      rateDateBs: rateDateBsInput,
    });
    onNotify(lang === 'ne' ? 'सुनचाँदीको नयाँ दर अद्यावधिक गरियो!' : 'Gold & Silver rates updated and logged!');
  };

  const handleRadioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess('radio')) {
      onNotify('Access Denied: Current role does not have Radio Admin permissions.');
      return;
    }
    await onAddRadioStation({
      nameNe: stationNameNe,
      nameEn: stationNameEn,
      frequency: stationFreq,
      locationNe: stationLocNe,
      locationEn: stationLocEn,
      streamUrl: stationUrl,
    });
    setStationNameNe('');
    setStationNameEn('');
    onNotify(lang === 'ne' ? 'नयाँ एफ.एम. रेडियो स्टेशन थपियो!' : 'New FM Radio station added!');
  };

  const publishedCount = news.filter((n) => n.status === 'published').length;
  const draftCount = news.filter((n) => n.status !== 'published').length;
  const pendingPrayersCount = prayers.filter((p) => p.moderationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Admin Header & 8-Role RBAC Switcher */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <Shield className="w-4 h-4" />
            <span>MULTI-ADMIN RBAC CONSOLE · 2FA & AUDIT LOGGING ACTIVE</span>
          </div>
          <h1 className="text-2xl font-bold">
            {lang === 'ne' ? 'सुसमाचार मल्टी-एडमिन ड्यासबोर्ड (CMS)' : 'Susamachar Multi-Admin CMS Dashboard'}
          </h1>
          <p className="text-xs text-slate-300">
            {lang === 'ne'
              ? `सक्रिय एडमिन: ${currentAdmin.fullNameNe} (${currentAdmin.roleNameNe})`
              : `Signed in as: ${currentAdmin.fullNameEn} — Role: ${currentAdmin.roleNameEn}`}
          </p>
        </div>

        {/* Role Simulator Switcher to test all 8 Admin Roles + Exit to Website */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <label className="text-xs text-slate-400 whitespace-nowrap">
            {lang === 'ne' ? 'एडमिन भूमिका छान्नुहोस् (Test 8 Roles):' : 'Switch Active Admin Role (RBAC):'}
          </label>
          <select
            value={currentAdmin.id}
            onChange={(e) => {
              const found = ADMIN_USERS.find((a) => a.id === Number(e.target.value));
              if (found) {
                onSelectAdminRole(found);
                onNotify(`Switched RBAC session to ${found.roleNameEn} (${found.fullNameEn})`);
              }
            }}
            className="h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white cursor-pointer"
          >
            {ADMIN_USERS.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.roleNameEn} ({adm.roleNameNe}) — {adm.username}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadCpanelUpdateZip}
            className="h-10 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white font-bold text-xs whitespace-nowrap shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Download latest cPanel update zip"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'ne' ? 'cPanel Update Zip' : 'cPanel Update Zip'}</span>
          </button>

          <button
            onClick={() => setShowLoginModal(true)}
            className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs whitespace-nowrap shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Admin Login / Switch Credentials"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'एडमिन लगइन' : 'Admin Login'}</span>
          </button>

          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Exit Admin to Website"
            >
              <span>{lang === 'ne' ? '← वेबसाइट हेर्नुहोस्' : '← View Website'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/80 dark:bg-slate-900 rounded-xl">
        {[
          { id: 'overview', ne: 'तथ्याङ्क र सारांश (Overview)', en: 'Overview & Stats', mod: 'overview' },
          { id: 'downloads', ne: 'फाइल तथा डाटा डाउनलोड (Downloads)', en: 'File & Data Downloads', mod: 'overview' },
          { id: 'news', ne: `समाचार सम्पादन (${news.length})`, en: `News CMS (${news.length})`, mod: 'news' },
          { id: 'churches', ne: `मण्डली व्यवस्थापन (${churches.length})`, en: `Churches (${churches.length})`, mod: 'overview' },
          { id: 'hymns', ne: 'भजन पुस्तकालय (१,२६८)', en: 'Hymn Library CMS (1,268)', mod: 'bible' },
          { id: 'prayer', ne: `प्रार्थना स्वीकृति (${pendingPrayersCount} Pending)`, en: `Prayer Moderation (${pendingPrayersCount})`, mod: 'prayer' },
          { id: 'rates', ne: 'सुनचाँदी दर अपडेट (Finance)', en: 'Gold/Silver Rates', mod: 'rates' },
          { id: 'radio', ne: `एफ.एम. रेडियो (${radioStations.length})`, en: `FM Radio (${radioStations.length})`, mod: 'radio' },
          { id: 'admins', ne: 'प्रयोगकर्ता तथा एडमिन', en: 'Users & Admins', mod: 'admins' },
          { id: 'deliverables', ne: 'SQL, APK र cPanel कोड', en: 'SQL, Android & cPanel Code', mod: 'overview' },
        ].map((tab) => {
          const permitted = hasAccess(tab.mod);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-red-800 text-white'
                  : permitted
                  ? 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {!permitted && <Lock className="w-3 h-3" />}
              <span>{lang === 'ne' ? tab.ne : tab.en}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD STATISTICS & OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 Required Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { labelNe: 'कुल प्रयोगकर्ता (Total Users)', labelEn: 'Total Registered Users', value: '1,428', sub: '+34 this week' },
              { labelNe: 'कुल समाचार (Total News)', labelEn: 'Total News Articles', value: String(news.length), sub: `${publishedCount} Published · ${draftCount} Draft` },
              { labelNe: 'प्रकाशित समाचार (Published)', labelEn: 'Published News', value: String(publishedCount), sub: 'SEO Indexed' },
              { labelNe: 'ड्राफ्ट समाचार (Draft News)', labelEn: 'Draft / Scheduled News', value: String(draftCount), sub: 'Editorial Queue' },
              { labelNe: 'रेडियो स्टेशन (Radio Stations)', labelEn: 'Active FM Stations', value: String(radioStations.length), sub: '24/7 Live Streams' },
              { labelNe: 'इसाई कार्यक्रम (Total Events)', labelEn: 'Christian Events', value: '3', sub: '1,472 RSVPs' },
              { labelNe: 'प्रार्थना निवेदन (Prayer Requests)', labelEn: 'Total Prayer Requests', value: String(prayers.length), sub: `${pendingPrayersCount} Awaiting Approval` },
              { labelNe: 'ग्यालरी एल्बम (Gallery Albums)', labelEn: 'Photo Gallery Albums', value: '4', sub: '112 Approved Photos' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 space-y-1"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'ne' ? stat.labelNe : stat.labelEn}
                </p>
                <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-red-800 dark:text-amber-400">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'हालैका एडमिन गतिविधि लग (Security Audit Logs)' : 'Recent Admin Activity & Security Audit Logs'}
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                RBAC Policy: Enforced
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 text-slate-500">
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Admin User</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Module / Action</th>
                    <th className="py-3 px-4 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {auditLogs.slice(0, 8).map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{log.adminName}</td>
                      <td className="py-3 px-4 text-red-800 dark:text-amber-400 font-medium">{log.roleName}</td>
                      <td className="py-3 px-4 font-mono">{log.module} · {log.action}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FILE & DATA DOWNLOAD HUB (फाइल तथा डाटा डाउनलोड केन्द्र) */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          {/* FEATURED HERO: cPanel Production Update ZIP Package */}
          <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-500/40 shadow-lg space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shrink-0">
                  <FolderArchive className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                      cPanel Ready
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      biblesandes.com सिधै अपडेट गर्न
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    {lang === 'ne' ? 'cPanel वेबसाइट अपडेट ZIP डाउनलोड' : 'cPanel Website Update ZIP (dist-only.zip)'}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'ne'
                      ? 'यो ZIP फाइललाई cPanel को public_html फोल्डर भित्र अपलोड गरी १-क्लिकमा Extract गरेपछि तपाईंको सम्पूर्ण वेबसाइट तुरुन्तै नयाँ फिचरहरूसहित अपडेट हुनेछ।'
                      : 'Upload and extract this zip into your cPanel public_html directory to immediately update biblesandes.com with all latest features.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadCpanelUpdateZip}
                  className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer scale-100 hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'ne' ? 'dist-only.zip डाउनलोड गर्नुहोस्' : 'Download dist-only.zip'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCpanelFullPackage}
                  className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'ne' ? 'Full Package (.zip)' : 'Full Bundle (.zip)'}</span>
                </button>

                {onOpenCPanelModal && (
                  <button
                    type="button"
                    onClick={onOpenCPanelModal}
                    className="h-11 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Google Drive मार्फत ट्रान्सफर गर्नुहोस्"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Google Drive Hub</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick 3-step Instructions */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs space-y-2">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ne' ? 'cPanel मा अपडेट गर्ने सजिलो ३ तरिका:' : '3 Simple Steps to Update on cPanel:'}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-stone-300 text-[11px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white">१. फाइल डाउनलोड:</div>
                  <div>माथिको हरियो "dist-only.zip डाउनलोड" बटन थिचेर जिप फाइल कम्प्युटरमा राख्नुहोस्।</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white">२. cPanel मा अपलोड:</div>
                  <div>cPanel खोल्नुहोस् &gt; File Manager &gt; public_html भित्र जानुहोस् र यो जिप अपलोड गर्नुहोस्।</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white">३. Extract गर्नुहोस्:</div>
                  <div>फाइलमा Right Click गरी Extract गर्नुहोस्। https://biblesandes.com मा तुरुन्तै नयाँ साइट चल्नेछ!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-900 to-amber-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'केन्द्रीकृत फाइल डाउनलोड तथा ब्याकअप' : 'Centralized File Download & Backup Hub'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {lang === 'ne' ? 'सुसमाचार सम्पूर्ण डाटा तथा फाइलहरू डाउनलोड गर्नुहोस्' : 'Download All Susamachar Platform Data & Files'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
              {lang === 'ne'
                ? 'यहाँबाट सम्पूर्ण वेबसाइटको डाटाबेस ब्याकअप, पवित्र बाइबलका ६६ पुस्तकहरू, १,२६८+ ख्रीष्टिय भजन, इसाई समाचार, प्रार्थना निवेदन, मण्डली निर्देशिका, तथा cPanel र SQL फाइलहरू १-क्लिकमा डाउनलोड गर्नुहोस्।'
                : 'Instantly download complete database backups, all 66 Protestant Bible books, 1,268+ Christian hymns, news archives, prayer requests, church directories, and SQL schema files.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Full Database Backup */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-red-800 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-800/10 dark:bg-red-950/40 text-red-800 dark:text-amber-400 flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'सम्पूर्ण डाटाबेस ब्याकअप (Full JSON)' : 'Full JSON Database Backup'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'समाचार, प्रार्थना, भजन, पात्रो, मण्डलीहरू, सुनचाँदी दर, अडिट लग र प्रयोगकर्ता सहितको सम्पूर्ण प्रणाली ब्याकअप।'
                      : 'Complete system snapshot with news, prayers, hymns, calendar, churches, rates, audit logs, and users.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullBackup}
                className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ne' ? 'Full Backup .JSON डाउनलोड' : 'Download Full Backup .JSON'}</span>
              </button>
            </div>

            {/* Card 2: Holy Bible 66 Books */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-amber-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'पवित्र बाइबल सम्पूर्ण ६६ पुस्तकहरू' : 'Holy Bible (66 Protestant Canon)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'पुरानो करार (३९ पुस्तकहरू) र नयाँ करार (२७ पुस्तकहरू) को आधिकारिक नेपाली तथा अंग्रेजी बाइबल डाटा।'
                      : 'Complete Protestant canon with all 66 books, chapter counts, testaments, and curated scriptures.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBibleJson}
                  className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>.JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBibleTxt}
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-red-800" />
                  <span>.TXT Text</span>
                </button>
              </div>
            </div>

            {/* Card 3: Christian Hymns Library */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-emerald-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'ख्रीष्टिय भजन संग्रह (१,२६८+ गीतहरू)' : 'Christian Hymn Collection (1,268+)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'नेपाली ख्रीष्टिय भजन र मसीही गीतहरूको सम्पूर्ण बोल (Lyrics), नम्बर, लेखक तथा वर्ग सहित।'
                      : 'Full OpenLyrics collection of Nepali and Hindi hymns, choruses, numbers, authors, and lyrics.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/export/hymns');
                      if (res.ok) {
                        const d = await res.json();
                        downloadJson('khristiya_bhajan_collection.json', d);
                        return;
                      }
                    } catch {
                      // fallback
                    }
                    onNotify('Downloading hymns collection...');
                  }}
                  className="h-10 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.JSON</span>
                </button>
                <a
                  href="/api/admin/export/hymns"
                  download="khristiya_bhajan_collection.json"
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct API</span>
                </a>
              </div>
            </div>

            {/* Card 4: News Articles Archive */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-blue-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? `इसाई समाचार अभिलेख (${news.length})` : `Christian News Archive (${news.length})`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'सबै प्रकाशित र ड्राफ्ट समाचार लेखहरू, विधा, मिति, लेखक र पूर्ण सामग्री।'
                      : 'Export all news articles, drafts, categories, timestamps, and full editorial content.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadNewsJson}
                  className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>.JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNewsCsv}
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>.CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* Card 5: Prayer Requests */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-amber-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? `प्रार्थना निवेदन सूची (${prayers.length})` : `Prayer Requests Report (${prayers.length})`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'प्रार्थना निवेदनहरू, प्रार्थना गर्नेहरूको संख्या, स्थान र जवाफ आएका गवाहीहरू।'
                      : 'All prayer petitions, intercession counts, locations, and answered testimonies.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPrayersJson}
                  className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>.JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPrayersCsv}
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>.CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* Card 6: Churches Directory */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-purple-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Church className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? `मण्डली तथा चर्च निर्देशिका (${churches.length})` : `Churches Directory (${churches.length})`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'नेपालभरिका स्थानीय मण्डलीहरू, पास्टरहरूको नाम, सम्पर्क नम्बर, संगतिको समय र ठेगाना।'
                      : 'Directory of fellowships, pastor names, contact numbers, service times, and addresses.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadChurchesJson}
                  className="h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>.JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadChurchesCsv}
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                  <span>.CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* Card 7: SQL Database Schema */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-stone-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-stone-500/10 dark:bg-stone-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'SQL डेटाबेस स्कीमा (.sql)' : 'Production SQL Schema (.sql)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'cPanel phpMyAdmin, MySQL वा PostgreSQL का लागि सम्पूर्ण तालिका संरचना तथा इन्डेक्सहरू।'
                      : 'Complete DDL schemas with tables, indexes, RBAC roles, and seed data for cPanel / MySQL / PostgreSQL.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadSqlSchema}
                className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ne' ? 'schema.sql डाउनलोड गर्नुहोस्' : 'Download schema.sql'}</span>
              </button>
            </div>

            {/* Card 8: cPanel Deployment Guide */}
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:border-amber-600 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'cPanel डिप्लोयमेन्ट गाइड' : 'cPanel Deployment Guide'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {lang === 'ne'
                      ? 'biblesandes.com cPanel मा Node.js 22 सेटअप गर्ने र dist फोल्डर अपलोड गर्ने पूर्ण विधि।'
                      : 'Step-by-step instructions for hosting on cPanel Node.js Selector with zero downtime.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadCpanelInstructions}
                className="w-full h-10 rounded-xl border border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ne' ? 'गाइड डाउनलोड गर्नुहोस् (.txt)' : 'Download Guide (.txt)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEWS PORTAL CMS (सिर्जना तथा सम्पादन) */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Edit News Form if an article is being edited */}
          {editingNews && (
            <div className="bg-amber-50/80 dark:bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'समाचार सम्पादन गर्दै (Editing Article):' : 'Editing News Article:'}{' '}
                    <span className="text-amber-700 dark:text-amber-400">{editingNews.titleNe}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEditNews}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditNews} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      नेपाली शीर्षक (Nepali Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitleNe}
                      onChange={(e) => setEditTitleNe(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      अंग्रेजी शीर्षक (English Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitleEn}
                      onChange={(e) => setEditTitleEn(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      विधा (Category)
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    >
                      {NEWS_CATEGORIES.slice(1).map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.nameNe} ({c.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      स्थिति (Status)
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'published' | 'draft')}
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    >
                      <option value="published">Published (प्रकाशित)</option>
                      <option value="draft">Draft (ड्राफ्ट)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      नेपाली सारांश र विवरण
                    </label>
                    <textarea
                      rows={3}
                      value={editSummaryNe}
                      onChange={(e) => setEditSummaryNe(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      अंग्रेजी सारांश र विवरण
                    </label>
                    <textarea
                      rows={3}
                      value={editSummaryEn}
                      onChange={(e) => setEditSummaryEn(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'अपडेट सुरक्षित गर्नुहोस्' : 'Save Updates'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditNews}
                    className="h-10 px-4 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {lang === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-800" />
                <span>{lang === 'ne' ? 'नयाँ समाचार प्रकाशन गर्नुहोस्' : 'Create & Publish News Article'}</span>
              </h2>

              {!hasAccess('news') ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-800 dark:text-red-300">
                  Your current role (<strong>{currentAdmin.roleNameEn}</strong>) does not have permission to modify news. Switch to <strong>Super Admin</strong> or <strong>News Admin</strong> above.
                </div>
              ) : (
                <form onSubmit={handleNewsSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      नेपाली शीर्षक (Nepali Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsTitleNe}
                      onChange={(e) => setNewsTitleNe(e.target.value)}
                      placeholder="उदा: पोखरामा बृहत् युवा आत्मिक सम्मेलन सम्पन्न"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      अंग्रेजी शीर्षक (English Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsTitleEn}
                      onChange={(e) => setNewsTitleEn(e.target.value)}
                      placeholder="e.g. Regional Youth Fellowship Convenes in Pokhara"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        समाचार विधा (Category)
                      </label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                      >
                        {NEWS_CATEGORIES.slice(1).map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.nameNe} ({c.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        स्थिति (Status)
                      </label>
                      <select
                        value={newsStatus}
                        onChange={(e) => setNewsStatus(e.target.value as 'published' | 'draft')}
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                      >
                        <option value="published">Published (प्रकाशित)</option>
                        <option value="draft">Draft (ड्राफ्ट)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      नेपाली विवरण (Nepali Summary & Content)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newsSummaryNe}
                      onChange={(e) => setNewsSummaryNe(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      अंग्रेजी विवरण (English Summary & Content)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newsSummaryEn}
                      onChange={(e) => setNewsSummaryEn(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold"
                  >
                    {lang === 'ne' ? 'समाचार सुरक्षित गर्नुहोस्' : 'Publish News Article'}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? `सबै समाचार सूची (${news.length})` : `Manage Existing News Articles (${news.length})`}
              </h2>
              <div className="divide-y divide-stone-200 dark:divide-slate-800">
                {news.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-red-800 dark:text-amber-400">{item.categoryNameNe}</span>
                        {' · '}
                        <span>{item.publishedAtBs}</span>
                        {' · '}
                        <span className="uppercase font-mono">{item.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {item.titleNe}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{item.titleEn}</p>
                    </div>
                    {hasAccess('news') && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditNews(item)}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Article (सम्पादन)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNews(item.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CHURCH DIRECTORY CMS (मण्डली व्यवस्थापन) */}
      {activeTab === 'churches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Church className="w-4 h-4 text-purple-700" />
              <span>
                {editingChurch
                  ? lang === 'ne'
                    ? 'मण्डली विवरण सम्पादन'
                    : 'Edit Church'
                  : lang === 'ne'
                  ? 'नयाँ मण्डली दर्ता गर्नुहोस्'
                  : 'Add New Church Listing'}
              </span>
            </h2>

            <form onSubmit={handleChurchSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  मण्डलीको नाम (Church Name in Nepali) *
                </label>
                <input
                  type="text"
                  required
                  value={churchNameNe}
                  onChange={(e) => setChurchNameNe(e.target.value)}
                  placeholder="उदा: पाटन कोइनोनिया मण्डली"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  अंग्रेजी नाम (Church Name in English)
                </label>
                <input
                  type="text"
                  value={churchNameEn}
                  onChange={(e) => setChurchNameEn(e.target.value)}
                  placeholder="e.g. Patan Koinonia Church"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    शहर / जिल्ला (City/District)
                  </label>
                  <input
                    type="text"
                    value={churchCityNe}
                    onChange={(e) => setChurchCityNe(e.target.value)}
                    placeholder="काठमाडौं, ललितपुर, आदि"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    प्रदेश (Province)
                  </label>
                  <select
                    value={churchProvince}
                    onChange={(e) => setChurchProvince(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  >
                    <option value="कोशी प्रदेश (Koshi)">कोशी प्रदेश (Koshi)</option>
                    <option value="मधेश प्रदेश (Madhesh)">मधेश प्रदेश (Madhesh)</option>
                    <option value="बागमती प्रदेश (Bagmati)">बागमती प्रदेश (Bagmati)</option>
                    <option value="गण्डकी प्रदेश (Gandaki)">गण्डकी प्रदेश (Gandaki)</option>
                    <option value="लुम्बिनी प्रदेश (Lumbini)">लुम्बिनी प्रदेश (Lumbini)</option>
                    <option value="कर्णाली प्रदेश (Karnali)">कर्णाली प्रदेश (Karnali)</option>
                    <option value="सुदूरपश्चिम प्रदेश (Sudurpashchim)">सुदूरपश्चिम प्रदेश (Sudurpashchim)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    पास्टरको नाम (Pastor Name)
                  </label>
                  <input
                    type="text"
                    value={churchPastorNe}
                    onChange={(e) => setChurchPastorNe(e.target.value)}
                    placeholder="उदा: पा. शमूएल श्रेष्ठ"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    सम्पर्क फोन (Phone)
                  </label>
                  <input
                    type="text"
                    value={churchPhone}
                    onChange={(e) => setChurchPhone(e.target.value)}
                    placeholder="९८५८०६४०५८"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  संगतिको समय (Service Time)
                </label>
                <input
                  type="text"
                  value={churchServiceTimeNe}
                  onChange={(e) => setChurchServiceTimeNe(e.target.value)}
                  placeholder="शनिबार बिहान १०:०० बजे"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  ठेगाना (Address)
                </label>
                <input
                  type="text"
                  value={churchAddressNe}
                  onChange={(e) => setChurchAddressNe(e.target.value)}
                  placeholder="उदा: लगनखेल, ललितपुर"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingChurch
                      ? lang === 'ne'
                        ? 'मण्डली अपडेट गर्नुहोस्'
                        : 'Update Church'
                      : lang === 'ne'
                      ? 'मण्डली सुरक्षित गर्नुहोस्'
                      : 'Save Church'}
                  </span>
                </button>
                {editingChurch && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingChurch(null);
                      setChurchNameNe('');
                      setChurchNameEn('');
                      setChurchPastorNe('');
                      setChurchPhone('');
                      setChurchAddressNe('');
                    }}
                    className="h-10 px-3 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {lang === 'ne' ? 'रद्द' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? `दर्ता भएका मण्डलीहरू (${churches.length})` : `Registered Churches (${churches.length})`}
              </h2>
              <button
                type="button"
                onClick={fetchChurches}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
              </button>
            </div>

            {churches.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Church className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">
                  {lang === 'ne' ? 'अहिले कुनै मण्डली दर्ता भएको छैन। बायाँ फारमबाट नयाँ मण्डली थप्नुहोस्।' : 'No churches currently listed. Add one using the form on the left.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200 dark:divide-slate-800">
                {churches.map((c) => (
                  <div key={c.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{c.nameNe}</span>
                        {c.nameEn && <span className="text-slate-500">({c.nameEn})</span>}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {c.pastorNameNe && <span>पास्टर: {c.pastorNameNe} · </span>}
                        <span>{c.cityNe} ({c.province})</span>
                        {c.phone && <span> · फोन: {c.phone}</span>}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        संगति: {c.serviceTimeNe} · ठेगाना: {c.addressNe}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditChurch(c)}
                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800"
                        title="Edit Church"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChurch(c.id, c.nameNe)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                        title="Delete Church"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRAYER WALL MODERATION */}
      {activeTab === 'prayer' && (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'प्रार्थना निवेदन स्वीकृति तथा मोडरेसन (Prayer Request Moderation)' : 'Prayer Request Moderation Queue'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ne'
                  ? 'सार्वजनिक प्रार्थना पर्खालमा देखाउनुअघि एडमिनले स्वीकृत (Approve) गर्नुपर्नेछ।'
                  : 'Approve public requests to display them on the Prayer Wall, or mark requests as Answered.'}
              </p>
            </div>
          </div>

          {!hasAccess('prayer') ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-800 dark:text-red-300">
              Switch to <strong>Super Admin</strong> or <strong>Prayer Admin</strong> to moderate prayer requests.
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-slate-800">
              {prayers.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{p.requesterName}</span>
                      <span>·</span>
                      <span className="font-mono uppercase text-red-800 dark:text-amber-400">
                        Moderation: {p.moderationStatus}
                      </span>
                      <span>·</span>
                      <span className="font-mono uppercase text-slate-500">
                        Visibility: {p.visibility}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.titleNe} ({p.titleEn})
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{p.requestTextNe}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {p.moderationStatus !== 'approved' && (
                      <button
                        onClick={() => {
                          onModeratePrayer(p.id, 'approved');
                          onNotify('Prayer request approved and published to the Prayer Wall.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {p.moderationStatus !== 'rejected' && (
                      <button
                        onClick={() => {
                          onModeratePrayer(p.id, 'rejected');
                          onNotify('Prayer request hidden from public wall.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onModeratePrayer(
                          p.id,
                          p.moderationStatus as 'approved' | 'rejected',
                          p.prayerStatus === 'answered' ? 'active' : 'answered'
                        );
                        onNotify('Updated prayer answered testimony status.');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-800 dark:text-amber-300 text-xs font-semibold"
                    >
                      {p.prayerStatus === 'answered' ? 'Answered ✓' : 'Mark Answered'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GOLD & SILVER RATES ADMIN */}
      {activeTab === 'rates' && (
        <div className="max-w-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'ne' ? 'दैनिक सुनचाँदी दर अद्यावधिक (Finance Content Admin)' : 'Update Daily Gold & Silver Bullion Rates (NPR)'}
            </h2>
          </div>

          {!hasAccess('rates') ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-800 dark:text-red-300">
              Switch to <strong>Super Admin</strong> or <strong>Finance Content Admin</strong> to update gold and silver prices.
            </div>
          ) : (
            <form onSubmit={handleRatesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  नेपाली मिति (BS Date)
                </label>
                <input
                  type="text"
                  value={rateDateBsInput}
                  onChange={(e) => setRateDateBsInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    छापावाल सुन (Fine Gold / Tola NPR)
                  </label>
                  <input
                    type="number"
                    required
                    value={goldInput}
                    onChange={(e) => setGoldInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-mono tabular-nums font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    तेजाबी सुन (Tejabi Gold / Tola NPR)
                  </label>
                  <input
                    type="number"
                    required
                    value={tejabiInput}
                    onChange={(e) => setTejabiInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-mono tabular-nums font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    असल चाँदी (Silver / Tola NPR)
                  </label>
                  <input
                    type="number"
                    required
                    value={silverInput}
                    onChange={(e) => setSilverInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-mono tabular-nums font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold"
              >
                {lang === 'ne' ? 'नयाँ सुनचाँदी दर प्रकाशित गर्नुहोस्' : 'Update Official NPR Bullion Rates'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 5: FM RADIO ADMIN */}
      {activeTab === 'radio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-800" />
              <span>{lang === 'ne' ? 'नयाँ रेडियो स्टेशन थप्नुहोस्' : 'Add Christian FM Radio Station'}</span>
            </h2>
            {!hasAccess('radio') ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-800 dark:text-red-300">
                Switch to <strong>Super Admin</strong> or <strong>Radio Admin</strong> to manage FM stations.
              </div>
            ) : (
              <form onSubmit={handleRadioSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    रेडियोको नाम (Nepali Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={stationNameNe}
                    onChange={(e) => setStationNameNe(e.target.value)}
                    placeholder="उदा: शान्ति सुसमाचार एफ.एम. १०२.४"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    अंग्रेजी नाम (English Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={stationNameEn}
                    onChange={(e) => setStationNameEn(e.target.value)}
                    placeholder="e.g. Shanti Gospel FM 102.4 MHz"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      फ्रिक्वेन्सी (Frequency)
                    </label>
                    <input
                      type="text"
                      value={stationFreq}
                      onChange={(e) => setStationFreq(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      सहर (Location)
                    </label>
                    <input
                      type="text"
                      value={stationLocEn}
                      onChange={(e) => {
                        setStationLocEn(e.target.value);
                        setStationLocNe(e.target.value);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    अधिकृत स्ट्रिमिङ URL (Authorized Stream URL)
                  </label>
                  <input
                    type="url"
                    required
                    value={stationUrl}
                    onChange={(e) => setStationUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold"
                >
                  {lang === 'ne' ? 'रेडियो स्टेशन थप्नुहोस्' : 'Save FM Radio Station'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active FM Radio Stations ({radioStations.length})
            </h2>
            <div className="divide-y divide-stone-200 dark:divide-slate-800">
              {radioStations.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {st.nameNe} ({st.nameEn})
                    </p>
                    <p className="text-xs font-mono text-slate-500">
                      {st.frequency} · {st.locationEn} · {st.streamUrl}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">Enabled</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 8 ADMIN ROLES & USER MANAGEMENT (MAKE ADMIN / CREATE ADMIN) */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Top Admin Controls & Promote Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Promote Registered User to Admin Card */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <span>{lang === 'ne' ? 'प्रयोगकर्तालाई एडमिन बनाउनुहोस् (Make Admin)' : 'Promote User to Admin'}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ne' ? '+ नयाँ एडमिन' : '+ New Admin'}</span>
                </button>
              </div>

              <form onSubmit={handlePromoteUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ne' ? 'दर्ता भएका प्रयोगकर्ता छान्नुहोस्:' : 'Select Registered User:'}
                  </label>
                  <select
                    value={promoteUserId}
                    onChange={(e) => setPromoteUserId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- {lang === 'ne' ? 'प्रयोगकर्ता छान्नुहोस्' : 'Select a user'} --</option>
                    {dbUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email}) - {u.churchName || 'Member'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ne' ? 'दिन चाहनुभएको एडमिन भूमिका (Admin Role):' : 'Assign Admin Role:'}
                  </label>
                  <select
                    value={promoteRole}
                    onChange={(e) => setPromoteRole(e.target.value as AdminRoleKey)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="NEWS_ADMIN">समाचार एडमिन (News Admin)</option>
                    <option value="BIBLE_ADMIN">बाइबल एडमिन (Bible Admin)</option>
                    <option value="PRAYER_ADMIN">प्रार्थना एडमिन (Prayer Admin)</option>
                    <option value="RADIO_ADMIN">रेडियो एडमिन (Radio Admin)</option>
                    <option value="CALENDAR_ADMIN">पात्रो एडमिन (Calendar Admin)</option>
                    <option value="FINANCE_ADMIN">सुनचाँदी दर एडमिन (Finance Admin)</option>
                    <option value="GALLERY_ADMIN">ग्यालरी एडमिन (Gallery Admin)</option>
                    <option value="SUPER_ADMIN">सुपर एडमिन (Super Admin - Full Access)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'प्रयोगकर्तालाई एडमिन बनाउनुहोस्' : 'Promote to Admin Role'}</span>
                </button>
              </form>
            </div>

            {/* Quick Registered Users Summary Card */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{lang === 'ne' ? 'दर्ता भएका सदस्यहरू (Users Directory)' : 'Registered Users Directory'}</span>
                </h2>
                <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                  {dbUsers.length} Users
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800 text-xs">
                {dbUsers.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">कुनै प्रयोगकर्ता दर्ता भएका छैनन्।</p>
                ) : (
                  dbUsers.map((u) => (
                    <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email} • {u.churchName || 'Member'}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPromoteUserId(u.id);
                            onNotify(`${u.fullName} छानियो। अब तल भूमिका चयन गरी एडमिन बनाउनुहोस्।`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-[11px] transition-colors"
                        >
                          एडमिन बनाउने
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUserOrAdmin(u.id, u.fullName)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Create New Admin Modal */}
          {showCreateAdminModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <span>{lang === 'ne' ? 'नयाँ एडमिन खाता सिर्जना गर्नुहोस्' : 'Create New Administrator'}</span>
                  </h3>
                  <button onClick={() => setShowCreateAdminModal(false)} className="text-slate-400 hover:text-slate-700">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewAdmin} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="e.g. newseditor"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAdminFullName}
                      onChange={(e) => setNewAdminFullName(e.target.value)}
                      placeholder="e.g. Pr. Samuel Adhikari"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="e.g. editor@biblesandes.com"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Role</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as AdminRoleKey)}
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    >
                      <option value="NEWS_ADMIN">समाचार एडमिन (News Admin)</option>
                      <option value="BIBLE_ADMIN">बाइबल एडमिन (Bible Admin)</option>
                      <option value="PRAYER_ADMIN">प्रार्थना एडमिन (Prayer Admin)</option>
                      <option value="RADIO_ADMIN">रेडियो एडमिन (Radio Admin)</option>
                      <option value="CALENDAR_ADMIN">पात्रो एडमिन (Calendar Admin)</option>
                      <option value="FINANCE_ADMIN">सुनचाँदी दर एडमिन (Finance Admin)</option>
                      <option value="GALLERY_ADMIN">ग्यालरी एडमिन (Gallery Admin)</option>
                      <option value="SUPER_ADMIN">सुपर एडमिन (Super Admin - Full Access)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                    >
                      {lang === 'ne' ? 'एडमिन सिर्जना गर्नुहोस्' : 'Create Admin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateAdminModal(false)}
                      className="h-10 px-4 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table of All 8 Admin Roles & Active Personnel */}
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'ne'
                    ? '८ विशिष्ट एडमिन भूमिका र अधिकार तालिका (Multi-Admin RBAC Directory)'
                    : '8 Specialized Admin Roles & Security Permissions Matrix'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  विशिष्ट अधिकार प्राप्त एडमिनहरूको विवरण र अधिकार क्षेत्र
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full">
                {dbAdmins.length} Admins
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 text-slate-500">
                    <th className="py-3 px-4 font-semibold">Role Title</th>
                    <th className="py-3 px-4 font-semibold">Assigned Administrator</th>
                    <th className="py-3 px-4 font-semibold">Email / Username</th>
                    <th className="py-3 px-4 font-semibold">2FA Status</th>
                    <th className="py-3 px-4 font-semibold">Authorized Modules</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {dbAdmins.map((adm) => (
                    <tr key={adm.id}>
                      <td className="py-3 px-4 font-bold text-red-800 dark:text-amber-400">
                        {adm.roleNameEn}
                        <div className="text-[11px] font-normal text-slate-500">{adm.roleNameNe}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {adm.fullNameEn}
                        <div className="text-[11px] font-normal text-slate-500">{adm.fullNameNe}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {adm.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-600">
                          {adm.twoFactorEnabled ? '2FA Verified' : 'Password + Session'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {adm.allowedModules.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              onSelectAdminRole(adm);
                              onNotify(`Switched active admin role to ${adm.roleNameEn}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-red-800 hover:text-white transition-colors cursor-pointer"
                          >
                            Switch
                          </button>
                          {adm.roleKey !== 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserOrAdmin(adm.id, adm.fullNameEn)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                              title="Delete Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DELIVERABLES SOURCE CODE & DEPLOYMENT FILES */}
      {activeTab === 'deliverables' && (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-red-800 dark:text-amber-400" />
                <span>Production Deliverables: MySQL Schema, Android Kotlin Source & cPanel Guide</span>
              </h2>
              <p className="text-xs text-slate-500">
                Inspect or download the production SQL database schema, native Android Jetpack Compose source, and cPanel deployment instructions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'schema', label: 'MySQL schema.sql' },
                { id: 'android', label: 'Android MainActivity.kt' },
                { id: 'cpanel', label: 'cPanel & APK Guide' },
                { id: 'api', label: 'REST API Docs' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDeliverableType(item.id as typeof deliverableType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    deliverableType === item.id
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                      : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">{deliverableFilename}</span>
            <button
              onClick={() => {
                const blob = new Blob([deliverableContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = deliverableFilename;
                a.click();
                URL.revokeObjectURL(url);
                onNotify(`Downloaded ${deliverableFilename}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 text-white font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {deliverableFilename}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
            {deliverableContent}
          </pre>
        </div>
      )}

      {/* TAB 8: CHRISTIAN HYMN LIBRARY ADMIN CMS */}
      {activeTab === 'hymns' && (
        <BhajanModuleView lang={lang} onNotify={onNotify} isAdminView={true} />
      )}

      {/* QUICK ADMIN LOGIN / RE-AUTH MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-800/10 text-red-800 dark:text-amber-400 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'एडमिन प्रमाणीकरण' : 'Admin Authentication'}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'एडमिन ड्यासबोर्ड लगइन' : 'Sign in to Admin Console'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ne'
                  ? 'आफ्नो एडमिन प्रयोगकर्ता नाम/इमेल र पासवर्ड राखी लगइन गर्नुहोस्।'
                  : 'Enter your admin credentials to update and manage the platform.'}
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ne' ? 'प्रयोगकर्ता नाम वा इमेल (Username / Email)' : 'Username or Email'}
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="superadmin, newsadmin, ..."
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ne' ? 'पासवर्ड (Password)' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-11 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loginLoading ? 'लगइन हुँदैछ...' : lang === 'ne' ? 'एडमिन लगइन गर्नुहोस्' : 'Sign in as Admin'}</span>
              </button>
            </form>

            {/* Quick 1-click Test Accounts */}
            <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {lang === 'ne' ? 'द्रुत भूमिका परिवर्तन (Quick Role Switch):' : 'Quick Role Switch:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_USERS.map((adm) => (
                  <button
                    key={adm.id}
                    type="button"
                    onClick={() => {
                      onSelectAdminRole(adm);
                      setShowLoginModal(false);
                      onNotify(`Switched to ${adm.roleNameEn} (${adm.fullNameEn})`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      currentAdmin.id === adm.id
                        ? 'border-red-800 bg-red-800 text-white'
                        : 'border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-800'
                    }`}
                  >
                    {adm.roleNameEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
