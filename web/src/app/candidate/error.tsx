"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <Card className="max-w-md w-full border-destructive/20 shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl text-foreground">Something went wrong</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            An unexpected error occurred while loading this page. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
