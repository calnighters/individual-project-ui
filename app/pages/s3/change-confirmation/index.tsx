import React, {useEffect, useState, useRef, useTransition} from 'react';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {postObjectContent, preUploadRequest} from '~/api/s3';
import 'diff2html/bundles/css/diff2html.min.css';
import '~/utils/diff/diff.css';
import {Button, ButtonGroup, Details, Heading, Panel} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {handleApiErrorClientSide} from "~/utils";
import {S3_PAGE_ERROR_RESPONSES} from "~/constants/pages/s3";
import {buildDiffHtml} from "~/utils/diff";
import Loading from "~/components/Loading";
import {DETAILS_ELEMENT_SUMMARY, DETAILS_ELEMENT_TEXT_EDIT, DETAILS_ELEMENT_TEXT_NEW_UPLOAD} from "~/constants/pages/s3/change-confirmation";

interface ChangeConfirmationProps {
    bucketName: string;
}

export default function ChangeConfirmation() {
    const {bucketName} = useParams<ChangeConfirmationProps>();
    const location = useLocation();
    const objectKey = location.state.objectKey as string;
    const file = location.state.file as File;
    const [isPreUploadPending, startTransitionPreUpload] = useTransition();
    const [isPostFileContentPending, startTransitionPostFileContent] = useTransition();

    const navigate = useNavigate();
    const fileRef = useRef(file);

    const [preUploadResponse, setPreUploadResponse] = useState<PreUploadResponse>();
    const [diffHtml, setDiffHtml] = useState<string>('');

    useEffect(() => {
        document.title = 'Change Confirmation - AWS Client';
    }, []);

    useEffect(() => {
        startTransitionPreUpload(async () => {
            const preUploadResponse = await preUploadRequest(
                bucketName as string,
                objectKey,
                fileRef.current,
                S3_PAGE_ERROR_RESPONSES
            );

            if (!preUploadResponse) return handleApiErrorClientSide();
            if (preUploadResponse.code) return;

            if (!preUploadResponse.newUpload) {
                const unifiedDiffHtml = buildDiffHtml(preUploadResponse.unifiedDiff);
                setDiffHtml(unifiedDiffHtml);
            }

            setPreUploadResponse(preUploadResponse);
        });
    }, [bucketName, objectKey]);

    const handleButtonClick = async () => {
        startTransitionPostFileContent(() => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target?.result as string;

                await postObjectContent(
                    bucketName as string,
                    objectKey,
                    content,
                    S3_PAGE_ERROR_RESPONSES);

                navigate(
                    `/s3-buckets/${bucketName}/change-complete`,
                    {state: {objectKey}}
                );
            };
            reader.readAsText(fileRef.current);
        });
    };

    return (
        <>
            <Heading>
                Change Confirmation
            </Heading>
            {isPreUploadPending && (
                <Loading/>
            )}
            {!isPreUploadPending && preUploadResponse && (
                <>
                    {preUploadResponse.newUpload ?
                        <Details summary={DETAILS_ELEMENT_SUMMARY}>
                            {DETAILS_ELEMENT_TEXT_NEW_UPLOAD}
                        </Details> :
                        <Details summary={DETAILS_ELEMENT_SUMMARY}>
                            {DETAILS_ELEMENT_TEXT_EDIT}
                        </Details>}
                    {
                        preUploadResponse.newUpload ? (
                            <Panel
                                heading={{
                                    children: 'New Upload',
                                }}
                                body={{
                                    children: (
                                        <>
                                            The file <strong>{objectKey}</strong> is being uploaded to
                                            bucket <strong>{bucketName}</strong>.
                                        </>
                                    ),
                                }}
                                role='alert'
                                dataTestId='panel'
                                theme={{
                                    backgroundColor:
                                    BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                                }}
                            />
                        ) : (
                            <div dangerouslySetInnerHTML={{__html: diffHtml}}/>
                        )
                    }
                    <ButtonGroup>
                        <Button
                            theme={{
                                backgroundColor:
                                BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                            }}
                            showProgress={isPostFileContentPending}
                            onClick={handleButtonClick}>
                            Confirm
                        </Button>
                    </ButtonGroup>
                </>
            )}

        </>
    );
}