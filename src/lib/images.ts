// Getting images ready to upload, in the browser. Drawing an image onto a
// canvas and saving that as a JPEG shrinks it and also drops the location and
// camera data phones attach. The API strips that data again anyway.

/** Open an image file, or fail if the browser can't read it. */
export async function readImage(file: Blob): Promise<{ image: HTMLImageElement; done: () => void }> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('unreadable'));
      element.src = url;
    });
    return { image, done: () => URL.revokeObjectURL(url) };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.86): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('unreadable'))), 'image/jpeg', quality),
  );
}

/** Shrink an image to fit within `maxSide` pixels and save it as a JPEG, keeping its shape. */
export async function fittedJpeg(file: Blob, maxSide = 1600): Promise<Blob> {
  const { image, done } = await readImage(file);
  try {
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('unreadable');
    // JPEGs can't be see-through, so a transparent screenshot gets a white background.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await canvasToJpeg(canvas);
  } finally {
    done();
  }
}
