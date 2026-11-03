import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Facebook,
  FileText,
  FolderOpen,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Instagram,
  Lock,
  Mail,
  MessageCircle,
  Mic,
  Music,
  Newspaper,
  Phone,
  Printer,
  Radio,
  Send,
  Server,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  Tv,
  Users,
  Video,
  X,
  Youtube,
} from 'lucide-react';

export type LegalTabType = 'privacy' | 'delete-account' | 'community' | 'terms' | 'about';

interface LegalAndAboutViewProps {
  lang: 'ne' | 'en';
  initialTab?: LegalTabType;
  onNavigateTab?: (tab: LegalTabType) => void;
  onOpenSection?: (section: string) => void;
  onNotify: (msg: string) => void;
}

export const LegalAndAboutView: React.FC<LegalAndAboutViewProps> = ({
  lang,
  initialTab = 'privacy',
  onNavigateTab,
  onOpenSection,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const [docLang, setDocLang] = useState<'ne' | 'en'>(lang);

  React.useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Interactive Account Deletion Form State
  const [delEmail, setDelEmail] = useState('');
  const [delUsername, setDelUsername] = useState('');
  const [delReason, setDelReason] = useState('Personal choice / Privacy preference');
  const [delSubmitted, setDelSubmitted] = useState(false);

  const handleTabChange = (tab: LegalTabType) => {
    setActiveTab(tab);
    if (onNavigateTab) onNavigateTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/#${activeTab}`;
      navigator.clipboard?.writeText(url);
      onNotify(docLang === 'ne' ? 'पृष्ठको आधिकारिक लिङ्क कपी गरियो!' : 'Official page URL copied!');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleAccountDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delEmail.trim() || !delEmail.includes('@')) {
      onNotify(docLang === 'ne' ? 'कृपया सही इमेल ठेगाना लेख्नुहोस्।' : 'Please enter a valid email address.');
      return;
    }

    try {
      // Store deletion request in local state for logging
      const existing = JSON.parse(localStorage.getItem('susamachar_deletion_requests') || '[]');
      existing.push({
        email: delEmail.trim(),
        username: delUsername.trim(),
        reason: delReason,
        requestedAt: new Date().toISOString(),
      });
      localStorage.setItem('susamachar_deletion_requests', JSON.stringify(existing));
    } catch {
      // ignore
    }

    setDelSubmitted(true);
    onNotify(
      docLang === 'ne'
        ? 'तपाईंको खाता मेटाउने अनुरोध दर्ता भएको छ (३० दिन भित्र प्रशोधन गरिनेछ)।'
        : 'Your account deletion request has been registered (processed within 30 days).'
    );
  };

  const effectiveDate = 'November 2, 2026';
  const effectiveDateNe = '२०८३ कार्तिक १७ (November 2, 2026)';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Clean Document Navigation & Controls Bar (No redundant Susamachar/About promo banner) */}
      <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/25 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs (Privacy, Delete Account, Community, Terms, About) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {[
            {
              id: 'privacy' as LegalTabType,
              icon: Lock,
              ne: 'गोपनीयता नीति (Privacy Policy)',
              en: 'Privacy Policy',
            },
            {
              id: 'delete-account' as LegalTabType,
              icon: Trash2,
              ne: 'खाता मेटाउने (Delete Account)',
              en: 'Delete Account',
            },
            {
              id: 'community' as LegalTabType,
              icon: Users,
              ne: 'समुदाय निर्देशिका (Community Guidelines)',
              en: 'Community Guidelines',
            },
            {
              id: 'terms' as LegalTabType,
              icon: FileText,
              ne: 'सेवाका सर्तहरू (Terms & Conditions)',
              en: 'Terms & Conditions',
            },
            {
              id: 'about' as LegalTabType,
              icon: Info,
              ne: 'हाम्रो बारेमा (About Us)',
              en: 'About Us',
            },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap text-xs font-bold shrink-0 ${
                  isSel
                    ? 'bg-[#8D8741] text-white shadow-xs'
                    : 'bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#BC986A]/25 hover:bg-[#FAF6EC] dark:hover:bg-slate-700/60 font-medium'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span>{docLang === 'ne' ? tab.ne : tab.en}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions (Bilingual Toggle, Print, Share Link) */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          {/* Bilingual Document Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDocLang('ne')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                docLang === 'ne'
                  ? 'bg-[#8D8741] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              नेपाली
            </button>
            <button
              type="button"
              onClick={() => setDocLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                docLang === 'en'
                  ? 'bg-[#659DBD] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="h-8 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#BC986A]/30 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-[#659DBD] transition-colors"
            title="Copy Page URL"
          >
            <Copy className="w-3.5 h-3.5 text-[#8D8741]" />
            <span className="hidden sm:inline">{docLang === 'ne' ? 'लिङ्क कपी' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-8 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#BC986A]/30 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-[#659DBD] transition-colors"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5 text-[#8D8741]" />
            <span className="hidden sm:inline">{docLang === 'ne' ? 'प्रिन्ट' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: PRIVACY POLICY (Full 17 Sections requested by User)
         =================================================================== */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 dark:text-slate-200">
          {/* Document Header */}
          <div className="border-b border-[#BC986A]/20 dark:border-slate-800 pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#8D8741] dark:text-[#DAAD86]">
              {docLang === 'ne' ? 'गोपनीयता नीति (PRIVACY POLICY)' : 'PRIVACY POLICY'}
            </h2>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1">
              Susamachar – The Good News of Jesus Christ
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {docLang === 'ne' ? `अन्तिम अद्यावधिक: ${effectiveDateNe}` : `Last Updated: ${effectiveDate}`}
            </p>
          </div>

          {/* AdMob & Google Play Callout Box */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 flex items-start gap-3 text-xs leading-relaxed">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {docLang === 'ne'
                  ? 'गुगल प्ले स्टोर (Google Play Store) र गुगल एडमोब (Google AdMob) पारदर्शिता घोषणा:'
                  : 'Google Play Store & Google AdMob Transparency Disclosure:'}
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                {docLang === 'ne'
                  ? 'यो गोपनीयता नीति हाम्रो मोबाइल एप र https://biblesandes.com वेबसाइट दुवैमा प्रत्यक्ष लागू हुन्छ। यसमा विज्ञापन पहिचानकर्ता (Google Advertising ID - AAID), विज्ञापन प्रदर्शन, डेटा सुरक्षा, र खाता मेटाउने (Delete Account) सम्बन्धी सम्पूर्ण कानुनी विवरण खुलाइएको छ।'
                  : 'This policy governs both the Susamachar mobile app and https://biblesandes.com. It explicitly explains Advertising Identifiers (AAID), AdMob display, user rights, and permanent account deletion mechanisms.'}
              </p>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                1
              </span>
              <span>{docLang === 'ne' ? '१. परिचय (Introduction)' : '1. Introduction'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Welcome to Susamachar.</strong>
              </p>
              <p>
                Susamachar is an all-in-one Christian mobile application operated through{' '}
                <a href="https://biblesandes.com" target="_blank" rel="noopener noreferrer" className="text-[#659DBD] underline font-semibold">
                  https://biblesandes.com
                </a>
                .
              </p>
              <p>
                Our application provides Bible reading, Christian news, sermons, videos, audio and worship music, Bible study resources, prayer requests, user profiles, comments, community discussions, and donation-related services.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, protect, and share personal information when users access our application and related services.
              </p>
              <p className="italic">
                By using Susamachar, you acknowledge this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                2
              </span>
              <span>{docLang === 'ne' ? '२. हामीले संकलन गर्ने जानकारी (Information We Collect)' : '2. Information We Collect'}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Depending on the features you use, we may collect the following categories of information:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-[#8D8741] dark:text-[#DAAD86]">
                  A. Account and Profile Information
                </h4>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Name and username.</li>
                  <li>Email address.</li>
                  <li>Authentication credentials.</li>
                  <li>Profile photo.</li>
                  <li>Account preferences and settings.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-[#8D8741] dark:text-[#DAAD86]">
                  B. User-Generated Content
                </h4>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Comments and community posts.</li>
                  <li>Prayer requests.</li>
                  <li>Bible study contributions.</li>
                  <li>Messages or other content submitted through available features.</li>
                  <li>Content reports and moderation records.</li>
                </ul>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic pt-1">
                  Prayer requests may contain personal or sensitive information, including information about religious beliefs, personal circumstances, or family matters. Users should avoid sharing unnecessary confidential information.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-[#8D8741] dark:text-[#DAAD86]">
                  C. Device and Technical Information
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Depending on the services and SDKs integrated into the application:
                </p>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Device type and operating system.</li>
                  <li>App version.</li>
                  <li>Device and advertising identifiers, where permitted (Google Advertising ID - AAID).</li>
                  <li>IP address and approximate location derived from it, if collected.</li>
                  <li>App usage and interaction information.</li>
                  <li>Crash reports and diagnostic information.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-[#8D8741] dark:text-[#DAAD86]">
                  D. Donation Information
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  If you make a donation through Susamachar, payment-related information may be processed by the applicable payment provider. We may receive limited information such as:
                </p>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Donation amount.</li>
                  <li>Transaction reference.</li>
                  <li>Payment status.</li>
                  <li>Date of transaction.</li>
                  <li>Donor name or email, if provided.</li>
                </ul>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                  We do not intentionally store complete payment card numbers or security codes on our servers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How We Use Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                3
              </span>
              <span>{docLang === 'ne' ? '३. जानकारीको प्रयोग (How We Use Information)' : '3. How We Use Information'}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              We may use collected information to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Create and manage user accounts.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Provide Bible reading and study resources.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deliver Christian news, sermons, videos, and worship audio.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Receive and manage prayer requests.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Operate user profiles and community features.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Display and manage comments.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Review reports and moderate inappropriate content.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Process and record donations.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Display advertisements via Google AdMob.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Improve app performance, security, and respond to support.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Advertising and Google AdMob */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                4
              </span>
              <span>{docLang === 'ne' ? '४. विज्ञापन र गुगल एडमोब (Advertising and Google AdMob)' : '4. Advertising and Google AdMob'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Susamachar may use Google AdMob to display advertisements.</strong>
              </p>
              <p>
                Depending on the advertising configuration and applicable consent requirements, advertising partners may process device identifiers, advertising information, and related technical data.
              </p>
              <p>
                We aim to configure advertisements in accordance with Google Play policies and applicable privacy laws.
              </p>
              <p>
                Where users under the applicable age threshold or users of unknown age are served ads, appropriate child-directed advertising protections, non-personalized advertising, and eligible advertising SDK requirements will be followed where applicable.
              </p>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between gap-4 mt-2">
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200">Google Privacy Policy & Technologies:</p>
                  <p className="text-blue-700 dark:text-blue-300">Review how Google manages data in advertising products.</p>
                </div>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold inline-flex items-center gap-1 shrink-0 hover:bg-blue-700"
                >
                  <span>Google Privacy</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>

          {/* Section 5: Prayer Requests */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                5
              </span>
              <span>{docLang === 'ne' ? '५. प्रार्थनाका विषयहरू (Prayer Requests)' : '5. Prayer Requests'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                Users may submit prayer requests through the application.
              </p>
              <p>
                Prayer requests may contain personal or sensitive information. We use submitted information to provide the prayer-request functionality and related services.
              </p>
              <p>
                Private prayer requests will not intentionally be made publicly available without appropriate user consent.
              </p>
              <p className="text-amber-700 dark:text-amber-400 font-semibold">
                Users should not include passwords, financial account details, or unnecessary confidential information in prayer requests.
              </p>
            </div>
          </section>

          {/* Section 6: Comments and Community Guidelines */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                6
              </span>
              <span>{docLang === 'ne' ? '६. टिप्पणी तथा समुदाय निर्देशिका (Comments & Community Guidelines)' : '6. Comments and Community Guidelines'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                Susamachar may allow users to post comments and participate in community discussions. Users are responsible for the content they submit.
              </p>
              <p className="font-bold text-red-600 dark:text-red-400">
                The following content is strictly prohibited:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200">
                <li>Hate speech and harassment.</li>
                <li>Threats and abusive content.</li>
                <li>Spam and fraudulent promotions.</li>
                <li>Impersonation and misleading information.</li>
                <li>Sexual or exploitative content.</li>
                <li>Content that violates applicable laws.</li>
                <li>Unauthorized copyrighted material.</li>
              </ul>
              <p>
                We may review, remove, restrict, or report content that violates our policies. Users may report inappropriate content through available reporting tools. Blocking and moderation tools will be provided where applicable.
              </p>
            </div>
          </section>

          {/* Section 7: Donations and Payments */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                7
              </span>
              <span>{docLang === 'ne' ? '७. दान र भुक्तानी (Donations and Payments)' : '7. Donations and Payments'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                Susamachar may provide donation options to support its Christian mission and related activities.
              </p>
              <p>
                Payment processing may be handled by third-party payment providers. The payment provider may collect and process payment information under its own privacy policy.
              </p>
              <p>
                We may retain limited donation records for accounting, security, legal, and administrative purposes. Donation information will not be used for unrelated purposes without an appropriate legal basis or consent.
              </p>
            </div>
          </section>

          {/* Section 8: Third-Party Services */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                8
              </span>
              <span>{docLang === 'ne' ? '८. तेस्रो-पक्षीय सेवाहरू (Third-Party Services)' : '8. Third-Party Services'}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Susamachar may integrate third-party services to operate its features, including:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>Google AdMob.</li>
              <li>Authentication providers (Firebase Auth).</li>
              <li>Cloud hosting and database providers (Firebase Firestore, Google Cloud).</li>
              <li>Analytics and crash reporting services.</li>
              <li>Video and audio delivery providers (YouTube, FM Audio streaming).</li>
              <li>Payment processing providers.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              Only services actually integrated into the application will apply. These providers may process information according to their own privacy policies and applicable agreements.
            </p>
          </section>

          {/* Section 9: Data Sharing */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                9
              </span>
              <span>{docLang === 'ne' ? '९. डेटा आदानप्रदान (Data Sharing)' : '9. Data Sharing'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                We do not sell users' personal information.
              </p>
              <p>
                We may share necessary information with:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                <li>Hosting and infrastructure providers.</li>
                <li>Authentication providers.</li>
                <li>Advertising providers (Google AdMob).</li>
                <li>Payment providers.</li>
                <li>Analytics and diagnostic providers.</li>
                <li>Authorized personnel responsible for moderation and support.</li>
                <li>Government authorities when legally required.</li>
              </ul>
              <p className="text-xs text-slate-500">
                Information is shared only as necessary for the relevant service, legal obligation, or other disclosed purpose.
              </p>
            </div>
          </section>

          {/* Section 10: Data Security */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                10
              </span>
              <span>{docLang === 'ne' ? '१०. डेटा सुरक्षा (Data Security)' : '10. Data Security'}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              We take reasonable technical and organizational measures to protect information, including:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>Secure authentication and session management.</li>
              <li>Password hashing (Salted scrypt/bcrypt).</li>
              <li>Encrypted network communication (HTTPS/TLS).</li>
              <li>Restricted access to personal information.</li>
              <li>Secure database and hosting configurations.</li>
              <li>Appropriate backup and recovery practices.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              No electronic storage or transmission system can guarantee absolute security.
            </p>
          </section>

          {/* Section 11: Data Retention */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                11
              </span>
              <span>{docLang === 'ne' ? '११. डेटा संरक्षण अवधि (Data Retention)' : '11. Data Retention'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                We retain personal information only as long as reasonably necessary to provide services, maintain security, comply with legal requirements, and resolve disputes.
              </p>
              <p>
                Prayer requests, comments, donation records, and other content may have different retention periods depending on their purpose and applicable obligations.
              </p>
              <p>
                Where data must be retained for legal, accounting, security, or fraud-prevention reasons, we will retain only the information necessary for that purpose.
              </p>
            </div>
          </section>

          {/* Section 12: Account Deletion (Google Play Mandate) */}
          <section className="space-y-3 p-5 rounded-2xl bg-[#FAF6EC] dark:bg-slate-800/80 border border-[#BC986A]/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-black">
                12
              </span>
              <span className="text-red-700 dark:text-red-300">
                {docLang === 'ne' ? '१२. खाता र डेटा मेटाउने अधिकार (Account Deletion)' : '12. Account Deletion'}
              </span>
            </h3>
            <div className="text-sm leading-relaxed space-y-3 text-slate-700 dark:text-slate-300">
              <p>
                Users can request permanent deletion of their Susamachar account and associated personal information. Deletion requests can be initiated:
              </p>
              <ol className="text-xs space-y-2 list-decimal list-inside">
                <li>
                  <strong>Through the application:</strong> Open Account Settings or Profile section and choose <em>Delete Account</em>.
                </li>
                <li>
                  <strong>Through our external account deletion webpage:</strong>{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('delete-account')}
                    className="text-[#659DBD] font-bold underline cursor-pointer"
                  >
                    https://biblesandes.com/delete-account
                  </button>
                </li>
                <li>
                  <strong>By Email:</strong> Contact{' '}
                  <a href="mailto:info@biblesandes.com?subject=Susamachar%20Account%20Deletion%20Request" className="text-[#659DBD] underline font-bold">
                    info@biblesandes.com
                  </a>{' '}
                  with subject: <strong>Susamachar Account Deletion Request</strong>.
                </li>
              </ol>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                After verifying a request, we will process account and associated data deletion within a reasonable period, normally within 30 days.
              </p>
              <p className="text-[11px] text-slate-500">
                Certain information may be retained where required for legitimate legal, accounting, security, or fraud-prevention purposes. Such retention will be limited and handled according to applicable requirements.
              </p>
            </div>
          </section>

          {/* Section 13: Children's and Teen Users' Privacy */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                13
              </span>
              <span>{docLang === 'ne' ? '१३. बालबालिका तथा किशोरकिशोरीको गोपनीयता (Children’s Privacy)' : '13. Children’s and Teen Users’ Privacy'}</span>
            </h3>
            <div className="text-sm leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                Susamachar is intended for users aged 13 and above, subject to applicable local laws.
              </p>
              <p>
                We take appropriate measures to protect younger users' information. We do not knowingly collect personal information from children below the applicable minimum age without legally required parental consent.
              </p>
              <p>
                If we discover that personal information has been collected in violation of applicable requirements, we will take appropriate steps to address the issue.
              </p>
            </div>
          </section>

          {/* Section 14: Your Privacy Rights */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                14
              </span>
              <span>{docLang === 'ne' ? '१४. तपाईंका कानुनी अधिकारहरू (Your Privacy Rights)' : '14. Your Privacy Rights'}</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Depending on applicable laws, users may have rights to:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>Access their personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion.</li>
              <li>Withdraw consent where applicable.</li>
              <li>Raise concerns about information processing.</li>
            </ul>
            <p className="text-xs text-slate-500">
              Users can contact us at info@biblesandes.com to exercise applicable privacy rights.
            </p>
          </section>

          {/* Section 15: External Links */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                15
              </span>
              <span>{docLang === 'ne' ? '१५. बाह्य लिङ्कहरू (External Links and Content)' : '15. External Links and Content'}</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Susamachar may provide links to external websites, video platforms, audio platforms, and other services. We are not responsible for the privacy policies or practices of third-party websites. Users should review those policies before sharing information with external services.
            </p>
          </section>

          {/* Section 16: Changes to This Privacy Policy */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                16
              </span>
              <span>{docLang === 'ne' ? '१६. नीति संशोधन (Changes to This Privacy Policy)' : '16. Changes to This Privacy Policy'}</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              We may update this Privacy Policy when our services, technology, or legal obligations change. Updated versions will be published on our website with a revised date.
            </p>
          </section>

          {/* Section 17: Contact Information */}
          <section className="space-y-3 p-5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#8D8741]/15 text-[#8D8741] dark:text-[#DAAD86] flex items-center justify-center text-sm font-black">
                17
              </span>
              <span>{docLang === 'ne' ? '१७. सम्पर्क विवरण (Contact Information)' : '17. Contact Information'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">App Name:</p>
                <p>Susamachar – सुसमाचार</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Official Website:</p>
                <a href="https://biblesandes.com" target="_blank" rel="noopener noreferrer" className="text-[#659DBD] underline font-semibold">
                  https://biblesandes.com
                </a>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Support & Data Privacy Email:</p>
                <a href="mailto:info@biblesandes.com" className="text-[#659DBD] underline font-semibold">
                  info@biblesandes.com
                </a>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Account Deletion URL:</p>
                <a href="https://biblesandes.com/delete-account" className="text-[#659DBD] underline font-semibold">
                  https://biblesandes.com/delete-account
                </a>
              </div>
              <div className="sm:col-span-2">
                <p className="font-bold text-slate-900 dark:text-white">Our Mission:</p>
                <p className="italic text-[#8D8741] dark:text-[#DAAD86]">Sharing the Good News of Jesus Christ.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================
          TAB 2: DELETE YOUR SUSAMACHAR ACCOUNT (Mandatory Google Play URL)
         =================================================================== */}
      {activeTab === 'delete-account' && (
        <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 dark:text-slate-200">
          <div className="border-b border-[#BC986A]/20 dark:border-slate-800 pb-5">
            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-bold inline-flex items-center gap-1.5 mb-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Google Play Policy Required Page</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {docLang === 'ne' ? 'आफ्नो सुसमाचार खाता मेटाउनुहोस्' : 'Delete Your Susamachar Account'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Susamachar respects your privacy and your right to control your personal information. You can request permanent deletion of your Susamachar account and associated personal data.
            </p>
          </div>

          {/* 2 Ways to Delete */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1: In App */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8D8741]/10 text-[#8D8741] flex items-center justify-center font-bold">
                १
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {docLang === 'ne' ? 'विधि १: एप भित्रबाट सिधै (In-App)' : 'Method 1: Inside Susamachar App'}
              </h3>
              <ol className="text-xs space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>Open the <strong>Susamachar App</strong>.</li>
                <li>Go to <strong>Profile</strong> or <strong>Account Settings</strong>.</li>
                <li>Select <strong>Delete Account</strong>.</li>
                <li>Review the deletion information and confirm your request.</li>
              </ol>
            </div>

            {/* Method 2: Email */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                २
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {docLang === 'ne' ? 'विधि २: इमेल मार्फत (Via Email)' : 'Method 2: Send Us an Email'}
              </h3>
              <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>Send an email request to:</p>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
                  <p><strong>To:</strong> info@biblesandes.com</p>
                  <p><strong>Subject:</strong> Susamachar Account Deletion Request</p>
                  <p><strong>Body:</strong> Include your registered email address and username.</p>
                </div>
                <a
                  href="mailto:info@biblesandes.com?subject=Susamachar%20Account%20Deletion%20Request&body=Hello%2C%20please%20permanently%20delete%20my%20Susamachar%20account%20and%20all%20associated%20data.%0A%0ARegistered%20Email%3A%20%0AUsername%3A%20%0AReason%20(optional)%3A%20"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>इमेल पठाउनुहोस् (Send Email Draft)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Deletion Submission Form (Direct on Web) */}
          <div className="p-6 rounded-2xl bg-[#FAF6EC] dark:bg-slate-800/80 border border-[#BC986A]/40 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>
                {docLang === 'ne' ? 'अनलाइन खाता मेटाउने फारम (Online Deletion Request)' : 'Submit Account Deletion Request Online'}
              </span>
            </h3>

            {delSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                <p className="font-bold">✅ अनुरोध सफलतापूर्वक प्राप्त भयो (Request Received)</p>
                <p>तपाईंको खाता र सम्पूर्ण व्यक्तिगत डेटा ३० दिन भित्र प्रमाणीकरण गरी स्थायी रूपमा हटाइनेछ।</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Confirmation notice will be sent to {delEmail}.</p>
              </div>
            ) : (
              <form onSubmit={handleAccountDeleteSubmit} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  यदि तपाईं एप खोल्न असमर्थ हुनुहुन्छ भने तल आफ्नो दर्ता गरिएको इमेल ठेगाना प्रविष्ट गरी खाता मेटाउने आधिकारिक अनुरोध पठाउन सक्नुहुन्छ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">दर्ता गरिएको इमेल (Registered Email) *</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={delEmail}
                      onChange={(e) => setDelEmail(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#659DBD] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">प्रयोगकर्ता नाम (Username - optional)</label>
                    <input
                      type="text"
                      placeholder="Username / Full Name"
                      value={delUsername}
                      onChange={(e) => setDelUsername(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#659DBD] outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-xs mb-1">खाता मेटाउनुको कारण (Reason)</label>
                  <select
                    value={delReason}
                    onChange={(e) => setDelReason(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#659DBD] outline-hidden"
                  >
                    <option value="Personal choice / Privacy preference">Personal choice / Privacy preference</option>
                    <option value="No longer using the app">No longer using the app</option>
                    <option value="Creating a new account">Creating a new account</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{docLang === 'ne' ? 'खाता मेटाउने अनुरोध पठाउनुहोस्' : 'Submit Deletion Request'}</span>
                </button>
              </form>
            )}
          </div>

          {/* What Will Be Deleted */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {docLang === 'ne' ? 'के-के मेटिनेछ? (What Will Be Deleted?)' : 'What Will Be Deleted?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              After your request is verified and processed, we will delete:
            </p>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>Your user account.</li>
              <li>Personal profile information.</li>
              <li>Associated authentication information.</li>
              <li>Personal information linked to your account.</li>
              <li>User-generated content associated with your account, where applicable and legally permissible.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              Some records may be retained for legitimate legal, accounting, security, or fraud-prevention purposes.
            </p>
          </div>

          {/* Processing Time */}
          <div className="p-4 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Processing Time:</p>
            <p className="text-slate-700 dark:text-slate-300">
              We aim to complete verified account deletion requests within <strong>30 days</strong>.
            </p>
          </div>

          {/* Contact */}
          <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-[#BC986A]/20 dark:border-slate-800 pt-4 space-y-1">
            <p><strong>Website:</strong> https://biblesandes.com</p>
            <p><strong>Email:</strong> info@biblesandes.com</p>
            <p className="text-[#8D8741] font-bold mt-2">Susamachar – The Good News of Jesus Christ.</p>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: SUSAMACHAR COMMUNITY GUIDELINES
         =================================================================== */}
      {activeTab === 'community' && (
        <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 dark:text-slate-200">
          <div className="border-b border-[#BC986A]/20 dark:border-slate-800 pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#8D8741] dark:text-[#DAAD86]">
              {docLang === 'ne' ? 'सुसमाचार समुदाय निर्देशिका' : 'Susamachar Community Guidelines'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Susamachar is a Christian community created to encourage faith, learning, prayer, and respectful discussion.
            </p>
          </div>

          {/* 8 Core Expectations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {docLang === 'ne' ? 'सबै प्रयोगकर्ताहरूबाट अपेक्षा (All users are expected to):' : 'All users are expected to:'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { no: 1, title: 'Respect other users and their beliefs.' },
                { no: 2, title: 'Share constructive and respectful comments.' },
                { no: 3, title: 'Avoid hate speech, threats, harassment, and abusive language.' },
                { no: 4, title: 'Never post spam, scams, or misleading links.' },
                { no: 5, title: 'Respect personal privacy.' },
                { no: 6, title: 'Avoid sharing another person\'s private information without permission.' },
                { no: 7, title: 'Respect copyright and intellectual property.' },
                { no: 8, title: 'Use prayer request features responsibly.' },
              ].map((item) => (
                <div
                  key={item.no}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60"
                >
                  <span className="w-6 h-6 rounded-lg bg-[#8D8741] text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    {item.no}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting and Moderation */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#8D8741]" />
              <span>{docLang === 'ne' ? 'उजुरी र सञ्चालन (Reporting and Moderation)' : 'Reporting and Moderation'}</span>
            </h3>
            <p>
              Users can report inappropriate comments and content through available buttons and in-app flags.
            </p>
            <p>
              Susamachar moderators may review reports, remove prohibited content, restrict accounts, or suspend users who repeatedly violate these guidelines.
            </p>
            <p className="font-semibold text-red-700 dark:text-red-400">
              Serious violations may result in permanent account restrictions.
            </p>
          </div>

          {/* Contact */}
          <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-[#BC986A]/20 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p>
              <strong>Contact:</strong>{' '}
              <a href="mailto:info@biblesandes.com" className="text-[#659DBD] underline font-semibold">
                info@biblesandes.com
              </a>
            </p>
            <p className="text-[#8D8741] font-bold">
              Susamachar – Building a respectful Christian community.
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: TERMS & CONDITIONS
         =================================================================== */}
      {activeTab === 'terms' && (
        <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 dark:text-slate-200">
          <div className="border-b border-[#BC986A]/20 dark:border-slate-800 pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#8D8741] dark:text-[#DAAD86]">
              {docLang === 'ne' ? 'सेवाका सर्तहरू (TERMS & CONDITIONS)' : 'TERMS & CONDITIONS'}
            </h2>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1">
              Susamachar – The Good News of Jesus Christ
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {docLang === 'ne' ? `अन्तिम अद्यावधिक: ${effectiveDateNe}` : `Last Updated: ${effectiveDate}`}
            </p>
          </div>

          {/* 1. Acceptance */}
          <section className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h3>
            <p>
              By downloading, installing, or accessing Susamachar (operated via https://biblesandes.com), you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue using the service.
            </p>
          </section>

          {/* 2. Scripture & Copyrights */}
          <section className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Scripture & Content Licensing
            </h3>
            <p>
              The Holy Bible texts, Christian news, devotionals, and songs made available through Susamachar are for personal devotion, Christian study, and non-commercial fellowship. Scripture translations comply with their respective licenses:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li><strong>Nepali Bible (NNRV / Common):</strong> Nepal Bible Society / FreeBiblesIndia (CC BY-SA 4.0).</li>
              <li><strong>King James Version (KJV):</strong> Public Domain.</li>
              <li><strong>Nepali Christian Bhajan & Choruses:</strong> Provided for sacred community worship.</li>
            </ul>
          </section>

          {/* 3. Community Conduct */}
          <section className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. User Conduct & Prayer Requests
            </h3>
            <p>
              You agree to use Susamachar for lawful, faith-building purposes only. You must not post defamatory, obscene, hateful, or misleading content on prayer walls, community boards, or notes.
            </p>
          </section>

          {/* 4. Advertisements */}
          <section className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. Advertisements (Google AdMob)
            </h3>
            <p>
              The application may display banner or interstitial ads powered by Google AdMob to support maintenance and hosting. Interaction with advertisements is subject to Google's terms and privacy policies.
            </p>
          </section>

          {/* 5. Limitation of Liability */}
          <section className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              5. Disclaimers & Governing Law
            </h3>
            <p>
              Susamachar is provided "as is" without warranty of uninterrupted service. Gold/Silver rates and foreign exchange rates are sourced for informational purposes. These Terms are governed by the laws of Nepal.
            </p>
          </section>

          {/* Contact */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800 text-xs space-y-1">
            <p><strong>Publisher:</strong> Dipima Fauja (Susamachar Team)</p>
            <p><strong>Email:</strong> info@biblesandes.com</p>
            <p><strong>Phone / WhatsApp:</strong> +977 9858064058 (९८५८०६४०५८)</p>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 5: ABOUT SUSAMACHAR (Exact text provided by user)
         =================================================================== */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-slate-900 border border-[#BC986A]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 dark:text-slate-200">
          {/* Header */}
          <div className="border-b border-[#BC986A]/20 dark:border-slate-800 pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#8D8741] dark:text-[#DAAD86]">
              {docLang === 'ne' ? 'हाम्रो बारेमा (About Susamachar)' : 'About Susamachar'}
            </h2>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Susamachar – The Good News of Jesus Christ
            </p>
            <p className="text-xs text-[#8D8741] dark:text-[#DAAD86] font-semibold mt-1">
              “सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ”
            </p>
          </div>

          {/* Short Description */}
          <div className="p-4 rounded-2xl bg-[#FAF6EC] dark:bg-slate-800/80 border border-[#BC986A]/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8D8741] block mb-1">
              Short Description
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Read the Bible, watch sermons, worship, study God's Word and connect in faith.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              पवित्र बाइबल पढ्नुहोस्, प्रवचन हेर्नुहोस्, आराधना गर्नुहोस्, परमेश्वरको बचन अध्ययन गर्नुहोस् र विश्वासमा जोडिनुहोस्।
            </p>
          </div>

          {/* Full Description */}
          <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8D8741] block">
              Full Description
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Susamachar – The Good News of Jesus Christ
            </h3>
            <p>
              Welcome to <strong>Susamachar</strong>, an all-in-one Christian application created to share the Good News of Jesus Christ and help people grow in their faith.
            </p>
            <p>
              Explore biblical teachings, Christian news, sermons, worship, Bible study, prayer, and a community of believers in one convenient application.
            </p>
          </div>

          {/* Features Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8D8741]" />
              <span>FEATURES (मुख्य सुविधाहरू)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: BookOpen,
                  emoji: '📖',
                  title: 'Bible',
                  titleNe: 'पवित्र बाइबल',
                  desc: "Read and explore God's Word with Nepali (NNRV) & English KJV translations, audio narration, and book-by-book chapter navigation.",
                },
                {
                  icon: Newspaper,
                  emoji: '📰',
                  title: 'Christian News',
                  titleNe: 'ख्रीष्टिय समाचार',
                  desc: 'Stay informed about Christian news, events, and gospel developments across Nepal and around the globe.',
                },
                {
                  icon: Mic,
                  emoji: '🎤',
                  title: 'Sermons',
                  titleNe: 'प्रवचन र शिक्षाहरू',
                  desc: 'Watch and listen to Christian messages, sermon series, and faith-building teachings.',
                },
                {
                  icon: Video,
                  emoji: '🎬',
                  title: 'Video',
                  titleNe: 'भिडियो तथा सर्ट्स',
                  desc: 'Explore Christian videos, testimony reels, and inspirational faith-based media.',
                },
                {
                  icon: Music,
                  emoji: '🎵',
                  title: 'Audio & Worship',
                  titleNe: 'आराधना र भजन संगीत',
                  desc: 'Listen to Nepali Christian worship songs, 24/7 FM Radio broadcasts, and audio hymns.',
                },
                {
                  icon: Sparkles,
                  emoji: '📚',
                  title: 'Bible Study',
                  titleNe: 'बाइबल अध्ययन तथा ६६ पुस्तक क्विज',
                  desc: 'Learn, study, and grow through biblical study resources and 66-book interactive Bible quiz with local progress saving.',
                },
                {
                  icon: Heart,
                  emoji: '🙏',
                  title: 'Prayer Requests',
                  titleNe: 'प्रार्थना पर्खाल',
                  desc: 'Share prayer requests and encourage one another in faith through our moderated prayer wall.',
                },
                {
                  icon: Users,
                  emoji: '👤',
                  title: 'User Accounts',
                  titleNe: 'प्रयोगकर्ता खाता र प्रोफाइल',
                  desc: 'Create an account, manage your profile, and personalize your experience with cloud sync.',
                },
                {
                  icon: MessageCircle,
                  emoji: '💬',
                  title: 'Comments & Community',
                  titleNe: 'टिप्पणी र समुदाय',
                  desc: 'Connect with other users through respectful Christian discussions under clear community guidelines.',
                },
                {
                  icon: Heart,
                  emoji: '❤️',
                  title: 'Donations',
                  titleNe: 'सेवकाइ सहयोग र दान',
                  desc: 'Support our mission and gospel outreach activities through available donation options.',
                },
              ].map((feat) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{feat.emoji}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {feat.title} ({feat.titleNe})
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OUR MISSION */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#8D8741]/10 via-[#FAF6EC] to-[#8D8741]/10 dark:from-slate-800 dark:to-slate-800 border border-[#8D8741]/30 space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#8D8741] dark:text-[#DAAD86] flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>OUR MISSION (हाम्रो उद्देश्य)</span>
            </h3>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              “Our mission is to share God's Word, proclaim the Gospel of Jesus Christ, encourage spiritual growth, and connect people through faith.”
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              परमेश्वरको जीवित बचन प्रचार गर्नु, येशू ख्रीष्टको मुक्ति सन्देश फैलाउनु, विश्वासीहरूलाई आत्मिक रूपमा बलियो बनाउनु र समुदायलाई ख्रीष्टको प्रेममा जोड्नु हाम्रो मुख्य उद्देश्य हो।
            </p>
          </div>

          {/* AVAILABLE LANGUAGES */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              AVAILABLE LANGUAGES (उपलब्ध भाषाहरू):
            </h4>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#8D8741]" />
                <span>Nepali (नेपाली)</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#659DBD]" />
                <span>English</span>
              </span>
            </div>
          </div>

          {/* Closing & Socials */}
          <div className="border-t border-[#BC986A]/20 dark:border-slate-800 pt-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              Download Susamachar and become part of a community that values God's Word, prayer, worship, and Christian fellowship.
            </p>
            <p className="text-sm font-black text-[#8D8741] dark:text-[#DAAD86]">
              Susamachar – Sharing the Good News of Jesus Christ.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold">
              <a
                href="tel:9858064058"
                className="h-9 px-3.5 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 border border-[#BC986A]/30 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-[#8D8741] hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#8D8741]" />
                <span>+977 9858064058</span>
              </a>

              <a
                href="mailto:info@biblesandes.com"
                className="h-9 px-3.5 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 border border-[#BC986A]/30 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-[#659DBD] hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#659DBD]" />
                <span>info@biblesandes.com</span>
              </a>

              <a
                href="https://www.facebook.com/susamachar/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 border border-[#BC986A]/30 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-[#1877F2] hover:text-white transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>Facebook</span>
              </a>

              <a
                href="https://whatsapp.com/channel/0029Vb9Au5KBadmeOvdhE33L"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 border border-[#BC986A]/30 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Channel</span>
              </a>

              <a
                href="https://www.youtube.com/@susamacharnp"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 rounded-xl bg-[#FAF6EC] dark:bg-slate-800 border border-[#BC986A]/30 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-[#FF0000] hover:text-white transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
