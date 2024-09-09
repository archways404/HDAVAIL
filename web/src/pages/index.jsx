import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DisplayStatus from '../components/DisplayStatus';

function Index() {
	return (
		<Layout>
			<div className="absolute bottom-4 right-4">
				<DisplayStatus />
			</div>
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-4xl font-bold text-green-500 dark:text-green-400 mb-4">
					Welcome to HDAVAIL
				</h1>
				<p className="text-lg mb-6">This is the index page.</p>
				<div className="flex items-center space-x-4">
					<Link
						to="/login"
						className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition dark:bg-green-600 dark:hover:bg-green-700">
						Login
					</Link>
				</div>
			</div>
		</Layout>
	);
}

export default Index;
