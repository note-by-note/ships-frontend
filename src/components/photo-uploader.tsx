'use client';

// A mentor's photo: choose one, see it cropped, upload it.
//
// The photo is squared and shrunk in the browser (640×640 JPEG), which also
// drops the location and camera data phones attach. The API strips that data
// again anyway. A new photo waits for staff approval before it's public.

import { useEffect, useState, type ChangeEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import type { PhotoState } from '@/lib/types';
import { Avatar } from './avatar';
import { Button } from './ui';

const SIZE = 640;

/** Centre-crop to a square and re-encode as JPEG. */
async function squareJpeg(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('unreadable'));
      element.src = url;
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('unreadable');
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE,
    );
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('unreadable'))), 'image/jpeg', 0.86),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoUploader({
  mentorId,
  name,
  state,
  onChange,
}: {
  mentorId: string;
  name: string;
  state: PhotoState;
  onChange: (next: PhotoState) => void;
}) {
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Show the photo that's waiting, which isn't public yet.
  useEffect(() => {
    if (!state.pendingPhoto) return;
    let url: string | null = null;
    api
      .blob(`/mentors/${mentorId}/pending-photo`)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setPendingSrc(url);
      })
      .catch(() => setPendingSrc(null));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [mentorId, state.pendingPhoto]);

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    setBusy('upload');
    try {
      const jpeg = await squareJpeg(file);
      const body = await api.upload<{ data: PhotoState }>(`/mentors/${mentorId}/photo`, jpeg);
      onChange(body.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'That photo couldn’t be read. Try a JPEG or PNG, or take a screenshot of it and upload that.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm('Remove your photo? Your initials will show instead.')) return;
    setBusy('remove');
    try {
      const body = await api.delete<{ data: PhotoState }>(`/mentors/${mentorId}/photo`);
      setPendingSrc(null);
      onChange(body.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex gap-4">
        <figure className="flex flex-col items-center gap-1.5">
          <Avatar name={name} photoPath={state.photoPath} className="size-24 text-2xl" />
          <figcaption className="text-xs text-ink-faint">{state.photoPath ? 'On your page' : 'Your initials'}</figcaption>
        </figure>
        {state.pendingPhoto ? (
          <figure className="flex flex-col items-center gap-1.5">
            {pendingSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- a private blob URL
              <img src={pendingSrc} alt="Your new photo" className="size-24 rounded-full object-cover opacity-80 ring-2 ring-gold" />
            ) : (
              <span className="size-24 rounded-full bg-paper" />
            )}
            <figcaption className="text-xs font-semibold text-warn">Waiting for approval</figcaption>
          </figure>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm text-ink-soft">
          Optional. A clear, friendly photo of your face, on your own. Staff check every photo before it goes on your
          page. If you&apos;d rather not, your initials show instead.
        </p>
        {state.photoDeclinedReason ? (
          <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            Your last photo wasn&apos;t approved: {state.photoDeclinedReason}
          </p>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
            {busy === 'upload' ? 'Uploading…' : state.photoPath || state.pendingPhoto ? 'Choose a new photo' : 'Choose a photo'}
            <input type="file" accept="image/*" className="sr-only" onChange={choose} disabled={busy !== null} />
          </label>
          {state.photoPath || state.pendingPhoto ? (
            <Button variant="ghost" onClick={remove} disabled={busy !== null}>
              Remove photo
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
