// Reads a File into a data URL so it persists in localStorage and renders on
// the storefront without a backend. For production, replace with a Supabase
// Storage upload:
//
//   const { data } = await supabase.storage.from('media').upload(path, file);
//   return supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
//
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const MAX_IMAGE_MB = 3;
export const MAX_VIDEO_MB = 8;

export function sizeMb(file: File) {
  return file.size / (1024 * 1024);
}
