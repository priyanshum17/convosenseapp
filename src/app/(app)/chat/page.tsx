import { ArrowLeft, MessagesSquare } from "lucide-react";

export default function ChatPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center bg-secondary/40">
      <div className="flex flex-col items-center gap-4 text-center">
        <MessagesSquare className="w-16 h-16 text-primary/80" />
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold font-headline">Welcome to GlobalTalk</h2>
            <p className="text-muted-foreground max-w-sm">
                Select a user from the sidebar on the left to begin a conversation.
            </p>
        </div>
      </div>
    </div>
  );
}
