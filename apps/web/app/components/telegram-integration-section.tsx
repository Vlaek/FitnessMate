import { Button } from '@repo/ui/components/button';
import { CardContent, CardFooter } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { toast } from '@repo/ui/toast';
import { useTranslation } from 'react-i18next';
import { useTelegramStore } from '../stores/telegram-store';

export function TelegramIntegrationSection() {
  const { t } = useTranslation('common');
  const {
    token: telegramToken,
    chatId,
    setToken,
    setChatId,
    resetToken,
    isConfigured,
  } = useTelegramStore();

  const handleSaveToken = () => {
    setToken(telegramToken);
    toast.success(t('telegramTokenSavedSuccessfully') || 'Telegram token saved successfully!');
  };

  const handleResetToken = () => {
    resetToken();
    toast.success(t('telegramTokenRemoved') || 'Telegram token removed!');
  };

  return (
    <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="bg-blue-600 p-6">
        <h2 className="text-2xl font-bold text-white">{t('telegramIntegration')}</h2>
        <p className="text-blue-100">{t('configureYourTelegramBotTokenToSendWorkoutReports')}</p>
      </div>
      <CardContent className="px-6 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="token" className="text-slate-700">
              {t('botToken')}
            </Label>
            <Input
              id="token"
              type="password"
              value={telegramToken}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('enterYourTelegramBotToken')}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>
          <div>
            <Label htmlFor="chatId" className="text-slate-700">
              {t('chatID')}
            </Label>
            <Input
              id="chatId"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder={t('enterTargetChatID')}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 bg-slate-50 px-6 py-4">
        <Button
          onClick={handleSaveToken}
          className="rounded-lg bg-green-600 px-5 py-2 text-white transition-colors hover:bg-green-700"
        >
          {t('saveToken')}
        </Button>
        <Button
          variant="outline"
          onClick={handleResetToken}
          className="rounded-lg border-red-500 px-5 py-2 text-red-600 transition-colors hover:bg-red-50"
        >
          {t('resetToken')}
        </Button>
        <p className="ml-auto text-sm font-medium text-green-600">
          {isConfigured() ? (
            <span>{t('tokenIsConfigured')}</span>
          ) : (
            <span>{t('tokenNotConfigured')}</span>
          )}
        </p>
      </CardFooter>
    </div>
  );
}
