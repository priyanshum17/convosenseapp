import { ConvoSenseProvider } from '@/contexts/global-talk-provider';
import ConvoSenseClient from '@/components/global-talk/main';

export default function Home() {
  return (
    <ConvoSenseProvider>
      <ConvoSenseClient />
    </ConvoSenseProvider>
  );
}
