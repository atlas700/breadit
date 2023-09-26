import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = UsernameValidator.parse(body);

    const isUsernameAlreadyExist = await db.user.findFirst({
      where: {
        id: session.user.id,
        username: name,
      },
    });

    if (isUsernameAlreadyExist) {
      return new Response("Username is already taken by other user.", {
        status: 409,
      });
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid username data passed please try again.", {
        status: 422,
      });
    }

    return new Response("Internal Server Error.", { status: 500 });
  }
}
