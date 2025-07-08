'use client';

import { useGlobalTalk } from '@/hooks/use-global-talk';
import OnboardingScreen from './onboarding-screen';
import ChatScreen from './chat-screen';

export default function GlobalTalkClient() {
  const { chatStarted } = useGlobalTalk();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background font-body">
      {chatStarted ? <ChatScreen /> : <OnboardingScreen />}
    </div>
  );
}
