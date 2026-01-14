```bash
docker compose down -v
docker compose --env-file .env.docker up -d postgres redis minio
docker compose --env-file .env.docker up seed
docker compose --env-file .env.docker up -d backend
```
