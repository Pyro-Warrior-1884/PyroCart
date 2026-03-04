down:
	docker compose down -v

logs:
	docker compose logs -f

run:
	docker compose down
	docker compose --env-file .env.docker up -d --build
