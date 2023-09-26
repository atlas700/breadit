import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });

        return new Response("OK");
      } else {
        await db.commentVote.update({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
          data: {
            type: voteType,
          },
        });

        return new Response("OK");
      }
    } else {
      await db.commentVote.create({
        data: {
          userId: session.user.id,
          commentId,
          type: voteType,
        },
      });

      return new Response("OK", { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        "Invalid comment vote data passed, please try again.",
        { status: 422 }
      );
    }

    return new Response("Internal Server Error.", { status: 500 });
  }
}
