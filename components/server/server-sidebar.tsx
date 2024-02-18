import { redirect } from "next/navigation";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { ChannelType, MemberRole } from "@prisma/client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerHeader } from "@/components/server/server-header";
import { ServerSearch } from "@/components/server/server-search";
import { Separator } from "@/components/ui/separator";
import { ServerSection } from "@/components/server/server-section";
import { ServerChannel } from "@/components/server/server-channel";
import { ServerMember } from "@/components/server/server-member";

interface ServerSidebarProps {
	serverId: string;
}
const iconMap = {
	[ChannelType.TEXT]: <Hash className="mr-2 w-4 h-4" />,
	[ChannelType.AUDIO]: <Mic className="mr-2 w-4 h-4" />,
	[ChannelType.VIDEO]: <Video className="mr-2 w-4 h-4" />,
};

const roleIconMap = {
	[MemberRole.GUEST]: null,
	[MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />,
	[MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />,
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
	const profile = await currentProfile();

	if (!profile) {
		return redirect("/");
	}

	// FETCHING SERVER AGAIN CAUSE WE NEED IN THE MOBIEL SIDEBAR AS WELL

	const server = await db.server.findUnique({
		where: { id: serverId },
		include: {
			channels: {
				orderBy: {
					createdAt: "asc",
				},
			},
			members: {
				include: {
					profile: true,
				},
				orderBy: {
					role: "asc", // SHOW AMDIN FIRST AND THEN MODERATOR AND THEN GUEST
				},
			},
		},
	});
	if (!server) {
		return redirect("/");
	}

	const textChannels = server?.channels.filter((el) => el.type === ChannelType.TEXT);
	const audioChannels = server?.channels.filter((el) => el.type === ChannelType.AUDIO);
	const videoChannels = server?.channels.filter((el) => el.type === ChannelType.VIDEO);

	const members = server?.members.filter((el) => el.profileId !== profile.id); // NOT SHOWING OURSERLF

	const role = server.members.find((el) => el.profileId === profile.id)?.role; // CHECKING OUR ROLE IN THE CURRENT SERVER

	return (
		<div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
			<ServerHeader server={server} role={role} />

			<ScrollArea className="flex-1 px-3">
				<div className="mt-2">
					<ServerSearch
						data={[
							{
								label: "Text Channels",
								type: "channel",
								data: textChannels.map((el) => ({
									id: el.id,
									name: el.name,
									icon: iconMap[el.type],
								})),
							},
							{
								label: "Voice Channels",
								type: "channel",
								data: audioChannels.map((el) => ({
									id: el.id,
									name: el.name,
									icon: iconMap[el.type],
								})),
							},
							{
								label: "Video Channels",
								type: "channel",
								data: videoChannels.map((el) => ({
									id: el.id,
									name: el.name,
									icon: iconMap[el.type],
								})),
							},

							{
								label: "Members",
								type: "member",
								data: members.map((el) => ({
									id: el.id,
									name: el.profile.name,
									icon: roleIconMap[el.role],
								})),
							},
						]}
					/>
				</div>

				<Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />

				{!!textChannels?.length && (
					<div className="mb-2">
						<ServerSection
							sectionType="channels"
							channelType={ChannelType.TEXT}
							role={role}
							label="Text Channels"
						/>
						<div className="space-y-2">
							{textChannels?.map((el) => (
								<ServerChannel key={el.id} channel={el} role={role} server={server} />
							))}
						</div>
					</div>
				)}

				{!!audioChannels?.length && (
					<div className="mb-2">
						<ServerSection
							sectionType="channels"
							channelType={ChannelType.AUDIO}
							role={role}
							label="Voice Channels"
						/>
						<div className="space-y-2">
							{audioChannels?.map((el) => (
								<ServerChannel key={el.id} channel={el} role={role} server={server} />
							))}
						</div>
					</div>
				)}

				{!!videoChannels?.length && (
					<div className="mb-2">
						<ServerSection
							sectionType="channels"
							channelType={ChannelType.VIDEO}
							role={role}
							label="Voice Channels"
						/>
						<div className="space-y-2">
							{videoChannels?.map((el) => (
								<ServerChannel key={el.id} channel={el} role={role} server={server} />
							))}
						</div>
					</div>
				)}
				{!!members?.length && (
					<div className="mb-2">
						<ServerSection sectionType="members" role={role} label="Members" server={server} />

						<div className="space-y-2">
							{members?.map((el) => (
								<ServerMember key={el.id} member={el} server={server} />
							))}
						</div>
					</div>
				)}
			</ScrollArea>
		</div>
	);
};
