import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home • Subspace",
};

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Override Inter with system font just for this route
  return <div className="font-system">{children}</div>;
}
