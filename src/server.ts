import fastify from 'fastify'
import { env } from './env/index.ts'
import { transactionsRoutes } from './routes/transactions.ts'

const app = fastify()

app.register(transactionsRoutes)

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP Server Running')
})
