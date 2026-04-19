export class TelegramService {
  private static TELEGRAM_TOKEN_KEY = 'telegram-storage';

  static getToken(): string | null {
    const stored = localStorage.getItem(this.TELEGRAM_TOKEN_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return parsed.state.token || null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  static removeToken(): void {
    localStorage.removeItem(this.TELEGRAM_TOKEN_KEY);
  }

  static async sendMessage(message: string, chatId: string): Promise<boolean> {
    const token = this.getToken();

    if (!token) {
      console.error('Telegram token is not set');
      return false;
    }

    if (token) {
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML', // Enable HTML parsing for better formatting
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        console.error('Telegram API error:', result);
        return false;
      }

      return result.ok;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  static async sendPhoto(
    imageSource: string | File,
    chatId: string,
    caption: string,
  ): Promise<boolean> {
    const token = this.getToken();

    if (!token) {
      console.error('Telegram token is not set');
      return false;
    }

    try {
      let imageBlob: Blob;
      let fileName: string;

      if (imageSource instanceof File) {
        imageBlob = imageSource;
        fileName = imageSource.name || 'image.jpg';
      } else {
        const imageResponse = await fetch(imageSource);
        if (!imageResponse.ok) {
          console.error(
            `Failed to fetch image from ${imageSource}, status: ${imageResponse.status}`,
          );
          return false;
        }

        imageBlob = await imageResponse.blob();
        fileName = imageSource.split('/').pop() || 'image.jpg';
      }

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', imageBlob, fileName);
      formData.append('caption', caption);

      const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.ok) {
        console.error('Telegram API error:', result);
        return false;
      }

      return result.ok;
    } catch (error) {
      console.error('Error sending Telegram photo:', error);
      return false;
    }
  }
}
