import pkg from 'lodash';

const {chunk} = pkg;

import {GridCol, GridRow, Link, Paragraph} from '@tact/gds-component-library';

const NUMBER_OF_COLUMNS = 3;

interface MenuItemsProps {
    menuItems: MenuItems;
}

export default function MenuItems({menuItems}: MenuItemsProps) {
    return chunk(menuItems, NUMBER_OF_COLUMNS).map((row, index) => (
        <GridRow key={index}>
            {row.map((item) => (
                <GridCol key={item.key} setWidth='one-third'>
                    <Link
                        dataTestId={`menu-item-${item.key}`}
                        href={item.link}
                        font={{fontWeight: 'bold'}}
                        unwrapped
                    >
                        {item.title}
                    </Link>
                    <Paragraph font={{fontSize: '16'}}>{item.description}</Paragraph>
                </GridCol>
            ))}
        </GridRow>
    ));
}
