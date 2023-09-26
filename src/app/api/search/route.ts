import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const searchQ = url.searchParams.get("q");

    if (!searchQ)
      return new Response("No search query provided, please try again.", {
        status: 404,
      });

    const subreddit = await db.subreddit.findMany({
      where: {
        name: { startsWith: searchQ },
      },
      include: {
        _count: true,
      },
      take: 5,
    });

    return new Response(JSON.stringify(subreddit));
  } catch (error) {
    return new Response("Internal Server Error.", { status: 500 });
  }
}
