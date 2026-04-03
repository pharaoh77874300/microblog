import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ConversationResponse } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "../hooks/useQueries";
import { fromNanoseconds, getInitials } from "../utils/formatting";

interface ConversationViewProps {
  conversation: ConversationResponse;
}

export function ConversationView({ conversation }: ConversationViewProps) {
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toText();

  const otherPrincipalText = conversation.otherPrincipal.toText();

  const { data, isLoading } = useMessages(otherPrincipalText);
  const { mutate: markRead } = useMarkConversationRead();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.pages.flatMap((p) => p.messages) ?? [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: markRead is stable, re-run when conversation changes
  useEffect(() => {
    markRead(conversation.otherPrincipal);
  }, [conversation.otherPrincipal]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message arrival
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    sendMessage(
      { recipient: conversation.otherPrincipal, text: trimmed },
      {
        onSuccess: () => setText(""),
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const avatarUrl = conversation.otherProfilePictureHash
    ? conversation.otherProfilePictureHash.getDirectURL()
    : null;
  const initials = getInitials(conversation.otherDisplayName);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="h-8 w-8">
          {avatarUrl && (
            <AvatarImage
              src={avatarUrl}
              alt={conversation.otherDisplayName}
              className="object-cover"
            />
          )}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">
            {conversation.otherDisplayName}
          </p>
          <p className="text-xs text-muted-foreground">
            @{conversation.otherUsername}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        {isLoading ? (
          <div
            className="flex justify-center py-8"
            data-ocid="messages.loading_state"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center py-12 text-center"
            data-ocid="messages.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender.toText() === currentPrincipal;
              const time = formatDistanceToNow(fromNanoseconds(msg.createdAt), {
                addSuffix: true,
              });
              return (
                <div
                  key={msg.id.toString()}
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px]",
                        isMe
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {time}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            data-ocid="messages.textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            data-ocid="messages.submit_button"
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
