const { db } = require('../../utils/db')

const Comment = db.comment
const CommentReaction = db.comment_reaction

const createComment = async (commentData) => {
    return await Comment.create({
        data: commentData
    })
}

const getCommentById = async (id) => {
    const comment = await Comment.findUnique({
        where: {
            id: parseInt(id)
        }
    })

    const replies = await Comment.findMany({
        where: {
            parentId: parseInt(id)
        }
    })

    return {
        comment: comment,
        replies: replies
    }
}

const updateComment = async (id, commentData) => {
    return await Comment.update({
        where: {
            id: parseInt(id)
        },
        data: commentData
    })
}
const deleteComment = async (id) => {
    return await Comment.delete({
        where: {
            id: parseInt(id)
        }
    })
}

const likeComment = async (commentId, userId) => {
    const comment = await Comment.findUnique({
        where: {
            id: parseInt(commentId)
        }
    })
    if (!comment) {
        throw new Error('Bình luận không tồn tại');
    }
    const existingReaction = await CommentReaction.findFirst({
        where: {
            comment_id: parseInt(commentId),
            user_id: parseInt(userId)
        }
    })
    console.log(parseInt(userId));
    
    if(existingReaction) {
        if(existingReaction.reaction_type === "Like") {
            //Un-like
            await CommentReaction.delete({
                where: {
                    id: parseInt(existingReaction.id)
                }
            })
            await Comment.update({
                where: {
                    id: parseInt(commentId)
                },
                data: {
                    likes: {
                        decrement: 1
                    },
                }
            })
            return {
                message: "Đã bỏ thích bình luận",
                likes: comment.likes - 1
            }
        }
        else if(existingReaction.reaction_type === "Dislike") {
            //Switch from dislike to like
            await CommentReaction.update({
                where: {
                    id: parseInt(existingReaction.id)
                },
                data: {
                    reaction_type: "Dislike"
                }
            })
            await Comment.update({
                where: {
                    id: parseInt(commentId)
                },
                data: {
                    likes: {
                        increment: 1
                    },
                    dislikes: {
                        decrement: 1
                    }
                }
            })
            return {
                message: "Đã chuyển thành thích bình luận",
                likes: comment.likes + 1,
                dislikes: comment.dislikes - 1
            }
        }
        
    }
    else {
        await CommentReaction.create({
            data: {
                comment_id: parseInt(commentId),
                user_id: parseInt(userId),
                reaction_type: "Like"
            }
        })
        await Comment.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                likes: {
                    increment: 1
                }
            }
        })
        return {
            message: "Đã thích bình luận",
            likes: comment.likes + 1
        }
    }

}

const dislikeComment = async (commentId, userId) => {
    const existingReaction = await CommentReaction.findFirst({
        where: {
            comment_id: parseInt(commentId),
            user_id: parseInt(userId)
        }
    })

    const comment = await Comment.findUnique({
        where: {
            id: parseInt(commentId)
        }
    })

    if(existingReaction)
    {
        if(existingReaction.reaction_type === "Dislike")
        {
            await CommentReaction.delete({
                where: {
                    id: parseInt(existingReaction.id)
                }
            })

            await Comment.update({
                where: {
                    id: parseInt(commentId)
                },
                data: {
                    dislikes: {
                        decrement: 1
                    }
                }
            })

            return {
                message: "Đã bỏ dislike bình luận",
                dislikes: comment.dislikes - 1
            }
        }
        else if(existingReaction.reaction_type === "Like")
        {
            await CommentReaction.update({
                where: {
                    id: parseInt(existingReaction.id)
                },
                data: {
                    reaction_type: "Dislike"
                }
            })

            await Comment.update({
                where: {
                    id: parseInt(commentId)
                },
                data: {
                    likes: {
                        decrement: 1
                    },
                    dislikes: {
                        increment: 1
                    }
                }
            })

            return {
                message: "Đã chuyển thành dislike bình luận",
                dislikes: comment.dislikes + 1,
                likes: comment.likes - 1
            }
        }
    }
    else {
        await CommentReaction.create({
            data: {
                comment_id: parseInt(commentId),
                user_id: parseInt(userId),
                reaction_type: "Dislike"
            }
        })
        await Comment.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                dislikes: {
                    increment: 1
                }
            }
        })
        return {
            message: "Đã dislike bình luận",
            dislikes: comment.dislikes + 1
        }
    }
}

module.exports = {
    createComment,
    getCommentById,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment
}
