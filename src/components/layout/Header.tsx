import { AuthButton } from "@/components/auth/AuthButton";

const BadmintonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-primary"
    data-ai-hint="badminton shuttlecock"
  >
    <path d="m15.18 2-6.25 6.25" />
    <path d="M12.53 3.47 5.28 10.72" />
    <path d="M10.72 5.28 3.47 12.53" />
    <path d="M9.75 6.25 2 14" />
    <path d="M14 22 8.5 16.5" />
    <path d="m20.5 17.5-5-5" />
    <path d="m17.5 20.5-5-5" />
    <path d="M14.5 21.5-9 7" />
  </svg>
);


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-4">
          <BadmintonIcon />
          <h1 className="text-2xl font-bold">
            <span className="text-primary">Court</span>
            <span className="text-foreground">Commander</span>
          </h1>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
