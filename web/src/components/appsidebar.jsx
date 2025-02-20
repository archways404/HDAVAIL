import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';

import { LuCircleUserRound } from 'react-icons/lu';
import { FaChevronUp } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarFooter,
	SidebarMenuBadge,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Link } from 'react-router-dom';

// Sidebar menu items
const items = [
	{ title: 'Home', url: '/', icon: Home },
	{ title: 'Inbox', url: '/inbox', icon: Inbox },
	{ title: 'Calendar', url: '/calendar', icon: Calendar },
	{ title: 'Search', url: '/search', icon: Search },
	{ title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
	return (
		<SidebarProvider open={true}>
			{/* Fixed Sidebar */}
			<div className="w-60 h-screen fixed top-0 left-0 bg-gray-900 dark:bg-gray-900 flex flex-col shadow-lg">
				{/* Sidebar Component */}
				<Sidebar
					collapsible="none"
					side="left"
					className="h-full">
					<SidebarContent className="h-full flex flex-col">
						<SidebarGroup className="flex-1">
							<SidebarGroupLabel className="mt-4 pl-4 text-white">
								Application
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{items.map((item) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link
													to={item.url}
													className="flex items-center gap-3 p-2 rounded-md text-white hover:bg-gray-800 transition-all">
													<item.icon className="w-5 h-5" />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
											<SidebarMenuBadge>NEW</SidebarMenuBadge>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					{/* Sidebar Footer */}
					<SidebarFooter className="p-4">
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										{/* Profile Button */}
										<Button
											variant="ghost"
											className="w-full flex justify-between items-center px-4 py-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all">
											<div className="flex items-center gap-3">
												{/* Avatar */}
												<LuCircleUserRound className="w-16 h-16 text-gray-400" />

												{/* User Info */}
												<div className="text-left">
													<p className="text-sm font-medium text-white">
														John S
													</p>
													<p className="text-xs text-gray-400">ab1234@mau.se</p>
												</div>
											</div>
											<FaChevronUp className="w-4 h-4 text-gray-400" />
										</Button>
									</DropdownMenuTrigger>

									{/* Dropdown Content */}
									<DropdownMenuContent className="w-56 bg-gray-800 shadow-lg rounded-md p-2">
										<DropdownMenuItem className="p-2 hover:bg-gray-700 rounded-md flex gap-3 items-center text-red-400">
											<TbLogout className="w-4 h-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>
			</div>
		</SidebarProvider>
	);
}
