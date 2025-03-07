import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("pages/home/index.tsx"),
    route("s3-buckets", "pages/s3/bucket-browser/index.tsx"),
    route("s3-buckets/:bucketName", "pages/s3/object-browser/index.tsx"),
    route("s3-buckets/:bucketName/edit", "pages/s3/object-editor/index.tsx"),
    route("s3-buckets/:bucketName/upload", "pages/s3/upload-object/index.tsx"),
    route("s3-buckets/:bucketName/change-confirmation", "pages/s3/change-confirmation/index.tsx"),
    route("s3-buckets/:bucketName/change-complete/*", "pages/s3/change-complete/index.tsx"),
    route("audit", "pages/audit/audit-viewer/index.tsx"),
    route("audit/diff/*", "pages/audit/audit-diff/index.tsx"),
    route("problem-with-service", "pages/error/problem-with-service/index.tsx"),
    route("page-not-found", "pages/error/page-not-found/index.tsx"),
    route("access-forbidden", "pages/error/access-forbidden/index.tsx"),
] satisfies RouteConfig;