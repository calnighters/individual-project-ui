import {
    BackLink,
    Breadcrumbs,
    Footer,
    Heading,
    HmrcInternalHeader,
    LandingHeader,
    PageTemplate, Spinner, TagBanner, useHydrated,
    WidthContainer, Wrapper
} from "@tact/gds-component-library";
import {
    BackgroundOrganisationColorClass,
    TextColorPaletteClass
} from "@tact/gds-component-library/dist/theme/colors/color_classes";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ErrorPageRedirectPath} from "~/utils/error-handling";
import {getBreadcrumbs} from "~/utils";

export const nonBreadcrumbAndBackLinkPaths = [
    '/',
    '/expired',
    ErrorPageRedirectPath.ACCESS_FORBIDDEN,
    ErrorPageRedirectPath.PAGE_NOT_FOUND,
    ErrorPageRedirectPath.PROBLEM_WITH_SERVICE,
];

const shouldShowBreadcrumbsOrBackLinks = (pathname: string) => {
    return nonBreadcrumbAndBackLinkPaths.every(
        (path) => !path.includes(pathname),
    );
};

export default function ClientPageTemplate({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {
    const pathname = useLocation().pathname;
    const navigate = useNavigate();
    const hydrated = useHydrated();
    const mainRef = useRef<HTMLElement | null>(null);

    const isSignInRoute = useMemo(() => pathname === '/sign-in', [pathname]);

    const shouldShowBanner = useMemo(
        () =>
            nonBreadcrumbAndBackLinkPaths
                .filter((path) => path !== '/')
                .every((path) => path !== pathname),
        [pathname],
    );

    const shouldShowBackLink = useMemo(
        () => shouldShowBreadcrumbsOrBackLinks(pathname),
        [pathname],
    );

    const [showBreadcrumbs, setShowBreadcrumbs] = useState(
        shouldShowBreadcrumbsOrBackLinks(pathname),
    );

    const [onBackLinkListenerSelected, setOnBackLinkListenerSelected] =
        useState(false);

    useEffect(() => {
        if (showBreadcrumbs && !shouldShowBreadcrumbsOrBackLinks(pathname)) {
            setShowBreadcrumbs(false);
        }
    }, [pathname, showBreadcrumbs]);

    const userId = 'user'; // TODO - take from token
    return (
        <PageTemplate>
            <HmrcInternalHeader
                dataTestId="header"
                service={
                    pathname !== '/' && !isSignInRoute
                        ? {
                            children: 'AWS Client',
                            href: '/',
                        }
                        : undefined
                }
            />
            <main ref={mainRef}>
                {pathname === '/' && (
                    <LandingHeader
                        dataTestId="landing-header"
                        theme={{
                            backgroundColor: BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,

                        }}>
                        <Heading
                            theme={{
                                color: TextColorPaletteClass.WHITE_TEXT,
                            }}
                        >
                            Welcome to AWS Client
                        </Heading>
                    </LandingHeader>
                )}
                <WidthContainer>
                    {userId && shouldShowBanner && (
                        <TagBanner
                            dataTestId='banner'
                            {...(pathname !== '/' && {
                                link: {
                                    text: 'Home',
                                    handleOnClick: () => navigate('/'),
                                },
                            })}
                            tags={[
                                {
                                    tagBackgroundColor:
                                    BackgroundOrganisationColorClass.HM_REVENUE_CUSTOMS_BACKGROUND,
                                    tagTextColor: TextColorPaletteClass.WHITE_TEXT,
                                    text: userId,
                                    title: 'USER',
                                },
                            ]}
                        />
                    )}
                    {showBreadcrumbs ? (
                        <Breadcrumbs
                            dataTestId='breadcrumbs'
                            links={getBreadcrumbs(pathname, navigate)}
                        />
                    ) : (shouldShowBackLink && (
                            <BackLink
                                dataTestId='back-link'
                                href={pathname}
                                {...(hydrated && {
                                    onClick: (
                                        formEvent: React.MouseEvent<HTMLAnchorElement>,
                                    ) => {
                                        formEvent.preventDefault();

                                        setOnBackLinkListenerSelected(
                                            !onBackLinkListenerSelected,
                                        );
                                    },
                                })}
                            >
                                Back
                            </BackLink>)
                    )}
                    <Wrapper dataTestId='wrapper'>
                        {children}
                    </Wrapper>
                </WidthContainer>
            </main>
            <Footer
                dataTestId='footer'
                links={[]}
            />
        </PageTemplate>
    )
        ;
}