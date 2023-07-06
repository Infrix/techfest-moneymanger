import { CiText } from "react-icons/ci";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";


export const paymentRouter = createTRPCRouter({

  getPayments: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const data1 = await ctx.prisma.payment.findMany({
      where: {
        userId: input
      }
    })

    const data2 = await ctx.prisma.payment.findMany({
      where: {
        payeeId: input 
      }
    })

    return {
      owe: data2.map(post => ({
        id: post.id,
        amount: post.amount,
        resolved: post.resolved, 
        userId: post.userId, 
        payeeId: post.payeeId,
        note: post.note,
        validated: post.validated,
        date: post.createdAt
      })),

      collect: data1.map(post => ({
        id: post.id,
        amount: post.amount,
        resolved: post.resolved, 
        userId: post.userId, 
        payeeId: post.payeeId,
        note: post.note,
        validated: post.validated,
        date: post.createdAt
      }))
    }

  }),

  getPayee: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const data = await ctx.prisma.payment.findMany({
      where: {
        spendingId: input
      }})

      return data.map(post => ({
        id: post.id,
        amount: post.amount,
        resolved: post.resolved, 
        userId: post.userId, 
        payeeId: post.payeeId,
        note: post.note,
        validated: post.validated
      }))
    }),

  create: protectedProcedure.input(z.object({
    amount: z.number(),
    userId: z.string(), 
    payeeId: z.string(), 
    spendingID: z.string(),
    note: z.string(),
    date: z.string().transform(str => new Date(str)),
  })).mutation(async ({input: {amount, spendingID, userId, payeeId, note, date}, ctx}) => {
    
    return await ctx.prisma.payment.create({
      data: {
        userId: userId,
        payeeId: payeeId,
        amount: amount,
        spendingId: spendingID,
        note: note,
        createdAt: date
      }
    })
  }),

  resolve: protectedProcedure.input(z.string()).mutation( async ({ input, ctx }) => {
    return await ctx.prisma.payment.update({
      where: {
        id: input
      },
      data: {
        resolved: true
      }
    })
  }),

  validate: protectedProcedure.input(z.string()).mutation( async ({ input, ctx }) => {
    return await ctx.prisma.payment.update({
      where: {
        id: input
      },
      data: {
        validated: true
      }
    })
  }),

})