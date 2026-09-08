export async function fetchPexelsMedia(query: string, type: 'photo' | 'video', orientation: 'landscape' | 'portrait' | 'square' = 'landscape') {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not defined in the environment.');
  }

  const endpoint = type === 'photo' 
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=15`
    : `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=15`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (type === 'photo') {
    if (!data.photos || data.photos.length === 0) return null;
    // Pick a random photo from the top results
    const item = data.photos[Math.floor(Math.random() * Math.min(5, data.photos.length))];
    // Use medium or large to keep it mobile friendly
    return item.src.large || item.src.medium || item.src.original;
  } else {
    if (!data.videos || data.videos.length === 0) return null;
    // Pick a random video from the top results
    const item = data.videos[Math.floor(Math.random() * Math.min(5, data.videos.length))];
    
    // Find an mp4 format video that is mobile friendly (around 720p to 1080p, not huge 4k)
    const videoFiles = item.video_files.filter((file: any) => file.file_type === 'video/mp4');
    
    // Sort by height descending and pick something around 720-1080 to avoid massive files
    videoFiles.sort((a: any, b: any) => b.height - a.height);
    
    let selectedFile = videoFiles.find((file: any) => file.height <= 1080 && file.height >= 720) || videoFiles[0];
    
    return selectedFile?.link || null;
  }
}
