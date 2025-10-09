import Image from 'next/image';
import Link from 'next/link';

export default function MockstoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/mocksy-app-icon.png"
              alt="Mocksy"
              width={40}
              height={40}
              className="rounded-lg"
              quality={100}
              priority
            />
            <span className="text-xl font-bold">Mockstore</span>
          </Link>

          <Link
            href="/new-app"
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            Create Your Own
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image
                src="/mocksy-app-icon.png"
                alt="Mocksy"
                width={24}
                height={24}
                className="rounded"
                quality={100}
              />
              <span>© 2025 Mocksy. AI-powered app store screenshots.</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
