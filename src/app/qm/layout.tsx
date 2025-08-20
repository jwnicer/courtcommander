
'use client';
import * as React from "react";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, KeyRound, Loader2, LogOut, X, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const QM_PIN = '987412'; // The secret PIN

// Create a new, custom DialogContent component
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
      onEscapeKeyDown={(e) => {
        props.onEscapeKeyDown?.(e);
        if (hideCloseButton) e.preventDefault();
      }}
       onPointerDownOutside={(e) => {
        props.onPointerDownOutside?.(e);
        if (hideCloseButton) e.preventDefault();
      }}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";


export default function QmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check session storage on component mount
    if (sessionStorage.getItem('isQmAuthenticated') === 'true') {
      setIsAuthenticated(true);
    }
    setIsVerifying(false);
  }, []);

  const handlePinSubmit = () => {
    setLoading(true);
    setTimeout(() => { // Simulate network delay
        if (pin === QM_PIN) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isQmAuthenticated', 'true');
            toast({
                title: 'Access Granted',
                description: 'Welcome to the Queue Master Panel.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'The PIN you entered is incorrect.',
            });
            setPin('');
        }
        setLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isQmAuthenticated');
    setPin('');
    toast({
        title: 'Logged Out',
        description: 'You have been securely logged out.',
    });
    router.push('/');
  }

  const handlePinKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handlePinSubmit();
    }
  }

  if (isVerifying) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2" />
                        Back to Site
                    </Link>
                </Button>
                {isAuthenticated && (
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2" />
                        Log Out
                    </Button>
                )}
            </div>
        </Header>
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!isAuthenticated ? (
                <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
                    <CustomDialogContent className="sm:max-w-md" hideCloseButton>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><KeyRound /> Queue Master Access</DialogTitle>
                            <DialogDescription>
                                Please enter the PIN to access the QM dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Label htmlFor="pin-input" className="sr-only">PIN</Label>
                            <Input
                                id="pin-input"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                onKeyDown={handlePinKeyPress}
                                className="text-center text-2xl tracking-[1em]"
                                placeholder="••••••"
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handlePinSubmit} className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Unlock
                            </Button>
                        </DialogFooter>
                    </CustomDialogContent>
                </Dialog>
            ) : (
                <div className="space-y-6">
                    {children}
                </div>
            )}
        </main>
    </div>
  );
}
