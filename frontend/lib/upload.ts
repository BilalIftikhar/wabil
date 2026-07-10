import { supabase, supabaseEnabled } from "@/lib/supabase";

// Uploads media and returns a URL to render on the storefront.
// - Supabase configured → uploads to the public `media` bucket, returns a CDN
//   URL that every visitor can load (permanent, shared).
// - Otherwise → falls back to a base64 data URL kept in the browser (demo mode).
export const MAX_IMAGE_MB = 5;
export const MAX_VIDEO_MB = 50; // Storage handles large files; base64 fallback is smaller

export function sizeMb(file: File) {
  return file.size / (1024 * 1024);
}

function safeName(file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function uploadMedia(file: File, folder = "products"): Promise<string> {
  if (supabaseEnabled && supabase) {
    const path = `${folder}/${safeName(file)}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  return fileToDataUrl(file);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
