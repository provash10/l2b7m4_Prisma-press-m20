import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (query: IPostQuery) => {

  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy
    ? query.sortBy === "CreatedAt" || query.sortBy === "createdAt"
      ? "createdAt"
      : query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  
  const andConditions: PostWhereInput[] = [];
  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];
  console.log(tagsArray,"tagsArray")

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (query.title) {
    andConditions.push({
      title: {
        contains: query.title as string,
        mode: "insensitive",
      },
    });
  }
  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }
  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }
  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }
  if (query.tags) {
    andConditions.push({
      tags : {
        hasSome : tagsArray
      }
    });
  }

  if(query.status){
    andConditions.push({
      status : query.status
    })
  }

  const posts = await prisma.post.findMany({
    //Filtering / exact match without AND Operator
    // where : {
    //   title : "My First Post",
    //   content: "Messi"
    // },

    //Filtering / exact match with AND Operator
    // where: {
    //   AND: [
    //     {
    //       title: "My First Post",
    //     },
    //     {
    //       content: "Messi",
    //     },
    //     {
    //       tags: {
    //         equals: ["typescript", "prisma", "express"],
    //       },
    //     },
    //   ],
    // },

    //Searching /partial match
    // where :{
    //   title :{
    //     contains : "Messi",
    //     mode : "insensitive"
    //   },

    //not ideal for partial match
    // content : {
    //   contains : "Messi"
    // }
    // },

    //searching / partial search with OR Operator
    // where : {
    //   OR : [
    //     {
    //       title : {
    //         contains: "Messi",
    //         mode: "insensitive"
    //       }
    //     },

    //     {
    //       content : {
    //         contains : "Messi",
    //         mode: "insensitive"
    //       }
    //     }
    //   ]
    // },

    //Combining Search(OR) & filtering(AND)
    // where : {
    //   //filtering & searching combined
    //   AND : [
    //     {
    //       //searching
    //       OR : [
    //         {
    //           title : {
    //             contains : "Messi",
    //             mode: "insensitive"
    //           }
    //         },

    //         {
    //           content : {
    //             contains : "Messi",
    //             mode : "insensitive"
    //           }
    //         }
    //       ]
    //     },

    //     //filtering
    //     {
    //       title : "Leonel Messi"
    //     },
    //     {
    //       content : "Messi"
    //     }
    //   ]
    // },

    //Pagination with (limit or take) and (skip or page)
    // take : 1,
    //take : 2,
    //for first page skip is 0
    //skip : 1, // visiting page 2
    //skip : 2, // visiting page 3
    // skip : 3, // visiting page 4
    //page = 4, limit /take =1 =>skip:(page-1) * limit=>
    //page = 3, limit / take =10 => skip :(page-1) * limit = (3-1) *10

    //Sorting
    // orderBy :{
    //   createdAt : "desc",
    //   title : "asc",
    //   content : "desc"
    //   //fieldName : asc/desc
    // },

    //dynamic searcing, filtering
    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             {
    //               title: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               content: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //           ],
    //         }
    //       : {},

    //     //title filtering
    //     // {
    //     //   title : query.title
    //     // },
    //     query.title ? { title: query.title } : {},

    //     //content filtering
    //     query.content ? { content: query.content } : {},

    // {
    //   tags : {
    //     hasSome
    //   }
    // },

    //   ],
    // },

    where: {
      AND: andConditions,
    },

    //dynamic pagination,sorting
    take: limit, // chack in- up variable
    skip: skip, // chack in- up variable

    orderBy: {
      // sortBy : sortOrder // chack in- up variable
      [sortBy]: sortOrder,
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};

const getPostById = async (postId: string) => {
  // await prisma.post.update({
  //     where:{
  //         id : postId,
  //     },
  //     data:{
  //         views :{
  //             increment :1
  //         },
  //     },

  // })

  // throw new Error("Fake Error")

  // const post = await prisma.post.findFirstOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //     _count: {
  //       select: {
  //         comments: true,
  //       },
  //     },
  //   },
  // });

  // return post;  //no need
  // return updatedPost;  //no need

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const post = await tx.post.findFirstOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return post;
  });

  return transactionResult;
};

//update post
const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean
) => {
  const post = await prisma.post.findFirstOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the Owner of this post");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean
) => {
  const post = await prisma.post.findFirstOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the Owner of this post");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
  // return null;
};

const getPostsStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // const totalPosts = await tx.post.count();

    // const totalPublishedPosts =await tx.post.count({
    //   where:{
    //     status : PostStatus.PUBLISHED
    //   }
    // })

    //  const totalDraftPosts =await tx.post.count({
    //   where:{
    //     status : PostStatus.DRAFT
    //   }
    // })

    //  const totalArchivedPosts =await tx.post.count({
    //   where:{
    //     status : PostStatus.ARCHIVED
    //   }
    // })

    // const totalComments = await tx.comment.count()

    // const totalApprovedComments = await tx.comment.count({
    //   where:{
    //     status : CommentStatus.APPROVED
    //   }
    // })

    // const totalRejectedComments = await tx.comment.count({
    //   where:{
    //     status : CommentStatus.REJECT
    //   }
    // })

    // //not a good approach
    // // const allPosts = await tx.post.findMany();

    // // let totalPostViews = 0;

    // // allPosts.forEach((post)=>{
    // //   totalPostViews = totalPostViews + post.views
    // // })

    // //Good Approach
    // const totalPostViewsAggregate = await tx.post.aggregate({
    //   _sum : {
    //     views : true
    //   }
    // })

    // const totalPostViews= totalPostViewsAggregate._sum.views

    // return {
    //   totalPosts,
    //   totalPublishedPosts,
    //   totalDraftPosts,
    //   totalArchivedPosts,
    //   totalComments,
    //   totalApprovedComments,
    //   totalRejectedComments,
    //   totalPostViews
    // }

    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews,
    ] = await Promise.all([
      await tx.post.count(),

      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),

      await tx.comment.count(),

      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),

      await tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),

      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViews?._sum?.views ?? 0,
    };
  });

  return transactionResult;
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
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

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsStats,
  getMyPosts,
};
