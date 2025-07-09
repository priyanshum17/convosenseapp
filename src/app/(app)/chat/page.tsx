import { ArrowLeft } from "lucide-react";

export default function ChatPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center bg-muted/50">
      <div className="flex items-center gap-4">
        <ArrowLeft className="w-12 h-12 text-muted-foreground" />
        <div className="flex flex-col items-start">
            <h2 className="text-2xl font-bold font-headline">Select a conversation</h2>
            <p className="text-muted-foreground">Choose a user from the sidebar to start chatting.</p>
        </div>
      </div>
    </div>
  );
}
