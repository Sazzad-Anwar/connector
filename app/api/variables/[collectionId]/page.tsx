import React from "react"

import EnvVariables from "@/components/env-variables/page"

export default function page({ params }: { params: { collectionId: string } }) {
  return <EnvVariables />
}
