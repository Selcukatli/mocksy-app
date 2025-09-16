import {
  Sparkles,
  Plus,
  Image,
  Languages,
  Wand2,
  ArrowRight,
  FileImage,
  Upload,
  Layout
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Mocksy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Create stunning app store screenshots with AI-powered editing and translation.
            Transform your app&apos;s presentation in seconds.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/new-app" className="group">
            <div className="relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create New App</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start fresh with templates and AI assistance
                </p>
                <div className="flex items-center text-sm text-primary">
                  Get Started <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Import Screenshots</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload existing screenshots to enhance
                </p>
                <div className="flex items-center text-sm text-purple-500">
                  Upload Now <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Layout className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Browse Templates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore professional screenshot designs
                </p>
                <div className="flex items-center text-sm text-pink-500">
                  View Gallery <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Apps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recent Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card/50 p-4 hover:bg-card transition-colors">
                <div className="aspect-[9/16] bg-gradient-to-br from-secondary to-secondary/50 rounded-lg mb-3 flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium mb-1">App {i}</h3>
                <p className="text-xs text-muted-foreground">Last edited 2 hours ago</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">AI-Powered Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background/60 backdrop-blur rounded-xl p-6">
              <Wand2 className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Smart Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate stunning screenshots from simple descriptions using AI
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur rounded-xl p-6">
              <Image className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Intelligent Editing</h3>
              <p className="text-sm text-muted-foreground">
                Enhance and modify screenshots with AI-powered tools
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur rounded-xl p-6">
              <Languages className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Auto Translation</h3>
              <p className="text-sm text-muted-foreground">
                Translate your screenshots to multiple languages instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}