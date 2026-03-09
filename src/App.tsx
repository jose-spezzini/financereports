import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import DownloadTemplate from './pages/DownloadTemplate';
import UploadFile from './pages/UploadFile';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Payment from './pages/Payment';
import { CurrencyProvider } from './context/CurrencyContext';
import { supabase } from './supabaseClient';
import Waitlist from './pages/Waitlist';
import i18n from './i18n';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') || localStorage.getItem('spezzini_lang');
    if (lang) {
      localStorage.setItem('spezzini_lang', lang);
      i18n.changeLanguage(lang);
    }
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data: { session } }) => {
        console.log('session establecida:', session);
        setSession(session);
        setLoading(false);
        window.history.replaceState({}, '', '/');
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;

  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing session={session} />} />
            <Route path="download-template" element={<DownloadTemplate />} />
            <Route path="upload" element={<UploadFile />} />
            <Route path="dashboard" element={session ? <Dashboard /> : <Navigate to="/register" />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Register />} />
            <Route path="payment" element={session ? <Payment /> : <Navigate to="/register" />} />
            <Route path="waitlist" element={<Waitlist session={session} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  )
}

export default App