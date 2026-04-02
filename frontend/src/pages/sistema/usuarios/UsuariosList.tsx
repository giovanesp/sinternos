import { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import api from '../../../core/client';
import { Page } from '../../../core/components/Page';
import { DefaultDataTable } from '../../../core/components/DefaultDataTable';
import { useAppToast } from '../../../core/useAppToast';
import UsuarioForm from './UsuarioForm';
import { UserPassword } from './UserPassword';
import { UserCompanyDialog } from './UserCompanyDialog';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'admin' | 'gestor' | 'usuario';
    created_at: string;
}

export default function UsuariosList() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
    const toast = useAppToast();
    const [changePassword, setChangePassword] = useState<any | null>(null);
    const [userAccessData, setUserAccessData] = useState<{ id: number, nome: string } | null>(null);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsuarios(res?.data || []);
        } catch (error: any) {
            toast.showError('Erro', 'Não foi possível carregar os usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const onNew = () => {
        setSelectedUserId(undefined);
        setDialogVisible(true);
    };

    const onEdit = (user: Usuario) => {
        setSelectedUserId(user.id);
        setDialogVisible(true);
    };

    const onDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
        try {
            await api.delete(`users/${id}`);
            toast.showSuccess("Sucesso", "Usuário excluído.");
            fetchUsuarios();
        } catch (err) {
            toast.showError("Erro", "Falha ao excluir usuário." + err);
        }
    };

    const roleBodyTemplate = (rowData: Usuario) => {
        const severities: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
            admin: 'danger',
            gestor: 'info',
            usuario: 'warning'
        };
        return <Tag value={rowData.role?.toUpperCase()} severity={severities[rowData.role] || 'info'} />;
    };

    const actionBody = (row: Usuario) => (
        <div className="flex gap-1 x-small">
            <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Editar" onClick={() => onEdit(row)} />
            <Button icon="pi pi-building" size="small" severity="help" tooltip="Empresas" onClick={() => setUserAccessData({ id: row.id, nome: row.nome })} />
            <Button icon="pi pi-lock" size="small" severity="info" tooltip="Alterar Senha" onClick={() => setChangePassword(row?.id)} />
            <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Excluir" onClick={() => onDelete(row.id)} />
        </div>
    );

    const statusBodyTemplate = (rowData: any) => {
        return (
            <i className={`pi ${rowData.is_active ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'}`}
                style={{ fontSize: '1.2rem' }}></i>
        );
    };

    const empresasBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-1 x-small">
                {rowData.empresas?.map((empresa: any) => (
                    <Tag key={empresa.id} value={empresa.razao_social} severity="success" />
                ))}
            </div>
        );
    };

    return (
        <Page>
            <DefaultDataTable
                value={usuarios}
                loading={loading}
                onReload={fetchUsuarios}
                onNew={onNew}
                globalFilterFields={['nome', 'email']}
                noStatus
            >
                <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                <Column field="nome" header="Nome" sortable />
                <Column field="email" header="E-mail" sortable />
                <Column field="role" header="Nível de Acesso" body={roleBodyTemplate} />
                <Column field="empresas" header="Empresas" body={empresasBodyTemplate} />
                <Column field="is_active" header="Status" body={statusBodyTemplate} sortable style={{ width: '100px' }} />
                <Column body={actionBody} header="Ações" style={{ width: '80px', textAlign: 'center' }} />
            </DefaultDataTable>

            <Dialog
                header={selectedUserId ? 'Editar Usuário' : 'Novo Usuário'}
                visible={isDialogVisible}
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                onHide={() => setDialogVisible(false)}
                modal
            >
                {isDialogVisible && (
                    <UsuarioForm
                        usuarioId={selectedUserId}
                        onSuccess={() => { setDialogVisible(false); fetchUsuarios(); }}
                        onCancel={() => setDialogVisible(false)}
                    />
                )}
            </Dialog>

            {changePassword &&
                <UserPassword
                    id={changePassword}
                    onHide={() => setChangePassword(null)}
                    visible={!!changePassword}
                />
            }

            {userAccessData && (
                <UserCompanyDialog
                    userId={userAccessData.id}
                    userName={userAccessData.nome}
                    visible={!!userAccessData}
                    onHide={() => setUserAccessData(null)}
                />
            )}

        </Page>
    );
}