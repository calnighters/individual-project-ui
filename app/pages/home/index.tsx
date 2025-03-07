import React from 'react';
import type {Route} from './+types/home';
import MenuItems from "~/components/MenuItems";

export function meta({}: Route.MetaArgs) {
    return [
        {title: 'AWS Client'},
        {name: 'description', content: 'Application for AWS access'},
    ];
}

const getMenuItems = (): MenuItemObject[] => [
    {
        key: 0,
        description: 'Manage your S3 buckets and objects',
        link: '/s3-buckets',
        pageTitle: 'S3',
        roles: ['s3_admin'],
        title: 'S3',
    },
    {
        key: 1,
        description: 'Search and view audit records',
        link: '/audit',
        pageTitle: 'Audit',
        roles: ['audit_viewer'],
        title: 'Audit',
    }
];

export default function Index() {
    return (
        <MenuItems
            menuItems={getMenuItems()}
        />
    );
}