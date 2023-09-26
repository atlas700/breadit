import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditValidator } from "@/lib/validators/subreddit";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("you must be login to create a community.", {
        status: 401,
      });
    }

    const body = await req.json();

    const { name } = SubredditValidator.parse(body);

    console.log(body);
    console.log(name);

    const existCommunity = await db.subreddit.findFirst({
      where: {
        name,
      },
    });

    if (existCommunity) {
      return new Response(
        "a community with the same name exist, try creating with another names.",
        {
          status: 409,
        }
      );
    }

    const subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    await db.subscription.create({
      data: {
        subredditId: subreddit.id,
        userId: session.user.id,
      },
    });

    return new Response(subreddit.name, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("community name is required to be created.", {
        status: 422,
      });
    }
    return new Response("Internal Server Error.", { status: 500 });
  }
}
