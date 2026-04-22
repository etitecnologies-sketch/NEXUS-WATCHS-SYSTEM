import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserDevices,
  createDevice,
  deleteDevice,
  getDeviceCameras,
  createCamera,
  deleteCamera,
  getUserFavorites,
  createFavorite,
  deleteFavorite,
  getUserNotifications,
  markNotificationAsRead,
  getCameraPtzPresets,
  createPtzPreset,
  deletePtzPreset,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  devices: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getUserDevices(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.enum(["dvr", "nvr", "ip_camera"]),
          connectionType: z.enum(["ip", "ddns", "p2p", "qrcode"]),
          ipAddress: z.string().optional(),
          ddnsAddress: z.string().optional(),
          p2pId: z.string().optional(),
          username: z.string().min(1),
          password: z.string().min(1),
          port: z.number().optional().default(8000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createDevice({
          userId: ctx.user.id,
          ...input,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteDevice(input.id, ctx.user.id);
      }),
  }),

  cameras: router({
    listByDevice: publicProcedure
      .input(z.object({ deviceId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getDeviceCameras(input.deviceId, ctx.user.id);
      }),
    create: publicProcedure
      .input(
        z.object({
          deviceId: z.number(),
          name: z.string().min(1),
          channelNumber: z.number(),
          rtspUrl: z.string().optional(),
          resolution: z.enum(["sd", "hd", "fullhd", "4k"]).optional().default("hd"),
          isPtzEnabled: z.boolean().optional().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createCamera({
          userId: ctx.user.id,
          deviceId: input.deviceId,
          name: input.name,
          channelNumber: input.channelNumber,
          rtspUrl: input.rtspUrl,
          resolution: input.resolution,
          isPtzEnabled: input.isPtzEnabled ? 1 : 0,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteCamera(input.id, ctx.user.id);
      }),
  }),

  favorites: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getUserFavorites(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          icon: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createFavorite({
          userId: ctx.user.id,
          ...input,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteFavorite(input.id, ctx.user.id);
      }),
  }),

  notifications: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getUserNotifications(ctx.user.id);
    }),
    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return markNotificationAsRead(input.id, ctx.user.id);
      }),
  }),

  ptz: router({
    listPresets: publicProcedure
      .input(z.object({ cameraId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return getCameraPtzPresets(input.cameraId, ctx.user.id);
      }),
    createPreset: publicProcedure
      .input(
        z.object({
          cameraId: z.number(),
          name: z.string().min(1),
          panPosition: z.number().optional(),
          tiltPosition: z.number().optional(),
          zoomLevel: z.number().optional(),
          presetNumber: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createPtzPreset({
          userId: ctx.user.id,
          cameraId: input.cameraId,
          name: input.name,
          panPosition: input.panPosition,
          tiltPosition: input.tiltPosition,
          zoomLevel: input.zoomLevel,
          presetNumber: input.presetNumber,
        });
      }),
    deletePreset: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deletePtzPreset(input.id, ctx.user.id);
      }),
  }),

  monitoring: router({
    getMetrics: publicProcedure
      .input(z.object({ host: z.string(), hours: z.number().optional().default(24) }))
      .query(async ({ input }) => {
        // In Docker, we use the service name 'nexus-ingest'
        const baseUrl = process.env.INGEST_API_URL || 'http://nexus-ingest:3000';
        try {
          const response = await fetch(`${baseUrl}/api/metrics?host=${input.host}&hours=${input.hours}`);
          if (!response.ok) throw new Error("Failed to fetch metrics");
          return await response.json();
        } catch (error) {
          console.error("Monitoring API error:", error);
          return [];
        }
      }),
    getStatus: publicProcedure
      .input(z.object({ host: z.string() }))
      .query(async ({ input }) => {
        const baseUrl = process.env.INGEST_API_URL || 'http://nexus-ingest:3000';
        try {
          const response = await fetch(`${baseUrl}/api/status?host=${input.host}`);
          if (!response.ok) throw new Error("Failed to fetch status");
          return await response.json();
        } catch (error) {
          console.error("Monitoring API error:", error);
          return null;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
