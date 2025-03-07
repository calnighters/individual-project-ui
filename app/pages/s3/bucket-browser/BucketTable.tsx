import React from "react";

const {FormEvent} = React;
import {useEffect, useMemo, useRef, useState} from "react";
import type {TableRow} from "@tact/gds-component-library";
import {InsetText, Pagination, Table} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {ColFormat} from "~/components/ColFormat";
import {
    RESULTS_PER_PAGE_LIMIT,
    MANY_RESULTS,
    NO_RESULTS_TEXT,
    TABLE_HEADERS
} from "~/constants/pages/s3/bucket-browser";
import LinkWrapper from "~/components/LinkWrapper";

const mapRowData = (bucketResponse: BucketRecord) => {
    const bucketName = (
        <ColFormat minWidth='85'>
            {bucketResponse.name}
        </ColFormat>
    );
    const viewBucketContent = (
        <ColFormat minWidth='50'>
            <LinkWrapper
                dataTestId='view-bucket-content-link'
                href={`/s3-buckets/${bucketResponse.name}`}
                font={{fontWeight: 'bold'}}
                unwrapped
            >
                View Contents
            </LinkWrapper>
        </ColFormat>
    )

    return [
        {index: 0, variant: 'td', children: bucketName},
        {index: 1, variant: 'td', children: viewBucketContent},
    ];
};

const mapRowState = (rowsData: BucketRecord[]): TableRow[] =>
    rowsData.map((value) => ({
        index: value.name,
        cells: mapRowData(value),
    })) as TableRow[];

export default function BucketTable({
                                        bucketResults
                                    }: {
    bucketResults: BucketSearchResponse;
}) {
    const tableRef = useRef<HTMLTableElement>(null);
    const [rowsState, setRowsState] = useState(
        mapRowState(bucketResults.buckets.slice(0, RESULTS_PER_PAGE_LIMIT))
    );
    const [selectedPage, setSelectedPage] = useState<number>(1);

    const totalPages = useMemo(() => {
        const totalPagesRemainder =
            bucketResults.buckets.length % RESULTS_PER_PAGE_LIMIT;

        if (totalPagesRemainder === 0) {
            return bucketResults.buckets.length / RESULTS_PER_PAGE_LIMIT;
        }

        return Math.floor(bucketResults.buckets.length / RESULTS_PER_PAGE_LIMIT) + 1;
    }, [bucketResults.buckets]);

    useEffect(() => {
        if (tableRef.current?.offsetTop) {
            window.scrollTo(0, tableRef.current?.offsetTop - 120);
        }
    }, [bucketResults]);

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
            to = bucketResults.buckets.length;
        }

        setSelectedPage(pageNumber);
        setRowsState(mapRowState(bucketResults.buckets.slice(from, to)));

        window.scrollTo(0, tableRef.current?.offsetTop as number);
    };
    return (
        <>
            {(bucketResults.buckets.length === 0 ||
                bucketResults.buckets.length === 200) && (
                <InsetText dataTestId='insetText-notice'>
                    {bucketResults.buckets.length === 0 ? NO_RESULTS_TEXT : MANY_RESULTS}
                </InsetText>
            )}

            {bucketResults.buckets.length > 0 && (
                <>
                    <Table
                        caption={{
                            children: 'S3 Buckets',
                            variant: 'xl',
                        }}
                        headers={TABLE_HEADERS}
                        dataTestId='bucket-records-table'
                        role='alert'
                        rows={rowsState}
                        tableRef={tableRef}
                    />
                    <Pagination
                        dataTestId='bucket-records-table-pagination'
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