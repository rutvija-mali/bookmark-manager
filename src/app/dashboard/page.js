"use client"
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddBookmarkModal from "@/components/AddBookmarkModal";
import { supabase } from "@/supabase-client";



export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const errorMessage =
    typeof error === "string" ? error : error?.message ?? "Something went wrong";

  const fetchBookmarks = async () => {
    try {
      if (!supabase) return;
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setBookmarks([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setIsLoading(false);
      if (error) throw error;
      setBookmarks(data ?? []);
    } catch (error) {
      setError(error);
      console.error("Error in fetching bookmarks", error);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);
  
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel("bookmark-channel").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookmarks" },
      () => {
        fetchBookmarks();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddBookmark = () => {
    setSelectedBookmark(null);
    setModalOpen(true);
  };

  const handleEditBookmark = (bookmark) => {
    setSelectedBookmark(bookmark);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBookmark(null);
  };

  const handleDelete = async (id) => {
    try {
      if (!supabase) return;

      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      setIsLoading(false);
    } catch (error) {
      setError(error);
      console.error("Error in deleting", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bookmarks
          </h1>
          <button
            onClick={handleAddBookmark}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus size={20} />
            Add Bookmark
          </button>
        </div>

        {isLoading && (
          <div className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            Loading...
          </div>
        )}

        {error && (
          <div className="mb-3 text-sm text-red-600">Error: {errorMessage}</div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookmarks.map((bookmark) => (
                  <tr
                    key={bookmark.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {bookmark.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {bookmark.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {new Date(bookmark.created_at).toLocaleDateString()}

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditBookmark(bookmark)}
                        className="text-blue-600 cursor-pointer dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button className="text-red-600 cursor-pointer dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={()=> handleDelete(bookmark.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AddBookmarkModal
          open={modalOpen}
          onClose={handleCloseModal}
          bookmark={selectedBookmark}
        />
      </div>
    </div>
  );
}