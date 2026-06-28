import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-300  items-center gap-4 px-4">
        <Link
          href="/"
          className={
            "flex items-center gap-2 font-semibold tracking-tight text-foreground"
          }
        >
          <span
            className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden
          >
            T
          </span>
          <span className="text-lg">Threadly</span>
        </Link>

        <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            placeholder="Search posts..."
            className="h-10 w-full rounded-full border-border bg-card pl-10 pr-16 text-sm"
            aria-label="Search posts"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={"/auth/sign-in"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
            )}
          >
            Log In
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "default" }))}
            href={"/auth/sign-up"}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
