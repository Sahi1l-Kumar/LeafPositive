"use client";

import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useRef } from "react";

import { SheetClose } from "@/components/ui/sheet";
import { cn, groupChatsByDate } from "@/lib/utils";
import { useTranslation } from "@/app/i18n/client";
import { LoadingSpinner } from "@/components/Loader";
import { getChats } from "@/lib/actions/chat.action";
import ROUTES from "@/constants/routes";

const NavLinks = ({
  isMobileNav = false,
  lng,
}: {
  isMobileNav?: boolean;
  lng: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation(lng, "translation");

  const fetchChats = async (pageNum = 1, query = "") => {
    try {
      const response = await getChats({
        page: pageNum,
        pageSize: 10,
        query,
      });

      if (response.success && response.data) {
        return response.data;
      }
      return { chats: [], isNext: false };
    } catch (error) {
      console.error("Error fetching chats:", error);
      return { chats: [], isNext: false };
    }
  };

  useEffect(() => {
    const initializeChats = async () => {
      if (i18n.isInitialized) {
        try {
          const { chats: initialChats, isNext } = await fetchChats();
          setChats(initialChats);
          setHasMore(isNext);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to load initial chats:", error);
          setIsLoading(false);
        }
      }
    };

    initializeChats();
  }, [i18n.isInitialized]);

  // Load more chats when scrolling
  const loadMoreChats = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { chats: newChats, isNext } = await fetchChats(
        nextPage,
        searchQuery
      );

      if (newChats.length > 0) {
        setChats((prevChats) => [...prevChats, ...newChats]);
        setPage(nextPage);
      }

      setHasMore(isNext);
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, searchQuery]);

  // Handle scroll event for infinite scrolling
  useEffect(() => {
    const chatListElement = chatListRef.current;
    if (!chatListElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatListElement;

      // Load more when user scrolls to bottom (with a small threshold)
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        hasMore &&
        !isLoadingMore
      ) {
        loadMoreChats();
      }
    };

    chatListElement.addEventListener("scroll", handleScroll);
    return () => chatListElement.removeEventListener("scroll", handleScroll);
  }, [loadMoreChats, hasMore, isLoadingMore]);

  // Handle search
  useEffect(() => {
    const searchChats = async () => {
      setIsLoading(true);
      const { chats: searchResults, isNext } = await fetchChats(1, searchQuery);
      setChats(searchResults);
      setPage(1);
      setHasMore(isNext);
      setIsLoading(false);
    };

    // Debounce search to avoid too many requests
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        searchChats();
      } else if (searchQuery === "") {
        // Reset to initial state when search is cleared
        const resetChats = async () => {
          setIsLoading(true);
          const { chats: initialChats, isNext } = await fetchChats(1);
          setChats(initialChats);
          setPage(1);
          setHasMore(isNext);
          setIsLoading(false);
        };
        resetChats();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCreateNewChat = async () => {
    router.push(ROUTES.HOME(lng));
  };

  if (isLoading) {
    return (
      <LoadingSpinner className="flex items-center justify-center h-full" />
    );
  }

  const { today, yesterday, previousWeek, previousMonth, older } =
    groupChatsByDate(chats);

  const renderChatGroup = (chatGroup: Chat[], titleKey: string) => {
    if (!chatGroup || chatGroup.length === 0) return null;

    return (
      <div className="mt-4">
        <p className="px-2 py-1 text-xs text-dark400_light500">{t(titleKey)}</p>
        {chatGroup.map((chat) => {
          const isActive = pathname === `/${lng}/chat/${chat._id}`;
          const chatTitle = chat.title || "Untitled Chat";

          const ChatLink = (
            <Link
              href={`/${lng}/chat/${chat._id}`}
              className={cn(
                "block rounded-md px-3 py-2 my-1 text-sm hover:bg-light-700 dark:hover:bg-dark-300 transition-colors",
                isActive
                  ? "bg-primary-100 dark:bg-dark-300 text-primary-500 dark:text-light-900"
                  : "text-dark300_light900"
              )}
            >
              {chatTitle}
            </Link>
          );

          return isMobileNav ? (
            <SheetClose asChild key={chat._id}>
              {ChatLink}
            </SheetClose>
          ) : (
            <React.Fragment key={chat._id}>{ChatLink}</React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full background-light850_dark100 text-dark100_light900 border-r light-border">
      <div className="sticky top-0 z-10 background-light850_dark100">
        <div className="flex items-center justify-between p-4">
          <button
            className="flex items-center justify-center rounded-md border light-border p-2 hover:bg-light-700 dark:hover:bg-dark-300 w-full transition-colors"
            onClick={handleCreateNewChat}
          >
            <Plus size={16} className="mr-2" />
            <span className="paragraph-medium">{t("chat.newChat")}</span>
          </button>
        </div>

        <div className="relative px-4 pb-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-400 dark:text-light-500"
            />
            <input
              type="text"
              placeholder={t("chat.searchPlaceholder")}
              className="w-full rounded-md bg-light-800 dark:bg-dark-300 py-2 pl-10 pr-4 text-sm text-dark300_light900 placeholder no-focus"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        ref={chatListRef}
        className="flex-1 overflow-y-auto px-2 custom-scrollbar"
      >
        {chats.length === 0 ? (
          <p className="text-center py-4 text-dark400_light500">
            {searchQuery ? t("chat.noSearchResults") : t("chat.noChats")}
          </p>
        ) : (
          <>
            {renderChatGroup(today, "chat.today")}
            {renderChatGroup(yesterday, "chat.yesterday")}
            {renderChatGroup(previousWeek, "chat.previousWeek")}
            {renderChatGroup(previousMonth, "chat.previousMonth")}
            {renderChatGroup(older, "chat.older")}
          </>
        )}

        {isLoadingMore && (
          <div className="py-2 text-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NavLinks;
