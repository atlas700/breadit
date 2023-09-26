import CommentsSection from "@/components/CommentsSection";
import EditorOutput from "@/components/EditorOutput";
import PostVoteClient from "@/components/post-vote/PostVoteClient";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTimeToNow } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: {
    postId: string;
  };
}

export default async function Page({ params: { postId } }: PageProps) {
  const session = await getAuthSession();

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!post) return notFound();

  return (
    <>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense
          fallback={<Loader2 className="w-5 h-5 animate-spin text-gray-700" />}
        >
          <PostVoteClient
            initialVotesAmt={post.votes.length}
            initialVote={
              post.votes.find((v) => v.userId === session?.user.id)?.type
            }
            postId={post.id}
          />
        </Suspense>

        <div className="sm:w-0 w-full flex-1 rounded-sm p-4 text-gray-600">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            posted by u/{post.author.username}{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </p>

          <h1 className="text-xl font-semibold leading-6 py-2 text-gray-900">
            {post.title}
          </h1>

          <EditorOutput content={post.content} />

          <Suspense
            fallback={
              <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
            }
          >
            <CommentsSection postId={post.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
