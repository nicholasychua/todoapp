import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon • Subspace",
};

export default function ComingSoonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Override Inter with system font just for this route
  return <div className="font-system">{children}</div>;
}
