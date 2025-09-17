'use client';

import {
  Plus,
  Image,
  Languages,
  Wand2,
  ArrowRight,
  FileImage,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-[linear-gradient(to_right,theme(colors.blue.600),theme(colors.purple.600),theme(colors.pink.600),theme(colors.orange.600),theme(colors.blue.600))] dark:bg-[linear-gradient(to_right,theme(colors.blue.400),theme(colors.purple.400),theme(colors.pink.400),theme(colors.orange.400),theme(colors.blue.400))] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
            Welcome to Mocksy
          </h1>
          <p className="text-lg text-muted-foreground lg:max-w-md">
            Create stunning app store screenshots with AI-powered editing and translation.
            Transform your app&apos;s presentation in seconds.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Smart Generation</h3>
            <p className="text-sm text-muted-foreground">
              Generate stunning screenshots from simple descriptions using AI
            </p>
          </motion.div>

          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Intelligent Editing</h3>
            <p className="text-sm text-muted-foreground">
              Enhance and modify screenshots with AI-powered tools
            </p>
          </motion.div>

          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Auto Translation</h3>
            <p className="text-sm text-muted-foreground">
              Translate your screenshots to multiple languages instantly
            </p>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Link href="/new-app" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Create New App</h3>
                <p className="text-white/90 mb-3 text-sm">
                  Start fresh with templates and AI assistance
                </p>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/templates" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Layout className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Browse Templates</h3>
                <p className="text-white/90 mb-3 text-sm">
                  Explore professional screenshot designs
                </p>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span>View Templates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Your Apps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 + i * 0.05 }}
              >
                <Link href={`/app/${i}`} className="group block">
                  <div className="rounded-xl border bg-card/50 p-4 hover:bg-card hover:shadow-md transition-all duration-200">
                    <div className="aspect-[9/16] bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                      <FileImage className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-medium mb-1">App {i}</h3>
                    <p className="text-xs text-muted-foreground">Last edited 2 hours ago</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}