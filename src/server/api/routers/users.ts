import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";


export const usersRouter = createTRPCRouter({

  getUserName: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: {
        id: input
      }
    })

    return data?.name
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.user.findMany() 

    return data.map(post => {
      return {
        id: post.id,
        name: post.name, 
        image: post.image 
      }
    })
  }),

  getUnique: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: {
        id: input
      }
    }) 

    return {
      id: data?.id,
      name: data?.name, 
      image: data?.image 
    }
    
  }),

  getFollowers: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const data = await ctx.prisma.follows.findMany({
      where: {
        followerId: input
      }
    }) 

    return data.map(post => {
      return {
        followerId: post.followerId,
        followingId: post.followingId,
        followerName: post.followerName,
        followerImg: post.followerImg,
        followingName: post.followingName,
        followingImg: post.followingImg,
        isFriend: post.isFriend
      }})
    
  }),

  getFollowing: protectedProcedure.input(z.string()).query(async ({ input, ctx  }) => {
    const data = await ctx.prisma.follows.findMany({
      where: {
        followingId: input
      }
    })

    return data.map(post => {
      return {
        followerId: post.followerId,
        followingId: post.followingId,
        followerName: post.followerName,
        followerImg: post.followerImg,
        followingName: post.followingName,
        followingImg: post.followingImg,
        isFriend: post.isFriend
      }})
  }),

  addFriend: protectedProcedure.input(z.object({ followerId: z.string(), followingId: z.string(), isFriend: z.boolean()})).mutation(async ({ input: {followerId, followingId, isFriend}, ctx}) => {
    return await ctx.prisma.follows.update({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        }
      }, 
      data: {
        isFriend: isFriend
      }
    })
  }),

  createFriend: protectedProcedure.input(z.object({
    followerId: z.string(), 
    followingId: z.string(), 
    followerName: z.string().optional(),
    followingName: z.string().optional(), 
    followerImg: z.string().optional(), 
    followingImg: z.string().optional(),
  })).mutation(async ({ input: {followerId, followingId, followerName, followingName, followerImg, followingImg }, ctx }) => {
    
    return await ctx.prisma.follows.create({
      data: {
        followerId: followerId, 
        followingId: followingId,
        followerName: followerName,
        followingName: followingName, 
        followerImg: followerImg,
        followingImg:  followingImg,
      },
    })
  }), 

  updateExpenditure: protectedProcedure.input(z.number()).mutation( async({ input, ctx }) => {
    return await ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id
      }, 
      data: {
        expenditure: input
      }
    })
  }),
})