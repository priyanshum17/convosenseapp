import { useContext } from 'react';
import { GlobalTalkContext, type GlobalTalkContextType } from '@/contexts/global-talk-provider';

export const useGlobalTalk = (): GlobalTalkContextType => {
  const context = useContext(GlobalTalkContext);
  if (!context) {
    throw new Error('useGlobalTalk must be used within a GlobalTalkProvider');
  }
  return context;
};
