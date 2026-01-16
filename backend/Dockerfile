FROM ubuntu:22.04

# Установка зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Установка standalone ASIO (требуется для Crow)
RUN git clone --depth 1 --branch asio-1-28-0 https://github.com/chriskohlhoff/asio.git /tmp/asio && \
    mkdir -p /usr/include && \
    # В репозитории ASIO структура: asio/include/asio/ и asio/include/asio.hpp
    if [ -d "/tmp/asio/asio/include" ]; then \
        cp -r /tmp/asio/asio/include/asio /usr/include/ && \
        cp /tmp/asio/asio/include/asio.hpp /usr/include/; \
    elif [ -d "/tmp/asio/include" ]; then \
        cp -r /tmp/asio/include/asio /usr/include/ && \
        cp /tmp/asio/include/asio.hpp /usr/include/; \
    else \
        # Ищем директорию asio и файл asio.hpp
        ASIO_DIR=$(find /tmp/asio -type d -name "asio" ! -path "*/.*" | head -1) && \
        ASIO_HPP=$(find /tmp/asio -name "asio.hpp" ! -path "*/.*" | head -1) && \
        cp -r "$ASIO_DIR" /usr/include/ && \
        cp "$ASIO_HPP" /usr/include/; \
    fi && \
    rm -rf /tmp/asio && \
    # Проверяем установку
    test -f /usr/include/asio.hpp && test -d /usr/include/asio

# Клонирование Crow и копирование в include
WORKDIR /tmp
RUN git clone --depth 1 https://github.com/CrowCpp/Crow.git && \
    mkdir -p /app/include && \
    # Копируем всю директорию include (включая crow.h и crow/)
    cp -r Crow/include/* /app/include/ && \
    # Проверяем что скопировалось
    test -f /app/include/crow.h && test -d /app/include/crow && \
    rm -rf Crow

# Рабочая директория
WORKDIR /app

# Копирование файлов проекта
COPY . .

# Сборка проекта
RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    cmake --build . && \
    cmake --install . --prefix /usr/local

# Открытие порта
EXPOSE 18080

# Запуск приложения (исполняемый файл находится в build/)
CMD ["/app/build/SeaBattleBackend"]

