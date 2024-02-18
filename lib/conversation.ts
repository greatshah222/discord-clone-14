import { db } from "@/lib/db";

export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
	let conversation =
		(await findConversations(memberOneId, memberTwoId)) ||
		(await findConversations(memberTwoId, memberOneId));

	if (!conversation) {
		// create a new one since it does not exist

		conversation = await createNewConversation(memberOneId, memberTwoId);
	}

	return conversation;
};

const findConversations = async (memberOneId: string, memberTwoId: string) => {
	try {
		return await db.conversation.findFirst({
			where: {
				AND: [
					{ memberOneId: memberOneId },
					{
						memberTwoId: memberTwoId,
					},
				],
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		});
	} catch (error) {
		return null;
	}
};

const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
	try {
		return await db.conversation.create({
			data: {
				memberOneId,
				memberTwoId,
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		});
	} catch (error) {
		return null;
	}
};
