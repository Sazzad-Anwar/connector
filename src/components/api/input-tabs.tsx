import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { ApiType, ParamsType } from "@/types/api";
import { arrayToObjectConversion } from "@/lib/utils";

import MultipleInput from "../multiple-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { JSONErrorType } from "./api";
import ResultRender from "../result-renderer";

type PropsType = {
  form: UseFormReturn<ApiType, any, undefined>;
  api?: ApiType;
  className?: string;
  height?: number | string;
};

export default function InputTabs({ form, api, height, className }: PropsType) {
  const jsonBodyDivRef = useRef<HTMLDivElement>(null);
  const [jsonBodyData, setJsonBodyData] = useState<any>({});
  const [jsonError, setJsonError] = useState<JSONErrorType>();

  const setJsonBody = (data: string) => {
    try {
      setJsonBodyData(JSON.parse(data));
      const jsonData = JSON.parse(data);
      const jsonArray = [] as ParamsType[];

      Object.keys(jsonData).map((item) => {
        const data = { key: item, value: jsonData[item] as any, id: uuid() };
        jsonArray.push(data);
      });

      form.setValue("body", jsonArray);

      setJsonError({
        isError: false,
        error: "",
      });
    } catch (error: any) {
      setJsonError({
        isError: true,
        error: error.message,
      });
    }
  };

  useEffect(() => {
    if (api?.id) {
      setJsonBodyData(arrayToObjectConversion(api!.body!));
    }
  }, [api]);

  return (
    <div className={className}>
      <Tabs defaultValue="body" className="w-full">
        <TabsList>
          <TabsTrigger value="params">
            Params{" "}
            {api?.params?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers{" "}
            {api?.headers?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}{" "}
          </TabsTrigger>
          <TabsTrigger value="body">
            Body{" "}
            {api?.body?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="params"
          className="animate__animated animate__fadeIn max-h-[calc(100vh-300px)] overflow-auto my-5"
        >
          <MultipleInput propertyName="params" form={form} />
        </TabsContent>
        <TabsContent
          value="headers"
          className="animate__animated animate__fadeIn max-h-[calc(100vh-300px)] overflow-auto"
        >
          <MultipleInput propertyName="headers" form={form} />
        </TabsContent>
        <TabsContent value="body" className="animate__animated animate__fadeIn">
          <Tabs defaultValue="x-www-form-urlencoded" className="w-full">
            <TabsList className="px-.5 h-9">
              <TabsTrigger value="x-www-form-urlencoded" className="h-7">
                x-www-form-urlencoded
              </TabsTrigger>
              <TabsTrigger value="raw" className="h-7">
                Raw JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="raw"
              className="animate__animated animate__fadeIn"
              style={{
                height:
                  (height as number) >= 300
                    ? (height as number) - 300
                    : (height as number),
              }}
            >
              <div className="flex items-center justify-between">
                {jsonError?.isError ? (
                  <div className="h-4 text-xs font-bold text-red-500">
                    {jsonError.error}
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>
              <ResultRender
                ref={jsonBodyDivRef}
                result={jsonBodyData}
                height={
                  (height as number) >= 300
                    ? (height as number) - 250
                    : (height as number)
                }
                readOnly={false}
                setData={setJsonBody}
                className="border-t pt-3"
              />
            </TabsContent>
            <TabsContent
              value="x-www-form-urlencoded"
              className="animate__animated animate__fadeIn relative max-h-[calc(100vh-300px)] overflow-auto"
            >
              <MultipleInput propertyName="body" form={form} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
