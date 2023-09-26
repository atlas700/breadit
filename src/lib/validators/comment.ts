import { z } from "zod";

export const CommentValidator = z.object({
  postId: z.string(),
  replyToId: z.string().optional(),
  text: z.string(),
});

export type CommentRequest = z.infer<typeof CommentValidator>;

export const CommentVoteValidator = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>;
