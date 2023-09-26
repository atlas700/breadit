"use client";

import { Prisma, Subreddit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// @ts-ignore
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isFetching, isFetched, refetch } = useQuery({
    queryFn: async () => {
      if (!searchQuery) return [];

      const { data } = await axios.get(`/api/search?q=${searchQuery}`);

      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const router = useRouter();

  const request = debounce(async () => {
    refetch();
  }, 500);

  const debounceRequest = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Command className="relative max-w-lg border rounded-lg z-50 overflow-visible">
      <CommandInput
        placeholder="Search communities..."
        value={searchQuery}
        onValueChange={(text) => {
          setSearchQuery(text);

          debounceRequest();
        }}
        className="border-none outline-none focus:border-none focus:outline-none ring-0"
      />

      {searchQuery.length > 0 ? (
        <CommandList className="absolute top-full inset-x-0 bg-white rounded-b-md shadow">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {data?.map((subreddit) => (
            <CommandItem
              key={subreddit.id}
              onSelect={(subName) => {
                router.push(`/r/${subName}`);
                router.refresh();
              }}
              value={subreddit.name}
            >
              <Users className="h-4 w-4 mr-2" />
              <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
            </CommandItem>
          ))}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
