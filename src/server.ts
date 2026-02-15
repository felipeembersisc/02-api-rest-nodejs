import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env/index.ts'
import { transactionsRoutes } from './routes/transactions.ts'

const app = fastify()

app.register(cookie)

app.register(transactionsRoutes)

app.listen({ port: env.PORT }).then(() => {
  console.log('HTTP Server Running')
})
