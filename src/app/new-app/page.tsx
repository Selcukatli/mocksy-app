'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAppPage() {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle app creation logic here
    console.log('Creating app:', { appName, appDescription });
    // For now, redirect to home
    router.push('/home');
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6">Create New App</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="appName" className="block text-sm font-medium mb-2">
            App Name
          </label>
          <input
            type="text"
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
            placeholder="Enter your app name"
            required
          />
        </div>

        <div>
          <label htmlFor="appDescription" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="appDescription"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
            placeholder="Describe your app"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Platform
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">iOS</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Android</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Screenshot Templates
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <p className="text-sm">Template 1</p>
            </div>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <p className="text-sm">Template 2</p>
            </div>
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <p className="text-sm">Template 3</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create App
          </button>
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}