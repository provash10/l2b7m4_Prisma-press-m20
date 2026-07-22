import { PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getPremiumPosts = async () => {
  const result = await prisma.post.findMany({
    where: {
      isPremium: true,
      status: PostStatus.PUBLISHED,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

export const premiumService = {
  getPremiumPosts,
};
