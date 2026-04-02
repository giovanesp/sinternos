import { Message } from 'primereact/message';
import type { FieldValues } from 'react-hook-form';

const Error = ({ text }: { text?: string }) => (
    <Message
        className='error-message'
        style={{ padding: '0rem 0.5rem', float: 'right' }}
        severity='error'
        text={text || 'Obrigatório!'}
    />
);

export const ErrorMessage = (props: {
    error?: FieldValues;
    invalid?: boolean;
    message?: string;
}) => {

    if (props.error) {
        return <Error text={props.error.message} />;
    }
    if (props.invalid) {
        return <Error text={props.message} />;
    }
    return null;
};