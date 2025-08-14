'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const registrationSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters.").max(50, "Nickname cannot exceed 50 characters."),
  level: z.coerce.number().min(1, "Level must be between 1 and 7").max(7, "Level must be between 1 and 7"),
});

export default function RegistrationForm({ orgId, venueId, sessionId }: { orgId: string, venueId: string, sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nickname: "",
      level: 3,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    setLoading(true);
    try {
      await api.registerParticipant({ ...values, orgId, venueId, sessionId });
      toast({
        title: "Registration Successful!",
        description: "You're now registered. Please proceed to payment.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto animate-in fade-in-50">
      <CardHeader>
        <CardTitle>Register for Session</CardTitle>
        <CardDescription>Enter your details to join the open play session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ShuttleSmasher" {...field} />
                  </FormControl>
                  <FormDescription>This will be your display name for the session.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(7)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Level {i + 1} {i === 0 ? '(Beginner)' : i === 3 ? '(Intermediate)' : i === 6 ? '(Advanced)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <FormDescription>A rough estimate of your skill level from 1 (new) to 7 (highly competitive).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Registering...' : 'Register and Proceed to Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
