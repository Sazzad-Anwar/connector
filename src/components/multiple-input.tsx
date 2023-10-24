import { useEffect } from "react";
import useApiStore from "@/store/store";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { ApiType } from "@/types/api";
import { cn, containsDynamicVariable, containsVariable } from "@/lib/utils";

import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useParams } from "react-router-dom";

export type PropsType = {
  propertyName: "params" | "headers" | "body" | "pathVariables";
  form: UseFormReturn<ApiType, any, undefined>;
};

export default function MultipleInput({ form, propertyName }: PropsType) {
  const { env, getEnv } = useApiStore();
  const routeParams = useParams();
  const { fields, insert, append, remove } = useFieldArray({
    control: form.control,
    name: propertyName,
  });
  const folderId = routeParams?.folderId;
  const params = form.watch(propertyName);

  useEffect(() => {
    if (folderId) {
      getEnv(folderId);
    }
  }, [getEnv, folderId]);

  useEffect(() => {
    if (fields.length < 1) {
      append({
        id: uuid(),
        key: "",
        value: "",
        description: "",
      });
    }
  }, [fields, append]);

  const isErrorIndex = (index: number) => {
    const items = params?.filter(
      (item) =>
        item.value !== "" &&
        containsDynamicVariable(item.value) &&
        !containsVariable(item.value, env),
    );

    const indexArr: number[] = [];

    items?.map((item) => {
      indexArr.push(params!.indexOf(item)!);
    });

    if (indexArr.includes(index)) {
      return true;
    } else {
      return false;
    }
  };

  const isCorrectVar = (index: number) => {
    const items = params?.filter(
      (item) =>
        item.value !== "" &&
        containsDynamicVariable(item.value) &&
        containsVariable(item.value, env),
    );

    const indexArr: number[] = [];

    items?.map((item) => {
      indexArr.push(params!.indexOf(item)!);
    });

    if (indexArr.includes(index)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border">
          <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
            Key
          </TableHead>
          <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
            Value
          </TableHead>
          <TableHead
            colSpan={2}
            className="h-[35px] w-[40%] resize-x pl-2 text-accent-foreground"
          >
            Description
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {fields.map((field, index) => (
          <TableRow key={field.id} className="group border">
            <TableCell className="border p-0">
              <input
                type="text"
                {...form.register(`${propertyName}.${index}.key` as const)}
                className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                placeholder="Key"
              />
            </TableCell>
            <TableCell className="border p-0">
              <input
                {...form.register(`${propertyName}.${index}.value` as const)}
                className={cn(
                  "h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none",
                  isErrorIndex(index)
                    ? "text-red-500"
                    : isCorrectVar(index)
                      ? "text-cyan-500"
                      : "text-white",
                )}
                placeholder="Value"
              />
            </TableCell>
            <TableCell className="border border-r-0 p-0">
              <input
                {...form.register(
                  `${propertyName}.${index}.description` as const,
                )}
                className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                placeholder="Description"
              />
            </TableCell>
            <TableCell className="flex h-[30px] w-full items-center justify-end py-1">
              <Button
                onClick={() =>
                  insert(index + 1, {
                    id: uuid(),
                    key: "",
                    value: "",
                    description: "",
                  })
                }
                variant="ghost"
                size="xs"
                type="button"
                className="mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100"
              >
                <Plus size={16} />
              </Button>
              <Button
                onClick={() => remove(index)}
                variant="ghost"
                size="xs"
                type="button"
                className="mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
