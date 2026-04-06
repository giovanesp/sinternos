import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { PickList } from 'primereact/picklist';
import api from '../../../core/client';
import { useAppToast } from '../../../core/useAppToast';
import { Button } from 'primereact/button';

interface Empresa {
    id: number;
    razao_social: string;
    cnpj?: string;
}

interface Props {
    userId: number;
    userName: string;
    visible: boolean;
    onHide: () => void;
}

export const UserCompanyDialog = ({ userId, userName, visible, onHide }: Props) => {
    const [source, setSource] = useState<Empresa[]>([]);
    const [target, setTarget] = useState<Empresa[]>([]);
    const toast = useAppToast();

    const loadData = async () => {
        try {
            const resEmpresas = await api.get('empresas');
            const todasEmpresas: Empresa[] = resEmpresas.data || [];

            const resUser = await api.get(`users/${userId}`);
            const empresasVinculadas: Empresa[] = resUser.data.empresas || [];

            const disponiveis = todasEmpresas.filter(
                emp => !empresasVinculadas.find(v => v.id === emp.id)
            );

            setSource(disponiveis);
            setTarget(empresasVinculadas);
        } catch (error) {
            toast.showError('Erro', 'Não foi possível carregar os vínculos.');
        }
    };

    useEffect(() => {
        if (visible && userId) loadData();
    }, [visible, userId]);

    const onMoveToTarget = async (e: any) => {
        const itensMovidos = e.items || e.value || [];
        if (itensMovidos.length === 0) return;
        try {
            await Promise.all(
                itensMovidos.map((emp: Empresa) =>
                    api.post(`users/${userId}/vincular-empresa/${emp.id}`)
                )
            );
            toast.showSuccess('Sucesso', 'Vínculos atualizados com sucesso.');
        } catch (err) {
            console.error("Erro ao vincular:", err);
            toast.showError('Erro', 'Falha ao vincular uma ou mais empresas.');
            loadData();
        }
    };

    const onMoveToSource = async (e: any) => {
        const itensMovidos = e.items || e.value || [];
        if (itensMovidos.length === 0) return;
        try {
            await Promise.all(
                itensMovidos.map((emp: Empresa) =>
                    api.delete(`users/${userId}/remover-empresa/${emp.id}`)
                )
            );
            toast.showSuccess('Sucesso', 'Empresas desvinculadas.');
        } catch (err) {
            toast.showError('Erro', 'Falha ao desvincular empresa.');
            loadData();
        }
    };

    const itemTemplate = (item: Empresa) => (
        <div className="flex align-items-center p-2 w-full">
            <div className="flex-1">
                <span className="font-bold block">{item.razao_social}</span>
                <small className="text-600">{item.cnpj}</small>
            </div>
        </div>
    );

    return (
        <Dialog
            header={`Gerenciar Acessos: ${userName}`}
            visible={visible}
            style={{ width: '70vw' }}
            onHide={onHide}
            footer={<Button label="Fechar" icon="pi pi-check" onClick={onHide} />}
        >
            <PickList
                source={source}
                target={target}
                dataKey="id"
                itemTemplate={itemTemplate}
                onChange={(e) => {
                    setSource(e.source);
                    setTarget(e.target);
                }}
                onMoveToTarget={onMoveToTarget}
                onMoveToSource={onMoveToSource}
                sourceHeader="Disponíveis"
                targetHeader="Vinculadas"
                sourceStyle={{ height: '30rem' }}
                targetStyle={{ height: '30rem' }}
                breakpoint="1400px"
            />
        </Dialog>
    );
};