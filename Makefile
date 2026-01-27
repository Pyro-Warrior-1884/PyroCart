down:
	docker compose down -v

up:
	docker compose build --no-cache

prm:
	docker compose --env-file .env.docker up -d postgres redis minio

back:
	docker compose --env-file .env.docker up -d backend

seed:
	docker compose --env-file .env.docker up seed

setup:
	cd backend && npm install

front:
	cd frontend && npm run dev
