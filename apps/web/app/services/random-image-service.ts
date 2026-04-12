interface IImagesResponse {
  images?: string[];
}

export class RandomImageService {
  private static cache: string[] | null = null;

  static async getImages(forceRefresh = false): Promise<string[]> {
    if (!forceRefresh && this.cache) {
      return this.cache;
    }

    const response = await fetch('/api/images', { cache: 'no-store' });
    if (!response.ok) {
      this.cache = [];
      return [];
    }

    const payload = (await response.json()) as IImagesResponse;
    const images = Array.isArray(payload.images) ? payload.images : [];
    this.cache = images;
    return images;
  }

  static async getRandomImage(exclude?: string): Promise<string | null> {
    const images = await this.getImages();
    if (images.length === 0) {
      return null;
    }

    const pool = exclude && images.length > 1 ? images.filter((image) => image !== exclude) : images;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex] || null;
  }
}
