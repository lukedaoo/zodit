export const StatusMessage = ({ isLoading, error }: { isLoading: boolean; error?: string | null }) => {
    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
    if (error) return <div className="text-center py-12 text-muted-foreground">{error}</div>;
    return null;
};
