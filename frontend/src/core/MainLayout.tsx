import { useState, useMemo } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { PanelMenu } from 'primereact/panelmenu';
import { Outlet, useNavigate } from 'react-router-dom';
import { getMenuItems } from './loader';
import './MainLayout.css';
import { useAuthStore } from './auth';
import { Badge } from 'primereact/badge';

export const MainLayout = () => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const user = useAuthStore.getState().user;

    const menuItems = useMemo(() => {
        const handleNavigate = (path: string) => {
            navigate(path);
            setVisible(false);
        };

        return getMenuItems(handleNavigate, user?.role || []);
    }, [navigate]);

    return (
        <div className="layout-wrapper">
            <header className="layout-header">
                <div className="header-left">
                    <Button
                        icon="pi pi-bars"
                        onClick={() => setVisible(true)}
                        className="p-button-text p-button-secondary"
                    />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#111' }}>
                        {import.meta.env.APP_TITLE}
                    </span>
                </div>

                <div className="header-right">
                    <i className="pi pi-bell p-overlay-badge" style={{ fontSize: '1.4rem', cursor: 'pointer' }}>
                        <Badge value="0" severity="danger"></Badge>
                    </i>

                    <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>Olá, {user?.nome || 'Administrador'}</span>
                        <Button
                            icon="pi pi-power-off"
                            onClick={() => navigate('/login')}
                            text
                            size='small'
                        />
                    </div>
                </div>
            </header>

            <main className="layout-main">
                <Outlet />
            </main>

            <Sidebar visible={visible} onHide={() => setVisible(false)}>
                <div style={{ padding: '0.2rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Menu</span>
                </div>
                <PanelMenu
                    model={menuItems}
                    style={{ width: '100%', border: 'none' }}
                    className="w-full md:w-18rem"
                />

                <div className='p-2 text-center' style={{ padding: '0.2rem', borderTop: '1px solid #d2d2d2', marginTop: '0.5rem' }}>
                    {import.meta.env.APP_DESCRIPTION}
                </div>
            </Sidebar>
        </div>
    );
};