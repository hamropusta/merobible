import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

export { auth };

export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const DRIVE_METADATA_SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';

const provider = new GoogleAuthProvider();
provider.addScope(DRIVE_FILE_SCOPE);
provider.addScope(DRIVE_METADATA_SCOPE);
provider.setCustomParameters({
  prompt: 'select_account',
});

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInForGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token not received');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const logoutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
}

/**
 * Upload a zip blob or array buffer to Google Drive using the Resumable Upload API
 */
export const uploadFileToGoogleDrive = async (
  blob: Blob,
  fileName: string,
  accessToken: string,
  onProgress?: (percent: number) => void
): Promise<DriveUploadResult> => {
  // Step 1: Initiate resumable session
  const metadata = {
    name: fileName,
    description: 'Susamachar / Bible Sandes cPanel deployment package (dist folder)',
    mimeType: 'application/zip',
  };

  const initResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'application/zip',
        'X-Upload-Content-Length': blob.size.toString(),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    throw new Error(`Google Drive upload init failed: ${initResponse.status} ${errorText}`);
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Google Drive resumable upload URL not found in response');
  }

  // Step 2: Upload binary data to resumable URL with progress
  const uploadResponse = await new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/zip');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
        })
      );
    };

    xhr.onerror = () => reject(new Error('Network error during Google Drive upload'));
    xhr.send(blob);
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Google Drive file upload failed: ${uploadResponse.status} ${errText}`);
  }

  const uploadData = await uploadResponse.json();
  const fileId = uploadData.id;

  // Step 3: Fetch file details including webViewLink and make shareable/accessible to user
  try {
    const detailsRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,webContentLink`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (detailsRes.ok) {
      const details = await detailsRes.json();
      return {
        id: fileId,
        name: details.name || fileName,
        webViewLink: details.webViewLink,
      };
    }
  } catch (err) {
    console.warn('Could not fetch file details:', err);
  }

  return {
    id: fileId,
    name: fileName,
    webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
  };
};

/**
 * Direct browser download helper using local blob
 */
export const downloadBlobLocally = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 1000);
};
