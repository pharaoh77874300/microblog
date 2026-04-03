import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getRouteApi } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { ConversationResponse } from "../backend.d";
import { useConversations } from "../hooks/useQueries";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import { BackButton } from "./BackButton";
import { ConversationView } from "./ConversationView";

const messagesWithRecipientRouteApi = getRouteApi(
  "/messages/$recipientPrincipal",
);

function MessagesPageContent({
  initialPrincipal,
}: { initialPrincipal?: string }) {
  const { data: conversations, isLoading, isError } = useConversations();
  const [selected, setSelected] = useState<ConversationResponse | null>(null);

  useEffect(() => {
    if (initialPrincipal && conversations) {
      const match = conversations.find(
        (c) => c.otherPrincipal.toText() === initialPrincipal,
      );
      if (match) setSelected(match);
    }
  }, [initialPrincipal, conversations]);

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <BackButton className="shrink-0 md:hidden" />
          <h1 className="flex-1 text-lg font-semibold">Messages</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "w-full border-r md:w-80 md:shrink-0",
            selected && "hidden md:block",
          )}
        >
          <ScrollArea className="h-full">
            {isLoading ? (
              <div
                className="flex justify-center py-8"
                data-ocid="conversations.loading_state"
              >
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <p
                className="p-4 text-center text-sm text-destructive"
                data-ocid="conversations.error_state"
              >
                Failed to load conversations.
              </p>
            ) : !conversations || conversations.length === 0 ? (
              <div
                className="flex flex-col items-center px-6 py-12 text-center"
                data-ocid="conversations.empty_state"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start a conversation from someone's profile.
                </p>
              </div>
            ) : (
              <ul>
                {conversations.map((conv, idx) => {
                  const avatarUrl = conv.otherProfilePictureHash
                    ? conv.otherProfilePictureHash.getDirectURL()
                    : null;
                  const initials = getInitials(conv.otherDisplayName);
                  const time = formatDistanceToNow(
                    fromNanoseconds(conv.lastMessageAt),
                    { addSuffix: true },
                  );
                  const isActive =
                    selected?.otherPrincipal.toText() ===
                    conv.otherPrincipal.toText();
                  return (
                    <li
                      key={conv.otherPrincipal.toText()}
                      data-ocid={`conversations.item.${idx + 1}`}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                          isActive && "bg-primary/5",
                        )}
                        onClick={() => setSelected(conv)}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          {avatarUrl && (
                            <AvatarImage
                              src={avatarUrl}
                              alt={conv.otherDisplayName}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between">
                            <p className="truncate text-sm font-semibold">
                              {conv.otherDisplayName}
                            </p>
                            <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                              {time}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.lastMessage}
                          </p>
                        </div>
                        {conv.unreadCount > 0n && (
                          <Badge className="ml-1 h-5 min-w-5 shrink-0 rounded-full px-1.5 text-[10px]">
                            {Number(conv.unreadCount) > 99
                              ? "99+"
                              : Number(conv.unreadCount)}
                          </Badge>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        </div>

        <div
          className={cn(
            "flex-1",
            !selected && "hidden md:flex md:items-center md:justify-center",
            selected && "flex flex-col overflow-hidden",
          )}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-2 border-b px-4 py-3 md:hidden">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setSelected(null)}
                >
                  ← Back
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ConversationView conversation={selected} />
              </div>
            </>
          ) : (
            <div
              className="flex flex-col items-center text-center"
              data-ocid="messages.empty_state"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessagesPage() {
  return <MessagesPageContent />;
}

export function MessagesPageWithRecipient() {
  const { recipientPrincipal } = messagesWithRecipientRouteApi.useParams();
  return <MessagesPageContent initialPrincipal={recipientPrincipal} />;
}
