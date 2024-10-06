import { TooltipProvider } from '@radix-ui/react-tooltip'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'split-pane-react/esm/themes/default.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import './index.css'
import RouterConfigs from './Routes.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <TooltipProvider>
        <RouterProvider router={RouterConfigs} />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
