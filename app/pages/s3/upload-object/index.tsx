import React, {useEffect, useRef, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import FileUpload from "~/components/FileUpload";
import {Button, ButtonGroup, Details, ErrorSummary, Heading, TextInput} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import type {ErrorSummaryItem} from "~/types/app/common";
import {onToggleExpand, setPageTitle} from "~/utils";
import {DETAILS_ELEMENT_SUMMARY, DETAILS_ELEMENT_TEXT} from "~/constants/pages/s3/upload-object";

interface UploadObjectParams {
    bucketName: string;
}

export default function UploadObject() {
    const {bucketName} = useParams<UploadObjectParams>();
    const navigate = useNavigate();

    const errorsRef = useRef<HTMLDivElement>(null);
    const objectKeyRef = useRef<HTMLInputElement>(null);
    const fileUploadRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [objectKey, setObjectKey] = useState<string>('');

    const [expandDetails, setExpandDetails] = useState(false);
    const [errors, setErrors] = useState<ErrorSummaryItem[] | undefined>(null);

    useEffect(() => {
        document.title = 'Upload File - AWS Client';
    }, []);

    useEffect(() => {
        if (errors) errorsRef.current?.focus();
    }, [errors]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target?.files[0]);
            if (!objectKey) {
                setObjectKey(file?.name || '');
            }
        }
    };

    const getErrors = () => {
        const errors: ErrorSummaryItem[] = [];
        if (!objectKey) {
            errors.push({
                index: 0,
                text: 'Please enter a file key',
                targetName: 'object-key',
            });
        }
        if (!file) {
            errors.push({
                index: 1,
                text: 'Please select a file to upload',
                targetName: 'file-upload',
            });
        }
        if (errors.length > 0) {
            return errors;
        }
        return;
    }

    const onErrorSelect = (targetName: string) => {
        switch (targetName) {
            case 'object-key':
                objectKeyRef.current?.focus();
                break;
            case 'file-upload':
                fileUploadRef.current?.focus();
                break;
            default:
                break;
        }
    };

    const handleButtonClick = async () => {
        setErrors(undefined);
        const errors = getErrors();

        document.title = setPageTitle(
            !!errors,
            'Upload File - AWS Client'
        );

        if (errors) {
            setErrors(errors);
            errorsRef.current?.focus();
            return;
        }

        navigate(
            `/s3-buckets/${bucketName}/change-confirmation`,
            {state: {objectKey, file}}
        );
    };
    return (
        <>
            <Heading>
                Upload File
            </Heading>
            {errors && (
                <ErrorSummary
                    errors={errors}
                    innerRef={errorsRef}
                    handleOnClick={onErrorSelect}
                    dataTestId='error-summary-container'
                />
            )}
            <Details
                dataTestId='details-help-with-upload-object'
                onToggle={(e: React.SyntheticEvent<HTMLDetailsElement>) => onToggleExpand(e, expandDetails, setExpandDetails)}
                open={expandDetails}
                summary={DETAILS_ELEMENT_SUMMARY}
            >
                {DETAILS_ELEMENT_TEXT}
            </Details>
            <TextInput
                dataTestId='object-key-input'
                fixedWidth={30}
                id='object-key'
                labelProps={{
                    children: 'Object Key',
                    htmlFor: 'object-key',
                }}
                maxLength={30}
                onChange={(e) => setObjectKey(e.target.value)}
                type='text'
                value={objectKey}
            />
            <FileUpload
                dataTestId='file-upload-input'
                formGroup={{}}
                label={
                    {
                        children: 'Upload File',
                        htmlFor: 'file-upload'
                    }
                }
                id='file-upload'
                onChange={handleFileChange}
            />
            <ButtonGroup>
                <Button
                    theme={{
                        backgroundColor:
                        BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                    }}
                    onClick={handleButtonClick}>
                    Continue
                </Button>
            </ButtonGroup>
        </>
    );
}