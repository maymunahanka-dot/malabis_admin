const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || dojxfvsaw
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
const FOLDER        = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || 'img'

console.log('rrrrrrrrrr',CLOUD_NAME, UPLOAD_PRESET, FOLDER);

export async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', FOLDER)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed')
  return data.secure_url
}

export async function uploadMultiple(files) {
  return Promise.all(files.map(uploadToCloudinary))
}
