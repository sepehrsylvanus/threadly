import { PostCard } from "@/components/feed/post-card";
import { FeedSortTabs } from "@/components/feed/feed-sort-tabs";
import { getSessionUser } from "@/lib/auth";
import {
  batchAuthorsForIds,
  getUserByUsername,
  getUserCommentCount,
  getUserKarma,
  listPostsByAuthor,
  listTags,
} from "@/lib/db/queries";
import { formatRelativeTime } from "@/lib/format";
import { FeedSort } from "@/lib/types";
import { UserAvatar } from "@neondatabase/auth/react";
import {
  Calendar,
  MessageSquare,
  ArrowLeft,
  ArrowUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const sortRaw = sp.sort;
  const sort: FeedSort =
    sortRaw === "new" || sortRaw === "top" ? sortRaw : "hot";

  const user = await getUserByUsername(username);
  if (!user) return notFound();

  const sessionUser = await getSessionUser();
  const [rows, karma, commentCount] = await Promise.all([
    listPostsByAuthor(user.id, sort, sessionUser?.id),
    getUserKarma(user.id),
    getUserCommentCount(user.id),
  ]);

  const tags = await listTags();
  const tagMap = new Map(tags.map((t) => [t.slug, t]));

  const authorById = new Map<string, typeof user>();
  authorById.set(user.id, user);

  const otherAuthorIds = [
    ...new Set(rows.map((r) => r.post.authorId).filter((id) => id !== user.id)),
  ];
  if (otherAuthorIds.length > 0) {
    const otherAuthors = await batchAuthorsForIds(otherAuthorIds);
    for (const [id, u] of otherAuthors) {
      authorById.set(id, u);
    }
  }

  const cards = rows.map((row) => {
    const author = authorById.get(row.post.authorId);
    if (!author) return null;
    return (
      <PostCard
        key={row.post.id}
        post={row.post}
        author={author}
        tagsBySlug={tagMap}
        score={row.score}
        userVote={row.userVote}
      />
    );
  });

  const totalPosts = rows.length;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Feed
        </Link>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground truncate">
              u/{user.username}
            </h1>
            {user.displayName && user.displayName !== user.username && (
              <p className="text-sm text-muted-foreground truncate">
                {user.displayName}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{karma}</p>
            <p className="text-xs text-muted-foreground">Karma</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalPosts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{commentCount}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Joined</p>
          </div>
        </div>

        {/* Detail Row */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {user.createdAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Joined {formatRelativeTime(user.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="mt-6">
        <FeedSortTabs current={sort} basePath={`/u/${username}`} />
        <div className="mt-4 space-y-4">
          {cards}
          {rows.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FileText className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No posts yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
