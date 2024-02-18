import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export const DELETE = async (
	req: Request,
	{
		params,
	}: {
		params: { memberId: string };
	}
) => {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(req.url);

		const serverId = searchParams.get("serverId");
		if (!profile) {
			return new NextResponse("Unauthorized", {
				status: 401,
			});
		}
		if (!serverId) {
			return new NextResponse("Server Id is missing", {
				status: 400,
			});
		}
		if (!params.memberId) {
			return new NextResponse("Member Id is missing", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id, // ONLY ADMIN CAN MODIFY THIS
			},
			data: {
				members: {
					deleteMany: {
						id: params.memberId,
						profileId: {
							not: profile.id, // ADMIN SHOULD NOT BE ABLE TO KICK THEMSELVES
						},
					},
				},
			},
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[MEMBER_ID_DELETE]", error);

		return new NextResponse("Internal Error", { status: 500 });
	}
};

export const PATCH = async (
	req: Request,
	{
		params,
	}: {
		params: { memberId: string };
	}
) => {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(req.url);
		const { role } = await req.json();

		const serverId = searchParams.get("serverId");
		if (!profile) {
			return new NextResponse("Unauthorized", {
				status: 401,
			});
		}
		if (!serverId) {
			return new NextResponse("Server Id is missing", {
				status: 400,
			});
		}
		if (!params.memberId) {
			return new NextResponse("Member Id is missing", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id, // ONLY ADMIN CAN MODIFY THIS
			},
			data: {
				members: {
					update: {
						where: {
							id: params.memberId,
							profileId: {
								not: profile.id, // logged in user cannot update themselves
							},
						},
						data: {
							role,
						},
					},
				},
			},
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[MEMBER_PATCH]", error);

		return new NextResponse("Internal Error", { status: 500 });
	}
};
