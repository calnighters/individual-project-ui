

export const commonHeaders = async (
    correlationId: string
): Promise<{}> => {
    const accessToken = "Test"
    return {
        // Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Correlation-Id': correlationId,
    };
};