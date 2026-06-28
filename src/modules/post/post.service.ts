import { prisma } from "../../lib/prisma";
import { ICreatePostPayload } from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit:{
            password: true,
        }
      },
      comments: true,
    },
  });

  return posts;
};

const getPostById = async(postId : string) => {
    const post = await prisma.post.findUniqueOrThrow({
        where:{
            id: postId
        }
    })

    const updatedPost = await prisma.post.update({
        where:{
            id : postId,
        },
        data:{
            views :{
                increment :1
            },
        },
        include:{
            author:{
                omit:{
                    password : true,
                },
            },
            comments: true,
        }
    })

    // return post;
    return updatedPost;
};

const updatePost = () => {};

const deletePost = () => {};

const getPostsStats = () => {
};

const getMyPosts=async(authorId : string)=>{
  const result = await prisma.post.findMany({
    where :{
      authorId
    },
    orderBy:{
      createdAt : "desc",
    },
    include :{
      comments: true,
      author:{
        omit:{
          password : true,
        }
      },
      _count : {
        select :{
          comments : true,
        }
      },

    },
  })

  return result;
}

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsStats,
  getMyPosts
};
