'use client';

import { useEffect, useRef } from 'react';
import type { Evidence } from '@/data/types';

/** Full source record for the evidence item currently on screen. */
export function SourceSheet({ item, onClose }: { item: Evidence; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <div className="scrim">
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Source record">
        <div className="sheet-handle" />
        <div className="eyebrow">SOURCE VERIFICATION</div>
        <h2>Source record</h2>
        <div className="sheet-source">{item.source}</div>
        <p>{item.detail}</p>
        <div className="sheet-warning">◷ Timer disabled</div>
        <button className="btn" ref={closeRef} onClick={onClose}>
          BACK TO EVIDENCE
        </button>
      </section>
    </div>
  );
}
