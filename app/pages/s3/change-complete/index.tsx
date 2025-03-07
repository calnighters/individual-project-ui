import React, {useEffect} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import {Panel, Paragraph, SectionBreak} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import LinkWrapper from "~/components/LinkWrapper";

export default function ChangeComplete() {
    const {bucketName} = useParams<{ bucketName: string; }>();
    const location = useLocation();
    const objectKey = location.state.objectKey as string;

    useEffect(() => {
        document.title = 'Change Complete - AWS Client';
    }, []);

    return (
        <>
            <Panel
                heading={{
                    children: 'Action completed',
                }}
                body={{
                    children: (
                        <>
                            The changes to the object <strong>{objectKey}</strong> in
                            bucket <strong>{bucketName}</strong> have been successfully completed.
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

            <SectionBreak size='l' visible/>

            <Paragraph>Do you want to:</Paragraph>

            <LinkWrapper
                dataTestId='link-browse-s3-buckets'
                href='/s3-buckets'
            >
                Browse S3 buckets
            </LinkWrapper>

            <SectionBreak size='m'/>

            <LinkWrapper
                dataTestId='link-home'
                href='/'
            >
                Go to AWS Client Home
            </LinkWrapper>
        </>
    );
}