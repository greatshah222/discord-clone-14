import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { currentProfile } from "@/lib/current-profile";
import { ChatInput } from "@/components/chat/chat-input";
import { db } from "@/lib/db";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChannelType } from "@prisma/client";
import { MediaRoom } from "@/components/media-room";

interface ChannelIdPageProps {
	params: {
		serverId: string;
		channelId: string;
	};
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
	const { serverId, channelId } = params;

	const profile = await currentProfile();

	if (!profile) {
		return redirectToSignIn();
	}

	const channel = await db.channel.findUnique({
		where: {
			id: channelId,
		},
	});

	const member = await db.member.findFirst({
		where: {
			serverId,
			profileId: profile.id,
		},
	});
	if (!channel || !member) {
		// USER TRYING TO ACCESS CHANNEL WHICH THEY DONT HAVE ACCESS
		return redirect("/");
	}

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader serverId={serverId} name={channel?.name} type="channel" />

			{channel.type === ChannelType.TEXT && (
				<>
					<ChatMessages
						name={channel.name}
						member={member}
						chatId={channel.id}
						apiUrl="/api/messages"
						socketQuery={{
							channelId: channel.id,
							serverId: channel.serverId,
						}}
						socketUrl="/api/socket/messages"
						paramKey="channelId"
						paramValue={channel.id}
						type="channel"
					/>

					<ChatInput
						name={channel.name}
						type="channel"
						apiUrl="/api/socket/messages"
						query={{
							channelId: channel.id,
							serverId: channel.serverId,
						}}
					/>
				</>
			)}

			{channel.type === ChannelType.AUDIO && (
				<MediaRoom chatId={channelId} video={false} audio={true} />
			)}

			{channel.type === ChannelType.VIDEO && (
				<MediaRoom chatId={channelId} video={true} audio={true} />
			)}
		</div>
	);
};

export default ChannelIdPage;
