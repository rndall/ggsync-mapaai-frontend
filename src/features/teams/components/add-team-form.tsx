import { useForm } from '@tanstack/react-form'
import { ImagePlus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTeam } from '@/features/teams/hooks/use-create-team'
import type { operations } from '@/types/api'
import {
  getErrorMessage,
  getFieldErrors,
  toFieldErrors,
} from '@/utils/server-errors'

type StoreTeamBody =
  operations['teams.store']['requestBody']['content']['multipart/form-data']

// Mirrors the backend's 5120KB logo limit (`teams.store` in `api.d.ts`).
const MAX_LOGO_BYTES = 5 * 1024 * 1024

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Team name is required.')
    .max(50, 'Team name must be at most 50 characters.'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters.'),
  logo: z
    .instanceof(File, { message: 'Logo must be an image file.' })
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Logo must be an image file.',
    })
    .refine((file) => file.size <= MAX_LOGO_BYTES, {
      message: 'Logo must be under 5MB.',
    })
    .nullable(),
})

type AddTeamFormProps = {
  onSuccess?: () => void
}

export default function AddTeamForm({ onSuccess }: AddTeamFormProps) {
  const { mutate: createTeam, isPending: isSubmitting } = useCreateTeam()
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // A server error stops applying once the user edits that field again.
  const clearServerError = (key: string) => {
    setServerErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      logo: null as File | null,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setServerErrors({})
      setFormError(null)
      // openapi-fetch only sends multipart when the body is a FormData
      // instance; a plain object would be JSON-stringified (a File becomes
      // "{}"), so the logo would never reach the backend.
      const payload = new FormData()
      payload.append('name', value.name.trim())
      if (value.description.trim()) {
        payload.append('description', value.description.trim())
      }
      if (value.logo) {
        payload.append('logo', value.logo)
      }
      createTeam(
        { body: payload as unknown as StoreTeamBody },
        {
          onSuccess: () => {
            form.reset()
            setServerErrors({})
            setFormError(null)
            onSuccess?.()
          },
          onError: (error) => {
            const fieldErrors = getFieldErrors(error)
            setServerErrors(fieldErrors)
            if (Object.keys(fieldErrors).length === 0) {
              setFormError(
                getErrorMessage(
                  error,
                  'Could not create the team. Please try again.',
                ),
              )
            }
          },
        },
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      noValidate
    >
      <FieldGroup>
        <form.Field
          name="logo"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'logo')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <LogoPicker
                  value={field.state.value}
                  onChange={(file) => {
                    field.handleChange(file)
                    clearServerError('logo')
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  inputId={field.name}
                />
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                    className="text-center"
                  />
                )}
              </Field>
            )
          }}
        />
        <form.Field
          name="name"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'name')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Team Name *
                </FieldLabel>
                <Input
                  size="xl"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearServerError('name')
                  }}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                />
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                  />
                )}
              </Field>
            )
          }}
        />
        <form.Field
          name="description"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'description')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Description
                </FieldLabel>
                <Textarea
                  className="px-3 py-2.5"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearServerError('description')
                  }}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  rows={4}
                />
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                  />
                )}
              </Field>
            )
          }}
        />
        {formError && (
          <p role="alert" className="text-xs/relaxed text-destructive">
            {formError}
          </p>
        )}
        <Field orientation="horizontal" className="justify-end">
          <Button
            type="submit"
            className="rounded-none"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Team'}
            {isSubmitting && <Spinner />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

type LogoPickerProps = {
  value: File | null
  onChange: (file: File | null) => void
  onBlur: () => void
  isInvalid: boolean
  inputId: string
}

function LogoPicker({
  value,
  onChange,
  onBlur,
  isInvalid,
  inputId,
}: LogoPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(value)
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [value])

  const openPicker = () => {
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          aria-invalid={isInvalid}
          aria-label={value ? 'Change team logo' : 'Upload team logo'}
          className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-input bg-input/20 transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Team logo preview"
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-8 text-muted-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={openPicker}
          aria-label={value ? 'Change team logo' : 'Add team logo'}
          className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
        onBlur={onBlur}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs/relaxed text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
          Remove logo
        </button>
      )}
    </div>
  )
}
