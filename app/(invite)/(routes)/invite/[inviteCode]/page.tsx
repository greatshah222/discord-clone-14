import { redirect } from "next/navigation";

import { redirectToSignIn } from "@clerk/nextjs";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface InvideCodePageProps {
	params: {
		inviteCode: string;
	};
}

const InvideCodePage = async ({ params }: InvideCodePageProps) => {
	const profile = await currentProfile();
	console.log("profile", profile);

	if (!profile) {
		return redirectToSignIn();
	}

	if (!params.inviteCode) {
		redirect("/");
	}

	// CHECK IF THE USER IS ALREADY IN THE SERVER

	const existingServer = await db.server.findFirst({
		where: {
			inviteCode: params.inviteCode,
			members: {
				some: {
					profileId: profile.id, // user is already a member of this server
				},
			},
		},
	});

	if (existingServer) {
		return redirect(`/servers/${existingServer.id}`);
	}

	const server = await db.server.update({
		where: {
			inviteCode: params.inviteCode,
		},
		data: {
			members: {
				create: [
					{
						profileId: profile.id,
						// BY DEFAULT EVERYONE WHO JOINS IS GUEST
					},
				],
			},
		},
	});

	if (server) {
		return redirect(`/servers/${server.id}`);
	}

	return null;
};

export default InvideCodePage;
