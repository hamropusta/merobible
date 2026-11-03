declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

export interface PickedGoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  iconUrl?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  embedUrl?: string;
  description?: string;
}

export type PickerViewMode = 'all' | 'images' | 'docs' | 'audio';

let isPickerApiLoaded = false;
let pickerApiLoadingPromise: Promise<void> | null = null;

/**
 * Ensures Google API client library (gapi) and the Google Picker module are loaded.
 */
export const loadGooglePickerApi = (): Promise<void> => {
  if (isPickerApiLoaded && window.google?.picker) {
    return Promise.resolve();
  }

  if (pickerApiLoadingPromise) {
    return pickerApiLoadingPromise;
  }

  pickerApiLoadingPromise = new Promise((resolve, reject) => {
    // Check if gapi script is present
    const checkGapi = () => {
      if (typeof window.gapi !== 'undefined') {
        window.gapi.load('picker', {
          callback: () => {
            isPickerApiLoaded = true;
            resolve();
          },
          onerror: () => {
            reject(new Error('Failed to load Google Picker module via gapi.load'));
          },
        });
      } else {
        // Wait or load script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.gapi) {
            window.gapi.load('picker', {
              callback: () => {
                isPickerApiLoaded = true;
                resolve();
              },
              onerror: () => {
                reject(new Error('Failed to initialize Google Picker API'));
              },
            });
          } else {
            reject(new Error('gapi not defined after loading script'));
          }
        };
        script.onerror = () => reject(new Error('Failed to download apis.google.com/js/api.js'));
        document.body.appendChild(script);
      }
    };

    checkGapi();
  });

  return pickerApiLoadingPromise;
};

/**
 * Builds and displays the Google Picker modal using the user's OAuth access token
 */
export const openGooglePicker = async ({
  accessToken,
  title = 'Google Drive बाट फाइल छान्नुहोस् (Select from Google Drive)',
  viewMode = 'all',
  multiselect = false,
  onPicked,
  onCancel,
}: {
  accessToken: string;
  title?: string;
  viewMode?: PickerViewMode;
  multiselect?: boolean;
  onPicked: (files: PickedGoogleDriveFile[]) => void;
  onCancel?: () => void;
}): Promise<void> => {
  if (!accessToken) {
    throw new Error('Access token is required to open Google Picker');
  }

  await loadGooglePickerApi();

  if (!window.google?.picker) {
    throw new Error('Google Picker library is not ready');
  }

  // Calculate pickerOrigin accurately to avoid iframe origin mismatches
  const pickerOrigin =
    window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  const builder = new window.google.picker.PickerBuilder();

  // Configure views based on viewMode
  if (viewMode === 'images') {
    const imagesView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES);
    imagesView.setIncludeFolders(true);
    builder.addView(imagesView);
  } else if (viewMode === 'audio') {
    const audioView = new window.google.picker.DocsView()
      .setMimeTypes('audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/ogg')
      .setIncludeFolders(true);
    builder.addView(audioView);
  } else if (viewMode === 'docs') {
    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCUMENTS);
    docsView.setIncludeFolders(true);
    builder.addView(docsView);
  } else {
    // All view
    const allDocsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    allDocsView.setIncludeFolders(true);
    builder.addView(allDocsView);

    // Also add images tab
    const imagesView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES);
    imagesView.setIncludeFolders(true);
    builder.addView(imagesView);
  }

  if (multiselect) {
    builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
  }

  builder
    .setOAuthToken(accessToken)
    .setTitle(title)
    .setOrigin(pickerOrigin)
    .setCallback((data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const docs = data[window.google.picker.Response.DOCUMENTS] || [];
        const pickedFiles: PickedGoogleDriveFile[] = docs.map((docItem: any) => ({
          id: docItem[window.google.picker.Document.ID],
          name: docItem[window.google.picker.Document.NAME],
          mimeType: docItem[window.google.picker.Document.MIME_TYPE],
          url: docItem[window.google.picker.Document.URL],
          iconUrl: docItem[window.google.picker.Document.ICON_URL],
          sizeBytes: docItem[window.google.picker.Document.SIZE_BYTES],
          lastEditedUtc: docItem[window.google.picker.Document.LAST_EDITED_UTC],
          description: docItem[window.google.picker.Document.DESCRIPTION],
          embedUrl: docItem[window.google.picker.Document.EMBEDDED_URL],
        }));
        onPicked(pickedFiles);
      } else if (data.action === window.google.picker.Action.CANCEL) {
        if (onCancel) onCancel();
      }
    });

  const picker = builder.build();
  picker.setVisible(true);
};
