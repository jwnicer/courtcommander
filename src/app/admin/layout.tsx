
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header>
            <Button asChild variant="outline">
                <Link href="/">
                    <Home className="mr-2" />
                    Back to Site
                </Link>
            </Button>
        </Header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
            {children}
        </main>
    </div>
  );
}
