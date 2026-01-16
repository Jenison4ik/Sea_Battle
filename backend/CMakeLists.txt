cmake_minimum_required(VERSION 3.15)
project(SeaBattleBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Поиск зависимостей
find_package(Boost REQUIRED COMPONENTS system)
find_package(Threads REQUIRED)

# Поиск Crow (локально в include или системно)
# Ищем crow.h в include директории
find_path(CROW_HEADER_DIR crow.h
    PATHS
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    /usr/local/include
    /usr/include
    NO_DEFAULT_PATH
)

if(NOT CROW_HEADER_DIR)
    # Пробуем найти в системных путях
    find_path(CROW_HEADER_DIR crow.h
        PATHS
        /usr/local/include
        /usr/include
    )
endif()

if(CROW_HEADER_DIR)
    message(STATUS "Found Crow header at ${CROW_HEADER_DIR}")
    # CROW_HEADER_DIR указывает на директорию где находится crow.h
    # Это и есть нужная include директория
    set(CROW_INCLUDE_DIR ${CROW_HEADER_DIR})
else()
    message(FATAL_ERROR "Crow library not found. Please install Crow or copy to include/")
endif()

# Исходные файлы
set(SOURCES
    main.cpp
    src/types.cpp
)

# Заголовочные файлы
set(HEADERS
    include/types.h
    include/session_manager.h
    include/game_engine.h
    include/json_serializer.h
)

# Исполняемый файл
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

# Включаемые директории
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CROW_INCLUDE_DIR}
    ${Boost_INCLUDE_DIRS}
)

# Линковка библиотек
target_link_libraries(${PROJECT_NAME} PRIVATE
    ${Boost_LIBRARIES}
    Threads::Threads
)

# Флаги компиляции
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra)
endif()

