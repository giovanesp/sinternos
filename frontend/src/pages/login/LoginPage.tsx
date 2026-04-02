import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import api from '../../core/client';
import { useAuthStore } from '../../core/auth';

interface Empresa {
    id: number;
    nome: string;
    cnpj?: string;
    email?: string;
}

const LoginPage: React.FC = () => {
    const [contato, setContato] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
    const [userId, setUserId] = useState(null);
    const [showEmpresaSelect, setShowEmpresaSelect] = useState(false);

    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', contato);
            formData.append('password', senha);

            const { data } = await api.post('/auth/token', formData);

            if (data.access_token) {
                const userResponse = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${data.access_token}` }
                });

                const user = userResponse.data;

                if (user.empresas.length > 1) {
                    setUserId(user.id);
                    setEmpresas(user.empresas);
                    setShowEmpresaSelect(true);
                } else {
                    setAuth(data.access_token, user);
                    navigate('/');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Falha na autenticação');
        } finally {
            setLoading(false);
        }
    };

    const handleSelecionarEmpresa = async () => {
        if (!empresaSelecionada) {
            setError('Selecione uma empresa.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/empresa', {
                empresa_id: empresaSelecionada,
                usuario_id: userId,
            });

            setAuth(data.token, data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao selecionar empresa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-blue-50">
            <div className="surface-card p-6 shadow-2 border-round w-full md:w-30rem">
                <div className="text-center mb-5">
                    <i className="pi pi-book text-blue-600 text-5xl mb-3"></i>
                    <div className="text-900 text-3xl font-bold mb-3">{import.meta.env.APP_TITLE}</div>
                    <div className="text-600 font-bold mb-2">{import.meta.env.APP_DESCRIPTION}</div>
                    <span className="text-400 font-medium line-height-3">Acesse o Sistema</span>
                </div>

                {!showEmpresaSelect ? (
                    <form onSubmit={handleLogin} className="flex flex-column gap-3">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="contato" className="font-bold">
                                Usuário (E-mail)
                            </label>
                            <InputText
                                id="contato"
                                value={contato}
                                onChange={(e) => setContato(e.target.value)}
                                placeholder="ex: admin@escola.com"
                            />
                        </div>

                        <div className="flex flex-column gap-2">
                            <label htmlFor="senha" className="font-bold">Senha</label>
                            <Password
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                toggleMask
                                feedback={false}
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <Message severity="error" text={error} className="w-full mb-4" />
                        )}

                        <Button
                            label="Entrar no Sistema"
                            icon="pi pi-user"
                            loading={loading}
                            className="w-full p-3 mt-2"
                        />
                    </form>
                ) : (
                    <div className="flex flex-column gap-4">
                        <div className="text-center">
                            <div className="text-900 font-medium mb-2">
                                {empresas.length === 1 ? "Sua Empresa" : "Escolha uma empresa"}
                            </div>
                            <div className="text-600 text-sm mb-3">
                                Você tem acesso a múltiplas empresas. Selecione uma para continuar.
                            </div>
                        </div>

                        <div className="flex flex-column gap-2">
                            <label className="font-bold">Empresa</label>
                            <Dropdown
                                value={empresaSelecionada}
                                options={empresas}
                                optionLabel="nome"
                                optionValue="id"
                                onChange={(e) => setEmpresaSelecionada(e.value)}
                                placeholder="Selecione a empresa"
                                className="w-full"
                            />
                            {empresaSelecionada && (
                                <small className="text-500 ml-3">
                                    {empresaSelecionada.nome} {empresaSelecionada.cnpj && `(${empresaSelecionada.cnpj})`}
                                </small>
                            )}
                        </div>

                        {error && (
                            <Message severity="error" text={error} className="w-full" />
                        )}

                        <div className="flex gap-2">
                            <Button
                                label="Voltar"
                                severity="secondary"
                                outlined
                                onClick={() => {
                                    setShowEmpresaSelect(false);
                                    setEmpresas([]);
                                    setEmpresaSelecionada(null);
                                }}
                                className="flex-1"
                            />
                            <Button
                                label="Continuar"
                                icon="pi pi-check"
                                severity="success"
                                disabled={!empresaSelecionada}
                                loading={loading}
                                className="flex-1"
                                onClick={handleSelecionarEmpresa}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;