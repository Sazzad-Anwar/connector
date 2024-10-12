import { v4 as uuid } from 'uuid'
import { Button, buttonVariants } from '../components/ui/button'
import useImportJSON from '../hooks/useImportJSON'
import useSidePanelToggleStore from '../store/sidePanelToggle'

export default function page() {
  const { InputFile } = useImportJSON()
  const { isCreatingFolder, setIsCreatingFolder } = useSidePanelToggleStore()

  return (
    <section className="flex h-screen flex-col items-center justify-center text-center relative">
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
          disabled={isCreatingFolder}
          variant="secondary"
          className="bg-secondary/50 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCreatingFolder(true)}
        >
          Create Collection
        </Button>
      </div>
    </section>
  )
}
