'use client';

import React, { useState, useEffect } from 'react';
import { GlobalNav } from '@/components/GlobalNav';
import { useIdentity } from '@/hooks/useIdentity';
import { useGuideSeen } from '@/hooks/useGuideSeen';
import { WelcomeOverlay } from '@/components/GuideOverlay';

export function NavWithIdentity() {
  const { identity, clear } = useIdentity();
  const { needsGuide, markSeen } = useGuideSeen();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setShowGuide(needsGuide());
  }, [needsGuide]);

  const dismiss = () => {
    markSeen();
    setShowGuide(false);
  };

  return (
    <>
      <GlobalNav
        identity={identity ? { handle: identity.handle, displayName: identity.displayName, kind: identity.kind } : null}
        onSwitchIdentity={clear}
      />
      {showGuide && (
        <WelcomeOverlay
          identity={identity ? { kind: identity.kind, displayName: identity.displayName, handle: identity.handle } : null}
          onDismiss={dismiss}
        />
      )}
    </>
  );
}
