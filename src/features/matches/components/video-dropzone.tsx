import { cn } from 'cn'
import { CloudUpload, FileVideo, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { isMp4File } from '@/utils/video'

type VideoDropzoneProps = {
  value: File | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  isInvalid?: boolean
  inputId?: string
  errorId?: string
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unitIndex]}`
}

export default function VideoDropzone({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  inputId,
  errorId,
}: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const openPicker = () => {
    inputRef.current?.click()
  }

  // Immediate type feedback stays local so a rejected drop never clears a
  // previously selected file; the required check lives in the form schema.
  const localErrorId = errorId ? `${errorId}-local` : undefined
  const describedBy = localError
    ? localErrorId
    : isInvalid && errorId
      ? errorId
      : undefined

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    const file = files.item(0)
    if (!file) return
    if (!isMp4File(file)) {
      setLocalError('Only MP4 files are supported')
      return
    }
    setLocalError(null)
    onChange(file)
  }

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation()
    setLocalError(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div
        onClick={openPicker}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragCounter.current += 1
          setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragCounter.current -= 1
          if (dragCounter.current <= 0) {
            dragCounter.current = 0
            setIsDragging(false)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragCounter.current = 0
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onDragEnd={() => {
          dragCounter.current = 0
          setIsDragging(false)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-input/20 px-6 py-10 text-center transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring/30',
          isDragging ? 'border-primary bg-primary/5' : 'border-input',
          isInvalid && !isDragging && 'border-destructive/50',
        )}
      >
        {value ? (
          <>
            <FileVideo className="size-8 text-muted" aria-hidden />
            <p className="w-full truncate text-sm font-bold text-muted-foreground">
              {value.name}
            </p>
            <p className="text-sm text-muted">{formatFileSize(value.size)}</p>
            <Button
              className="font-sans font-bold"
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X data-icon="inline-start" /> Remove
            </Button>
            <p className="text-xs text-muted">Click to replace</p>
          </>
        ) : (
          <>
            <CloudUpload className="size-8 text-muted" aria-hidden />
            <p className="text-sm font-bold text-muted-foreground">
              Choose a file or drag & drop
            </p>
            <p className="text-muted">MP4 format</p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="mt-2 rounded-none bg-[#B5C6DD]! px-4 font-sans font-bold text-[#1C304C]"
              onClick={(e) => {
                e.stopPropagation()
                openPicker()
              }}
            >
              Browse File
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".mp4,video/mp4"
          className="sr-only"
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          onBlur={onBlur}
        />
      </div>
      {localError && (
        <p
          id={localErrorId}
          className="mt-1 text-xs/relaxed text-destructive"
          role="alert"
        >
          {localError}
        </p>
      )}
    </div>
  )
}
