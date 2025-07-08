import { GlobalTalkProvider } from '@/contexts/global-talk-provider';
import GlobalTalkClient from '@/components/global-talk/main';

export default function Home() {
  return (
    <GlobalTalkProvider>
      <GlobalTalkClient />
    </GlobalTalkProvider>
  );
}
