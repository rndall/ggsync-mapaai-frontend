import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import type { NormalizedHeatPoint } from '@/features/matches/analysis-heat'
import { containPoint } from '@/features/matches/analysis-heat'
import type { MapCrop } from '@/features/matches/analysis-types'

type MatchHeatmapProps = {
  // Maps API image URL for the match's map (`match.map.image_url`), used as
  // the heat canvas base. Null renders the dark box with heat only.
  baseImageUrl: string | null
  mapCrop: MapCrop
  // Already normalized (x / crop.width, y / crop.height) and filtered to the
  // active team lens, the selected side, ok rounds, and the round window.
  // Player heat is player-position density only; Utility reuses this module
  // row-driven with the selected utility's points.
  points: Array<NormalizedHeatPoint>
  // Ok rounds where the lens team played the selected side. Zero means the
  // combination was never played and the box shows the explicit empty state.
  matchedRounds: number
  failedRounds: number
  lowConfidence: boolean
  // Labels for the empty-state copy.
  teamLabel: string
  sideLabel: string
  // Overrides the Player copy (e.g. the selected utility name) for the
  // aria label and the empty state. Defaults to Player.
  heatLabel?: string
}

// Player heat over the minimap base: base image layer plus canvas density
// overlay in the same square box as the old placeholder, so arrival causes
// no reflow. The Utility tab reuses this module row-driven with the selected
// utility name as the label.
export function MatchHeatmap({
  baseImageUrl,
  mapCrop,
  points,
  matchedRounds,
  failedRounds,
  lowConfidence,
  teamLabel,
  sideLabel,
  heatLabel: heatLabelProp,
}: MatchHeatmapProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Natural size of the Maps API base once loaded. Until then (or with no
  // base URL) points map to the full box; afterwards they map into the
  // aspect-preserved image rect via `containPoint`.
  const [baseSize, setBaseSize] = useState<{
    width: number
    height: number
  } | null>(null)
  const isEmpty = points.length === 0
  const heatLabel = heatLabelProp ?? 'Player'

  // A new base URL invalidates the old natural size until it loads, so heat
  // never maps against a stale aspect in between.
  useEffect(() => {
    setBaseSize(null)
  }, [baseImageUrl])

  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!box || !canvas) return

    const render = () => {
      const rect = box.getBoundingClientRect()
      // Cap DPR so large displays do not blow up the per-pixel ramp pass.
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      if (points.length === 0) return

      // Intensity layer: white radial splats on black, additive.
      const layer = document.createElement('canvas')
      layer.width = width
      layer.height = height
      const layerCtx = layer.getContext('2d')
      if (!layerCtx) return
      layerCtx.fillStyle = '#000'
      layerCtx.fillRect(0, 0, width, height)
      layerCtx.globalCompositeOperation = 'lighter'
      const radius = Math.max(16 * dpr, Math.min(width, height) * 0.085)
      for (const point of points) {
        // Crop-normalized points translate into the aspect-preserved image
        // rect (x over crop width, y over crop height, scaled into the
        // displayed base), so the base keeps its ratio and heat lands on it.
        const { x: cx, y: cy } = containPoint(
          point.nx,
          point.ny,
          width,
          height,
          baseSize?.width ?? null,
          baseSize?.height ?? null,
        )
        const gradient = layerCtx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          radius,
        )
        gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)')
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        layerCtx.fillStyle = gradient
        layerCtx.beginPath()
        layerCtx.arc(cx, cy, radius, 0, Math.PI * 2)
        layerCtx.fill()
      }

      // Map intensity through the reference blue-green-yellow-red ramp.
      const intensity = layerCtx.getImageData(0, 0, width, height)
      const output = ctx.createImageData(width, height)
      for (let i = 0; i < intensity.data.length; i += 4) {
        const t = (intensity.data[i] ?? 0) / 255
        if (t <= 0.02) continue
        const [r, g, b] = heatRamp(t)
        output.data[i] = r
        output.data[i + 1] = g
        output.data[i + 2] = b
        output.data[i + 3] = Math.round(Math.min(1, t * 1.15) * 215)
      }
      ctx.putImageData(output, 0, 0)
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(box)
    return () => observer.disconnect()
  }, [points, baseSize])

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Same square box as the old placeholder: no layout shift when heat
          arrives. The base keeps its aspect ratio (contain); normalized
          points translate from the analysis crop size into the displayed
          image rect, so heat lands on the undistorted base. */}
      <div
        role="img"
        aria-label={
          isEmpty
            ? `No ${heatLabel.toLowerCase()} heat for ${teamLabel} on ${sideLabel}`
            : `${heatLabel} density heatmap`
        }
        className="relative aspect-square w-full flex-1 overflow-hidden rounded-lg border bg-background/70"
      >
        {/* Padded gutter around the map: the image and the canvas share the
            inner coordinate space, so heat stays aligned with the base. */}
        <div className="absolute inset-0 p-4">
          <div ref={boxRef} className="relative h-full w-full">
            {baseImageUrl && (
              <img
                key={baseImageUrl}
                src={baseImageUrl}
                alt=""
                aria-hidden
                draggable={false}
                onLoad={handleBaseLoad(mapCrop, setBaseSize)}
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
            <canvas
              ref={canvasRef}
              aria-hidden
              className="absolute inset-0 h-full w-full"
            />
            {isEmpty && (
              <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {matchedRounds === 0
                  ? `${teamLabel} did not play ${sideLabel} in any tracked round.`
                  : `No ${heatLabel.toLowerCase()} points for ${teamLabel} on ${sideLabel} in this window.`}
              </p>
            )}
          </div>
        </div>
      </div>
      {(failedRounds > 0 || lowConfidence) && (
        <div className="flex flex-wrap items-center gap-2">
          {failedRounds > 0 && (
            <p className="text-xs text-muted-foreground">
              {failedRounds} {failedRounds === 1 ? 'round' : 'rounds'} excluded
              — analysis failed.
            </p>
          )}
          {lowConfidence && (
            <Badge variant="secondary" className="text-xs">
              Low confidence
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

type HeatStop = { t: number; color: [number, number, number] }

// Reference ramp: blue through green and yellow to red.
const HEAT_STOPS: Array<HeatStop> = [
  { t: 0, color: [37, 99, 235] },
  { t: 0.35, color: [34, 197, 94] },
  { t: 0.65, color: [250, 204, 21] },
  { t: 1, color: [239, 68, 68] },
]

function heatRamp(t: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t))
  for (let i = 1; i < HEAT_STOPS.length; i += 1) {
    const prev = HEAT_STOPS[i - 1]
    const next = HEAT_STOPS[i]
    if (!prev || !next) continue
    if (clamped <= next.t) {
      const span = next.t - prev.t || 1
      const mix = (clamped - prev.t) / span
      return [
        Math.round(prev.color[0] + (next.color[0] - prev.color[0]) * mix),
        Math.round(prev.color[1] + (next.color[1] - prev.color[1]) * mix),
        Math.round(prev.color[2] + (next.color[2] - prev.color[2]) * mix),
      ]
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1]?.color ?? [239, 68, 68]
}

// Translate a crop-normalized point (x over crop width, y over crop height)
// into the aspect-preserved base image rect — see `containPoint` in
// `./analysis-heat` for the mapping.

// Base load handler: records the natural size so heat maps into the
// aspect-preserved rect, and (dev only) warns when the analysis crop frame
// drifts past ~5% aspect delta from the base — the observed Tunisia delta is
// ~1.6% in height, absorbed by the translation with no visible distortion.
function handleBaseLoad(
  mapCrop: MapCrop,
  onSize: (size: { width: number; height: number }) => void,
) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      onSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    if (!import.meta.env.DEV) return
    if (
      !img.naturalWidth ||
      !img.naturalHeight ||
      !mapCrop.width ||
      !mapCrop.height
    ) {
      return
    }
    const baseAspect = img.naturalWidth / img.naturalHeight
    const cropAspect = mapCrop.width / mapCrop.height
    const delta = Math.abs(cropAspect - baseAspect) / baseAspect
    if (delta > 0.05) {
      console.warn(
        `[heatmap] map crop aspect differs from the base image by ${(delta * 100).toFixed(1)}% — check heat alignment.`,
      )
    }
  }
}
