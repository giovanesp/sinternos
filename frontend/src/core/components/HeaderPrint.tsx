import { useAuthStore } from "../auth";
import api from '../client';
import { useEffect, useState } from "react";
import { cpfCnpjMask } from "../helpers/utils";

const API_BASE_URL = import.meta.env.APP_URL || 'http://localhost:3000';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    companyInfo?: string;
    logoSrc?: string;
    hidden?: boolean
}

export const HeaderPrint = (props: HeaderProps) => {
    const [empresa, setEmpresa] = useState<any>(null);
    const user = useAuthStore.getState().user;

    useEffect(() => {
        if (user?.empresa_id) {
            api.get(`empresas/${user?.empresa_id}`).then((res) => {
                setEmpresa(res.data);
            });
        }
    }, [user?.empresa_id]);

    const {
        title = empresa?.nome || 'EMPRESA 1',
        subtitle = empresa?.descricao || 'Projeto de Modernizaçaõ da Gestão',
        companyInfo = empresa?.cnpj && `CNPJ: ${cpfCnpjMask(empresa?.cnpj)}`,
        logoSrc = empresa?.logo_url && empresa?.logo_url.startsWith('http') ? empresa?.logo_url : API_BASE_URL + empresa?.logo_url || API_BASE_URL + 'logo_ajaev.png',
        hidden = false,
    } = props;

    const currentDate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const currentTime = new Date().toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`print:block ${hidden && 'hidden'}`}>
            <div
                className='flex align-items-center justify-content-between w-full bg-white px-2 py-0 mb-2'
                style={{ padding: '0px', borderBottom: '1px solid rgb(206, 202, 202)' }}
            >
                <div className='w-1/4'>
                    <img
                        src={logoSrc}
                        alt='Logotipo'
                        className='logo'
                        style={{ width: '100%', height: '80px', objectFit: 'contain' }}
                    />
                </div>

                <div className='text-center w-1/2 small'>
                    <h2 className='text-xl font-bold text-gray-900 m-0'>{title}</h2>
                    <p className='text-sm text-gray-700 m-0'>
                        {companyInfo}
                        <br />
                        <small>{subtitle}</small>
                    </p>
                </div>

                <div className='w-1/4 text-right small vertical-align-top' style={{ fontSize: '9px' }}>
                    <p className='text-gray-700'>
                        Data: {currentDate} <br />
                        Hora: {currentTime}
                    </p>
                </div>
            </div>
        </div>
    );
};