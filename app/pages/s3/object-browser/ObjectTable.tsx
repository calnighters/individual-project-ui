import React from "react";

const {FormEvent} = React;
import {useEffect, useMemo, useRef, useState} from "react";
import type {TableRow} from "@tact/gds-component-library";
import {InsetText, Pagination, Table} from "@tact/gds-component-library";
import {BackgroundOrganisationColorClass} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import {ColFormat} from "~/components/ColFormat";
import LinkWrapper from "~/components/LinkWrapper";
import {useNavigate} from "react-router-dom";
import type {NavigateFunction} from "react-router";
import {
    MANY_RESULTS,
    NO_RESULTS_TEXT,
    RESULTS_PER_PAGE_LIMIT,
    TABLE_HEADERS
} from "~/constants/pages/s3/object-browser";

const onRowClick = (bucketName: string, objectResponse: ObjectRecord, navigate: NavigateFunction) => {
    navigate(`/s3-buckets/${bucketName}/edit`, {state: {objectResponse}});
};

const mapRowData = (bucketName: string, objectResponse: ObjectRecord, hydrated: boolean, navigate: NavigateFunction) => {
    const objectKey = (
        <ColFormat minWidth='85'>
            {objectResponse.objectKey}
        </ColFormat>
    );
    const objectSize = (
        <ColFormat minWidth='85'>
            {objectResponse.objectSize.toString()}
        </ColFormat>
    );
    const lastModifiedTimestamp = (
        <ColFormat minWidth='85'>
            {objectResponse.lastModifiedTimestamp.replace('T', ' ')}
        </ColFormat>
    );
    const viewBucketContent = (
        <ColFormat minWidth='50'>
            <LinkWrapper
                dataTestId='view-object-link'
                href={`/s3-buckets/${bucketName}/edit`}
                {...(hydrated && {
                    onClick: (formEvent) => {
                        formEvent.preventDefault();

                        onRowClick(bucketName, objectResponse, navigate);
                    },
                })}
                font={{fontWeight: 'bold'}}
                unwrapped
            >
                View File
            </LinkWrapper>
        </ColFormat>
    )

    return [
        {index: 0, variant: 'td', children: objectKey},
        {index: 1, variant: 'td', children: objectSize},
        {index: 2, variant: 'td', children: lastModifiedTimestamp},
        {index: 3, variant: 'td', children: viewBucketContent}
    ];
};

const mapRowState = (bucketName: string, rowsData: ObjectRecord[], hydrated: boolean, navigate: NavigateFunction): TableRow[] =>
    rowsData.map((value) => ({
        index: value.objectKey,
        cells: mapRowData(bucketName, value, hydrated, navigate),
    })) as TableRow[];

export default function ObjectTable({
                                        bucketName,
                                        objectResults,
                                        hydrated
                                    }: {
    bucketName: string;
    objectResults: ObjectSearchResponse;
    hydrated: boolean;
}) {
    const tableRef = useRef<HTMLTableElement>(null);
    const navigate = useNavigate();
    const [rowsState, setRowsState] = useState(
        mapRowState(bucketName, objectResults.objects.slice(0, RESULTS_PER_PAGE_LIMIT), hydrated, navigate)
    );
    const [selectedPage, setSelectedPage] = useState<number>(1);

    const totalPages = useMemo(() => {
        const totalPagesRemainder =
            objectResults.objects.length % RESULTS_PER_PAGE_LIMIT;

        if (totalPagesRemainder === 0) {
            return objectResults.objects.length / RESULTS_PER_PAGE_LIMIT;
        }

        return Math.floor(objectResults.objects.length / RESULTS_PER_PAGE_LIMIT) + 1;
    }, [objectResults.objects]);

    useEffect(() => {
        if (tableRef.current?.offsetTop) {
            window.scrollTo(0, tableRef.current?.offsetTop - 120);
        }
    }, [objectResults]);

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
            to = objectResults.objects.length;
        }
        setSelectedPage(pageNumber);
        setRowsState(mapRowState(bucketName, objectResults.objects.slice(from, to), hydrated, navigate));

        window.scrollTo(0, tableRef.current?.offsetTop as number);
    };
    return (
        <>
            {(objectResults.objects.length === 0 ||
                objectResults.objects.length === 200) && (
                <InsetText dataTestId='insetText-notice'>
                    {objectResults.objects.length === 0 ? NO_RESULTS_TEXT : MANY_RESULTS}
                </InsetText>
            )}

            {objectResults.objects.length > 0 && (
                <>
                    <Table
                        caption={{
                            children: `Contents of ${bucketName}`,
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