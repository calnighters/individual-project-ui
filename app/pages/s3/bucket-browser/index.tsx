import {useEffect, useState, useTransition} from 'react';
import {listBuckets} from '~/api/s3';
import BucketTable from "~/pages/s3/bucket-browser/BucketTable";
import Loading from "~/components/Loading";
import {S3_PAGE_ERROR_RESPONSES} from "~/constants/pages/s3";
import {handleApiErrorClientSide} from "~/utils";
import {Details} from "@tact/gds-component-library";
import {DETAILS_ELEMENT_SUMMARY, DETAILS_ELEMENT_TEXT} from "~/constants/pages/s3/bucket-browser";

export default function BucketBrowser() {
    const [isListBucketsPending, startTransitionListBuckets] = useTransition();
    const [bucketResponse, setBucketResponse] = useState<BucketSearchResponse>();

    useEffect(() => {
        document.title = 'S3 Buckets - AWS Client';
    }, []);

    useEffect(() => {
        startTransitionListBuckets(async () => {
            const listBucketsResponse = await listBuckets(
                S3_PAGE_ERROR_RESPONSES
            );

            if (!listBucketsResponse) return handleApiErrorClientSide();
            if (listBucketsResponse.code) return;

            setBucketResponse(listBucketsResponse);
        })
    }, []);

    return (
        <>
            {isListBucketsPending}
            {isListBucketsPending && (
                <Loading/>
            )}
            {!isListBucketsPending && bucketResponse &&
                (
                    <>
                        {bucketResponse.buckets.length > 0 &&
                            <Details summary={DETAILS_ELEMENT_SUMMARY}>
                                {DETAILS_ELEMENT_TEXT}
                            </Details>}
                        <BucketTable bucketResults={bucketResponse}/>
                    </>
                )
            }
        </>);
}