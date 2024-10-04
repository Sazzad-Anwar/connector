import { Suspense, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter } from 'react-router-dom'
import Error from './components/error'
import Layout from './components/layout'
import Loading from './components/loading'
const Api = lazy(() => import('./pages/api/page'))
const Home = lazy(() => import('./pages/page'))
const AddApi = lazy(() => import('./pages/api/add/page'))
const UpdateApi = lazy(() => import('./pages/api/update/page'))
const Variables = lazy(() => import('./pages/variables/page'))

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <Error />,
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
    path: '/api/variables/:folderId',
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
    path: '/api/:folderId/:apiId/update',
    element: (
      <Layout>
        <Suspense fallback={<Loading />}>
          <ErrorBoundary fallback={<Error />}>
            <UpdateApi />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/api/:folderId/add',
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
    path: '/api/:folderId/:apiId',
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
])

export default router
