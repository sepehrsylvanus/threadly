import { FeedSort } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

function hrefFor(sort: FeedSort, tag?: string, basePath?: string) {
  const params = new URLSearchParams();
  if (sort !== "hot") params.set("sort", sort);
  if (tag) params.set("tag", tag);
  const q = params.toString();
  const base = basePath ?? "/";
  return q ? `${base}?${q}` : base;
}

export function FeedSortTabs({
  current,
  tag,
  basePath,
}: {
  current: FeedSort;
  tag?: string;
  basePath?: string;
}) {
  const tabs: { id: FeedSort; label: string; icon: typeof Flame }[] = [
    { id: "hot", label: "Hot", icon: Flame },
    { id: "new", label: "New", icon: Sparkles },
    { id: "top", label: "Top", icon: TrendingUp },
  ];
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = current === id;

          return (
            <Link
              key={id}
              href={hrefFor(id, tag, basePath)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
