export const commonHeaders = async (
    correlationId: string
): Promise<{}> => {
    return {
        'Content-Type': 'application/json',
        'Correlation-Id': correlationId,
    };
};