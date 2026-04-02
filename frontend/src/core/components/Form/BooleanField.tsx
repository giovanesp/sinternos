import type { DropdownProps } from 'primereact/dropdown';
import type { FieldValues, RegisterOptions } from 'react-hook-form';

import { DropdownField } from './DropdownField';

type BooleanFieldProps = {
    icon?: string;
    label?: string;
    name: string;
    rules?: RegisterOptions<FieldValues, string>;
} & Omit<DropdownProps, 'optionLabel' | 'optionValue' | 'options' | 'value'>;

export const BooleanField = (props: BooleanFieldProps) => (
    <DropdownField
        {...props}
        optionLabel={undefined}
        optionValue={undefined}
        options={[
            { label: 'Sim', value: 1 },
            { label: 'Não', value: 0 },
        ]}
    />
);
