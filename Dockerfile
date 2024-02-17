FROM python:3.11-slim

ENV PORT 8080

RUN apt update && apt install -y libpq-dev

RUN pip install poetry==1.6.1

RUN poetry config virtualenvs.create false

WORKDIR /code

COPY ./pyproject.toml ./README.md ./poetry.lock* ./

COPY ./package[s] ./packages

COPY ./source_docs ./source_docs

RUN poetry install  --no-interaction --no-ansi --no-root

COPY ./app ./app

RUN poetry install --no-interaction --no-ansi

EXPOSE $PORT

CMD exec uvicorn app.server:app --host 0.0.0.0 --port $PORT
