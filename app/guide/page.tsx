'use client';

import { WelcomeOverlay } from '@/components/GuideOverlay';
import { useGuideSteps } from '@/hooks/useGuideSteps';

export default function GuidePage() {
  const { resetAll } = useGuideSteps();

  return (
    <WelcomeOverlay
      identity={null}
      onDismiss={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
    />
  );
}
