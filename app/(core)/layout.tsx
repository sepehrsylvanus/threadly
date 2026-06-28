export default async function CoreGroupeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div>
        <LeftSidebar />
        <div>{children}</div>
      </div>
    </>
  );
}
