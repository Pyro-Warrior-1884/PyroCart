down:
	docker compose down -v

up:
	docker compose build --no-cache

pro:
	docker compose --env-file .env.docker up -d postgres redis opensearch

open:
	curl -X PUT http://localhost:9200/products -H "Content-Type: application/json" -d "{\"settings\":{\"analysis\":{\"analyzer\":{\"product_analyzer\":{\"type\":\"custom\",\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",\"stop\"]}}}},\"mappings\":{\"properties\":{\"id\":{\"type\":\"integer\"},\"name\":{\"type\":\"text\",\"analyzer\":\"product_analyzer\",\"fields\":{\"keyword\":{\"type\":\"keyword\"}}},\"description\":{\"type\":\"text\",\"analyzer\":\"product_analyzer\"},\"price\":{\"type\":\"float\"},\"category\":{\"type\":\"keyword\"},\"createdAt\":{\"type\":\"date\"}}}}"

back:
	docker compose --env-file .env.docker up -d backend

seed:
	docker compose --env-file .env.docker up seed

front:
	cd frontend && npm run dev

setup: down up pro
deploy: open back seed front