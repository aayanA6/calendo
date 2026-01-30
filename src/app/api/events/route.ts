import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { authConfig } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({ 
      userId: (session.user as any).id 
    }).sort({ startDate: 1 });

    const transformedEvents = events.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      color: event.color,
      user: {
  id: (session.user! as any).id,
  name: session.user!.name || "",
  email: session.user!.email || "",
  picturePath: "",
},
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, color } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await Event.create({
      userId: (session.user as any).id,
      title,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color: color || "blue",
    });

    const transformedEvent = {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      color: event.color,
      user: {
        id: (session.user as any).id,
        name: session.user.name || "",
        email: session.user.email || "",
        picturePath: "",
      },
    };

    return NextResponse.json({ event: transformedEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}