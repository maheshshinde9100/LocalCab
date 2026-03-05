import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-black text-white pt-20 pb-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="md:col-span-1">
                        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-6">
                            <span className="bg-white text-black px-2 py-0.5 rounded">L</span>
                            LocalCab
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Empowering rural communities with safe, reliable, and technology-driven transportation solutions. Connecting villages to cities, one ride at a time.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Opportunities</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li><Link to="/drivers/register" className="hover:text-white transition-colors">Drive with us</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Village Partners</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Fleet Solutions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Support</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li><Link to="/" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="/" className="hover:text-white transition-colors">Safety</Link></li>
                            <li><Link to="/developer" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/developer" className="hover:text-white transition-colors">Developer Details</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-6">
                        <a href="https://github.com/maheshshinde9100" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-github"></i></a>
                        <a href="https://www.linkedin.com/in/maheshshinde9100/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></a>
                        <a href="https://maheshshinde-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><i className="fas fa-globe"></i></a>
                    </div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} LocalCab Technologies. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
