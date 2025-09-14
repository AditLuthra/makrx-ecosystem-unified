import { NextResponse } from "next/server";
import { requireAuth, type AuthenticatedRequest } from "@/lib/auth-middleware";
import { storage } from "@/server/storage";

export async function GET(request: Request) {
  try {
    const authResult = await requireAuth(request as any);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    // Get user from request
    const authenticatedRequest = request as AuthenticatedRequest;
    const user = authenticatedRequest.user;

    if (!user) {
      return NextResponse.json(
        { error: "No user session found" },
        { status: 401 }
      );
    }

    // Fetch user registrations from database
    const registrations = await storage.getUserRegistrations(user.id);
    
    // Transform data to include event details
    const registrationsWithEvents = await Promise.all(
      registrations.map(async (registration) => {
        const event = await storage.getEvent(registration.eventId);
        return {
          id: registration.id,
          type: registration.type,
          status: registration.status,
          registeredAt: registration.registeredAt,
          event: event ? {
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            featuredImage: event.featuredImage
          } : null
        };
      })
    );

    return NextResponse.json(registrationsWithEvents);
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}