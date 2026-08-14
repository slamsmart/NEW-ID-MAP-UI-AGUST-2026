const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export const isCloudinaryConfigured = () =>
  !!CLOUD_NAME && CLOUD_NAME !== 'your-cloud-name' && !!UPLOAD_PRESET;

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Append Cloudinary on-the-fly transformations to a stored URL.
 * Non-Cloudinary URLs (blob:, data:, CDN lain) dikembalikan apa adanya.
 *
 * @example getCloudinaryUrl(url, 'w_400,c_fill,q_auto,f_auto')
 */
export function getCloudinaryUrl(
  url: string | null | undefined,
  transform = 'w_800,c_limit,q_auto,f_auto',
): string | undefined {
  if (!url) return undefined;
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace(/\/upload\//, `/upload/${transform}/`);
}

/**
 * Kompres gambar sebelum upload: maks 1600px sisi terpanjang, JPEG quality 0.82.
 * Kembalikan file asli jika canvas tidak tersedia atau hasilnya lebih besar.
 */
async function compressForUpload(file: File): Promise<File> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.82,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/**
 * Upload satu file gambar ke Cloudinary (unsigned upload).
 * Tidak butuh backend — upload langsung dari browser.
 * File dikompres ke maks 1600px sebelum dikirim untuk menghemat bandwidth.
 */
export async function uploadPhoto(
  file: File,
  folder = 'idmap/surveys',
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di .env');
  }

  const compressed = await compressForUpload(file);

  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Upload Cloudinary gagal');
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  };
}

/**
 * Ubah file gambar menjadi base64 data URL untuk preview lokal
 * saat offline (disimpan sementara, upload saat online kembali).
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const maxSide = 512;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context tidak tersedia');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
