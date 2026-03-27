'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface DogPhotoUploadProps {
  currentUrl: string | null
  dogName: string
  onUpload: (url: string) => void
}

export function DogPhotoUpload({ currentUrl, dogName, onUpload }: DogPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      formData.append('folder', 'dogs')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        onUpload(data.secure_url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative w-[60px] h-[60px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
      style={{ backgroundColor: '#e8dece' }}
      disabled={uploading}
      title="Changer la photo"
    >
      {currentUrl ? (
        <Image src={currentUrl} alt={dogName} fill className="object-cover" sizes="60px" />
      ) : (
        <span>{uploading ? '⏳' : '🐶'}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </button>
  )
}
