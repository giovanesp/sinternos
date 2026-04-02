import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import api from '../../../core/client';
import { useAppToast } from '../../../core/useAppToast';

export const EdicaoLoteQuadro = ({ dataRef, onSaveSuccess }: { dataRef: Date, onSaveSuccess: () => void }) => {
    const [itens, setItens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();

    const coresOptions = [
        { label: 'Operação (Verde)', value: 'verde' },
        { label: 'Parado (Vermelho)', value: 'vermelho' },
        { label: 'Manutenção (Laranja)', value: 'laranja' }
    ];

    useEffect(() => {
        const dataStr = dataRef.toISOString().split('T')[0];
        api.get(`/operacao_diaria/${dataStr}`).then(res => setItens(res.data));
    }, [dataRef]);

    const onCellEditComplete = (e: any) => {
        let { rowData, newValue, field } = e;
        rowData[field] = newValue;
        setItens([...itens]);
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            await api.post('/operacao_diaria/batch', {
                data_referencia: dataRef,
                itens: itens
            });
            toast.showSuccess('Sucesso', 'Quadro atualizado com sucesso!');
            onSaveSuccess();
        } catch (err) {
            toast.showError('Erro', 'Falha ao salvar alterações.');
        } finally {
            setLoading(false);
        }
    };

    const textEditor = (options: any) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const statusEditor = (options: any) => {
        return <Dropdown value={options.value} options={coresOptions} onChange={(e) => options.editorCallback(e.value)} placeholder="Selecione a Cor" />;
    };

    return (
        <div className="card">
            <DataTable value={itens} editMode="cell" className="editable-cells-table p-datatable-sm" responsiveLayout="scroll">
                <Column field="grupo_nome" header="Remessa/Grupo" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete} style={{ width: '25%' }} />
                <Column field="motorista_nome" header="Motorista" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete} />
                <Column field="veiculo_placa" header="Placa" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete} />
                <Column field="status_cor" header="Cor/Status" body={(rowData) => <i className={`pi pi-circle-fill text-${rowData.status_cor === 'verde' ? 'green' : rowData.status_cor === 'laranja' ? 'orange' : 'red'}-500`} />}
                    editor={(options) => statusEditor(options)} onCellEditComplete={onCellEditComplete} />
                <Column field="info_viagem" header="Informação da Viagem" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete} />
                <Column field="observacoes" header="Notas" editor={(options) => textEditor(options)} onCellEditComplete={onCellEditComplete} />
            </DataTable>

            <div className="flex justify-content-end mt-3">
                <Button label="Salvar Alterações do Quadro" icon="pi pi-check" loading={loading} onClick={handleSaveAll} className="p-button-success" />
            </div>
        </div>
    );
};