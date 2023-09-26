import SubscriptionToggle from "@/components/SubscriptionToggle";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

const layout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}) => {
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subredditId: subreddit?.id,
          userId: session.user.id,
        },
      });

  const isSubscribed = !!subscription;

  const subscriptionMembersCount = await db.subscription.count({
    where: {
      subredditId: subreddit?.id,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="sm:container h-full max-w-7xl mx-auto">
      {/* TODO: a link to go back the feed page. */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        <div className="col-span-2 space-y-6">{children}</div>

        <div className="hidden md:block overflow-hidden h-fit border border-gray-200 rounded-lg order-first md:order-last">
          <div className="py-4 px-6">
            <p className="py-3 font-semibold text-zinc-700 ">
              r/{subreddit?.name}
            </p>
          </div>

          <dl
            className="px-6 py-4 divide-y divide-gray-200
            bg-white text-sm leading-6"
          >
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-700">Created At</dt>
              <dd className="text-gray-500">
                <time dateTime={subreddit?.createdAt.toDateString()}>
                  {format(subreddit.createdAt, "MMMM d , yyy")}
                </time>
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-700">Members Count</dt>
              <dd className="text-gray-500">{subscriptionMembersCount}</dd>
            </div>

            {subreddit.creatorId === session?.user.id ? (
              <div className="flex justify-between gap-x-4 py-3">
                <p className="text-emerald-600">You created this subreddit</p>
              </div>
            ) : null}

            {subreddit.creatorId !== session?.user.id ? (
              <div className="flex justify-between gap-x-4 py-3">
                <SubscriptionToggle
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                  isSubscribed={isSubscribed}
                />
              </div>
            ) : null}

            <div className="flex justify-between gap-x-4 py-3">
              <Link
                href={`${slug}/submit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full mb-6"
                )}
              >
                Create Post
              </Link>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default layout;
