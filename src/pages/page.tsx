import { v4 as uuid } from 'uuid'
import SideNavToggler from '../components/nav/sidenav-toggler'
import { Button, buttonVariants } from '../components/ui/button'
import useImportJSON from '../hooks/useImportJSON'
import useCreatingFolderStore from '../store/createFolder'

export default function page() {
  const { InputFile } = useImportJSON()
  const { isCreatingCollection, setIsCreatingCollection } =
    useCreatingFolderStore()

  return (
    <section className="flex h-screen flex-col items-center justify-center text-center relative">
      <SideNavToggler className="absolute top-3 left-3" />
      <div className="flex justify-center items-center h-14 w-14 rounded-full border bg-secondary p-2">
        <i className="bi bi-plugin text-4xl " />
      </div>
      <h1 className="text-2xl mt-3">Welcome to Connector</h1>
      <div className="flex items-center gap-1 mt-3">
        <InputFile
          id={uuid()}
          importOn="root"
          variant="outline"
          size="xs"
          className={buttonVariants({
            variant: 'secondary',
            className:
              'w-auto bg-secondary/50 text-muted-foreground hover:text-foreground',
          })}
        >
          Import Collection
        </InputFile>
        <Button
          disabled={isCreatingCollection}
          variant="outline"
          className="bg-secondary/50 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsCreatingCollection(true)
          }}
        >
          Create Collection
        </Button>
      </div>
    </section>
  )
}
