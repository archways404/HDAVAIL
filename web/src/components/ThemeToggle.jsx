import { useContext } from 'react';
import { Switch } from '@/components/ui/switch';
import { ThemeContext } from '../context/ThemeContext';

function ThemeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);

	const isDarkMode = theme === 'dark';

	return (
		<div className="flex items-center space-x-2">
			<Switch
				checked={isDarkMode}
				onCheckedChange={toggleTheme}
				className="bg-green-500 dark:bg-green-600"
			/>
			<span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
		</div>
	);
}

export default ThemeToggle;
