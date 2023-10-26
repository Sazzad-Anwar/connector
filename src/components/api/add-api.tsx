import { useEffect, useState } from "react";
import useApiStore from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsRight, Info } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { ApiSchema, ApiType, FolderType } from "@/types/api";
import {
  cn,
  containsDynamicVariable,
  containsVariable,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  isEmpty,
} from "@/lib/utils";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import InputTabs from "./input-tabs";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../breadcrumb";

export default function AddApi() {
  const navigate = useNavigate();
  const params = useParams();
  const folderId = params.folderId as string;
  const { collections, createApi } = useApiStore();
  const form = useForm<ApiType>({
    mode: "onChange",
    resolver: zodResolver(ApiSchema),
    defaultValues: {
      name: "New Api",
      method: "GET",
    },
  });
  const [isUrlError, setIsUrlError] = useState<boolean>(false);
  const url = form.watch("url");
  const rootParentId = getRootParentIdForNthChildren(collections, folderId);
  const rootParent = collections.find(
    (item: FolderType) => item.id === rootParentId,
  );

  const onSubmit: SubmitHandler<ApiType> = (data) => {
    data.id = uuid();
    data.params = isEmpty(data.params!) ? [] : data.params;
    data.headers = isEmpty(data.headers!) ? [] : data.headers;
    data.body = isEmpty(data.body!) ? [] : data.body;

    createApi(data, folderId);
    toast({
      variant: "success",
      title: "Api is created",
    });
    navigate(`/api/${folderId}/${data.id}`);
  };

  useEffect(() => {
    form.setValue("id", "");
    form.setValue("name", "");
    form.setValue("method", "GET");
    form.setValue("url", "");
    form.setValue("params", [
      { id: uuid(), key: "", value: "", description: "" },
    ]);
    form.setValue("headers", [
      { id: uuid(), key: "", value: "", description: "" },
    ]);
    form.setValue("body", [
      { id: uuid(), key: "", value: "", description: "" },
    ]);
  }, [form]);

  useEffect(() => {
    if (
      containsDynamicVariable(url) &&
      !containsVariable(url, rootParent?.env ?? [])
    ) {
      setIsUrlError(true);
    } else {
      setIsUrlError(false);
    }
  }, [rootParent, url]);

  const setBorderColor = (isError: boolean) =>
    isError ? "border-destructive" : "";

  return (
    <Form {...form}>
      <form className="m-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <Breadcrumbs
                breadcrumbs={getBreadcrumbsForNthChildren(
                  collections,
                  folderId,
                )}
              />
              <ChevronsRight size={13} className="mx-2" />
              <FormControl>
                <Input
                  placeholder="Api Name"
                  {...field}
                  value={field.value ?? ""}
                  className={setBorderColor(!!form.formState.errors.name)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="mt-4 flex w-full items-center">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="mr-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className={
                        (field.value === "GET"
                          ? "text-green-500"
                          : field.value === "POST"
                            ? "text-yellow-500"
                            : field.value === "PUT"
                              ? "text-blue-500"
                              : field.value === "PATCH"
                                ? "text-purple-500"
                                : field.value === "DELETE"
                                  ? "text-destructive"
                                  : "text-foreground") +
                        " font-bold w-24 " +
                        setBorderColor(!!form.formState.errors.method)
                      }
                    >
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => (
                      <SelectItem
                        className={
                          (item === "GET"
                            ? "text-green-500"
                            : item === "POST"
                              ? "text-yellow-500"
                              : item === "PUT"
                                ? "text-blue-500"
                                : item === "PATCH"
                                  ? "text-purple-500"
                                  : "text-destructive") + " font-bold"
                        }
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Input
                    placeholder="Url"
                    {...field}
                    size={200}
                    value={field.value ?? ""}
                    className={cn(
                      isUrlError ? "text-red-500" : "",
                      setBorderColor(isUrlError),
                    )}
                  />
                </FormControl>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {isUrlError && (
                        <Info className="mb-2 ml-2 text-destructive" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>It is not a valid variable</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormItem>
            )}
          />
        </div>
        <InputTabs
          className="pt-5 h-auto max-h-[calc(100vh-200px)]"
          form={form}
        />
        <div className="flex mt-5 justify-end">
          <Button disabled={isUrlError} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
