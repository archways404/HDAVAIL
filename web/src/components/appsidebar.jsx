import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MdOutlinePrivacyTip } from 'react-icons/md';

import { LuCircleUserRound } from 'react-icons/lu';
import { FaChevronUp } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';

import { CgProfile } from 'react-icons/cg';

//import UserIcon from '../assets/user.png'; // Import the image
import UserIcon from '../assets/user1.png'; // Import the image

import ThemeToggle from './ThemeToggle';
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

export function AppSidebar({ user, consent }) {
	if (!user) {
		return null;
	}

	// Format the user's name
	const formattedFirstName =
		user.first.charAt(0).toUpperCase() + user.first.slice(1);
	const formattedLastName = user.last.charAt(0).toUpperCase();

	// Define all possible categories
	const allCategories = ['necessary', 'preferences', 'analytics'];

	// Use optional chaining with a fallback to false
	const permissionsObject = allCategories.reduce((acc, category) => {
		acc[category] = consent?.acceptedCategories?.includes(category) ?? false;
		return acc;
	}, {});

	console.log('permissions obj', permissionsObject);

	return (
		<SidebarProvider open={true}>
			{/* Fixed Sidebar */}
			<div className="w-60 h-screen fixed top-0 left-0 flex flex-col shadow-lg">
				{/* Sidebar Component */}
				<Sidebar
					collapsible="none"
					side="left"
					className="h-full bg-transparent">
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
											<SidebarMenuBadge>
												<Badge
													variant="outline"
													className="border-green-500 text-green-500 text-[10px] font-light px-1.5 py-0.5 h-auto rounded-xl">
													NEW
												</Badge>
											</SidebarMenuBadge>
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
									<div className="grid grid-cols-2 gap-4 p-6">
										{/* Theme Toggle */}
										<div className="flex justify-center">
											<ThemeToggle className="p-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all w-full max-w-[120px]" />
										</div>

										{/* Cookie Preferences Button */}
										<div className="flex justify-center">
											<Button
												type="button"
												className="px-2 py-2 bg-transparent rounded-lg hover:bg-gray-700 transition-all"
												onClick={() => window.CookieConsent?.showPreferences()}>
												<MdOutlinePrivacyTip
													className="text-white"
													style={{
														width: '24px',
														height: '24px',
														color: 'red',
													}}
												/>
											</Button>
										</div>
									</div>
									<DropdownMenuTrigger asChild>
										{/* Profile Button */}
										<Button
											variant="ghost"
											className="w-full flex items-center px-4 py-6 rounded-lg bg-transparent border-2 border-gray-700 hover:bg-gray-700 transition-all">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												{/* Avatar */}
												<img
													src={UserIcon}
													alt="User Avatar"
													className="w-8 h-8 rounded-full object-cover"
												/>
												{/* User Info */}
												<div className="text-left flex-1 min-w-0">
													<p className="text-[clamp(12px, 4vw, 16px)] font-medium text-white truncate">
														{formattedFirstName} {formattedLastName}
													</p>
													<p className="text-[clamp(10px, 3vw, 14px)] text-gray-400 truncate">
														{user.email}
													</p>
												</div>
											</div>

											{/* Chevron (Prevent Overflow) */}
											<FaChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
										</Button>
									</DropdownMenuTrigger>

									{/* Dropdown Content */}
									<DropdownMenuContent className="w-56 bg-transparent rounded-lg">
										<DropdownMenuItem className="p-2 hover:bg-gray-700 rounded-lg flex gap-3 items-center text-red-400">
											<TbLogout className="w-4 h-4" />
											<Link to="/logout">Sign out</Link>
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
