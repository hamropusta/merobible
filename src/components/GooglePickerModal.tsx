import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Music,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Cloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  openGooglePicker,
  PickedGoogleDriveFile,
  PickerViewMode,
} from '../services/googlePickerService';
import {
  signInForGoogleDrive,
  getCachedAccessToken,
} from '../services/googleDriveService';

interface GooglePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ne' | 'en';
  onFileSelect?: (file: PickedGoogleDriveFile) => void;
}

export const GooglePickerModal: React.FC<GooglePickerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onFileSelect,
}) => {
  const [selectedViewMode, setSelectedViewMode] = useState<PickerViewMode>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pickedFiles, setPickedFiles] = useState<PickedGoogleDriveFile[]>([]);
  const [lastSelected, setLastSelected] = useState<PickedGoogleDriveFile | null>(null);

  if (!isOpen) return null;

  const handleLaunchPicker = async (mode: PickerViewMode = selectedViewMode) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let token = getCachedAccessToken();
      if (!token) {
        const authResult = await signInForGoogleDrive();
        token = authResult.accessToken;
      }

      await openGooglePicker({
        accessToken: token,
        viewMode: mode,
        title:
          mode === 'images'
            ? 'Bible Wallpaper / तस्विरहरू छान्नुहोस्'
            : mode === 'audio'
            ? 'भजन / इसाई संगीत अडियो छान्नुहोस्'
            : mode === 'docs'
            ? 'बाइबल अध्ययन डकुमेन्ट / PDF छान्नुहोस्'
            : 'Google Drive बाट फाइल छान्नुहोस्',
        onPicked: (files) => {
          setPickedFiles((prev) => [...files, ...prev]);
          if (files.length > 0) {
            setLastSelected(files[0]);
            if (onFileSelect) {
              onFileSelect(files[0]);
            }
          }
          setIsLoading(false);
        },
        onCancel: () => {
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Picker error:', err);
      setErrorMsg(err?.message || 'Google Picker खोल्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between bg-stone-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white flex items-center gap-2">
                {lang === 'ne' ? 'Google Picker — गुगल ड्राइभ एक्सप्लोरर' : 'Google Picker — Drive File Explorer'}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Google Drive API
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {lang === 'ne'
                  ? 'तपाईंको गुगल ड्राइभबाट भजन, बाइबल तस्विर र अध्ययन सामग्री छान्नुहोस्'
                  : 'Select worship media, Bible wallpapers, notes & documents from your Google Drive'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{lang === 'ne' ? 'त्रुटि (Error)' : 'Error'}</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Quick Picker Launch Buttons */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2.5 block">
              {lang === 'ne' ? '१. ड्राइभ ब्राउज प्रकार छान्नुहोस्' : '1. Choose Media / Document Type'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedViewMode('all');
                  handleLaunchPicker('all');
                }}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                  selectedViewMode === 'all'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm'
                    : 'border-stone-200 dark:border-slate-800 hover:border-blue-300 hover:bg-stone-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-xs">{lang === 'ne' ? 'सबै फाइलहरू' : 'All Files'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">All Drive Docs</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedViewMode('images');
                  handleLaunchPicker('images');
                }}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                  selectedViewMode === 'images'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm'
                    : 'border-stone-200 dark:border-slate-800 hover:border-rose-300 hover:bg-stone-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="font-semibold text-xs">{lang === 'ne' ? 'तस्विर / वालपेपर' : 'Images / Wallpapers'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">JPG, PNG, Photos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedViewMode('docs');
                  handleLaunchPicker('docs');
                }}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                  selectedViewMode === 'docs'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'border-stone-200 dark:border-slate-800 hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="font-semibold text-xs">{lang === 'ne' ? 'डकुमेन्ट / PDF' : 'Docs & PDFs'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">Notes, Sermons</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedViewMode('audio');
                  handleLaunchPicker('audio');
                }}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                  selectedViewMode === 'audio'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'border-stone-200 dark:border-slate-800 hover:border-emerald-300 hover:bg-stone-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Music className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs">{lang === 'ne' ? 'भजन / अडियो' : 'Hymns & Audio'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">MP3, Worship Tracks</div>
                </div>
              </button>
            </div>
          </div>

          {/* Launch Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold text-stone-900 dark:text-white text-xs sm:text-sm">
                  {lang === 'ne' ? 'Google Picker विन्डो खोल्नुहोस्' : 'Open Google Drive Picker'}
                </p>
                <p className="text-[11px] text-stone-600 dark:text-slate-400">
                  {lang === 'ne'
                    ? 'गुगलको सुरक्षित डायलॉग मार्फत फाइल छान्नुहोस्'
                    : 'Directly search and pick files using Google’s official picker UI'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLaunchPicker()}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{lang === 'ne' ? 'लोड हुँदैछ...' : 'Launching...'}</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'ड्राइभ खोल्नुहोस्' : 'Browse Drive'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Picked Files List */}
          {pickedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                  {lang === 'ne' ? 'हालै छानिएका फाइलहरू (Selected Files)' : 'Recently Picked Files'}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {pickedFiles.length} {lang === 'ne' ? 'फाइल' : 'files'}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {pickedFiles.map((f, i) => (
                  <div
                    key={`${f.id}-${i}`}
                    className="p-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {f.iconUrl ? (
                        <img src={f.iconUrl} alt="" className="w-4 h-4 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{f.name}</p>
                        <p className="text-[10px] text-stone-400 dark:text-slate-500">{f.mimeType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {f.url && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{lang === 'ne' ? 'हेर्नुहोस्' : 'Open'}</span>
                        </a>
                      )}
                      {onFileSelect && (
                        <button
                          onClick={() => {
                            setLastSelected(f);
                            onFileSelect(f);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            lastSelected?.id === f.id
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {lastSelected?.id === f.id ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {lang === 'ne' ? 'छानियो' : 'Selected'}
                            </span>
                          ) : (
                            lang === 'ne' ? 'प्रयोग गर्नुहोस्' : 'Use in App'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature details note */}
          <div className="p-3.5 rounded-xl bg-stone-100/70 dark:bg-slate-800/40 border border-stone-200 dark:border-slate-800 text-[11px] text-stone-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'ne' ? 'विशेषताहरू:' : 'Integration Highlights:'}
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-stone-600 dark:text-slate-400">
              <li>{lang === 'ne' ? 'Google Drive बाट सिधै भजन र बचनका फाइलहरू छान्ने सुविधा' : 'Directly pick worship media and sermon docs from your Google Drive'}</li>
              <li>{lang === 'ne' ? 'Firebase Authentication को साथ सुरक्षित पहुँच' : 'Authenticated securely via Firebase Google Sign-In with OAuth'}</li>
              <li>{lang === 'ne' ? 'बाइबल पद वालपेपर स्टुडियोमा प्रयोग गर्न मिल्ने' : 'Compatible with Bible Verse Wallpaper Studio & Community Notes'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between bg-stone-50 dark:bg-slate-800/50">
          <div className="text-[11px] text-stone-500 dark:text-slate-400">
            {lang === 'ne' ? 'सुसमाचार · गुगल ड्राइभ पिकर' : 'Susamachar · Google Drive Picker'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-800 dark:text-white font-medium text-xs transition-colors"
          >
            {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
