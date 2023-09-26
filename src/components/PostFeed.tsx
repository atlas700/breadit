"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import Post from "./Post";

interface PostFeedProps {
  subredditName?: string;
  initialPosts: ExtendedPost[];
}

const PostFeed: FC<PostFeedProps> = ({ subredditName, initialPosts }) => {
  const postRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: postRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);

      return data as ExtendedPost[];
    },
    {
      getNextPageParam(_, pages) {
        return pages.length + 1;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [1],
      },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts?.map((post, idx) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (idx === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                commentAmt={post.comments.length}
                subredditName={post.subreddit.name}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          );
        } else {
          return (
            <li key={post.id}>
              <Post
                key={post.id}
                votesAmt={votesAmt}
                currentVote={currentVote}
                commentAmt={post.comments.length}
                subredditName={post.subreddit.name}
                post={post}
              />
            </li>
          );
        }
      })}

      {/* A loader while fetching more posts */}
      <li className="mt-6 mb-10 mx-auto">
        {isFetchingNextPage ? (
          <div className="flex gap-x-2 items-center text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
            <p>Loading more posts...</p>
          </div>
        ) : null}
      </li>
    </ul>
  );
};

export default PostFeed;
