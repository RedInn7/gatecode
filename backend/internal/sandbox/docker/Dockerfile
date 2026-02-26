# Gatecode Judge Image
# Supports: C++ (g++ 14, C++23 + PCH), Java (OpenJDK 21), Python 3
#
# Build:
#   docker build -t gatecode-judge:latest \
#     backend/internal/sandbox/docker/
#
# Ubuntu 24.04 + g++-14 for full C++23 support (deducing this, etc.).
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        g++-14 \
        openjdk-21-jdk-headless \
        python3 python3-pip python3-venv \
        wget \
    && update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-14 100 \
    && update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-14 100 \
    && pip3 install --break-system-packages --no-cache-dir sortedcontainers \
    && rm -rf /var/lib/apt/lists/*

# Pre-compile C++ bits/stdc++.h as a precompiled header (PCH).
# This reduces C++ compilation time from ~3-4s to ~0.5-1s per problem.
# The PCH is compiled with the same flags used in LangConfig.CompileCmd.
# Uses find to locate the arch-specific header (x86_64 or aarch64).
RUN STDC_H=$(find /usr/include -name 'stdc++.h' -path '*/bits/*' | head -1) \
    && g++ -O2 -std=c++23 -x c++-header "$STDC_H" -o "${STDC_H}.gch"

# nlohmann/json — single-header C++ JSON library for the C++ auto-wrap runner
RUN mkdir -p /usr/local/include/nlohmann \
    && wget -q -O /usr/local/include/nlohmann/json.hpp \
       https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp

# Gson — JSON library for the Java auto-wrap runner
RUN wget -q -O /usr/local/lib/gson.jar \
    https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar

# 创建非 root 用户 judge，防止容器逃逸
RUN useradd -m -s /bin/sh judge 2>/dev/null || true

# Working directory for code execution; files are copied via docker cp
RUN mkdir -p /w && chmod 777 /w
WORKDIR /home/judge

USER judge
