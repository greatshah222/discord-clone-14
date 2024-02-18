import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { ServerSidebar } from "@/components/server/server-sidebar";

const ServerIdlayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { serverId: string }; // serverId cause we have named our file serverId
}) => {
	const profile = await currentProfile();

	if (!profile) {
		return redirectToSignIn();
	}

	const server = await db.server.findUnique({
		where: {
			id: params.serverId,
			members: {
				some: {
					profileId: profile.id, // ONLY A MEMBER OF THE SERVER CAN LOAD THE SERVER
				},
			},
		},
	});

	if (!server) {
		return redirect("/");
	}
	return (
		<div className="h-full">
			<div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
				<ServerSidebar serverId={params.serverId} />
			</div>

			<main className="h-full md:pl-60 ">{children}</main>
		</div>
	);
};

export default ServerIdlayout;
