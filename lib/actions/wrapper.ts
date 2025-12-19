import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

type Role = "admin" | "mandor" | "pelanggan";

// Simple in-memory rate limiting
const rateLimit = 10; // Max requests per window
const rateLimitWindow = 60 * 1000; // 1 minute in milliseconds
const rateLimits = new Map<string, { timestamps: number[] }>();

type SuccessResponse = {
  success: true;
  data: unknown;
};

type ErrorResponse = {
  success: false;
  error: string;
  status: number;
  details?: unknown;
};

type ApiResponse = SuccessResponse | ErrorResponse;

export function withAuthAction<T = unknown>(
  handler: (data: T, userId: string, role: Role) => Promise<unknown>,
  options: {
    roles?: Role[];
    schema?: z.ZodSchema<T>;
  } = {}
): (data: T) => Promise<ApiResponse> {
  return async (data: T): Promise<ApiResponse> => {
    try {
      // Rate limiting check
      const ip = getClientIp();
      const now = Date.now();
      const rateLimitData = rateLimits.get(ip) || { timestamps: [] };

      // Remove old timestamps
      const recentTimestamps = rateLimitData.timestamps.filter(
        (timestamp) => now - timestamp < rateLimitWindow
      );

      // Check rate limit
      if (recentTimestamps.length >= rateLimit) {
        return {
          success: false,
          error: "Too many requests. Please try again later.",
          status: 429,
        };
      }

      // Update timestamps
      recentTimestamps.push(now);
      rateLimits.set(ip, { timestamps: recentTimestamps });

      // Authentication check
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
          status: 401,
        };
      }

      // Role-based access control
      if (
        options.roles?.length &&
        !options.roles.includes(session.user.role as Role)
      ) {
        return {
          success: false,
          error: "Forbidden: Insufficient permissions",
          status: 403,
        };
      }

      // Input validation
      if (options.schema) {
        const result = options.schema.safeParse(data);
        if (!result.success) {
          return {
            success: false,
            error: "Validation error",
            details: result.error.format(),
            status: 400,
          };
        }
        data = result.data;
      }

      // Execute the handler with validated data
      const result = await handler(
        data,
        session.user.id,
        session.user.role as Role
      );
      return { success: true, data: result };
    } catch (error) {
      console.error("Action error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        status: 500,
      };
    }
  };
}

// Helper function to get client IP (simplified for example)
function getClientIp(): string {
  // In production, you'd get this from request headers
  // This is a simplified version that returns a random string
  return Math.random().toString(36).substring(2, 15);
}
