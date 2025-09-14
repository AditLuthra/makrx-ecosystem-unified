export async function uploadProfileImage(
  _file: File,
  onProgress?: (percent: number) => void,
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Simulate upload
  onProgress?.(50);
  await new Promise((r) => setTimeout(r, 200));
  onProgress?.(100);
  return { success: true, url: '/placeholder.svg' };
}
