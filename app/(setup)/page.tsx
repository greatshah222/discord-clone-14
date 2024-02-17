import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = async () => {
	const profile = await initialProfile();

	// FINDING FIRST SERVER FOR THIS PROFILE

	const server = await db.server.findFirst({
		where: {
			members: {
				some: {
					profileId: profile.id,
				},
			},
		},
	});

	if (server) {
		return redirect(`/servers/${server.id}`);
	}

	// IF NOT PART OF ANY SERVER USER HAVE TO CREATE ONE SERVER

	return <InitialModal />;
};

export default SetupPage;
