import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CreateComment from "./CreateComment";
import PostComment from "./PostComment";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: { postId, replyToId: null },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-2" />
      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-6">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLvlCmnt) => {
            const topLvlCmntVotesAmt = topLvlCmnt.votes.reduce((acc, vote) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            }, 0);

            const topLvlCmntVoteType = topLvlCmnt.votes.find(
              (vote) => vote.userId === session?.user.id
            )?.type;

            return (
              <div key={topLvlCmnt.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLvlCmnt}
                    commentId={topLvlCmnt.id}
                    initialVotesAmt={topLvlCmntVotesAmt}
                    initialVoteType={topLvlCmntVoteType}
                    postId={postId}
                  />
                </div>

                <div className="ml-2 pl-4 py-4 border-l-2 border-zinc-200">
                  {topLvlCmnt.replies
                    .sort((a, b) => a.votes.length - b.votes.length)
                    .map((reply) => {
                      const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                        if (vote.type === "UP") return acc + 1;
                        if (vote.type === "DOWN") return acc - 1;
                        return acc;
                      }, 0);

                      const replyVoteType = reply.votes.find(
                        (vote) => vote.userId === session?.user.id
                      )?.type;

                      return (
                        <PostComment
                          comment={reply}
                          postId={postId}
                          commentId={topLvlCmnt.id}
                          initialVoteType={replyVoteType}
                          initialVotesAmt={replyVotesAmt}
                          key={reply.id}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
