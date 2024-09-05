import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ThemeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const isLightMode = theme === 'light';

	return (
		<div className="flex items-center space-x-2">
			<div
				onClick={toggleTheme}
				className={`${
					isLightMode ? 'bg-gray-500' : 'bg-gray-500'
				} relative inline-flex items-center h-6 rounded-full w-12 cursor-pointer transition-colors duration-250 ease-in-out`}>
				<span
					className={`${
						isLightMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
					} inline-block w-5 h-5 transform rounded-full transition-transform duration-250 shadow-lg ease-in-out`}
				/>
			</div>
			<span>{isLightMode ? 'Light Mode' : 'Dark Mode'}</span>
		</div>
	);
}

export default ThemeToggle;
