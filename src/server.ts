import fastify from 'fastify'
import crypto from 'node:crypto'
import { knexDb } from './database.ts'

const app = fastify()

app.post('/', async () => {
  const transaction = await knexDb('transactions')
    .insert({
      id: crypto.randomUUID(),
      title: 'Transação de teste',
      amount: 1000,
    })
    .returning('*')

  return transaction
})

app.get('/', async () => {
  const transcations = await knexDb('transactions').select('*')

  return transcations
})

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server Running')
})
