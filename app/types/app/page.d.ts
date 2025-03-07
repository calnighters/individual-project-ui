type ColorPalette = {
    hmrc: {
        hmrcGreenColour: string;
    };
    palette: {
        govukWhiteColour: string;
    };
};

interface MenuItemObject {
    description: string;
    key: number;
    link: string;
    pageTitle?: string;
    roles: Roles[];
    title: string;
}

type MenuItems = MenuItemObject[];
