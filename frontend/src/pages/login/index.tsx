import type { AppModule } from '../../core/types/module';
import LoginPage from './LoginPage';

const loginModule: AppModule = {
    path: '/login',
    label: 'Login',
    icon: 'pi pi-lock',
    element: <LoginPage />,
    showInMenu: false
};

export default loginModule;