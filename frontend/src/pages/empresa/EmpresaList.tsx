import { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import api from '../../core/client';
import { Page } from '../../core/components/Page';
import { DefaultDataTable } from '../../core/components/DefaultDataTable';
import { useAppToast } from '../../core/useAppToast';
import EmpresaForm from './EmpresaForm';

interface Empresa {
    id: number;
    razao_social: string;
    cnpj?: string;
}

export default function EmpresaList() {
    const [data, setData] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>();
    const toast = useAppToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/empresas');
            setData(res?.data || []);
        } catch (error: any) {
            toast.showError('Erro', 'Não foi possível carregar os usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onNew = () => {
        setSelectedEmpresaId(undefined);
        setDialogVisible(true);
    };

    const onEdit = (empresa: Empresa) => {
        setSelectedEmpresaId(empresa.id);
        setDialogVisible(true);
    };

    const onDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;
        try {
            await api.delete(`empresas/${id}`);
            toast.showSuccess("Sucesso", "Empresa excluída.");
            fetchData();
        } catch (err) {
            toast.showError("Erro", "Falha ao excluir empresa." + err);
        }
    };

    const actionBody = (row: Empresa) => (
        <div className="flex gap-1 x-small">
            <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Editar" onClick={() => onEdit(row)} />
            <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Excluir" onClick={() => onDelete(row.id)} />
        </div>
    );

    const statusBodyTemplate = (rowData: any) => {
        return (
            <i className={`pi ${rowData.is_active ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}
                style={{ fontSize: '1.2rem' }}></i>
        );
    };

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
                <Column field="razao_social" header="Razão Social" sortable />
                <Column field="cnpj" header="CNPJ" sortable />
                <Column field="telefone" header="Telefone" sortable />
                <Column field="email" header="E-mail" sortable />
                <Column field="cidade" header="Cidade" sortable />
                <Column field="uf" header="UF" sortable />
                <Column field="ramo" header="Ramo" sortable />
                <Column field="is_active" header="Status" body={statusBodyTemplate} sortable style={{ width: '100px' }} />
                <Column body={actionBody} header="Ações" style={{ width: '80px', textAlign: 'center' }} />
            </DefaultDataTable>

            <Dialog
                header={selectedEmpresaId ? 'Editar Empresa' : 'Nova Empresa'}
                visible={isDialogVisible}
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                onHide={() => setDialogVisible(false)}
                modal
            >
                {isDialogVisible && (
                    <EmpresaForm
                        empresaId={selectedEmpresaId}
                        onSuccess={() => { setDialogVisible(false); fetchData(); }}
                        onCancel={() => setDialogVisible(false)}
                    />
                )}
            </Dialog>

        </Page>
    );
}