import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

export default function Error() {
  return (
    <div className="h-screen max-w-lg mx-auto flex justify-center items-center">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="text-red-500">Error Occured!</AlertTitle>
        <AlertDescription>
          Error occured while rendering the component. Please check console.
        </AlertDescription>
      </Alert>
    </div>
  );
}
