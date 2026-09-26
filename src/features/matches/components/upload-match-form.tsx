import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import z from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { useCreateMatchDirect } from '@/features/matches/hooks/use-create-match-direct'
import { parseMatchParams } from '@/features/matches/utils/match-submit'
import { teamQueries } from '@/features/teams/queries'
import type { operations } from '@/types/api'
import {
  getErrorMessage,
  getFieldErrors,
  toFieldErrors,
} from '@/utils/server-errors'
import { isMp4File } from '@/utils/video'

import MapSearch from './map-search'
import TeamColorField from './team-color-field'
import type { TeamOption } from './team-combobox'
import VideoDropzone from './video-dropzone'

// Stored as "yyyy-MM-dd" and parsed as a local date so the selected day never
// shifts across timezones.
function parseDateValue(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return undefined
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  return Number.isNaN(date.getTime()) ? undefined : date
}

const formSchema = z
  .object({
    matchName: z.string().min(1, 'Match name is required'),
    matchDate: z.string().min(1, 'Match date is required'),
    map: z.string().min(1, 'Map is required'),
    redTeamId: z.string().min(1, 'Red team is required'),
    blueTeamId: z.string().min(1, 'Blue team is required'),
    videoFile: z
      .instanceof(File, { message: 'Match video is required' })
      .refine((file) => isMp4File(file), {
        message: 'Only MP4 files are supported',
      })
      .nullable()
      .refine((file): file is File => file instanceof File, {
        message: 'Match video is required',
      }),
  })
  .refine(
    (data) =>
      !data.redTeamId || !data.blueTeamId || data.redTeamId !== data.blueTeamId,
    {
      message: 'Teams must be different',
      path: ['blueTeamId'],
    },
  )

type UploadMatchFormProps = {
  teamId?: string
  onSuccess?: () => void
}

type StoreDirectMatchBody =
  operations['match.storeDirect']['requestBody']['content']['multipart/form-data']

export default function UploadMatchForm({
  teamId,
  onSuccess,
}: UploadMatchFormProps) {
  const { mutateAsync: createMatchDirect, isPending: isSubmitting } =
    useCreateMatchDirect()
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Team selection options for the color pickers. The global endpoint
  // returns the full team list with no identifier required.
  const optionsQuery = useQuery(teamQueries.options())

  const teams: TeamOption[] = optionsQuery.data?.data ?? []
  const teamName = teamId
    ? teams.find((team) => String(team.id) === teamId)?.name
    : undefined

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
      matchName: '',
      matchDate: '',
      map: '',
      redTeamId: teamId ?? '',
      blueTeamId: '',
      videoFile: null as File | null,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors({})
      setFormError(null)

      const parsed = parseMatchParams(value, teamId)
      if (!parsed.ok) {
        setFormError(parsed.message)
        return
      }
      const { params } = parsed

      // openapi-fetch only sends multipart when the body is a FormData
      // instance; a plain object would be JSON-stringified (a File becomes
      // "{}"), so the video would never reach the backend.
      const payload = new FormData()
      payload.append('name', params.matchName)
      payload.append('played_at', params.playedAt)
      payload.append('team_color', params.teamColor)
      payload.append('map_id', String(params.mapId))
      payload.append('opponent_team_id', String(params.opponentTeamId))
      payload.append('video', params.videoFile, params.videoFile.name)

      try {
        // Text fields + video go in one request, so the drawer stays open
        // with the button spinner until the upload resolves.
        await toast.promise(
          createMatchDirect({
            params: { path: { team: params.uploaderId } },
            body: payload as unknown as StoreDirectMatchBody,
          }),
          {
            loading: {
              title: 'Uploading match…',
              timeout: 0,
            },
            success: {
              type: 'success',
              title: 'Match uploaded',
              description: 'Processing started.',
              timeout: 5000,
            },
            error: (uploadError: unknown) => ({
              type: 'error',
              title: 'Upload failed',
              description: getErrorMessage(
                uploadError,
                'Could not upload the match. Please try again.',
              ),
              timeout: 5000,
            }),
          },
        )

        form.reset()
        setServerErrors({})
        setFormError(null)
        onSuccess?.()
      } catch (error) {
        const fieldErrors = getFieldErrors(error)
        setServerErrors(fieldErrors)
        if (Object.keys(fieldErrors).length === 0) {
          setFormError(
            getErrorMessage(
              error,
              'Could not upload the match. Please try again.',
            ),
          )
        }
      }
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
          name="matchName"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'name')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Match Name
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
          name="matchDate"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'played_at')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Match Date
                </FieldLabel>
                <ButtonGroup className="w-full">
                  <DatePicker
                    size="xl"
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="flex-1"
                    value={parseDateValue(field.state.value)}
                    onChange={(date) => {
                      field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')
                      clearServerError('played_at')
                    }}
                    onBlur={field.handleBlur}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    onClick={() => {
                      field.handleChange(format(new Date(), 'yyyy-MM-dd'))
                      field.handleBlur()
                      clearServerError('played_at')
                    }}
                  >
                    Today
                  </Button>
                </ButtonGroup>
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
          name="map"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'map_id')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Select Map
                </FieldLabel>
                <MapSearch
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    clearServerError('map_id')
                  }}
                  onOpenChange={(open) => {
                    if (!open) {
                      field.handleBlur()
                    }
                  }}
                  size="xl"
                  aria-invalid={isInvalid}
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
          name="redTeamId"
          children={(redField) => (
            <form.Field
              name="blueTeamId"
              children={(blueField) => {
                const redServerErrors = toFieldErrors(
                  serverErrors,
                  'opponent_team_id',
                )
                const isRedInvalid =
                  (redField.state.meta.isTouched &&
                    !redField.state.meta.isValid) ||
                  redServerErrors.length > 0
                const isBlueInvalid =
                  (blueField.state.meta.isTouched &&
                    !blueField.state.meta.isValid) ||
                  redServerErrors.length > 0
                return (
                  <Field data-invalid={isRedInvalid || isBlueInvalid}>
                    <FieldLabel className="text-sm text-muted">
                      Assign Team Color
                    </FieldLabel>
                    <TeamColorField
                      teamId={teamId}
                      teams={teams}
                      teamName={teamName}
                      redTeamId={redField.state.value}
                      blueTeamId={blueField.state.value}
                      onRedTeamChange={(value) => {
                        redField.handleChange(value)
                        clearServerError('opponent_team_id')
                      }}
                      onBlueTeamChange={(value) => {
                        blueField.handleChange(value)
                        clearServerError('opponent_team_id')
                      }}
                      onRedBlur={redField.handleBlur}
                      onBlueBlur={blueField.handleBlur}
                      redInvalid={isRedInvalid}
                      blueInvalid={isBlueInvalid}
                      redInputId={redField.name}
                      blueInputId={blueField.name}
                    />
                    {isRedInvalid && (
                      <FieldError
                        errors={[
                          ...redField.state.meta.errors,
                          ...redServerErrors,
                        ]}
                      />
                    )}
                    {isBlueInvalid && (
                      <FieldError
                        errors={[
                          ...blueField.state.meta.errors,
                          ...redServerErrors,
                        ]}
                      />
                    )}
                  </Field>
                )
              }}
            />
          )}
        />
        <form.Field
          name="videoFile"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'video')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Upload Match
                </FieldLabel>
                <VideoDropzone
                  value={field.state.value}
                  onChange={(file) => {
                    field.handleChange(file)
                    clearServerError('video')
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  inputId={field.name}
                  errorId={`${field.name}-error`}
                />
                {isInvalid && (
                  <FieldError
                    id={`${field.name}-error`}
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
            {isSubmitting ? 'Uploading match...' : 'Start Analyzing'}
            {isSubmitting && <Spinner />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
