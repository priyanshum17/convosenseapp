'use client';

import { useConvoSense } from '@/hooks/use-global-talk';
import OnboardingScreen from './onboarding-screen';
import ChatScreen from './chat-screen';
import TranslationPreviewDialog from './translation-preview-dialog';

export default function ConvoSenseClient() {
  const { chatStarted } = useConvoSense();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background font-body">
      {chatStarted ? <ChatScreen /> : <OnboardingScreen />}
      <TranslationPreviewDialog />
    </div>
  );
}
