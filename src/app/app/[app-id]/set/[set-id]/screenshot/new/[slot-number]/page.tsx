'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id, Doc } from '@convex/_generated/dataModel';
import ManageScreenshotPanel from '../../[screenshot-id]/components/ManageScreenshotPanel';
import { useEditorStore } from '@/stores/editorStore';
import ScreenshotSetPageContent from '../../../ScreenshotSetPageContent';

interface PageProps {
  params: Promise<{
    'app-id': string;
    'set-id': string;
    'slot-number': string;
  }>;
}

export default function NewScreenshotPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const setId = resolvedParams['set-id'];
  const slotNumber = parseInt(resolvedParams['slot-number']);
  const router = useRouter();

  const [headerText, setHeaderText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  // Create screenshot mutation
  const createScreenshotMutation = useMutation(api.screenshots.createScreenshot);

  // Create the placeholder slot data
  const [selectedSlot, setSelectedSlot] = useState<Doc<"screenshots"> | null>(null);

  useEffect(() => {
    if (!screenshotSet) return;

    // Check if a screenshot already exists for this slot
    const existingScreenshot = screenshots.find(s => s.slotNumber === slotNumber);
    if (existingScreenshot) {
      // Redirect to the existing screenshot's URL
      router.replace(`/app/${appId}/set/${setId}/screenshot/${existingScreenshot._id}`);
    } else {
      // Create a temporary placeholder
      setSelectedSlot({
        _id: `new-${slotNumber}` as Id<"screenshots">,
        _creationTime: Date.now(),
        setId: screenshotSet._id,
        appId: screenshotSet.appId,
        createdBy: screenshotSet.createdBy,
        slotNumber: slotNumber,
        isEmpty: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }, [screenshotSet, screenshots, slotNumber, router, appId, setId]);

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
        onCreateScreenshot={async (title?: string, subtitle?: string) => {
          if (!screenshotSet || !selectedSlot || isCreating) return;

          setIsCreating(true);
          try {
            const newScreenshotId = await createScreenshotMutation({
              setId: screenshotSet._id,
              slotNumber: selectedSlot.slotNumber,
              title,
              subtitle,
            });
            // Navigate to the newly created screenshot
            router.replace(`/app/${appId}/set/${setId}/screenshot/${newScreenshotId}`);
          } catch {
            // Error handling silently
          } finally {
            setIsCreating(false);
          }
        }}
      />
    </>
  );
}