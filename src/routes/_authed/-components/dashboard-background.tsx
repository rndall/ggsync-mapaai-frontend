import dashboardBg from '@/assets/images/dashboard-bg.png'

export default function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-180 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background" />
      <img
        src={dashboardBg}
        alt=""
        className="absolute h-full w-full object-cover object-left opacity-90 mix-blend-color-dodge brightness-75 contrast-105 saturate-85"
      />
      <div className="absolute inset-0 bg-[rgba(21,34,54,0.47)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180.36deg,rgba(18,18,18,0)_45%,#0D1722_80%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(261.62deg,rgba(18,18,18,0)_40%,#0D1722_85%)]" />
    </div>
  )
}
