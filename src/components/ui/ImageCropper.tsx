import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, Check, RotateCw } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
  cropShape?: 'rect' | 'round'
}

// Utility: create a cropped image blob from crop area
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image()
  image.crossOrigin = 'anonymous'

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/jpeg',
      0.92
    )
  })
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = 'round',
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropAreaChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedBlob)
    } catch (err) {
      console.error('Error cropping image:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,16,35,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      {/* Modal card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0B2440', margin: 0 }}>
            Recortar imagen
          </h3>
          <button
            onClick={onCancel}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8A93A8',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Crop area */}
        <div style={{ position: 'relative', width: '100%', height: 340, background: '#0B2440' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropAreaChange}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: '3px solid rgba(255,255,255,0.8)',
                boxShadow: '0 0 0 9999px rgba(11,16,35,0.6)',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ padding: '16px 20px 20px' }}>
          {/* Zoom slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <ZoomOut size={16} color="#8A93A8" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                appearance: 'none',
                background: `linear-gradient(to right, #2458ED 0%, #2458ED ${((zoom - 1) / 2) * 100}%, #E2E8F0 ${((zoom - 1) / 2) * 100}%, #E2E8F0 100%)`,
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <ZoomIn size={16} color="#8A93A8" />
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotar 90°"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                background: '#FFFFFF',
                color: '#4B5568',
                cursor: 'pointer',
                fontFamily: "\"Instrument Sans\", system-ui, sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={processing}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                borderRadius: 12,
                background: '#2458ED',
                color: '#FFFFFF',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontFamily: "\"Instrument Sans\", system-ui, sans-serif",
                transition: 'all 0.15s',
                opacity: processing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Check size={16} />
              {processing ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
