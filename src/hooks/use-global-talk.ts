import { useContext } from 'react';
import { ConvoSenseContext, type ConvoSenseContextType } from '@/contexts/global-talk-provider';

export const useConvoSense = (): ConvoSenseContextType => {
  const context = useContext(ConvoSenseContext);
  if (!context) {
    throw new Error('useConvoSense must be used within a ConvoSenseProvider');
  }
  return context;
};
