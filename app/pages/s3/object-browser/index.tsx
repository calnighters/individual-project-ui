import React, {useEffect, useState, useTransition} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {listObjects,} from '~/api/s3';
import ObjectTable from "~/pages/s3/object-browser/ObjectTable";
import Loading from "~/components/Loading";
import {Button, ButtonGroup, Details, useHydrated} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {S3_PAGE_ERROR_RESPONSES} from "~/constants/pages/s3";
import {handleApiErrorClientSide} from "~/utils";
import {DETAILS_ELEMENT_SUMMARY, DETAILS_ELEMENT_TEXT} from "~/constants/pages/s3/object-browser";

interface ObjectBrowserProps {
    bucketName: string;
}

export default function ObjectBrowser() {
    const [isListObjectsPending, startTransitionListObjects] = useTransition();
    const [objectSearchResponse, setObjectSearchResponse] = useState<ObjectSearchResponse>();

    const navigate = useNavigate();
    const hydrated = useHydrated();
    const {bucketName} = useParams<ObjectBrowserProps>();

    useEffect(() => {
        document.title = 'S3 Bucket Contents - AWS Client';
    }, []);

    useEffect(() => {
        startTransitionListObjects(async () => {
            const listObjectsResponse = await listObjects(
                bucketName as string,
                S3_PAGE_ERROR_RESPONSES
            );

            if (!listObjectsResponse) return handleApiErrorClientSide();
            if (listObjectsResponse.code) return;

            setObjectSearchResponse(listObjectsResponse);
        })
    }, [bucketName]);

    const handleButtonClick = () => {
        navigate(`/s3-buckets/${bucketName}/upload`);
    }

    return (
        <>
            {isListObjectsPending && (
                <Loading/>
            )}
            {!isListObjectsPending && objectSearchResponse &&
                <>
                    {objectSearchResponse.objects.length > 0 &&
                        <Details summary={DETAILS_ELEMENT_SUMMARY}>
                            {DETAILS_ELEMENT_TEXT}
                        </Details>}
                    <ObjectTable bucketName={bucketName as string} objectResults={objectSearchResponse}
                                 hydrated={hydrated}/>
                    <ButtonGroup>
                        <Button
                            theme={{
                                backgroundColor:
                                BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                            }}
                            onClick={handleButtonClick}>
                            Upload File
                        </Button>
                    </ButtonGroup>
                </>
            }
        </>
    );
}