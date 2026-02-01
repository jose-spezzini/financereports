import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import DownloadTemplate from './pages/DownloadTemplate';
import UploadFile from './pages/UploadFile';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Payment from './pages/Payment';

import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="download-template" element={<DownloadTemplate />} />
            <Route path="upload" element={<UploadFile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Register />} />
            <Route path="payment" element={<Payment />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  )
}

export default App
