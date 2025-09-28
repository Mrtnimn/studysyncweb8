// Security utilities for URL validation and iframe safety

const ALLOWED_YOUTUBE_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com'
];

const ALLOWED_SPOTIFY_DOMAINS = [
  'open.spotify.com',
  'embed.spotify.com'
];

/**
 * Validates and normalizes YouTube URLs to ensure they're safe for embedding
 */
export function validateYouTubeURL(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check if domain is allowed
    if (!ALLOWED_YOUTUBE_DOMAINS.includes(urlObj.hostname)) {
      console.warn('Invalid YouTube domain:', urlObj.hostname);
      return null;
    }
    
    // Convert to embed format if it's a watch URL
    if (urlObj.pathname === '/watch' && urlObj.searchParams.get('v')) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=0&modestbranding=1&rel=0`;
    }
    
    // If it's already an embed URL, ensure it uses the secure domain
    if (urlObj.pathname.startsWith('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1];
      return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=0&modestbranding=1&rel=0`;
    }
    
    // Handle youtu.be short URLs
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=0&modestbranding=1&rel=0`;
    }
    
    return null;
  } catch (error) {
    console.warn('Invalid YouTube URL format:', url);
    return null;
  }
}

/**
 * Validates and normalizes Spotify URLs to ensure they're safe for embedding
 */
export function validateSpotifyURL(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check if domain is allowed
    if (!ALLOWED_SPOTIFY_DOMAINS.includes(urlObj.hostname)) {
      console.warn('Invalid Spotify domain:', urlObj.hostname);
      return null;
    }
    
    // Convert open.spotify.com URLs to embed format if needed
    if (urlObj.hostname === 'open.spotify.com') {
      // Extract the resource type and ID from the URL
      const pathMatch = urlObj.pathname.match(/\/(track|album|playlist|show|episode)\/([a-zA-Z0-9]+)/);
      if (pathMatch) {
        const [, type, id] = pathMatch;
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      }
    }
    
    // If it's already an embed URL, keep it as is
    if (urlObj.hostname === 'embed.spotify.com' || urlObj.pathname.startsWith('/embed/')) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.warn('Invalid Spotify URL format:', url);
    return null;
  }
}

/**
 * Get minimal sandbox and allow attributes for media iframes
 */
export function getSecureIframeProps() {
  return {
    sandbox: 'allow-scripts allow-same-origin allow-presentation',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    referrerPolicy: 'strict-origin-when-cross-origin' as const
  };
}