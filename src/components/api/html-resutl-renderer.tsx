import React from 'react'

interface HtmlRendererProps {
  url: string
  height: number
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ url, height }) => {
  return (
    <iframe
      className="border-t-2"
      src={url}
      style={{ maxHeight: height, height, width: '100%', overflow: 'auto' }}
    />
  )
}

export default HtmlRenderer
