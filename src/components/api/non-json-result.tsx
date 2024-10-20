import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

type Props = {
  url: string
  headers: any
  nonJsonResult: any
}

export default function NonJSONResult({ url, headers, nonJsonResult }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(nonJsonResult !== '')
  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Content Preview {headers?.['content-type']}</DialogTitle>
        </DialogHeader>
        {headers?.['content-type']?.includes('image') ? (
          <img
            src={url}
            loading="lazy"
            alt="Content preview"
            className="w-auto mx-auto h-96 object-cover object-center"
          />
        ) : headers?.['content-type']?.includes('video') ? (
          <video
            src={url}
            controls
            className="w-full h-auto"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            srcDoc={nonJsonResult}
            className="w-full h-[60vh]"
            title="Content preview"
            security="same-origin"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
