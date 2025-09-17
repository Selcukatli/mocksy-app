'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function ProfilePage() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="p-8 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold mb-8"
        >
          Profile Settings
        </motion.h1>

        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Personal Information */}
          <motion.div
            variants={itemAnimation}
            className="bg-card rounded-xl border p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors"
                />
              </div>

              <Button variant="default" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            variants={itemAnimation}
            className="bg-card rounded-xl border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Account</h2>

            <div className="space-y-3 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">Free</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                <p className="text-sm text-muted-foreground">Usage</p>
                <p className="font-medium">3 / 10 apps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">January 2025</p>
              </motion.div>
            </div>

            <Button variant="gradient" className="w-full">
              Upgrade to Pro
            </Button>
          </motion.div>

          {/* Preferences */}
          <motion.div
            variants={itemAnimation}
            className="bg-card rounded-xl border p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Default Language</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Screenshot Quality</label>
                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors">
                  <option>High (PNG)</option>
                  <option>Medium (JPEG 90%)</option>
                  <option>Low (JPEG 70%)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm">Auto-save screenshots</span>
                </label>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-border text-primary focus:ring-primary" defaultChecked />
                  <span className="text-sm">Enable AI suggestions</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            variants={itemAnimation}
            className="bg-card rounded-xl border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>

            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}