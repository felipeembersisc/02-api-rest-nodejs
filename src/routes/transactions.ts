import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'
import { knexDb } from '../database.ts'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists.ts'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sessionId } = request.cookies

      const transactions = await knexDb('transactions')
        .where('session_id', sessionId)
        .select('*')

      return reply.status(200).send(transactions)
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sessionId } = request.cookies

      const getTransactionParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knexDb('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return reply.status(200).send(transaction)
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sessionId } = request.cookies

      const summary = await knexDb('transactions')
        .where({ session_id: sessionId })
        .sum('amount', { as: 'amount' })
        .first()

      return reply.status(200).send(summary)
    },
  )

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })

      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      let { sessionId } = request.cookies

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
    },
  )
}
