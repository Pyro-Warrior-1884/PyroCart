down:
	docker compose down -v

run:
	docker compose --env-file .env.docker up -d --build

logs:
	docker compose logs -f

run:
	docker compose down
	docker compose --env-file .env.docker up -d --build