import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notebook | Documind",
  description: "AI-powered notebook for students",
};

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
