import { Bookmark, Loader2 } from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useBookmarks } from "../hooks/useQueries";
import { BackButton } from "./BackButton";
import { FeedSkeleton } from "./FeedSkeleton";
import { PostCard } from "./PostCard";

export function BookmarksPage() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBookmarks();

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <BackButton className="shrink-0" />
          <h1 className="flex-1 text-lg font-semibold">Bookmarks</h1>
        </div>
      </div>

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <p className="p-4 text-center text-destructive">
          Failed to load bookmarks.
        </p>
      ) : posts.length === 0 ? (
        <div
          className="flex flex-col items-center px-8 py-16 text-center"
          data-ocid="bookmarks.empty_state"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bookmark className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold">No bookmarks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save posts to read later by bookmarking them.
          </p>
        </div>
      ) : (
        <>
          {posts.map((post, idx) => (
            <div
              key={post.id.toString()}
              data-ocid={`bookmarks.item.${idx + 1}`}
            >
              <PostCard post={post} />
            </div>
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
