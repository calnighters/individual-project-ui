import React, {useEffect, useRef, useState, useTransition} from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {getObjectContent} from '~/api/s3';
import Loading from "~/components/Loading";
import {Button, ButtonGroup, Details, ErrorSummary, Heading, TextArea} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {S3_PAGE_ERROR_RESPONSES} from "~/constants/pages/s3";
import {handleApiErrorClientSide, onToggleExpand, setPageTitle} from "~/utils";
import {DETAILS_ELEMENT_SUMMARY, DETAILS_ELEMENT_TEXT} from "~/constants/pages/s3/object-editor";
import type {ErrorSummaryItem} from "~/types/app/common";

interface ObjectEditorParams {
    bucketName: string;
}

export default function ObjectEditor() {
    const {bucketName} = useParams<ObjectEditorParams>();
    const navigate = useNavigate();
    const location = useLocation();
    const objectResponse = location.state.objectResponse as ObjectRecord;

    const errorsRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isGetContentPending, startTransitionGetContent] = useTransition();
    const [originalContent, setOriginalContent] = useState<string>('');
    const [content, setContent] = useState<string>('');

    const [expandDetails, setExpandDetails] = useState(false);
    const [errors, setErrors] = useState<ErrorSummaryItem[] | undefined>(null);

    useEffect(() => {
        document.title = 'Modify File - AWS Client';
    }, []);

    useEffect(() => {
        if (errors) errorsRef.current?.focus();
    }, [errors]);

    useEffect(() => {
        startTransitionGetContent(async () => {
            const getContentResponse = await getObjectContent(
                bucketName as string,
                objectResponse.objectKey,
                S3_PAGE_ERROR_RESPONSES
            );

            if (!getContentResponse) return handleApiErrorClientSide();
            if (getContentResponse.code) return;

            setOriginalContent(getContentResponse.content);
            setContent(getContentResponse.content);
        });
    }, [bucketName, objectResponse.objectKey]);

    const getErrors = () => {
        const errors: ErrorSummaryItem[] = [];
        if (originalContent === content) {
            errors.push({
                index: 0,
                text: 'Make changes to the file content before continuing',
                targetName: 'object-content',
            });
        }
        if (errors.length > 0) {
            return errors;
        }
        return;
    }

    const onErrorSelect = (targetName: string) => {
        switch (targetName) {
            case 'object-content':
                fileInputRef.current?.focus();
                break;
            default:
                break;
        }
    };

    const handleButtonClick = () => {
        setErrors(undefined);
        const errors = getErrors();

        document.title = setPageTitle(
            !!errors,
            'Modify File - AWS Client'
        );

        if (errors) {
            setErrors(errors);
            errorsRef.current?.focus();
            return;
        }

        const file = new File(
            [content],
            objectResponse.objectKey,
            {type: 'text/plain;charset=utf-8'}
        );
        const objectKey = objectResponse.objectKey;
        navigate(
            `/s3-buckets/${bucketName}/change-confirmation`,
            {state: {objectKey, file}}
        );
    };

    return (
        <>
            {isGetContentPending && (
                <Loading/>
            )}
            {!isGetContentPending && content &&
                <>
                    <Heading>
                        Object {objectResponse.objectKey}
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
                    <TextArea
                        id='object-content'
                        formGroup={{}}
                        rows={20}
                        selectRef={fileInputRef}
                        onChange={(e) => setContent(e.target.value)}
                        defaultValue={content}
                    >
                    </TextArea>
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
            }
        </>
    );
}