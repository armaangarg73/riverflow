import { users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import React from "react";
import EditButton from "./EditButton";
import Navbar from "./Navbar";
import { IconClockFilled, IconUserFilled } from "@tabler/icons-react";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    userId: string;
    userSlug: string;
  }>;
};

const Layout = async (props: LayoutProps) => {
  const { children, params } = props;
  const { userId } = await params;

  if (!userId) {
    return (
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  let user;

  try {
    user = await users.get<UserPrefs>(userId);
  } catch {
    return (
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name,
  )}&background=random&size=200`;

  return (
    <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-40 shrink-0">
          <div className="h-40 w-40 overflow-hidden rounded-xl">
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-start justify-between">
            <div className="block space-y-0.5">
              <h1 className="text-3xl font-bold">{user.name}</h1>

              <p className="text-lg text-gray-500">{user.email}</p>

              <p className="flex items-center gap-1 text-sm font-bold text-gray-500">
                <IconUserFilled className="w-4 shrink-0" />
                Dropped {convertDateToRelativeTime(new Date(user.$createdAt))}
              </p>

              <p className="flex items-center gap-1 text-sm text-gray-500">
                <IconClockFilled className="w-4 shrink-0" />
                Last activity{" "}
                {convertDateToRelativeTime(new Date(user.$updatedAt))}
              </p>
            </div>

            <div className="shrink-0">
              <EditButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Navbar />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
