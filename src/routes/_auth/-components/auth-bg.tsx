import authBg from '@/assets/images/auth-bg.webp'

export default function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <img
        src={authBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover grayscale"
      />
      <div className="absolute inset-0 bg-[rgba(0,111,167,0.2)]" />
      <div className="absolute inset-0 bg-[linear-gradient(261.62deg,rgba(18,18,18,0)_41.07%,rgba(13,23,34,0.19)_87.66%)]" />
      <div className="absolute inset-0 bg-[#0D1722]/85" />
      <div className="absolute inset-0 bg-[linear-gradient(0.18deg,rgba(18,18,18,0)_4.08%,#0D1722_96.6%)]" />
    </div>
  )
}
