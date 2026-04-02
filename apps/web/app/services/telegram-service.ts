export class TelegramService {
  private static TELEGRAM_TOKEN_KEY = 'telegram_token';
  
  static saveToken(token: string): void {
    localStorage.setItem(this.TELEGRAM_TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TELEGRAM_TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TELEGRAM_TOKEN_KEY);
  }

  static async sendMessage(message: string, chatId: string): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('Telegram token is not set');
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
        }),
      });

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }
}