import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { MemberRole } from "@prisma/client";

export const POST = async (req: Request) => {
	try {
		const { name, imageUrl } = await req.json();

		const profile = await currentProfile();
		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		if (!name) {
			return new NextResponse("Name is required", { status: 400 });
		}
		if (!imageUrl) {
			return new NextResponse("Image URL is required", { status: 400 });
		}

		const server = await db.server.create({
			data: {
				profileId: profile.id,
				name,
				imageUrl,
				inviteCode: uuidv4(),
				channels: {
					create: [
						// WE CREATE GENRAL CHANNEL WHENERVER SOMEONE CREATES ANY SERVER
						{
							name: "general",
							profileId: profile.id,
						},
					],
				},
				members: {
					// WHO EVER CREATES THE SERVER WILL BE AN ADMIN
					create: [
						{
							profileId: profile.id,
							role: MemberRole.ADMIN,
						},
					],
				},
			},
		});
		return NextResponse.json(server);
	} catch (error) {
		console.log("[SERVERS_POST]", error);

		return new NextResponse("Internal Error", { status: 500 });
	}
};
