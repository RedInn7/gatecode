# Gatecode Judge Image
# Supports: C++ (g++ 11, C++17/20), Java (OpenJDK 17), Python 3
#
# Build:
#   docker build -t gatecode-judge:latest \
#     backend/internal/sandbox/docker/
#
# 使用 ubuntu:22.04 保证依赖稳定；alpine 的 musl libc 会导致部分 C++ STL 行为不一致。
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        g++ \
        openjdk-17-jdk-headless \
        python3 \
        wget \
    && rm -rf /var/lib/apt/lists/*

# nlohmann/json — single-header C++ JSON library for the C++ auto-wrap runner
RUN mkdir -p /usr/local/include/nlohmann \
    && wget -q -O /usr/local/include/nlohmann/json.hpp \
       https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp

# Gson — JSON library for the Java auto-wrap runner
RUN wget -q -O /usr/local/lib/gson.jar \
    https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar

# 创建非 root 用户 judge，防止容器逃逸
RUN useradd -m -u 1000 -s /bin/sh judge

# 默认工作目录；运行时代码通过 -v 挂载到 /w
WORKDIR /home/judge

USER judge
