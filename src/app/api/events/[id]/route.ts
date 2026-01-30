import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";
import { authConfig } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const event = await Event.findOne({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update fields
    if (body.title) event.title = body.title;
    if (body.description !== undefined) event.description = body.description;
    if (body.startDate) event.startDate = new Date(body.startDate);
    if (body.endDate) event.endDate = new Date(body.endDate);
    if (body.color) event.color = body.color;

    await event.save();

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

    return NextResponse.json({ event: transformedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findOneAndDelete({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}