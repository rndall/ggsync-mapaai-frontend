import dashboardTexture from '@/assets/images/dashboard-texture.jpg'

export default function DashboardTexture() {
  return (
    <img
      src={dashboardTexture}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full max-w-[300%] object-cover opacity-17 mix-blend-overlay brightness-30"
    />
  )
}
