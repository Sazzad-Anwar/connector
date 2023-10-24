import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
const Api = lazy(() => import("./pages/api/page"));
const Home = lazy(() => import("./pages/page"));
const AddApi = lazy(() => import("./pages/api/add/page"));
const Variables = lazy(() => import("./pages/variables/page"));
import Loading from "./components/loading";
import Layout from "./components/layout";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./components/error";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary fallback={<Error />}>
            <Home />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/api/variables/:folderId",
    element: (
      <Layout>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary fallback={<Error />}>
            <Variables />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/api/:folderId/add",
    element: (
      <Layout>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary fallback={<Error />}>
            <AddApi />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/api/:folderId/:apiId",
    element: (
      <Layout>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary fallback={<Error />}>
            <Api />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
]);

export default router;
