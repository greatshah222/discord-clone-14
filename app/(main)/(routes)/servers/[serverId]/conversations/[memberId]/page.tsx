import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";

interface MemberIdPageProps {
	params: {
		memberId: string;
		serverId: string;
	};
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
	const { memberId, serverId } = params;

	const profile = await currentProfile();

	if (!profile) {
		return redirectToSignIn();
	}
	const currentMember = await db.member.findFirst({
		where: {
			serverId,
			profileId: profile.id,
		},
		include: {
			profile: true,
		},
	});

	if (!currentMember) {
		return redirect("/");
	}

	const conversation = await getOrCreateConversation(currentMember.id, memberId); // FINDING CONVERSATION BETWEEN CURRENT LOGGEDIN USER AND MEMBERID

	if (!conversation) {
		// IF SOMETHING WENT WRONG
		return redirect(`/servers/${serverId}`);
	}

	const { memberOne, memberTwo } = conversation;

	// finding other member from above conversation - we dont know which one is us at the moment

	const otherMember = memberOne.profileId === profile?.id ? memberTwo : memberOne;

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader
				imageUrl={otherMember.profile.imageUrl}
				name={otherMember.profile.name}
				serverId={serverId}
				type="conversations"
			/>
		</div>
	);
};

export default MemberIdPage;
