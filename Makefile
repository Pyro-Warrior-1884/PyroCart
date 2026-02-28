down:
	docker compose down -v

build:
	docker compose --env-file .env.docker build --no-cache

up:
	docker compose --env-file .env.docker up -d

run:
	docker compose --env-file .env.docker up -d --build

logs:
	docker compose logs -f

restart:
	docker compose down
	docker compose --env-file .env.docker up -d --build

clean:
	docker system prune -af