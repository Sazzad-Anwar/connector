import React, { useEffect, useState } from "react";
import useApiStore from "@/store/store";
import { v4 as uuid } from "uuid";

import { FolderType } from "@/types/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export type InputFileType = {
  children: React.ReactNode;
  className?: string;
  collectionId?: string;
  variant?: "ghost" | "secondary" | "link" | "outline" | "success";
  size?: "lg" | "sm" | "xs" | "icon";
};

export default function useImportJSON() {
  const { createFolder } = useApiStore();

  const readJsonFile = (file: Blob) =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        if (event.target) {
          resolve(JSON.parse(event.target.result as string));
        }
      };

      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });

  const onFileChange = async (e: any, id?: string) => {
    if (e.target?.files) {
      const parsedData = (await readJsonFile(e.target.files[0])) as FolderType;
      parsedData.id = uuid();
      id ? createFolder(parsedData, id) : createFolder(parsedData);
      toast({
        variant: "success",
        title: "Imported Successfully",
      });
    }
  };

  const InputFile = ({
    children,
    className,
    collectionId,
    variant,
    size,
  }: InputFileType) => {
    const [id, setId] = useState<string>(collectionId ?? "");

    useEffect(() => {
      if (id !== "undefined") {
        setId(collectionId!);
      }
    }, [collectionId, id]);

    return (
      <label
        className={cn(
          buttonVariants({
            variant: variant ?? "default",
            size: size ?? "default",
          }),
          "cursor-pointer px-2 py-1",
          className,
        )}
        htmlFor="input"
      >
        <input
          id="input"
          className="hidden"
          type="file"
          accept="application/JSON"
          onChange={(e) =>
            collectionId ? onFileChange(e, collectionId) : onFileChange(e)
          }
        />

        {children}
      </label>
    );
  };

  return { onFileChange, InputFile };
}
