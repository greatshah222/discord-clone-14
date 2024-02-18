import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { currentProfile } from "@/lib/current-profile";
import { MemberRole } from "@prisma/client";

export const DELETE = async (
	req: Request,
	{
		params,
	}: {
		params: { channelId: string };
	}
) => {
	try {
		const profile = await currentProfile();

		const { searchParams } = new URL(req.url);
		const { channelId } = params;

		const serverId = searchParams.get("serverId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!serverId) {
			return new NextResponse("Server Id is missing", {
				status: 400,
			});
		}

		if (!channelId) {
			return new NextResponse("Channel Id is missing", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							in: [MemberRole.ADMIN, MemberRole.MODERATOR], // ONLY MEMBER BELONGING TO CURRENT SERVER AND EITHER WITH ROLE ADMIN OR MODERATOR CAN CREATE A NEW CHANNEL
						},
					},
				},
			},
			data: {
				channels: {
					delete: {
						id: channelId,
						name: {
							not: "general", // NEVER GONNA DELETE GENERAL CHANNEL
						},
					},
				},
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[CHANNELS_ID_DELETE]", error);

		return new NextResponse("Internal Error", { status: 500 });
	}
};

export const PATCH = async (
	req: Request,
	{
		params,
	}: {
		params: { channelId: string };
	}
) => {
	try {
		const profile = await currentProfile();

		const { name, type } = await req.json();

		const { searchParams } = new URL(req.url);
		const { channelId } = params;

		const serverId = searchParams.get("serverId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!serverId) {
			return new NextResponse("Server Id is missing", {
				status: 400,
			});
		}

		if (!channelId) {
			return new NextResponse("Channel Id is missing", {
				status: 400,
			});
		}

		if (name === "general") {
			return new NextResponse("Name cannot be general", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							in: [MemberRole.ADMIN, MemberRole.MODERATOR], // ONLY MEMBER BELONGING TO CURRENT SERVER AND EITHER WITH ROLE ADMIN OR MODERATOR CAN CREATE A NEW CHANNEL
						},
					},
				},
			},
			data: {
				channels: {
					update: {
						where: {
							id: channelId,
							NOT: {
								name: "general",
							},
						},
						data: {
							name,
							type,
						},
					},
				},
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[CHANNELS_ID_PATCH]", error);

		return new NextResponse("Internal Error", { status: 500 });
	}
};
