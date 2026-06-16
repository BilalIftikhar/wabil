# WABIL Laravel 11 API
FROM php:8.3-cli-alpine

RUN apk add --no-cache postgresql-dev libzip-dev zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader || true

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
