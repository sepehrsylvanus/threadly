import { LeftSidebar } from "@/components/layout/left-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { getSessionUser } from "@/lib/auth";
import { tagPostCounts } from "@/lib/db/queries";

export default async function CoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const tags = await tagPostCounts();
  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-300 gap-8 px-4 pb-16 pt-2">
        <LeftSidebar showCta={!user} tagsWithCounts={tags} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
