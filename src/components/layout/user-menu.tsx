"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  firstName,
  lastName,
  email,
  avatarUrl,
  roleLabel,
}: {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
        <Avatar>
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span>
            {firstName} {lastName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">{email}</span>
          <span className="mt-1 text-xs font-medium text-primary">{roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/profile">
            <UserIcon /> Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => logout()}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
