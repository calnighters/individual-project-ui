import { type ForwardedRef, forwardRef } from 'react';
import { Link, useHydrated } from '@tact/gds-component-library';

import type { LinkProps } from '@tact/gds-component-library/dist/components/Link';

const LinkWrapper = forwardRef(function LinkWrapped(
  { children, onClick, ...rest }: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const hydrated = useHydrated();
  return (
    <Link
      {...(hydrated &&
        !!onClick && {
          onClick: (formEvent: React.MouseEvent<HTMLAnchorElement>) => {
            onClick(formEvent);
          },
        })}
      innerRef={ref}
      {...rest}
    >
      {children}
    </Link>
  );
});

export default LinkWrapper;
