import { cn } from '@/lib/utils'

export default function Loading({
  className,
  height,
  name = 'Loading',
}: {
  className?: string
  height?: number
  name?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-[450px] items-center justify-center',
        className,
      )}
      style={{
        height: className?.includes('h-screen') ? '100vh' : height ?? 500,
      }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* <LoaderSpinner size={25} className="animate-spin" /> */}
        <i className="bi bi-plugin text-2xl animate-pulse" />
        <span className="flex animate-pulse items-center text-base">
          {name}
        </span>
      </div>
    </div>
  )
}
