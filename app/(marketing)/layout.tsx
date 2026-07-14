import { NavBar } from "@/components/marketing/NavBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
