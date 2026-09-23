/**
 * Client & Server upload helper for Amerigam
 * Uploads media files directly to the DigitalOcean VPS storage (/public/uploads)
 */

export async function uploadMedia(file: File | Blob, folder = 'general'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload file to server');
  }

  return data.url;
}

export async function uploadBase64(base64: string, folder = 'avatars'): Promise<string> {
  const formData = new FormData();
  formData.append('base64', base64);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload image to server');
  }

  return data.url;
}
