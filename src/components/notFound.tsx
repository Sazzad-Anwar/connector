import { TbError404 } from 'react-icons/tb'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-xl">
      <img
        src="/not-found.svg"
        className="ml-10"
        height={100}
        width={100}
      />
      <span className="flex items-center justify-center">
        <TbError404
          size={35}
          className="mr-2"
        />{' '}
        | Not found
      </span>
    </div>
  )
}
