# Individual Project UI

This UI is the frontend of my project DC3IPR. It interacts with the API to upload, view and modify files. The service also audits requests and can search on them later.

## Building

```shell

npm run build

docker build -f docker/build/Dockerfile -t <REGISTRY>/user-interface:<VERSION> .
docker push <REGISTRY>/user-interface:<VERSION>
```