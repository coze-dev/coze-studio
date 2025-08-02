# Stage 1: Builder for Go application
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies for Go
RUN apk add --no-cache git gcc libc-dev

# Copy go.mod and go.sum first to leverage Docker cache
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy the entire backend source code
COPY backend/ ./

# Build the Go application
RUN go build -ldflags="-s -w" -o /app/opencoze main.go


# Stage 2: Final image
FROM alpine:3.22.0

WORKDIR /app

# Install runtime dependencies for Go app and base for Python
# pax-utils for scanelf, python3 for running Python, python3-dev for headers/shared libs
# bind-tools for nslookup etc., file for debugging file types
RUN apk add --no-cache pax-utils python3 python3-dev bind-tools file deno curl

# Install Python build dependencies, create venv, install packages, then remove build deps
RUN apk add --no-cache --virtual .python-build-deps build-base py3-pip git && \
    python3 -m venv --copies --upgrade-deps /app/.venv && \
    # Activate venv and install packages
    . /app/.venv/bin/activate && \
    # If you want to use other third-party libraries, you can install them here.
    pip install urllib3==1.26.16 && \
    pip install --no-cache-dir h11==0.16.0 httpx==0.28.1 pillow==11.2.1 pdfplumber==0.11.7 python-docx==1.2.0 numpy==2.3.1 && \
    # Deactivate (optional, as RUN is a new shell)
    # deactivate && \
    # Remove build dependencies
    apk del .python-build-deps


# Copy the built Go binary from the builder stage
COPY --from=builder /app/opencoze /app/opencoze

# Copy Python application scripts
COPY backend/infra/impl/document/parser/builtin/parse_pdf.py /app/parse_pdf.py
COPY backend/infra/impl/document/parser/builtin/parse_docx.py /app/parse_docx.py
COPY backend/infra/impl/coderunner/script/sandbox.py /app/sandbox.py


# Copy static resources
COPY backend/static /app/resources/static/
COPY backend/conf /app/resources/conf/
COPY docker/.env.example /app/.env
# COPY docker/.env.ve /app/.env
# COPY docker/cert.pem /app/cert.pem
# COPY docker/key.pem /app/key.pem

# Set PATH to prioritize venv's binaries
ENV PATH="/app/.venv/bin:${PATH}"
# ENV LD_LIBRARY_PATH="/usr/lib:${LD_LIBRARY_PATH}" # Keep commented for now

# Ensure python scripts and venv executables are executable
RUN chmod +x /app/parse_pdf.py /app/parse_docx.py  && \
    find /app/.venv/bin -type f -exec chmod +x {} \;


EXPOSE 8888

CMD ["/app/opencoze"]
