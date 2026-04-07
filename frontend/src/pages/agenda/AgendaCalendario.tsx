import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Page } from '../../core/components/Page';
import api from '../../core/client';
import EventoForm from './EventoForm';
import { useAppToast } from '../../core/useAppToast';
import { Button } from 'primereact/button';
import {
    startOfMonth,
    endOfMonth,
    format,
    startOfDay,
    endOfDay
} from 'date-fns';

export default function AgendaCalendario() {
    const [eventos, setEventos] = useState([]);
    const [diretores, setDiretores] = useState([]);
    const [diretorSelecionado, setDiretorSelecionado] = useState(null);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<{ start: Date, end: Date } | undefined>();
    const [selectedEventoId, setSelectedEventoId] = useState<number | undefined>();
    const [start_date, setStartDate] = useState(format(startOfDay(startOfMonth(new Date())), 'yyyy-MM-dd HH:mm:ss'));
    const [end_date, setEndDate] = useState(format(endOfDay(endOfMonth(new Date())), 'yyyy-MM-dd HH:mm:ss'));
    const toast = useAppToast();

    useEffect(() => {
        api.get('/users?is_director=true').then(res => {
            setDiretores(res.data.map((d: any) => ({ label: d.nome, value: d.id })));
        });
    }, []);

    const fetchEventos = async () => {
        try {
            const url = diretorSelecionado ? `/eventos?diretor_id=${diretorSelecionado}` : '/eventos';
            const res = await api.get(url, {
                params: {
                    start_date: start_date,
                    end_date: end_date
                }
            });

            const formatted = res.data.map((ev: any) => ({
                id: ev.id,
                title: ev.titulo,
                start: ev.data_inicio,
                end: ev.data_fim,
                backgroundColor: ev.cor,
                extendedProps: { ...ev }
            }));
            setEventos(formatted);
        } catch (err) {
            toast.showError("Erro", "Falha ao carregar agenda");
        }
    };

    useEffect(() => { fetchEventos(); }, [diretorSelecionado, start_date, end_date]);

    const handleDateSelect = (selectInfo: any) => {
        setSelectedEventoId(undefined);
        setSelectedDate({ start: selectInfo.start, end: selectInfo.end });
        setDialogVisible(true);
    };

    const handleEventClick = (clickInfo: any) => {
        setSelectedEventoId(Number(clickInfo.event.id));
        setDialogVisible(true);
    };

    const onDeleteEvento = async () => {
        if (!selectedEventoId) return;

        if (!window.confirm("Deseja realmente remover este compromisso da agenda?")) return;

        try {
            await api.delete(`/eventos/${selectedEventoId}`);
            toast.showSuccess("Sucesso", "Evento excluído com sucesso.");
            setDialogVisible(false);
            fetchEventos();
        } catch (err) {
            toast.showError("Erro", "Não foi possível excluir o evento.");
        }
    };

    const renderFooter = () => {
        return (
            <div className="flex justify-content-between w-full">
                {selectedEventoId ? (
                    <Button
                        label="Excluir"
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={onDeleteEvento}
                        outlined
                    />
                ) : <div />}
                <div>
                    <Button label="Cancelar" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
                </div>
            </div>
        );
    };

    const handleDatesSet = (arg: any) => {
        setStartDate(arg.startStr);
        setEndDate(arg.endStr);
    };

    return (
        <Page>
            <div className="card shadow-2 p-2 border-round bg-white">
                <div className="flex justify-content-between align-items-center mb-2 small">
                    <h2 className="m-0 text-xl">Agenda Corporativa</h2>
                    <div className="flex align-items-center gap-3">
                        <span className="font-bold">Filtrar Diretor:</span>
                        <Dropdown
                            value={diretorSelecionado}
                            options={diretores}
                            onChange={(e) => setDiretorSelecionado(e.value)}
                            placeholder="Todos os Diretores"
                            showClear
                            className="w-full md:w-15rem"
                        />
                    </div>
                </div>

                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    locale={ptBrLocale}
                    events={eventos}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    height="65vh"
                    datesSet={handleDatesSet}
                />
            </div>

            <Dialog
                header={selectedEventoId ? 'Editar Compromisso' : 'Novo Agendamento'}
                visible={isDialogVisible}
                style={{ width: '650px' }}
                onHide={() => setDialogVisible(false)}
                footer={renderFooter()}
                modal
            >
                {isDialogVisible && (
                    <EventoForm
                        eventoId={selectedEventoId}
                        initialDates={selectedDate}
                        onSuccess={() => { setDialogVisible(false); fetchEventos(); }}
                        onCancel={() => setDialogVisible(false)}
                        diretorId={diretorSelecionado as unknown as number}
                    />
                )}
            </Dialog>
        </Page>
    );
}