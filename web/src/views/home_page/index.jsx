import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import DisplayStatus from '../../components/DisplayStatus';

function Index() {
	return (
		<Layout>
			{/* 
			<div className="absolute bottom-4 right-4">
				<DisplayStatus />
			</div>
			*/}
			{/* Flex container for ASCII Art and Button */}
			<div className="flex flex-col items-center justify-between min-h-screen text-center w-full">
				{/* ASCII Art - Ensured proper spacing and wrapping */}
				<pre className="text-xl font-mono leading-none bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-pre-wrap max-w-full mt-32 px-4">
					{`

                                                   dddddddd                                                                                         
                     333333333333333               d::::::d                 hhhhhhh               iiii     ffffffffffffffff           tttt          
                    3:::::::::::::::33             d::::::d                 h:::::h              i::::i   f::::::::::::::::f       ttt:::t          
                    3::::::33333::::::3            d::::::d                 h:::::h               iiii   f::::::::::::::::::f      t:::::t          
                    3333333     3:::::3            d:::::d                  h:::::h                      f::::::fffffff:::::f      t:::::t          
rrrrr   rrrrrrrrr               3:::::3    ddddddddd:::::d     ssssssssss    h::::h hhhhh       iiiiiii  f:::::f       ffffffttttttt:::::ttttttt    
r::::rrr:::::::::r              3:::::3  dd::::::::::::::d   ss::::::::::s   h::::hh:::::hhh    i:::::i  f:::::f             t:::::::::::::::::t    
r:::::::::::::::::r     33333333:::::3  d::::::::::::::::d ss:::::::::::::s  h::::::::::::::hh   i::::i f:::::::ffffff       t:::::::::::::::::t    
rr::::::rrrrr::::::r    3:::::::::::3  d:::::::ddddd:::::d s::::::ssss:::::s h:::::::hhh::::::h  i::::i f::::::::::::f       tttttt:::::::tttttt    
 r:::::r     r:::::r    33333333:::::3 d::::::d    d:::::d  s:::::s  ssssss  h::::::h   h::::::h i::::i f::::::::::::f             t:::::t          
 r:::::r     rrrrrrr            3:::::3d:::::d     d:::::d    s::::::s       h:::::h     h:::::h i::::i f:::::::ffffff             t:::::t          
 r:::::r                        3:::::3d:::::d     d:::::d       s::::::s    h:::::h     h:::::h i::::i  f:::::f                   t:::::t          
 r:::::r                        3:::::3d:::::d     d:::::d ssssss   s:::::s  h:::::h     h:::::h i::::i  f:::::f                   t:::::t    tttttt
 r:::::r            3333333     3:::::3d::::::ddddd::::::dds:::::ssss::::::s h:::::h     h:::::hi::::::if:::::::f                  t::::::tttt:::::t
 r:::::r            3::::::33333::::::3 d:::::::::::::::::ds::::::::::::::s  h:::::h     h:::::hi::::::if:::::::f                  tt::::::::::::::t
 r:::::r            3:::::::::::::::33   d:::::::::ddd::::d s:::::::::::ss   h:::::h     h:::::hi::::::if:::::::f                    tt:::::::::::tt
 rrrrrrr             333333333333333      ddddddddd   ddddd  sssssssssss     hhhhhhh     hhhhhhhiiiiiiiifffffffff                      ttttttttttt  
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    

                                                                                        
                                                                                        

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
