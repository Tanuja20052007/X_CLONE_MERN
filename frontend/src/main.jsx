import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// We use useMutation for creating updating and deleting the data and
//We use useQeury for fetching the data from the backens mostlty

const queryClient = new  QueryClient();
createRoot(document.getElementById('root')).render(



  <BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
  </BrowserRouter>

)
