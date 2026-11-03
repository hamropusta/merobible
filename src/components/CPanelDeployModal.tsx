import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  FolderArchive,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initDriveAuth,
  signInForGoogleDrive,
  uploadFileToGoogleDrive,
  downloadBlobLocally,
  logoutGoogleDrive,
  getCachedAccessToken,
} from '../services/googleDriveService';

interface CPanelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CPanelDeployModal: React.FC<CPanelDeployModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [driveFileUrl, setDriveFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloadingLocally, setIsDownloadingLocally] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initDriveAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsAuthenticating(true);
    try {
      const res = await signInForGoogleDrive();
      setCurrentUser(res.user);
      setAccessToken(res.accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message?.includes('popup-closed-by-user')
          ? 'लगइन पपअप बन्द गरियो। कृपया फेरि प्रयास गर्नुहोस्।'
          : 'Google लगइन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogleDrive();
    setCurrentUser(null);
    setAccessToken(null);
    setDriveFileUrl(null);
  };

  const handleStartUploadToDrive = async () => {
    setConfirmModalOpen(false);
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = accessToken || getCachedAccessToken();
      if (!token) {
        throw new Error('Google Drive access token is missing. Please sign in again.');
      }

      // Fetch the zip blob directly from our applet server
      const zipRes = await fetch('/dist-only.zip');
      if (!zipRes.ok) {
        throw new Error('Could not fetch dist-only.zip package from server');
      }
      const zipBlob = await zipRes.blob();

      // Upload to Google Drive using Resumable Upload
      const result = await uploadFileToGoogleDrive(
        zipBlob,
        'dist-only.zip',
        token,
        (pct) => setUploadProgress(pct)
      );

      if (result.webViewLink) {
        setDriveFileUrl(result.webViewLink);
      } else {
        setDriveFileUrl(`https://drive.google.com/file/d/${result.id}/view`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google Drive मा फाइल अपलोड गर्दा समस्या आयो।');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectDownload = async () => {
    setIsDownloadingLocally(true);
    try {
      const res = await fetch('/dist-only.zip');
      if (!res.ok) throw new Error('Download request failed');
      const blob = await res.blob();
      downloadBlobLocally(blob, 'dist-only.zip');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('डाउनलोड गर्न सकिएन, कृपया सिधै Google Drive विकल्प प्रयोग गर्नुहोस्।');
    } finally {
      setIsDownloadingLocally(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-900 via-stone-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FolderArchive className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">cPanel Deployment & Google Drive Hub</h2>
              <p className="text-xs text-stone-300">
                biblesandes.com का लागि <span className="text-amber-300 font-mono">dist</span> फोल्डर प्राप्त गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div className="text-xs">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Google Drive Sync */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-950">
                    विकल्प १: सिधै तपाईंको Google Drive मा सेभ गर्नुहोस् (सिफारिस गरिएको)
                  </h3>
                  <p className="text-xs text-emerald-800">
                    फाइल सिधै तपाईंको व्यक्तिगत Google Drive मा पुग्नेछ, जहाँबाट १ क्लिकमा cPanel मा हाल्न सकिन्छ।
                  </p>
                </div>
              </div>
            </div>

            {!currentUser ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-emerald-200">
                <div className="text-xs text-stone-600">
                  फाइल अपलोड गर्न आफ्नो Google अकाउन्टबाट साइन-इन गर्नुहोस्:
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-xl shadow-sm hover:shadow transition-all text-xs disabled:opacity-60 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.photoURL || 'https://via.placeholder.com/32'}
                      alt=""
                      className="w-7 h-7 rounded-full border border-stone-200"
                    />
                    <div>
                      <div className="font-semibold text-xs text-stone-900">
                        {currentUser.displayName || 'Google User'}
                      </div>
                      <div className="text-[11px] text-stone-500">{currentUser.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="text-stone-500 hover:text-stone-700 text-xs flex items-center gap-1 p-1 hover:bg-stone-100 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>बाहिरिनुहोस्</span>
                  </button>
                </div>

                {driveFileUrl ? (
                  <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-2 text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Google Drive मा सफलतापूर्वक अपलोड भयो!</span>
                    </div>
                    <p className="text-xs">
                      तपाईंको Google Drive मा <strong>dist-only.zip</strong> फाइल तयार छ। तल क्लिक गरेर सिधै खोल्न सक्नुहुन्छ:
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <a
                        href={driveFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-xs shadow"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Google Drive मा फाइल खोल्नुहोस्</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => setConfirmModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-60 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Google Drive मा पठाउँदै... {uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-4 h-4" />
                          <span>📤 Google Drive मा dist-only.zip (19MB) पठाउनुहोस्</span>
                        </>
                      )}
                    </button>

                    {isUploading && (
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Direct Local Browser Download */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-700 text-white rounded-xl shadow">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    विकल्प २: ब्राउजरबाट सिधै कम्प्युटरमा डाउनलोड गर्नुहोस्
                  </h3>
                  <p className="text-xs text-stone-500">
                    यसले यही पेजबाट सिधै तपाईंको कम्प्युटरमा <code className="bg-stone-200 px-1 py-0.5 rounded">dist-only.zip</code> सेभ गर्छ।
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDownloadingLocally}
                onClick={handleDirectDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDownloadingLocally ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>तयार हुँदै...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download dist-only.zip</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Step-by-Step cPanel instructions */}
          <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="font-bold text-xs text-stone-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>cPanel File Manager मा हाल्ने ३ सरल तरिका:</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1 pl-1">
              <li>
                माथिको Google Drive वा कम्प्युटरबाट <strong>dist-only.zip</strong> प्राप्त गर्नुहोस्।
              </li>
              <li>
                तपाईंको cPanel File Manager को{' '}
                <code className="text-red-700 font-mono">/home/biblesandes/susamachar/</code> मा गएर माथिको{' '}
                <strong>Upload</strong> बटन थिच्नुहोस् र यो फाइल हाल्नुहोस्।
              </li>
              <li>
                अपलोड भएपछि <strong>dist-only.zip</strong> मा राइट क्लिक गरी <strong>Extract</strong> थिच्नुहोस्। त्यसपछि{' '}
                <strong>biblesandes.com</strong> रिफ्रेस गर्नुहोस्!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Workspace Guideline compliance */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              <span>Google Drive मा अपलोड पुष्टि गर्नुहोस्</span>
            </div>
            <p className="text-xs text-stone-600">
              के तपाईं <strong>dist-only.zip</strong> (१९ MB) लाई आफ्नो Google Drive खाता (
              <span className="font-semibold text-stone-800">{currentUser?.email}</span>) मा नयाँ फाइलको रूपमा अपलोड गर्न चाहनुहुन्छ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleStartUploadToDrive}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow"
              >
                हुन्छ, अपलोड गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
