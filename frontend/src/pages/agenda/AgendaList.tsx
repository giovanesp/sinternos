import { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import api from '../../core/client';
import { Page } from '../../core/components/Page';
import { DefaultDataTable } from '../../core/components/DefaultDataTable';
import { useAppToast } from '../../core/useAppToast';
import EventoForm from './EventoForm';
import { formataDataHoraBR } from '../../core/helpers/utils';
import { useNavigate } from 'react-router-dom';
import { Form } from '../../core/components/Form';
import {
    startOfMonth,
    endOfMonth,
    format,
    startOfDay,
    endOfDay
} from 'date-fns';

interface Evento {
    id: number;
    titulo: string;
    data_inicio: string;
    data_fim: string;
    diretor_id: number;
    diretor_nome?: string;
    cor?: string;
    status: string;
}

export default function AgendaList() {
    const navigate = useNavigate();
    const toast = useAppToast();

    const [data, setData] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [selectedEventoId, setSelectedEventoId] = useState<number | undefined>();

    const [start_date, setStartDate] = useState(format(startOfDay(startOfMonth(new Date())), 'yyyy-MM-dd HH:mm:ss'));
    const [end_date, setEndDate] = useState(format(endOfDay(endOfMonth(new Date())), 'yyyy-MM-dd HH:mm:ss'));
    const [diretor_id, setDiretorSelecionado] = useState<number | undefined>();
    const [titulo, setTitulo] = useState<string | undefined>();
    const [status, setStatus] = useState<string | undefined>();

    const fetchData = async (filtrosAtuais?: Record<string, any>) => {
        setLoading(true);
        try {
            const res = await api.get('/eventos', {
                params: {
                    start_date: filtrosAtuais?.data_inicio || start_date,
                    end_date: filtrosAtuais?.data_fim || end_date,
                    diretor_id: filtrosAtuais?.diretor_id ?? diretor_id,
                    titulo: filtrosAtuais?.titulo ?? titulo,
                    status: filtrosAtuais?.status ?? status
                }
            });
            setData(res?.data || []);
        } catch (error: any) {
            toast.showError('Erro', 'Não foi possível carregar a agenda.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onNew = () => {
        setSelectedEventoId(undefined);
        setDialogVisible(true);
    };

    const onEdit = (evento: Evento) => {
        setSelectedEventoId(evento.id);
        setDialogVisible(true);
    };

    const onDelete = async (id: number) => {
        if (!window.confirm("Deseja remover este evento da agenda?")) return;
        try {
            await api.delete(`eventos/${id}`);
            toast.showSuccess("Sucesso", "Evento removido.");
            fetchData();
        } catch (err) {
            toast.showError("Erro", "Falha ao excluir evento.");
        }
    };

    const handleFilterSubmit = async (formData: Record<string, any>) => {
        setFilterVisible(false);
        const sDate = formData.data_inicio instanceof Date
            ? format(formData.data_inicio, 'yyyy-MM-dd HH:mm:ss')
            : formData.data_inicio;

        const eDate = formData.data_fim instanceof Date
            ? format(formData.data_fim, 'yyyy-MM-dd HH:mm:ss')
            : formData.data_fim;

        setStartDate(sDate);
        setEndDate(eDate);
        setDiretorSelecionado(formData.diretor_id);
        setTitulo(formData.titulo);
        setStatus(formData.status);

        fetchData({
            ...formData,
            data_inicio: sDate,
            data_fim: eDate
        });
    };

    const dateTemplate = (rowData: Evento, field: 'data_inicio' | 'data_fim') => {
        return formataDataHoraBR(rowData[field]);
    };

    const titleTemplate = (rowData: Evento) => (
        <div className="flex align-items-center gap-2">
            <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: rowData.cor || '#3174ad',
                flexShrink: 0
            }}></div>
            <span className="font-medium">{rowData.titulo}</span>
        </div>
    );

    const actionBody = (row: Evento) => (
        <div className="flex gap-1">
            <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Editar" onClick={() => onEdit(row)} text />
            <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Excluir" onClick={() => onDelete(row.id)} text />
        </div>
    );

    return (
        <Page>
            <DefaultDataTable
                value={data}
                loading={loading}
                onReload={() => fetchData()}
                onNew={onNew}
                onFilter={() => setFilterVisible(true)}
                globalFilterFields={['titulo', 'diretor_nome', 'status']}
                headerContent={
                    <>
                        <Button
                            icon="pi pi-calendar"
                            label="Calendário"
                            size='small'
                            severity="info"
                            onClick={() => navigate('/calendario')}
                        />
                        <Button
                            icon="pi pi-filter"
                            label="Filtrar"
                            size='small'
                            severity='secondary'
                            onClick={() => setFilterVisible(true)}
                        />
                    </>
                }
                noStatus
            >
                <Column field="id" header="ID" sortable style={{ width: '70px' }} />
                <Column field="titulo" header="Evento" body={titleTemplate} sortable />
                <Column field="diretor.nome" header="Agenda de" sortable />
                <Column
                    field="data_inicio"
                    header="Início"
                    body={(row) => dateTemplate(row, 'data_inicio')}
                    sortable
                />
                <Column
                    field="data_fim"
                    header="Término"
                    body={(row) => dateTemplate(row, 'data_fim')}
                    sortable
                />
                <Column
                    field="status"
                    header="Status"
                    body={(row) => (
                        <Tag
                            value={row.status.toUpperCase()}
                            severity={row.status === 'confirmado' ? 'success' : 'warning'}
                        />
                    )}
                    sortable
                />
                <Column body={actionBody} header="Ações" style={{ width: '120px', textAlign: 'center' }} />
            </DefaultDataTable>

            <Dialog
                header={selectedEventoId ? 'Editar Evento' : 'Novo Evento na Agenda'}
                visible={isDialogVisible}
                style={{ width: '500px' }}
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                onHide={() => setDialogVisible(false)}
                modal
            >
                {isDialogVisible && (
                    <EventoForm
                        eventoId={selectedEventoId}
                        onSuccess={() => { setDialogVisible(false); fetchData(); }}
                        onCancel={() => setDialogVisible(false)}
                    />
                )}
            </Dialog>

            <Dialog
                header="Filtrar Agenda"
                visible={isFilterVisible}
                style={{ width: '450px' }}
                breakpoints={{ '960px': '75vw', '641px': '95vw' }}
                onHide={() => setFilterVisible(false)}
                modal
            >
                {isFilterVisible && (
                    <Form
                        onSubmit={handleFilterSubmit}
                        onCancel={() => setFilterVisible(false)}
                        initialData={{
                            titulo,
                            diretor_id,
                            status,
                            data_inicio: start_date ? new Date(start_date) : null,
                            data_fim: end_date ? new Date(end_date) : null
                        }}
                    >
                        <Form.InputText name="titulo" label="Título do Evento" className="col-12" />

                        <Form.RequestField
                            name="diretor_id"
                            label="Agenda do Diretor"
                            className="col-12"
                            path="/users"
                            params={{ is_director: true }}
                            optionLabel="nome"
                            optionValue="id"
                        />

                        <Form.InputCalendar
                            name="data_inicio"
                            label="De"
                            className="col-12 md:col-6"
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                        />

                        <Form.InputCalendar
                            name="data_fim"
                            label="Até"
                            className="col-12 md:col-6"
                            showTime
                            hourFormat="24"
                            dateFormat="dd/mm/yy"
                        />

                        <Form.InputDropdown
                            name="status"
                            label="Status"
                            className="col-12"
                            options={[
                                { label: 'Confirmado', value: 'confirmado' },
                                { label: 'Pendente', value: 'pendente' },
                                { label: 'Cancelado', value: 'cancelado' }
                            ]}
                        />
                    </Form>
                )}
            </Dialog>
        </Page>
    );
}