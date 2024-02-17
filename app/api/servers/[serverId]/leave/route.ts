import { v4 as uuidv4 } from "uuid";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const PATCH = async (req: Request, { params }: { params: { serverId: string } }) => {
	try {
		const profile = await currentProfile();

		if (!profile) {
			return new NextResponse("Unauthorized", {
				status: 401,
			});
		}

		if (!params?.serverId) {
			return new NextResponse("Server ID is missing", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: params.serverId,
				profileId: {
					not: profile.id, // ADMIN CANNOT LEAVE THE SERVER
				},
				members: {
					some: {
						profileId: profile.id, // ONLY MEMBER BELONGING TO SERVER CAN LEAVER THIS SERVER
					},
				},
			},
			data: {
				members: {
					deleteMany: {
						profileId: profile.id,
					},
				},
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log(["SERVER_ID_PATCH_LEAVE_SERVER", error]);
		return new NextResponse("Interal Error", {
			status: 500,
		});
	}
};
