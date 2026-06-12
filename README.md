# English Word Dashboard

A small NestJS + Vue 3 dashboard for practicing random English words by level.

## Features

- Random English word API.
- Phonetic spelling for each vocabulary word.
- Topic category for each vocabulary word.
- Multi-select filters for English levels and topic categories.
- Sentence count selector for 3 or 4 examples.
- Vue 3 dashboard that calls the NestJS backend.

## Run

```sh
npm install
npm run dev
```

The backend runs on `http://localhost:3000`.
The frontend runs on `http://localhost:5173`.

## API

```txt
GET /api/words/random?filter=a1&sentences=3
GET /api/words/random?levels=A1&levels=B1&categories=food&categories=travel&sentences=4
```

Query options:

- `levels`: one or more of `A1`, `A2`, `B1`, `B2`, `C1`, or `C2`
- `categories`: one or more topic categories, such as `food`, `travel`, or `daily life`
- `filter`: legacy option for `a1`, `a1-a2`, `business`, or `academic`
- `sentences`: `3` or `4`
