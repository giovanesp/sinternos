import { useAuthStore } from "../auth";
import api from '../client';
import { useEffect, useState } from "react";

interface FooterProps {
    email?: string;
    telefone?: string;
    endereco?: string;
    hidden?: boolean
}

export const FooterPrint = (props: FooterProps) => {
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
        email = empresa?.email,
        telefone = empresa?.telefone,
        endereco = empresa?.endereco,
        hidden = false,
    } = props;


    return (
        <div className={`print:block ${hidden && 'hidden'}`}>
            <div className="text-center p-0 m-0" style={{ borderTop: '1px solid rgb(206, 202, 202)' }}>
                <p className='text-sm text-gray-700 m-0'><br />
                    {email} | {telefone}<br />
                    {endereco}
                </p>
            </div>
        </div>
    );
};