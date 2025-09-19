/**
 * Utility functions for handling file downloads
 */

/**
 * Download a file from a URL with a specific filename
 * @param url - The URL of the file to download
 * @param filename - The desired filename for the download
 */
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    // For direct downloads, create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    
    // If filename is provided, use it, otherwise let browser determine
    if (filename) {
      link.download = filename;
    } else {
      // Try to extract filename from URL
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        link.download = lastPart;
      } else {
        link.download = 'document';
      }
    }
    
    // Set target to ensure download behavior
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Download a file using fetch API for better control
 * @param url - The URL of the file to download
 * @param filename - The desired filename for the download
 * @param authToken - Optional authentication token
 */
export const downloadFileWithFetch = async (
  url: string, 
  filename?: string, 
  authToken?: string
): Promise<void> => {
  try {
    const headers: HeadersInit = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Create blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Determine filename
    if (filename) {
      link.download = filename;
    } else {
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          link.download = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Fallback: extract from URL or use default
      if (!link.download) {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        link.download = lastPart && lastPart.includes('.') ? lastPart : 'document';
      }
    }
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Generate a filename for a project document
 * @param project - The project object
 * @param type - Type of document ('document' or 'file')
 * @returns A formatted filename
 */
export const generateProjectFilename = (
  project: { title: string; year: string; student?: { name: string } },
  type: 'document' | 'file' = 'document'
): string => {
  // Clean project title (remove special characters)
  const cleanTitle = project.title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length

  // Clean student name if available
  const studentName = project.student?.name
    ? project.student.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')
    : 'Unknown';

  // Create filename: ProjectTitle_Year_StudentName_Type
  return `${cleanTitle}_${project.year}_${studentName}_${type}`;
};

/**
 * Check if a URL is downloadable (basic validation)
 * @param url - The URL to check
 * @returns Boolean indicating if URL appears to be downloadable
 */
export const isDownloadableUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common document file extensions
  const downloadableExtensions = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp',
    '.mp4', '.avi', '.mov', '.wmv',
    '.mp3', '.wav', '.ogg'
  ];
  
  const lowerUrl = url.toLowerCase();
  return downloadableExtensions.some(ext => lowerUrl.includes(ext));
};