import React from 'react';
import {Heading, Paragraph} from '@tact/gds-component-library';
import type {Route} from './+types/home';
import LinkWrapper from '~/components/LinkWrapper';
import {PageNotFoundErrorCode} from '~/constants/error-codes';

export function meta({}: Route.MetaArgs) {
    return [
        {title: 'Page Not Found | AWS Client'}
    ];
}

export default function PageNotFoundPage({
                                             searchParams,
                                         }: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const errorCode = searchParams?.errorCode;
    const correlationId = searchParams?.correlationId;
    const errorMessage = searchParams?.errorMessage;

    const renderRoute = () => {
        switch (errorCode) {
            case PageNotFoundErrorCode.ResourceNotFound:
                return (
                    <>
                        {errorMessage && <Paragraph>{errorMessage}</Paragraph>}

                        <Paragraph>
                            If the problem persists, please contact the help desk to report
                            the problem quoting the following reference:
                        </Paragraph>

                        {correlationId && <Paragraph>{correlationId}</Paragraph>}

                        <LinkWrapper
                            dataTestId='link-resource-not-found'
                            selector='return to the SCR Administration page'
                            href='/'
                        >
                            Alternatively,&nbsp;return to the AWS Client page.
                        </LinkWrapper>
                    </>
                );
            default:
                return (
                    <>
                        <Paragraph>
                            The page you are trying to access does not exist.
                        </Paragraph>

                        <Paragraph>
                            If you typed the web address, check it is correct.
                        </Paragraph>

                        <Paragraph>
                            If you pasted the web address, check you copied the entire
                            address.
                        </Paragraph>

                        <Paragraph>
                            If the web address is correct or you selected a link or button,
                            contact the help desk if you need to report the problem.
                        </Paragraph>

                        <LinkWrapper
                            dataTestId='link-unknown-path'
                            selector='return to the AWS Client page'
                            href='/'
                        >
                            Alternatively,&nbsp;return to the AWS Client page.
                        </LinkWrapper>
                    </>
                );
        }
    };

    return (
        <>
            <Heading>Page Not Found</Heading>
            {renderRoute()}
        </>
    );
}
