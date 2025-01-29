import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function NotFound() {
	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-4xl font-bold text-red-500 dark:text-red-400 mb-4">
					404 - Page Not Found
				</h1>
				<p className="text-lg mb-6">
					The page you are looking for does not exist.
				</p>
				<Link
					to="/"
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition dark:bg-green-600 dark:hover:bg-green-700">
					Home
				</Link>
			</div>
		</Layout>
	);
}

export default NotFound;
