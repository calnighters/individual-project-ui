import type {NavigateFunction} from "react-router";
import {useMemo} from "react";
import {redirect} from "react-router-dom";

export const handleApiErrorClientSide = () => {
    redirect('/expired');
};

export const getBreadcrumbs = (pathname: string, router: NavigateFunction) => {
    const rootBreadcrumb = {
        text: 'AWS Client',
        handleOnClick: () => router('/'),
        key: '0',
    };

    const segments = pathname.split('/');

    if (pathname === '/') return [rootBreadcrumb];

    segments.pop();

    return segments.map((path, index) => {
        if (index === 0) return rootBreadcrumb;

        return {
            text: path
                .replace(/-/g, ' ')
                .split(' ')
                .join(' ')
                .replace(/(^\w{1})|(\s+\w{1})/g, (firstLetter) =>
                    firstLetter.toUpperCase(),
                ),
            handleOnClick: () =>
                router(
                    `${segments.slice(0, segments.indexOf(path) + 1).join('/')}`,
                ),
            key: index.toString(),
        };
    });
};

export const onToggleExpand = (
    event: React.SyntheticEvent<HTMLDetailsElement>,
    expandDetails: boolean,
    setExpandDetails: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    if (expandDetails && !(event.currentTarget as HTMLDetailsElement).open) {
        setExpandDetails(!expandDetails);
    }
};

export const setPageTitle = (error: boolean, title: string) => {
    if (error) return `Error: ${title}`;
    return title;
};

export const useQuery = (search: string) => {
    return useMemo(() => new URLSearchParams(search), [search]);
}
