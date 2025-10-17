'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id, Doc } from '@convex/_generated/dataModel';
import ManageScreenshotPanel from './components/ManageScreenshotPanel';
import { useEditorStore } from '@/stores/editorStore';
import ScreenshotSetPageContent from '../../ScreenshotSetPageContent';

interface PageProps {
  params: Promise<{
    'app-id': string;
    'set-id': string;
    'screenshot-id': string;
  }>;
}

export default function ScreenshotPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const setId = resolvedParams['set-id'];
  const screenshotId = resolvedParams['screenshot-id'];
  const router = useRouter();

  const [headerText, setHeaderText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');

  // Store hooks
  const { setActiveSlot, updateTempScreenshot } = useEditorStore();

  // Get the screenshot set
  const screenshotSet = useQuery(
    api.screenshotSets.getSet,
    { setId: setId as Id<"screenshotSets"> }
  );

  // Get all screenshots for the set
  const screenshotsQuery = useQuery(
    api.screenshots.getScreenshotsForSet,
    screenshotSet ? { setId: screenshotSet._id } : "skip"
  );

  // Memoize the screenshots array to prevent unnecessary re-renders
  const screenshots = useMemo(() => screenshotsQuery || [], [screenshotsQuery]);

  // Find the screenshot data
  const [selectedSlot, setSelectedSlot] = useState<Doc<"screenshots"> | null>(null);

  useEffect(() => {
    if (!screenshotSet) return;

    // Find existing screenshot
    const screenshot = screenshots.find(s => s._id === screenshotId);
    if (screenshot) {
      setSelectedSlot(screenshot);
      setHeaderText(screenshot.title || '');
      setSubtitleText(screenshot.subtitle || '');
    } else if (screenshots.length > 0) {
      // Screenshot not found, redirect back
      router.back();
    }
  }, [screenshotSet, screenshots, screenshotId, router]);

  // Set as active in editor store
  useEffect(() => {
    if (selectedSlot && screenshotSet) {
      setActiveSlot(screenshotSet._id, selectedSlot._id, selectedSlot.slotNumber);
      updateTempScreenshot({ title: headerText, subtitle: subtitleText });
    }
  }, [selectedSlot, screenshotSet, headerText, subtitleText, setActiveSlot, updateTempScreenshot]);

  // Handle back navigation
  const handleClose = () => {
    router.back();
  };

  if (!screenshotSet || !selectedSlot) {
    return null; // Or a loading state
  }

  const appId = resolvedParams['app-id'];

  return (
    <>
      {/* Render set page in background */}
      <ScreenshotSetPageContent
        appId={appId}
        setId={setId}
        isBackground={true}
      />
      {/* Render panel on top */}
      <ManageScreenshotPanel
        selectedSlot={selectedSlot}
        headerText={headerText}
        subtitleText={subtitleText}
        onHeaderChange={setHeaderText}
        onSubtitleChange={setSubtitleText}
        onClose={handleClose}
        isOpen={true}
        onCreateScreenshot={undefined}
        appId={appId}
      />
    </>
  );
}