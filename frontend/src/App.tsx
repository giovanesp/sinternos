import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './core/MainLayout';
import { appModules } from './core/loader';
import { useAuthStore } from './core/auth';
import { ToastProvider } from './core/contexts/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/login/LoginPage';

const ProtectedRoute = () => {
    const token = useAuthStore(state => state.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {

    const hasRootModule = appModules.some(m => m.path === '/');

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<ProtectedRoute />}>
                            <Route element={<MainLayout />}>

                                {!hasRootModule && (
                                    <Route path="/" element={<div className="p-4">Seja bem-vindo ao sistema!</div>} />
                                )}

                                {appModules.map((m, index) => (
                                    <Route
                                        key={`${m.path}-${index}`}
                                        path={m.path}
                                        element={m.element}
                                    />
                                ))}

                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export default App;