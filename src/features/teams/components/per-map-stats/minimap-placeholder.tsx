export function MinimapPlaceholder() {
  return (
    <div className="relative flex h-full flex-col">
      {/* Blank on purpose: heatmap rendering (with site markers) lands
          later. The square box holds the column height so it causes no
          reflow when the heatmap arrives. */}
      <div
        role="img"
        aria-label="Minimap heatmap placeholder"
        className="aspect-square w-full flex-1 rounded-lg border bg-background/70"
      />
    </div>
  )
}
