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
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户 judge，防止容器逃逸
RUN useradd -m -u 1000 -s /bin/sh judge

# 默认工作目录；运行时代码通过 -v 挂载到 /w
WORKDIR /home/judge

USER judge
