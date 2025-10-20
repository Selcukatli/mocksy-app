import Image from 'next/image';
import { Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Mocksy Buzzed Animation */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/mocksy-buzzed.gif"
            alt="Mocksy confused"
            width={240}
            height={240}
            unoptimized
            className="w-60 h-60"
            priority
          />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Mocksy searched everywhere but couldn&apos;t find what you&apos;re looking for. 
            Maybe it went on vacation? 🏖️
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <Link
            href="/appstore"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Browse Apps
          </Link>
          
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate App
          </Link>
        </div>

        {/* Fun fact */}
        <div className="mt-12 p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Did you know?</strong> The 404 error was named after room 404 at CERN where the World Wide Web was born!
          </p>
        </div>
      </div>
    </div>
  );
}

