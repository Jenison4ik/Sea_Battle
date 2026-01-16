# Stage 1: Сборка фронтенда
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
# Это делается отдельно для кэширования слоя Docker
COPY frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код фронтенда
COPY frontend/ ./

# Собираем фронтенд (результат будет в /app/dist)
RUN npm run build

# Stage 2: Nginx для раздачи статики
FROM nginx:alpine

# Копируем собранные файлы из stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

# Nginx запускается автоматически
CMD ["nginx", "-g", "daemon off;"]

