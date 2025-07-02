export const fetchResource = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

export const downloadFile = (blob: Blob, filename?: string) => {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = downloadUrl;
  link.setAttribute('download', filename || 'document');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
