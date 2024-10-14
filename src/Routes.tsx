import { Suspense, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { createBrowserRouter } from 'react-router-dom'
import Error from './components/error'
import Layout from './components/layout'
import Loading from './components/loading'
const Api = lazy(() => import('./pages/api/page'))
const Home = lazy(() => import('./pages/page'))

const RouterConfigs = createBrowserRouter([
  {
    path: '/',
    errorElement: <Error />,
    element: (
      <Layout>
        <Suspense fallback={<Loading className="h-screen" />}>
          <ErrorBoundary fallback={<Error />}>
            <Home />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/api/:folderId/:apiId',
    element: (
      <Layout>
        <Suspense fallback={<Loading className="h-screen" />}>
          <ErrorBoundary fallback={<Error />}>
            <Api />
          </ErrorBoundary>
        </Suspense>
      </Layout>
    ),
  },
])

export default RouterConfigs
