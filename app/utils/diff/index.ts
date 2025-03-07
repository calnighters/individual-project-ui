import * as Diff2Html from "diff2html";

export const buildDiffHtml = (unifiedDiff: string[]): string => {
    const unifiedDiffBuilt = unifiedDiff.join('\n');
    return Diff2Html.html(unifiedDiffBuilt, {
        inputFormat: 'diff',
        showFiles: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
        drawFileList: false,
        context: Number.MAX_SAFE_INTEGER
    });
}