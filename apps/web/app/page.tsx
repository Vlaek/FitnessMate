'use client';

import { MainHeader } from './components/main-header';
import { TelegramIntegrationSection } from './components/telegram-integration-section';
import { WorkoutTemplatesSection } from './components/workout-templates-section';

export default function HomePage() {
  return (
    <div
      data-testid="home-shell"
      className="min-h-[calc(100vh-62px)] bg-background py-8 text-foreground transition-colors"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <MainHeader />

        <TelegramIntegrationSection />

        <WorkoutTemplatesSection />
      </div>
    </div>
  );
}
