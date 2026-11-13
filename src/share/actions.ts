export const X_INTENT_BASE = "https://twitter.com/intent/tweet";

/** The share text already carries the URL, so only `text` is sent. */
export function xIntentUrl(text: string): string {
  return `${X_INTENT_BASE}?text=${encodeURIComponent(text)}`;
}

export function openXIntent(text: string): void {
  window.open(xIntentUrl(text), "_blank", "noopener,noreferrer");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context: try the legacy path below.
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export type NativeShareResult = "shared-with-file" | "shared-text" | "cancelled" | "unsupported" | "failed";

/** Shares the image when the platform accepts files, else just the text. */
export async function nativeShare({ text, file }: { text: string; file?: File }): Promise<NativeShareResult> {
  if (!canNativeShare()) return "unsupported";
  const withFile: ShareData | null = file ? { text, files: [file] } : null;
  const fileOk = withFile !== null && typeof navigator.canShare === "function" && navigator.canShare(withFile);
  try {
    if (fileOk && withFile) {
      await navigator.share(withFile);
      return "shared-with-file";
    }
    await navigator.share({ text });
    return "shared-text";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    return "failed";
  }
}
