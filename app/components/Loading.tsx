import { Heading, SectionBreak, Spinner } from '@tact/gds-component-library';

interface Loading {
  heading?: string;
}

export default function Loading({ heading = 'Loading' }: Loading) {
  return (
    <>
      <Heading>{heading}</Heading>
      <SectionBreak size='xl' />
      <Spinner centerAlign dataTestId='page-spinner' />
      <SectionBreak size='xl' />
    </>
  );
}
