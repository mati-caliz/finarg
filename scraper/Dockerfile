FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY shared ./shared
RUN pip install "./shared[migrations]"

COPY scraper/pyproject.toml ./
COPY scraper/labrecha_scraper ./labrecha_scraper

RUN pip install .

ENTRYPOINT ["labrecha-scraper"]
CMD ["run", "all"]
