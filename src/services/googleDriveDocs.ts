/**
 * Google Drive & Google Docs service for StatAssist AI
 * Manages the log book 'development statsAI' inside the Google Drive folder 'unimas'
 * for connection to Gemini NotebookLM ('Statistical Assistant AI').
 */

export interface GoogleDriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface GoogleDocFile {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface SyncLogbookPayload {
  activeDatasetName?: string;
  datasetStats?: { rowCount: number; colCount: number };
  activeTestName?: string;
  researchQuestion?: string;
  statisticalSummary?: string;
  apaInText?: string;
  apaTableText?: string;
  customNotes?: string;
}

/**
 * Searches for or creates a folder in Google Drive (defaults to 'unimas').
 */
export async function findOrCreateDriveFolder(
  accessToken: string,
  folderName: string = 'unimas'
): Promise<GoogleDriveFolder> {
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=10`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Failed to query Google Drive for folder '${folderName}': ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const folder = searchData.files[0];
    return {
      id: folder.id,
      name: folder.name,
      webViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    };
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Drive folder '${folderName}': ${errorText}`);
  }

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    name: newFolder.name,
    webViewLink: `https://drive.google.com/drive/folders/${newFolder.id}`,
  };
}

/**
 * Searches for or creates the Google Doc 'development statsAI' in the specified folder.
 */
export async function findOrCreateLogbookDoc(
  accessToken: string,
  folderId: string,
  docName: string = 'development statsAI'
): Promise<{ doc: GoogleDocFile; isNewlyCreated: boolean }> {
  const query = encodeURIComponent(
    `name = '${docName}' and '${folderId}' in parents and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&pageSize=10`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Failed to query Google Drive for '${docName}': ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const doc = searchData.files[0];
    return {
      doc: {
        id: doc.id,
        name: doc.name,
        webViewLink: doc.webViewLink || `https://docs.google.com/document/d/${doc.id}/edit`,
        createdTime: doc.createdTime,
        modifiedTime: doc.modifiedTime,
      },
      isNewlyCreated: false,
    };
  }

  // Create new Google Doc inside folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: docName,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Doc '${docName}': ${errorText}`);
  }

  const newDoc = await createRes.json();
  const docFile: GoogleDocFile = {
    id: newDoc.id,
    name: newDoc.name,
    webViewLink: `https://docs.google.com/document/d/${newDoc.id}/edit`,
    createdTime: new Date().toISOString(),
  };

  // Populate document with initial master logbook blueprint
  await initializeDocContent(accessToken, newDoc.id);

  return { doc: docFile, isNewlyCreated: true };
}

/**
 * Initializes the newly created Google Doc with initial system specifications,
 * NotebookLM instructions, and architecture log.
 */
async function initializeDocContent(accessToken: string, documentId: string): Promise<void> {
  const initialContent = `STATISTICAL ASSISTANT AI (StatAssist AI) — DEVELOPMENT & RESEARCH LOGBOOK
Document: development statsAI | Drive Folder: unimas
Integration Target: Google Gemini NotebookLM ("Statistical Assistant AI")
Timestamp: ${new Date().toLocaleString()}
================================================================================

1. OVERVIEW & MISSION
Statistical Assistant AI (StatAssist AI) is an intelligent academic platform designed to automate quantitative empirical data analysis, hypothesis testing, and APA 7th edition manuscript reporting for researchers, faculty, and scholars.

2. GEMINI NOTEBOOKLM GROUNDING INSTRUCTIONS
This Google Doc serves as the primary grounded knowledge base and live development log for your Google Gemini NotebookLM notebook titled "Statistical Assistant AI".
To connect this document in NotebookLM:
  1. Open Google NotebookLM (https://notebooklm.google.com/).
  2. Select or create your notebook: "Statistical Assistant AI".
  3. Click "+ Add source" -> Choose "Google Drive".
  4. Navigate into your Drive folder 'unimas' and select 'development statsAI'.
  5. Gemini NotebookLM will ingest all statistical algorithms, APA 7th standards, research questions, and live empirical analysis logs recorded below!

3. ARCHITECTURAL PROTOCOLS & SUPPORTED STATISTICAL MODULES
  • Independent Samples t-Test (Student's & Welch's t, Levene's Test, Cohen's d)
  • Paired Samples t-Test (Repeated measures, difference normality, Cohen's dz)
  • One-Way ANOVA (Between-subjects F-test, post-hoc Tukey HSD, eta-squared η²)
  • Multiple Linear Regression (OLS estimation, R, R², Adjusted R², F-test, Beta weights)
  • Pearson Product-Moment & Spearman Rank-Order Correlation (r / rs, bivariate significance)
  • Chi-Square Test of Independence (Goodness-of-fit, Cramer's V, contingency tables)
  • Mann-Whitney U, Wilcoxon Signed-Rank, and Kruskal-Wallis Non-Parametric tests.

4. APA 7TH EDITION PUBLICATION STANDARDS
  • Strict APA 7th manual alignment (3-rule tables: top border, mid-header border, bottom border; no vertical lines).
  • Precision typography: italicized statistical symbols (M, SD, t, F, p, r, η²).
  • Leading zero omission for bounded parameters (e.g., p < .001, r = .42).
  • 95% Confidence Intervals formatted as [LL, UL].

================================================================================
INITIAL DEVELOPMENT LOG ENTRY [${new Date().toISOString()}]
• Status: Log book initialized under Google Drive folder 'unimas'.
• System: Statistical Assistant AI operational.
• Initialized by user connected via Google Workspace OAuth.
================================================================================
\n`;

  await insertTextIntoGoogleDoc(accessToken, documentId, initialContent, 1);
}

/**
 * Inserts text into a Google Doc using the Docs API batchUpdate.
 */
export async function insertTextIntoGoogleDoc(
  accessToken: string,
  documentId: string,
  text: string,
  index: number = 1
): Promise<void> {
  const batchUpdateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;

  const body = {
    requests: [
      {
        insertText: {
          location: {
            index,
          },
          text,
        },
      },
    ],
  };

  const res = await fetch(batchUpdateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update Google Doc: ${errorText}`);
  }
}

/**
 * Appends a new structured development & analysis log entry to the Google Doc.
 */
export async function appendLogbookEntry(
  accessToken: string,
  documentId: string,
  payload: SyncLogbookPayload
): Promise<void> {
  // First get the document length so we append to the end
  const docUrl = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const docRes = await fetch(docUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!docRes.ok) {
    const errorText = await docRes.text();
    throw new Error(`Failed to fetch Google Doc structure: ${errorText}`);
  }

  const docData = await docRes.json();
  const endIndex = docData.body?.content?.slice(-1)[0]?.endIndex || 1;
  const insertIndex = Math.max(1, endIndex - 1);

  const timestamp = new Date().toLocaleString();
  let entryText = `\n--------------------------------------------------------------------------------
LOGBOOK UPDATE: ${timestamp}
• Project: Statistical Assistant AI (StatAssist AI)
• Drive Location: unimas / development statsAI
`;

  if (payload.activeDatasetName) {
    entryText += `• Active Dataset: ${payload.activeDatasetName}`;
    if (payload.datasetStats) {
      entryText += ` (${payload.datasetStats.rowCount} rows, ${payload.datasetStats.colCount} columns)`;
    }
    entryText += '\n';
  }

  if (payload.activeTestName) {
    entryText += `• Test Protocol: ${payload.activeTestName}\n`;
  }

  if (payload.researchQuestion) {
    entryText += `• Research Question: ${payload.researchQuestion}\n`;
  }

  if (payload.statisticalSummary) {
    entryText += `\n[STATISTICAL SUMMARY & METRICS]\n${payload.statisticalSummary}\n`;
  }

  if (payload.apaInText) {
    entryText += `\n[APA 7th IN-TEXT STATEMENT]\n${payload.apaInText}\n`;
  }

  if (payload.apaTableText) {
    entryText += `\n[APA 7th SUMMARY TABLE]\n${payload.apaTableText}\n`;
  }

  if (payload.customNotes) {
    entryText += `\n[RESEARCHER NOTES & ANNOTATION]\n${payload.customNotes}\n`;
  }

  entryText += `--------------------------------------------------------------------------------\n`;

  await insertTextIntoGoogleDoc(accessToken, documentId, entryText, insertIndex);
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
  starred?: boolean;
}

/**
 * Lists files and folders from user's Google Drive
 */
export async function listGoogleDriveFiles(
  accessToken: string,
  pageSize: number = 25,
  query?: string,
  folderId?: string
): Promise<DriveFileItem[]> {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set(
    'fields',
    'files(id,name,mimeType,webViewLink,iconLink,modifiedTime,size,starred)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc');

  const qParts = ['trashed = false'];
  if (folderId) {
    qParts.push(`'${folderId}' in parents`);
  }
  if (query) {
    const escaped = query.replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }
  url.searchParams.set('q', qParts.join(' and '));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list Google Drive files: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Uploads a file (e.g. CSV dataset, APA report) into Google Drive
 */
export async function uploadFileToGoogleDrive(
  accessToken: string,
  filename: string,
  content: string,
  mimeType: string = 'text/csv',
  folderId?: string
): Promise<DriveFileItem> {
  const metadata: any = {
    name: filename,
    mimeType: mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to upload file to Google Drive: ${errorText}`);
  }

  return res.json();
}

/**
 * Fetches content of a text or CSV file from Google Drive
 */
export async function fetchGoogleDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to read file from Google Drive: ${errorText}`);
  }

  return res.text();
}

/**
 * Deletes a file from Google Drive (Requires explicit confirmation beforehand)
 */
export async function deleteGoogleDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${errorText}`);
  }
}
