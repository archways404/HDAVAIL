import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

import { FaLightbulb } from 'react-icons/fa';
import { MdDarkMode } from 'react-icons/md';

function ThemeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const isLightMode = theme === 'light';

	return (
		<div className="flex items-center space-x-2">
			<div
				onClick={toggleTheme}
				className={`relative inline-flex items-center h-7 w-14 cursor-pointer rounded-full transition-all duration-300 ease-in-out 
                    ${isLightMode ? 'bg-gray-400' : 'bg-gray-600'}`}>
				{/* Light Mode Icon */}
				<FaLightbulb
					className={`absolute left-2 transition-opacity duration-300 ${
						isLightMode
							? 'opacity-100 text-yellow-400'
							: 'opacity-0 text-gray-400'
					}`}
					size={16}
				/>

				{/* Dark Mode Icon */}
				<MdDarkMode
					className={`absolute right-2 transition-opacity duration-300 ${
						isLightMode
							? 'opacity-0 text-gray-400'
							: 'opacity-100 text-blue-400'
					}`}
					size={18}
				/>

				{/* Toggle Button */}
				<span
					className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out
                    ${
											isLightMode
												? 'translate-x-7 bg-white'
												: 'translate-x-1 bg-gray-900'
										}`}
				/>
			</div>
		</div>
	);
}

export default ThemeToggle;
