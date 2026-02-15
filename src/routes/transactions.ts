import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'
import { knexDb } from '../database.ts'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const transactions = await knexDb('transactions').select('*')

    return reply.status(200).send(transactions)
  })

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const getTransactionParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knexDb('transactions').where({ id }).first()

    return reply.status(200).send(transaction)
  })

  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const summary = await knexDb('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return reply.status(200).send(summary)
  })

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knexDb('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
