// YouTube Data API v3 Client
// Documentation: https://developers.google.com/youtube/v3/docs

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

export class YouTubeClient {
  private apiKey: string | undefined;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  /**
   * Search for videos related to a location's weather
   */
  async searchWeatherVideos(
    locationName: string,
    maxResults: number = 3
  ): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const query = `${locationName} weather`;
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', maxResults.toString());
    url.searchParams.set('key', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `YouTube API error: ${response.status} ${response.statusText}`
      );
    }

    const data: YouTubeSearchResponse = await response.json();

    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  }

  /**
   * Generate YouTube video URL
   */
  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

// Singleton instance
export const youtubeClient = new YouTubeClient();
