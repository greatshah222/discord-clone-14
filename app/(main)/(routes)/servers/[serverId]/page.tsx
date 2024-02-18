import { redirectToSignIn } from "@clerk/nextjs";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
	params: {
		serverId: string;
	};
}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
	const profile = await currentProfile();

	if (!profile) {
		return redirectToSignIn();
	}

	// ALWAYS REDIRECTING TO FIRST CHANNEL WHICH WILL BE GENERAL IN OUR CASE
	const server = await db.server.findUnique({
		where: {
			id: params.serverId,
			members: {
				some: {
					profileId: profile.id, // VERFYING IF WE ARE IN THIS CHANNEL
				},
			},
		},
		include: {
			channels: {
				where: {
					name: "general",
				},
				orderBy: {
					createdAt: "asc",
				},
			},
		},
	});

	const initialChannel = server?.channels[0];

	if (initialChannel?.name !== "general") {
		// THIS SHOULD NEVER BE IN OUR CASE - CAUSE GENERAL WILL BE ALWAYS BE IN OUR CASE
		return null;
	}
	return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`);
};

export default ServerIdPage;
