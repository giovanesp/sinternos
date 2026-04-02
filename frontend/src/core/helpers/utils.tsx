
export const testarCNPJ = (cnpj: string): boolean => {
    const limpo = cnpj.replace(/[^\d]+/g, '');

    if (limpo.length !== 14) return false;

    if (/^(\d)\1+$/.test(limpo)) return false;

    let tamanhoTotal = limpo.length - 2;
    let cnpjSemDigitos = limpo.substring(0, tamanhoTotal);
    let digitosVerificadores = limpo.substring(tamanhoTotal);
    let soma = 0;
    let pos = tamanhoTotal - 7;

    for (let i = tamanhoTotal; i >= 1; i--) {
        soma += parseInt(cnpjSemDigitos.charAt(tamanhoTotal - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(digitosVerificadores.charAt(0))) return false;

    tamanhoTotal = tamanhoTotal + 1;
    cnpjSemDigitos = limpo.substring(0, tamanhoTotal);
    soma = 0;
    pos = tamanhoTotal - 7;

    for (let i = tamanhoTotal; i >= 1; i--) {
        soma += parseInt(cnpjSemDigitos.charAt(tamanhoTotal - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(digitosVerificadores.charAt(1))) return false;

    return true;
};

export const testarCPF = (strCPF: string): boolean => {
    let soma = 0;
    let resto: number;
    const limpo = strCPF.replace(/\D/g, '');

    if (limpo === '00000000000' || limpo.length !== 11) return false;

    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(limpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(limpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.substring(10, 11))) return false;

    return true;
};

export const cpfCnpjMask = (cpfCnpj: string | null | undefined, lgpd: boolean = false): string => {
    if (!cpfCnpj) return '';
    let valor = cpfCnpj.replace(/\D/g, '');

    if (valor.length <= 11) { // CPF
        if (lgpd) {
            return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
        }
        return valor
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
        if (lgpd) {
            return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.***/***/$4-$5');
        }
        return valor
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
};

export const formataDataBRExtenso = (data: string | Date): string | null => {
    try {
        const dateObj = new Date(data);
        if (isNaN(dateObj.getTime())) throw new Error("Data inválida");

        return dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return null;
    }
};

export const formataDataBR = (data: string | Date): string | null => {
    try {
        const dateObj = new Date(data);
        if (isNaN(dateObj.getTime())) throw new Error("Data inválida");

        return dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        });
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return null;
    }
};

export const calculaIdade = (dataNascimento: string | Date): number | null => {
    try {
        const nascimento = new Date(dataNascimento);
        if (isNaN(nascimento.getTime())) throw new Error("Data de nascimento inválida");

        const hoje = new Date();
        let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();

        const mesAtual = hoje.getUTCMonth();
        const diaAtual = hoje.getUTCDate();
        const mesNasc = nascimento.getUTCMonth();
        const diaNasc = nascimento.getUTCDate();

        if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
            idade--;
        }

        return idade;
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return null;
    }
};

export const formataDataHoraBR = (data: string | Date): string | null => {
    try {
        const dateObj = new Date(data);
        if (isNaN(dateObj.getTime())) throw new Error("Data inválida");

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        }).format(dateObj);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        return null;
    }
};

export const toCssClasse = (numbers: string | null | undefined): string => {
    const cols = numbers ? numbers.split(' ') : [];
    let classes = '';

    if (cols[0]) classes += ` col-xs-${cols[0]}`;
    if (cols[1]) classes += ` col-sm-${cols[1]}`;
    if (cols[2]) classes += ` col-md-${cols[2]}`;
    if (cols[3]) classes += ` col-lg-${cols[3]}`;

    return classes;
};

export const uuidv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const round = (v: number, decimal?: number): string => {
    return v.toFixed(decimal ?? 2);
};

export const geraNum = (min: number = 1, max: number = 600, increment: number = 1): number => {
    return Math.floor(Math.random() * (max - min + increment)) + min;
};

export const formataTelefone = (telefone: string | null | undefined, lgpd: boolean = false): string => {
    if (!telefone) return '';

    const numeroLimpo = telefone.replace(/\D/g, '');
    const tamanho = numeroLimpo.length;

    let numeroFormatado = '';

    if (tamanho === 10) {
        numeroFormatado = `(${numeroLimpo.substring(0, 2)}) ${numeroLimpo.substring(2, 6)}-${numeroLimpo.substring(6)}`;
        if (lgpd) numeroFormatado = `(${numeroLimpo.substring(0, 2)}) ****-**${numeroLimpo.substring(8)}`;
    } else if (tamanho === 11) {
        numeroFormatado = `(${numeroLimpo.substring(0, 2)}) ${numeroLimpo.substring(2, 7)}-${numeroLimpo.substring(7)}`;
        if (lgpd) numeroFormatado = `(${numeroLimpo.substring(0, 2)}) *****-**${numeroLimpo.substring(9)}`;
    } else if (tamanho === 8) {
        numeroFormatado = `${numeroLimpo.substring(0, 4)}-${numeroLimpo.substring(4)}`;
        if (lgpd) numeroFormatado = `****-**${numeroLimpo.substring(6)}`;
    } else if (tamanho === 9) {
        numeroFormatado = `${numeroLimpo.substring(0, 5)}-${numeroLimpo.substring(5)}`;
        if (lgpd) numeroFormatado = `*****-**${numeroLimpo.substring(7)}`;
    } else {
        return telefone;
    }

    return numeroFormatado;
};

export const getDirtyValues = (current: Record<string, any>, original: Record<string, any>): Record<string, any> => {
    return Object.keys(current).reduce((acc: Record<string, any>, key: string) => {
        const currentVal = current[key];
        const originalVal = original[key];

        if (String(currentVal) !== String(originalVal ?? '')) {
            acc[key] = currentVal;
        }
        return acc;
    }, {});
};

export const formataMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export const limpaString = (str: string): string => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');
};