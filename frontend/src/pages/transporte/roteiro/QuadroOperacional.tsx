import { useEffect, useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import api from '../../../core/client';
import { useAppToast } from '../../../core/useAppToast';
import { groupBy } from 'lodash';
import { Page } from '../../../core/components/Page';
import { Dialog } from 'primereact/dialog';
import { EdicaoLoteQuadro } from './EdicaoLoteQuadro';
import { NovoRegistro } from './NovoRegistro';
import { EdicaoIndividual } from './EdicaoIndividual';
import { Tag } from 'primereact/tag';

const statusStyles = [
    { label: 'verde', bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
    { label: 'laranja', bg: '#fff7ed', border: '#f97316', text: '#c2410c' },
    { label: 'vermelho', bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' }
];

export const QuadroOperacional = () => {
    const [quadroRaw, setQuadroRaw] = useState<any[]>([]); // Armazena os dados brutos da API
    const [dataRef, setDataRef] = useState<Date>(new Date());
    const [showBatchDialog, setShowBatchDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const toast = useAppToast();

    const carregarQuadro = async (data: Date) => {
        const dataStr = data.toISOString().split('T')[0];
        try {
            const res = await api.get(`/operacao_diaria/${dataStr}`);
            setQuadroRaw(res.data);
        } catch (err) {
            toast.showError('Erro', 'Não foi possível carregar o quadro.');
        }
    };

    // Lógica de agrupamento e ordenação (Maiores grupos primeiro)
    const { quadroAgrupado, gruposOrdenados } = useMemo(() => {
        const agrupado = groupBy(quadroRaw, 'grupo_nome');
        const ordenados = Object.keys(agrupado).sort((a, b) => agrupado[b].length - agrupado[a].length);
        return { quadroAgrupado: agrupado, gruposOrdenados: ordenados };
    }, [quadroRaw]);

    const handleClonar = async () => {
        const dataStr = dataRef.toISOString().split('T')[0];
        try {
            await api.post(`/operacao_diaria/clonar/${dataStr}`);
            toast.showSuccess('Sucesso', 'Quadro anterior clonado!');
            carregarQuadro(dataRef);
        } catch (err) {
            toast.showError('Erro', 'Falha ao clonar quadro.');
        }
    };

    useEffect(() => {
        carregarQuadro(dataRef);
    }, [dataRef]);

    const handleEditarIndividual = (item: any) => {
        setEditItem(item);
        setShowEditDialog(true);
    };

    return (
        <Page title="Quadro">
            <div className="p-1">
                {/* Header do Quadro */}
                <div className="flex justify-content-between align-items-center mb-2 bg-white p-2 border-round shadow-1">
                    <div className="flex align-items-center gap-2">
                        <h3 className="m-0 text-primary text-xl font-bold">Quadro Operacional</h3>
                        <Calendar
                            value={dataRef}
                            onChange={(e) => setDataRef(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className='p-inputtext-sm'
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button label="Clonar" icon="pi pi-copy" size="small" className="p-button-outlined" onClick={handleClonar} />
                        <Button label="Massa" icon="pi pi-table" size="small" className="p-button-warning p-button-outlined" onClick={() => setShowBatchDialog(true)} />
                        <Button label="Novo" icon="pi pi-plus" size="small" onClick={() => setModalVisible(true)} />
                    </div>
                </div>

                {/* Grid Masonry: Organização automática de espaço */}
                <div className="masonry-grid">
                    {gruposOrdenados.map((grupo) => {
                        const totalItens = quadroAgrupado[grupo].length;
                        const classeGrid = totalItens > 20 ? 'item-extra-longo' : '';
                        return (
                            <div key={grupo} className={`masonry-item ${classeGrid}`}>
                                <Card
                                    title={<div className="text-sm font-bold uppercase line-height-2">{grupo}</div>}
                                    subTitle={<Tag value={quadroAgrupado[grupo].length} severity="info" className="mt-1" />}
                                    className="shadow-2 border-top-3 border-yellow-400"
                                >
                                    <div className="flex flex-column gap-1">
                                        {quadroAgrupado[grupo].map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="p-2 motorista-item border-round flex align-items-center border-left-3 shadow-1"
                                                style={{
                                                    backgroundColor: statusStyles.find((s) => s.label === item.status_cor)?.bg || '#f8f9fa',
                                                    borderLeftColor: statusStyles.find((s) => s.label === item.status_cor)?.border || '#dee2e6'
                                                }}
                                            >
                                                <div className='w-full overflow-hidden'>
                                                    <div className="flex justify-content-between align-items-center">
                                                        <span className="font-bold text-xs white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                                            {item.motorista_nome} <span className="text-600 font-normal">[{item.veiculo_placa}]</span>
                                                        </span>
                                                        {/* Botão que aparece apenas no hover da linha */}
                                                        <Button
                                                            icon="pi pi-pencil"
                                                            className="p-button-text p-0 text-700 hover-pencil"
                                                            style={{ width: '20px', height: '20px' }}
                                                            onClick={() => handleEditarIndividual(item)}
                                                            title='Editar'
                                                        />
                                                    </div>

                                                    {item.info_viagem && (
                                                        <div className="text-xs text-600 font-medium line-height-1 mt-1 border-top-1 border-200 pt-1">
                                                            {item.info_viagem}
                                                        </div>
                                                    )}

                                                    {item.observacoes && (
                                                        <div className="text-xs italic text-800 mt-1 line-height-1 opacity-70">
                                                            {item.observacoes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )
                    }
                    )}
                </div>
            </div>

            {/* Modais de Diálogo */}
            <Dialog header="Edição em Massa" visible={showBatchDialog} style={{ width: '90vw' }} onHide={() => setShowBatchDialog(false)}>
                <EdicaoLoteQuadro dataRef={dataRef} onSaveSuccess={() => { carregarQuadro(dataRef); setShowBatchDialog(false); }} />
            </Dialog>

            <Dialog header="Editar Registro" visible={showEditDialog} style={{ width: '450px' }} onHide={() => setShowEditDialog(false)}>
                {editItem && <EdicaoIndividual item={editItem} onSuccess={() => { carregarQuadro(dataRef); setShowEditDialog(false); }} onCancel={() => setShowEditDialog(false)} />}
            </Dialog>

            <NovoRegistro visible={modalVisible} onHide={() => setModalVisible(false)} dataPadrao={dataRef} onSuccess={() => { carregarQuadro(dataRef); setModalVisible(false); }} />
        </Page>
    );
};