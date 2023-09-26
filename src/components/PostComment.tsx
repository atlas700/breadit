"use client";

import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { FC, useRef, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import CommentVoteClient from "./CommentVoteClient";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "./ui/Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  postId: string;
  commentId: string;
  initialVotesAmt: number;
  initialVoteType: VoteType | null | undefined;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  commentId,
  initialVoteType,
  initialVotesAmt,
  postId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");

  const { data: session } = useSession();
  const router = useRouter();

  const handleReplyClick = () => {
    if (!session) return router.push("/");

    setIsReplying(true);
  };

  const { mutate: reply, isLoading } = useMutation({
    mutationFn: async ({ text, replyToId, postId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data;
    },
    onError: (err) => {
      return toast({
        title: "There was an error",
        description: "Cannot reply to the comment, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();

      setIsReplying(false);

      setReplyText("");
    },
  });

  return (
    <div className="flex flex-col " ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || "",
            image: comment.author.image || null,
          }}
          className="w-5 h-5"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="font-medium text-sm text-zinc-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-zinc-900 mt-2 text-sm">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVoteClient
          commentId={commentId}
          initialVotesAmt={initialVotesAmt}
          initialVote={initialVoteType}
        />

        <Button variant={"ghost"} size={"sm"} onClick={handleReplyClick}>
          <MessageSquarePlus className="w-4 h-4 mr-1.5" />
          Reply
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label>Your reply</Label>
            <div className="flex mt-2 items-center">
              <Textarea
                placeholder="Your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
              />
            </div>
            <div className="flex justify-end gap-y-3">
              <Button
                variant={"secondary"}
                tabIndex={-1}
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={replyText.length === 0}
                onClick={() =>
                  reply({
                    postId,
                    replyToId: commentId ?? comment.id,
                    text: replyText,
                  })
                }
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : null}
                Submit
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
