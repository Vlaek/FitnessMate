'use client';

import { MainHeader } from './components/main-header';
import { TelegramIntegrationSection } from './components/telegram-integration-section';
import { WorkoutTemplatesSection } from './components/workout-templates-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <MainHeader />

        <TelegramIntegrationSection />

        <WorkoutTemplatesSection />
      </div>
    </div>
  );
}
