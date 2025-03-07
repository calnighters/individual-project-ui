import React, {useEffect, useState, useTransition} from 'react';
import {useLocation} from 'react-router-dom';
import 'diff2html/bundles/css/diff2html.min.css';
import '~/utils/diff/diff.css';
import {Heading, Spinner} from "@tact/gds-component-library";
import {postFindAuditDiff} from "~/api/audit";
import {handleApiErrorClientSide, useQuery} from "~/utils";
import {AUDIT_PAGE_ERROR_RESPONSES} from "~/constants/pages/audit";
import {buildDiffHtml} from "~/utils/diff";
import LinkWrapper from "~/components/LinkWrapper";

export default function AuditDiff() {
    const {search} = useLocation();
    const queryParams = useQuery(search);
    const [diffHtml, setDiffHtml] = useState<string>('');

    const [isGetAuditDiffPending, startTransitionAuditDiff] = useTransition();

    useEffect(() => {
        document.title = 'Audit Diff - AWS Client';
    }, []);

    useEffect(() => {

        const diff: AuditDiffRequest = {
            auditObjectKey: queryParams.get("objectKey"),
        };

        startTransitionAuditDiff(async () => {
            const diffResponse = await postFindAuditDiff(
                diff,
                AUDIT_PAGE_ERROR_RESPONSES
            );

            if (!diffResponse) return handleApiErrorClientSide();
            if (diffResponse.code) return;

            const unifiedDiffHtml = buildDiffHtml(diffResponse.unifiedDiff);

            setDiffHtml(unifiedDiffHtml);
        })
    }, [queryParams]);

    return (
        <>
            <Heading>
                Audit Diff
            </Heading>
            {isGetAuditDiffPending && (
                <Spinner centerAlign dataTestId='page-spinner'/>
            )}
            {!isGetAuditDiffPending && diffHtml && (
                <>
                    <div dangerouslySetInnerHTML={{__html: diffHtml}}/>
                    <LinkWrapper
                        dataTestId='link-back'
                        selector='Close'
                        href='/audit'
                    >
                        Close
                    </LinkWrapper>
                </>
            )}
        </>
    );
}