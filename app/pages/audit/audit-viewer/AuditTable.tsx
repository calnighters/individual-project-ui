import React from "react";

const {FormEvent} = React;
import {useEffect, useMemo, useRef, useState} from "react";
import type {TableRow} from "@tact/gds-component-library";
import {InsetText, Link, Pagination, Table} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {ColFormat} from "~/components/ColFormat";
import {
    MANY_RESULTS,
    NO_RESULTS_TEXT,
    RESULTS_PER_PAGE_LIMIT,
    TABLE_HEADERS
} from "~/constants/pages/audit";

const mapRowData = (auditResponse: AuditInfo) => {
    const bucketName = (
        <ColFormat minWidth='85'>
            {auditResponse.bucketName}
        </ColFormat>
    );
    const objectKey = (
        <ColFormat minWidth='85'>
            {auditResponse.objectKey}
        </ColFormat>
    );
    const actionTimestamp = (
        <ColFormat minWidth='85'>
            {auditResponse.auditDate.replace('T', ' ')}
        </ColFormat>
    );
    const eventType = (
        <ColFormat minWidth='85'>
            {auditResponse.eventType}
        </ColFormat>
    );
    const userName = (
        <ColFormat minWidth='85'>
            {auditResponse.userName}
        </ColFormat>
    );
    const viewBucketContent = (
        <ColFormat minWidth='50'>
            {auditResponse.eventType === 'MODIFY' ? (
                <Link
                    dataTestId='view-object-link'
                    href={`/audit/diff?objectKey=${auditResponse.auditObjectKey}`}
                    font={{fontWeight: 'bold'}}
                    unwrapped
                >
                    View Diff
                </Link>
            ) : ''}
        </ColFormat>
    )

    return [
        {index: 0, variant: 'td', children: bucketName},
        {index: 1, variant: 'td', children: objectKey},
        {index: 2, variant: 'td', children: actionTimestamp},
        {index: 3, variant: 'td', children: eventType},
        {index: 4, variant: 'td', children: userName},
        {index: 5, variant: 'td', children: viewBucketContent},
    ];
};

const mapRowState = (rowsData: AuditInfo[]): TableRow[] =>
    rowsData.map((value, index) => ({
        index: index,
        cells: mapRowData(value),
    })) as TableRow[];

export default function AuditTable({
                                       auditResults
                                   }: {
    auditResults: AuditSearchResponse;
}) {
    const tableRef = useRef<HTMLTableElement>(null);
    const [rowsState, setRowsState] = useState(
        mapRowState(auditResults.auditRecords.slice(0, RESULTS_PER_PAGE_LIMIT))
    );
    const [selectedPage, setSelectedPage] = useState<number>(1);

    const totalPages = useMemo(() => {
        const totalPagesRemainder =
            auditResults.auditRecords.length % RESULTS_PER_PAGE_LIMIT;

        if (totalPagesRemainder === 0) {
            return auditResults.auditRecords.length / RESULTS_PER_PAGE_LIMIT;
        }

        return Math.floor(auditResults.auditRecords.length / RESULTS_PER_PAGE_LIMIT) + 1;
    }, [auditResults.auditRecords]);

    useEffect(() => {
        if (tableRef.current?.offsetTop) {
            window.scrollTo(0, tableRef.current?.offsetTop - 120);
        }
    }, [auditResults]);

    const updateTablePageData = (
        _formEvent: FormEvent,
        page: number | string,
    ) => {
        const pageNumber = page as number;

        let from: number;
        let to: number;

        if (pageNumber < totalPages) {
            from = pageNumber * RESULTS_PER_PAGE_LIMIT - RESULTS_PER_PAGE_LIMIT;
            to = from + RESULTS_PER_PAGE_LIMIT;
        } else {
            from = pageNumber * RESULTS_PER_PAGE_LIMIT - RESULTS_PER_PAGE_LIMIT;
            to = auditResults.auditRecords.length;
        }
        setSelectedPage(pageNumber);
        setRowsState(mapRowState(auditResults.auditRecords.slice(from, to)));

        window.scrollTo(0, tableRef.current?.offsetTop as number);
    };
    return (
        <>
            {(auditResults.auditRecords.length === 0 ||
                auditResults.auditRecords.length === 200) && (
                <InsetText dataTestId='insetText-notice'>
                    {auditResults.auditRecords.length === 0 ? NO_RESULTS_TEXT : MANY_RESULTS}
                </InsetText>
            )}

            {auditResults.auditRecords.length > 0 && (
                <>
                    <Table
                        caption={{
                            children: `Audit Results`,
                            variant: 'm',
                        }}
                        headers={TABLE_HEADERS}
                        dataTestId='audit-results-table'
                        role='alert'
                        rows={rowsState}
                        tableRef={tableRef}
                    />
                    <Pagination
                        dataTestId='audit-results-table-pagination'
                        onClick={updateTablePageData}
                        resultsPerPage={RESULTS_PER_PAGE_LIMIT}
                        selectedPage={selectedPage}
                        selectedBackgroundColor={
                            BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND
                        }
                        totalPages={totalPages}
                    />
                </>
            )}
        </>
    );
}