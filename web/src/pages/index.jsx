import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DisplayStatus from '../components/DisplayStatus';

function Index() {
	return (
		<Layout>
			<div className="absolute bottom-4 right-4">
				<DisplayStatus />
			</div>
			{/* Flex container for ASCII Art and Button */}
			<div className="flex flex-col items-center justify-between min-h-screen text-center w-full">
				{/* ASCII Art - Ensured proper spacing and wrapping */}
				<pre className="text-xl font-mono leading-none bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-pre-wrap max-w-full mt-32 px-4">
					{`			                                                
 ##   ##  #######  #######  #######  #######  ##      
 ##  ##        ##                ##       ##  ##      
 #####    ##   ##  ####     ######   ##   ##  ##      
 ##  ##   ##   ##  ##       ##   ##  ##   ##  ##   ## 
 ##   ##  #######  #######  #######  #######  ####### 
                                                      

 :::    :::  ::::::::  :::::::::: :::::::::   ::::::::  :::        
:+:   :+:  :+:    :+: :+:        :+:    :+: :+:    :+: :+:        
+:+  +:+   +:+    +:+ +:+        +:+    +:+ +:+    +:+ +:+        
+#++:++    +#+    +:+ +#++:++#   +#++:++#+  +#+    +:+ +#+        
+#+  +#+   +#+    +#+ +#+        +#+    +#+ +#+    +#+ +#+        
#+#   #+#  #+#    #+# #+#        #+#    #+# #+#    #+# #+#        
###    ###  ########  ########## #########   ########  ########## 


@@@  @@@   @@@@@@   @@@@@@@@  @@@@@@@    @@@@@@   @@@       
@@@  @@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@       
@@!  !@@  @@!  @@@  @@!       @@!  @@@  @@!  @@@  @@!       
!@!  @!!  !@!  @!@  !@!       !@   @!@  !@!  @!@  !@!       
@!@@!@!   @!@  !@!  @!!!:!    @!@!@!@   @!@  !@!  @!!       
!!@!!!    !@!  !!!  !!!!!:    !!!@!!!!  !@!  !!!  !!!       
!!: :!!   !!:  !!!  !!:       !!:  !!!  !!:  !!!  !!:       
:!:  !:!  :!:  !:!  :!:       :!:  !:!  :!:  !:!   :!:      
 ::  :::  ::::: ::   :: ::::   :: ::::  ::::: ::   :: ::::  
 :   :::   : :  :   : :: ::   :: : ::    : :  :   : :: : :  
					`}
				</pre>

				{/* Centered Button */}
				<div className="mt-auto mb-16">
					<Link
						to="/login"
						className="px-6 py-3 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:from-green-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
						Login
					</Link>
				</div>
			</div>
		</Layout>
	);
}

export default Index;
