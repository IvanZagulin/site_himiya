# Легкая химия

Проект сайта и API для курса химии.

## Структура

- `frontend/` - статический сайт и админка, публикуется в `/var/www/legkaya-himiya`.
- `backend/` - FastAPI backend.
- `docker-compose.yml` - production-сервисы backend и Postgres.
- `scripts/deploy_server.sh` - синхронизация кода из репозитория в рабочие папки сервера.

## Деплой на сервере

```bash
cd /home/ivanzagulin/site_himiya
git pull
bash scripts/deploy_server.sh
```

Файл `.env` остается только на сервере в `/home/ivanzagulin/legkaya-himiya/.env` и не хранится в репозитории.
