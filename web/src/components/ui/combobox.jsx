import React, { useState } from 'react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Combobox({ items, placeholder, onChange }) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState(null);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between"
					onClick={() => setOpen((prev) => !prev)}>
					{selected
						? items.find((item) => item.value === selected)?.label
						: placeholder}
					<span className="ml-auto">{open ? '▲' : '▼'}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-2">
				<Command>
					<CommandInput placeholder="Search user..." />
					<CommandList>
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
								<CommandItem
									key={item.value}
									onSelect={() => {
										setSelected(item.value);
										setOpen(false);
										onChange(item.value);
									}}
									className="cursor-pointer">
									{item.label}
									{selected === item.value && (
										<Check className="ml-auto h-4 w-4" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
