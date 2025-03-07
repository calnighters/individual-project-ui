import React, {useEffect} from 'react';
import { Heading, Paragraph } from '@tact/gds-component-library';
import type {Route} from './+types/home';
import LinkWrapper from '~/components/LinkWrapper';
import { ErrorPageRedirectPath } from '~/utils/error-handling';
import { ProblemWithServiceErrorCode } from '~/constants/error-codes';
import {useNavigate} from "react-router-dom";


export function meta({}: Route.MetaArgs) {
  return [
    {title: 'Problem With Service | AWS Client'}
  ];
}

export default function ProblemWithServicePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const errorCode = searchParams?.errorCode;
  const correlationId = searchParams?.correlationId;
  const errorMessage = searchParams?.errorMessage;
  const unknownRoles = searchParams?.unknownRoles;
  const navigate = useNavigate();

  useEffect(() => {
    if (!errorCode) navigate(ErrorPageRedirectPath.PAGE_NOT_FOUND);
  }, [errorCode, navigate]);

  const renderRoute = () => {
    switch (errorCode) {
      case ProblemWithServiceErrorCode.Unexpected:
        return (
          <>
            {errorMessage && <Paragraph>{errorMessage}</Paragraph>}

            <Paragraph>
              If the problem persists, please contact the help desk to report
              the problem quoting the following reference:
            </Paragraph>

            {correlationId && <Paragraph>{correlationId}</Paragraph>}

            <NextLink href='/' passHref legacyBehavior>
              <LinkWrapper
                dataTestId='link-unexpected'
                selector='Return to the AWS Client page'
              >
                Return to the AWS Client page.
              </LinkWrapper>
            </NextLink>
          </>
        );
      default: {
        let roleMessage =
          'An unknown role name has been provided to the AWS Client.';

        if (unknownRoles) {
          const unknownRolesList = (unknownRoles as string).split(',') ?? [];
          roleMessage =
            unknownRolesList.length === 1
              ? `An unknown role name has been provided to the AWS Client: ${unknownRoles as string}.`
              : `Unknown role names have been provided to the AWS Client: ${unknownRolesList.join(', ')}.`;
        }

        return (
          <>
            <Paragraph>{roleMessage}</Paragraph>

            <Paragraph>
              Please contact the help desk to report the problem.
            </Paragraph>
          </>
        );
      }
    }
  };

  return (
    <>
      <Heading>Problem With Service</Heading>
      {renderRoute()}
    </>
  );
}
