import { useEffect, useRef, useState } from "react";
import { Maximize } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ResponseStatus } from "./api";
import Loading from "../loading";
import ResultRender from "../result-renderer";

type PropsType = {
  isLoading: boolean;
  result: any;
  height?: number;
  responseStatus: ResponseStatus;
};

export default function ApiResult({
  isLoading,
  result,
  height,
  responseStatus,
}: PropsType) {
  const resultDivRef = useRef<HTMLDivElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const payloadSize = (data: any): string => {
    // Convert JSON data to string
    // Convert JSON data to string
    const json_string = JSON.stringify(data);

    // Calculate length of string in bytes
    const string_length = new TextEncoder().encode(json_string).length;

    // Convert payload size to KB
    const payload_size_kb = +(string_length / 1024).toFixed(2);
    return payload_size_kb > 1 ? `${payload_size_kb} KB` : `${string_length} B`;
  };

  return (
    <section ref={resultDivRef} className="border-t py-1">
      {isLoading && <Loading height={height! - 300} />}
      {!isLoading && result && (
        <>
          <div className="flex items-center justify-between py-3 pl-5 pr-0 text-sm">
            <h1 className="text-base">Response</h1>
            <div className="flex items-center">
              <p
                className={cn(
                  responseStatus.status?.toString().startsWith("2", 0)
                    ? "ml-1 font-medium text-green-600 dark:font-normal dark:text-green-400"
                    : "ml-1 font-medium text-red-500 dark:font-normal",
                  "mr-2",
                )}
              >
                {responseStatus.status} {responseStatus.statusText}
              </p>
              <p className="mr-4">
                Time:
                <span className={"pl-1 text-green-500"}>
                  {responseStatus.time}
                </span>
              </p>
              <p className="mr-2">
                Size:
                <span className={"ml-1 text-green-500"}>
                  {payloadSize(result)}
                </span>
              </p>
            </div>
          </div>
          <ResultRender
            ref={resultContainerRef}
            height={height}
            result={result && result}
          />
        </>
      )}
    </section>
  );
}
