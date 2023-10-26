import { useEffect, useRef, useState } from "react";
import useApiStore from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import copy from "copy-to-clipboard";
import { ChevronsRight, Clipboard } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { ApiSchema, ApiType } from "@/types/api";
import {
  arrayToObjectConversion,
  containsDynamicVariable,
  containsVariable,
  extractVariable,
  getBreadcrumbsForNthChildren,
  getQueryString,
  isEmpty,
  replaceVariables,
} from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import ApiResult from "./api-result";
import InputTabs from "./input-tabs";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "../notFound";
import Loading from "../loading";
import SidenavToggler from "../nav/sidenav-toggler";
import Breadcrumbs from "../breadcrumb";
import SplitPane, { Pane } from "split-pane-react";

export type JSONErrorType = {
  isError: boolean;
  error: string;
};

export type ResponseStatus = {
  status: number;
  statusText: string;
  time: string;
};

export default function Api() {
  const { api, getApi, collections, env, getEnv } = useApiStore();
  const params = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>();
  const [splitPanelHeight, setSplitPanelHeight] = useState<number>();
  const [heightOfBreadcrumbUrl, setHeightOfBreadcrumbUrl] = useState<number>();
  const breadCrumbDivRef = useRef<HTMLDivElement>(null);
  const urlDivRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState([200, 300]);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 0,
    statusText: "",
    time: "",
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<ApiType>({
    mode: "onChange",
    resolver: zodResolver(ApiSchema),
  });
  const customParams = form.watch("params");
  const url = !isEmpty(customParams!)
    ? api.url +
    "?" +
    getQueryString(arrayToObjectConversion(customParams!), env)
    : api.url;
  const apiId = params.apiId as string;
  const folderId = params.folderId as string;

  useEffect(() => {
    if (apiId && folderId) {
      getApi(apiId!);
      getEnv(folderId!);
    } else {
      navigate("/");
    }
  }, [apiId, folderId, getApi, navigate, getEnv]);

  useEffect(() => {
    setTimeout(() => {
      if (breadCrumbDivRef?.current && urlDivRef?.current) {
        setSplitPanelHeight(
          window.innerHeight -
          (breadCrumbDivRef.current?.clientHeight +
            urlDivRef.current?.clientHeight),
        );
        setSizes([
          200,
          window.innerHeight -
          (breadCrumbDivRef.current?.clientHeight +
            urlDivRef.current?.clientHeight) -
          600,
        ]);
        setHeightOfBreadcrumbUrl(
          breadCrumbDivRef.current?.clientHeight +
          urlDivRef.current?.clientHeight,
        );
      }
    }, 100);
  }, []);

  useEffect(() => {
    form.setValue("id", api?.id ?? "");
    form.setValue("name", api?.name ?? "");
    form.setValue("method", api?.method ?? "GET");
    form.setValue("url", api?.url ?? "");
    form.setValue(
      "params",
      api?.params?.length
        ? api?.params
        : [{ id: uuid(), key: "", value: "", description: "" }],
    );
    form.setValue(
      "headers",
      api?.headers?.length
        ? api?.headers
        : [{ id: uuid(), key: "", value: "", description: "" }],
    );
    form.setValue(
      "body",
      api?.body?.length
        ? api?.body
        : [{ id: uuid(), key: "", value: "", description: "" }],
    );
  }, [form, api]);

  const onSubmit: SubmitHandler<ApiType> = async (submitData) => {
    const startTime = Date.now();
    try {
      setIsLoading(true);
      const params = isEmpty(submitData.params!)
        ? getQueryString(arrayToObjectConversion(api.params!), env)
        : getQueryString(arrayToObjectConversion(submitData.params!), env);

      let url = api.url + (params ? "?" + params : "");
      url = containsDynamicVariable(url) ? replaceVariables(url, env) : url;
      const requestBody = arrayToObjectConversion(submitData.body!);
      const headers = arrayToObjectConversion(submitData.headers!);

      Object.keys(headers).map((item) => {
        if (
          containsDynamicVariable(headers[item]) &&
          containsVariable(headers[item], env)
        ) {
          headers[item] = replaceVariables(headers[item], env);
        } else if (
          containsDynamicVariable(headers[item]) &&
          containsVariable(headers[item], env)
        ) {
          delete headers[item];
        }
      });

      const response = await axios({
        method: api.method,
        url,
        data: requestBody,
        headers: headers,
        timeout: 4000,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      setResult(response.data);
      setResponseStatus({
        status: response?.status,
        statusText: response?.statusText,
        time: (responseTime as number) + "ms",
      });

      setIsLoading(false);
    } catch (error: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      setResponseStatus({
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        time: (responseTime as number) + "ms",
      });
      setResult(error?.response ? error?.response?.data : error?.message);
      setIsLoading(false);
    }
  };

  const callApi = async () => {
    buttonRef.current?.click();
  };

  if (
    apiId === "undefined" ||
    apiId === "null" ||
    folderId === "undefined" ||
    folderId === "null" ||
    !collections?.length
  ) {
    return <NotFound />;
  }
  if (apiId && folderId && !api.id) {
    return <Loading />;
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="overflow-hidden"
        style={{ height: window.innerHeight }}
      >
        <SplitPane
          sashRender={() => <></>}
          split="horizontal"
          sizes={sizes}
          onChange={(sizes) => setSizes(sizes)}
        >
          <Pane
            minSize={120}
            maxSize="100%"
            style={{
              top: heightOfBreadcrumbUrl,
            }}
          >
            <div ref={breadCrumbDivRef} className="flex items-center p-5">
              <SidenavToggler />
              <Breadcrumbs
                breadcrumbs={getBreadcrumbsForNthChildren(
                  collections,
                  folderId!,
                )}
              />
              <ChevronsRight size={13} className="mx-2" />
              {api.name}
            </div>
            <div
              ref={urlDivRef}
              className="mx-auto flex w-[calc(100%-40px)] items-center justify-between rounded border p-1"
            >
              <div className="flex items-center">
                <span
                  className={
                    (api.method === "GET"
                      ? "text-green-500"
                      : api.method === "POST"
                        ? "text-yellow-500"
                        : api.method === "PUT"
                          ? "text-blue-500"
                          : api.method === "PATCH"
                            ? "text-purple-500"
                            : api.method === "DELETE"
                              ? "text-destructive"
                              : "text-foreground") + " font-bold px-2 border-r"
                  }
                >
                  {api.method}
                </span>
                <div className=" max-w-[12rem] overflow-hidden truncate px-2 md:max-w-md lg:max-w-lg xl:max-w-4xl 2xl:max-w-7xl">
                  {containsDynamicVariable(api.url) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-cyan-500">{`{{${extractVariable(
                            url,
                          )}}}`}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {replaceVariables(`{{${extractVariable(url)}}}`, env)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    url
                  )}
                  {url.split("}}")[1]}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-2 flex h-8 w-8 justify-self-end p-1"
                  size="sm"
                  onClick={() => {
                    copy(url);
                    toast({
                      variant: "success",
                      title: "Url is copied",
                    });
                  }}
                >
                  <Clipboard size={18} />
                </Button>
                <Button
                  onClick={() => callApi()}
                  className="rounded text-white"
                  size="sm"
                >
                  Connect
                </Button>
              </div>
            </div>
            <InputTabs
              className="px-5 pt-5"
              height={sizes[0]}
              form={form}
              api={api}
            />
          </Pane>

          <Pane minSize={50} maxSize="100%">
            <ApiResult
              height={splitPanelHeight!}
              isLoading={isLoading}
              result={result}
              responseStatus={responseStatus}
            />
          </Pane>
        </SplitPane>
      </form>
    </>
  );
}
