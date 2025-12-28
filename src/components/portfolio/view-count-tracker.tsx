/**
 * ViewCountTracker Component
 *
 * Tracks project views using sessionStorage to count once per session
 * Increments view count on first visit via API
 */

'use client';

import { useEffect } from 'react';

interface ViewCountTrackerProps {
  projectId: string;
}

export function ViewCountTracker({ projectId }: ViewCountTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      // Check if this project was already viewed in this session
      const storageKey = `project-viewed-${projectId}`;
      const hasViewed = sessionStorage.getItem(storageKey);

      if (hasViewed) {
        return; // Already tracked this session
      }

      try {
        // Increment view count via API
        const response = await fetch(`/api/projects/${projectId}/view`, {
          method: 'POST',
        });

        if (response.ok) {
          // Mark as viewed in this session
          sessionStorage.setItem(storageKey, 'true');
        }
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.error('Failed to track project view:', error);
      }
    };

    trackView();
  }, [projectId]);

  // This component renders nothing
  return null;
}
