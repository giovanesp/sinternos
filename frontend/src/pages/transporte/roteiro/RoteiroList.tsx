import { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import api from '../../../core/client';
import { Page } from '../../../core/components/Page';
import { DefaultDataTable } from '../../../core/components/DefaultDataTable';
import { useAppToast } from '../../../core/useAppToast';
import RoteiroForm from './RoteiroForm';
import { formataDataBR } from '../../../core/helpers/utils';

interface Roteiro {
    id?: number;
    nome_motorista: string;
    placa_veiculo: string;
    status: string;
    remessa?: number;
    viagem_numero?: number;
    data_carregamento?: Date;
    data_entrega?: Date;
    observacao?: string;
    detalhes?: string;
}

export default function RoteiroList() {
    const [data, setData] = useState<Roteiro[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedRoteiroId, setSelectedRoteiroId] = useState<number | undefined>();
    const toast = useAppToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/roteiros');
            setData(res?.data || []);
        } catch (error: any) {
            toast.showError('Erro', 'Não foi possível carregar os roteiros.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onNew = () => {
        setSelectedRoteiroId(undefined);
        setDialogVisible(true);
    };

    const onEdit = (roteiro: Roteiro) => {
        setSelectedRoteiroId(roteiro.id);
        setDialogVisible(true);
    };

    const onDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este roteiro?")) return;
        try {
            await api.delete(`roteiros/${id}`);
            toast.showSuccess("Sucesso", "Roteiro excluído.");
            fetchData();
        } catch (err) {
            toast.showError("Erro", "Falha ao excluir roteiro." + err);
        }
    };

    const actionBody = (row: Roteiro) => (
        <div className="flex gap-1 x-small">
            <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Editar" onClick={() => onEdit(row)} />
            <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Excluir" onClick={() => onDelete(row.id!)} />
        </div>
    );

    return (
        <Page>
            <DefaultDataTable
                value={data}
                loading={loading}
                onReload={fetchData}
                onNew={onNew}
                globalFilterFields={['razao_social', 'email']}
                noStatus
            >
                <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                <Column field="placa_veiculo" header="Placa Veículo" sortable />
                <Column field="nome_motorista" header="Motorista" sortable />
                <Column field="categoria" header="Categoria" sortable />
                <Column field="data_carregamento" header="Carregamento" sortable body={(row: Roteiro) => row.data_carregamento && formataDataBR(row.data_carregamento)} />
                <Column field="data_entrega" header="Entrega" sortable body={(row: Roteiro) => row.data_entrega && formataDataBR(row.data_entrega)} />
                <Column field="remessa" header="Remessa" sortable />
                <Column field="viagem_numero" header="Viagem" sortable />
                <Column field="observacao" header="Observação" sortable />
                <Column field="detalhes" header="Detalhes" sortable />
                <Column field="status" header="Status" sortable />
                <Column body={actionBody} header="Ações" style={{ width: '80px', textAlign: 'center' }} />
            </DefaultDataTable>

            <Dialog
                header={selectedRoteiroId ? 'Editar Roteiro' : 'Novo Roteiro'}
                visible={isDialogVisible}
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                onHide={() => setDialogVisible(false)}
                modal
            >
                {isDialogVisible && (
                    <RoteiroForm
                        roteiroId={selectedRoteiroId}
                        onSuccess={() => { setDialogVisible(false); fetchData(); }}
                        onCancel={() => setDialogVisible(false)}
                    />
                )}
            </Dialog>

        </Page>
    );
}