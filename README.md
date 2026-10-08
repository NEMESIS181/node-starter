# node-starter

Express + MongoDB (Mongoose) starter template for new services.

## Getting started

```bash
cp .env.example .env
npm install
```

Run with Docker (app + MongoDB, hot reload):

```bash
docker compose up --build
```

Run locally (needs a MongoDB instance; set `MONGO_URL=mongodb://localhost:27017/<db>` in `.env`):

```bash
npm run dev
```

| Script           | Description                     |
| ---------------- | ------------------------------- |
| `npm run dev`    | Start with nodemon (hot reload) |
| `npm start`      | Start with node (production)    |
| `npm run lint`   | Run ESLint                      |
| `npm run format` | Format all files with Prettier  |

Production image: `docker build --target prod -t my-service .`

## Project structure

```
server.js            Entry point: env, DB connection, HTTP server, graceful shutdown
app.js               Express app: middlewares, routes, error handler
config/              Database connection and winston logger
routes/index.js      Registers every resource router under /api/v1
routes/              One router per resource
controllers/         Request handlers
models/              Mongoose models
validators/          zod schemas for request bodies
middlewares/         Error handler, sanitize, validate() and checkId
utils/               AppError, catchAsync, APIFeatures, filterObj, isValidId
```

## Adding a new resource

1. `models/productModel.js` – the Mongoose schema
2. `validators/productValidator.js` – zod schemas for create/update
3. `controllers/productController.js` – request handlers
4. `routes/productRoutes.js` – wire routes to controllers with `validate(schema)` and `router.param('id', checkId)`
5. Register it in `routes/index.js`: `router.use('/products', productRoutes)`

## API conventions

- `GET /health` – health check (returns 503 if the DB is disconnected)
- `APIFeatures` gives list endpoints `?price[gte]=10&sort=-price,name&fields=name,price&page=2&limit=20` (limit is capped at 100):
  `new APIFeatures(Product.find(), req.query).filter().sort().limitFields().paginate().query`
- Throw `new AppError(message, statusCode)` (or pass it to `next`) for expected errors; wrap async handlers in `catchAsync`
- Responses: `{ status: 'success', data }` on success, `{ status: 'fail' | 'error', message }` on error
