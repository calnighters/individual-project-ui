import type {MutableRefObject} from 'react';

import type {DisplayProps} from "@tact/gds-component-library/dist/utils";
import {FormGroup, Label } from "@tact/gds-component-library";
import type {FormGroupProps, LabelProps} from "@tact/gds-component-library";
interface FileUploadProps extends DisplayProps, React.InputHTMLAttributes<HTMLInputElement> {
    dataTestId?: string;
    formGroup: Omit<FormGroupProps, 'children'>;
    label?: LabelProps;
    textAreaRef?: MutableRefObject<HTMLInputElement | null>;
}

function FileUpload({
                        dataTestId,
                        formGroup,
                        label,
                        fileUploadRef,
                        ...rest
                    }: FileUploadProps) {

    return (
        <FormGroup dataTestId={dataTestId} {...formGroup}>
            {!!label && <Label {...(label as LabelProps)} />}
            <input
                className='govuk-file-upload'
                type='file'
                ref={fileUploadRef}
                {...rest}
            />
        </FormGroup>
    );
}

export type {
    FileUploadProps
};
export default FileUpload;
