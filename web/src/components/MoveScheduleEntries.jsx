import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { createSwapy } from 'swapy';

import { useRef, useEffect } from 'react';

function MoveScheduleEntry() {
	const containerRef = useRef(null);

	useEffect(() => {
		if (containerRef.current) {
			const swapy = createSwapy(containerRef.current, {
				animation: 'dynamic', // options: 'dynamic', 'spring', or 'none'
			});

			// Enable Swapy
			swapy.enable(true);

			// Cleanup on unmount
			return () => {
				swapy.destroy();
			};
		}
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
				<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
					Create a new entry
				</h2>
				<div
					className="container"
					ref={containerRef}>
					<div
						className="section-1"
						data-swapy-slot="foo">
						<div
							className="content-a"
							data-swapy-item="a">
							Content A
						</div>
					</div>

					<div
						className="section-2"
						data-swapy-slot="bar">
						<div
							className="content-b"
							data-swapy-item="b">
							<div
								className="handle"
								data-swapy-handle>
								Handle
							</div>
							Content B
						</div>
					</div>

					<div
						className="section-3"
						data-swapy-slot="baz">
						<div
							className="content-c"
							data-swapy-item="c">
							Content C
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default MoveScheduleEntry;
