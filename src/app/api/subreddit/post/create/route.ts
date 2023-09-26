import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();

    const { subredditId, title, content } = PostValidator.parse(body);

    const isSubscribed = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        subredditId,
      },
    });

    if (!isSubscribed) {
      return new Response(
        "You need to be subscribed to subreddit to create post.",
        { status: 403 }
      );
    }

    await db.post.create({
      data: {
        subredditId,
        authorId: session.user.id,
        title,
        content,
      },
    });

    return new Response("Ok", { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Provide at least the title to create the post.", {
        status: 422,
      });
    }

    return new Response("Internal Server Error.", { status: 500 });
  }
}
