import React, {useEffect} from 'react';
import {Heading, Paragraph} from '@tact/gds-component-library';
import type {Route} from './+types/home';
import LinkWrapper from '~/components/LinkWrapper';
import {ErrorPageRedirectPath} from '~/utils/error-handling';
import {AccessForbiddenErrorCode} from '~/constants/error-codes';

import {useNavigate} from "react-router-dom";

export function meta({}: Route.MetaArgs) {
    return [
        {title: 'Access Forbidden | AWS Client'}
    ];
}

export default function AccessForbiddenPage({
                                                searchParams,
                                            }: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const errorCode = searchParams?.errorCode;
    const correlationId = searchParams?.correlationId;
    const navigate = useNavigate();

    useEffect(() => {
        if (!errorCode) navigate(ErrorPageRedirectPath.PAGE_NOT_FOUND);
    }, [errorCode, navigate]);

    const renderRoute = () => {
        switch (errorCode) {
            case AccessForbiddenErrorCode.UnauthorisedRole:
                return (
                    <>
                        <Paragraph>
                            Your selected role does not allow access to this page.
                        </Paragraph>

                        <LinkWrapper
                            dataTestId='link-unauthorised-role'
                            selector='Return to the AWS Client page'
                            href='/'
                        >
                            Return to the SCR Administration page.
                        </LinkWrapper>
                    </>
                );
            case AccessForbiddenErrorCode.NoRolesExist:
                return (
                    <>
                        <Paragraph>
                            No roles have been provided to the SCR service.
                        </Paragraph>

                        <Paragraph>
                            Please contact the help desk to report the problem.
                        </Paragraph>
                    </>
                );
            case AccessForbiddenErrorCode.UnknownError:
                return (
                    <>
                        <Paragraph>An unknown error has occurred.</Paragraph>

                        {correlationId && (
                            <>
                                <Paragraph>
                                    If the problem persists, please contact the help desk to
                                    report the problem quoting the following reference:
                                </Paragraph>

                                <Paragraph>{correlationId}</Paragraph>
                            </>
                        )}

                        {!correlationId && (
                            <Paragraph>
                                If the problem persists, please contact the help desk to report
                                the problem.
                            </Paragraph>
                        )}

                        <LinkWrapper
                            dataTestId='link-unknown-error'
                            selector='Return to the SCR Administration page'
                            href='/'
                        >
                            Return to the SCR Administration page.
                        </LinkWrapper>
                    </>
                );
            default:
                return (
                    <>
                        <Paragraph>
                            An error has occurred in the authorisation provider.
                        </Paragraph>

                        <Paragraph>
                            If the problem persists, please contact the help desk to report
                            the problem.
                        </Paragraph>

                        <LinkWrapper
                            dataTestId='link-authorisation-error'
                            selector='Return to the SCR Administration page'
                            href='/'
                        >
                            Return to the SCR Administration page.
                        </LinkWrapper>
                    </>
                );
        }
    };

    return (
        <>
            <Heading>Access Forbidden</Heading>
            {renderRoute()}
        </>
    );
}
