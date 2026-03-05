import React from 'react';
import { Link } from 'react-router-dom';

const Developer = () => {
    const skills = [
        { name: 'Java', level: 91 },
        { name: 'Spring Boot', level: 90 },
        { name: 'React.js', level: 80 },
        { name: 'Node.js', level: 70 },
        { name: 'MongoDB', level: 80 },
        { name: 'MySQL', level: 85 },
        { name: 'Docker', level: 60 },
        { name: 'Kafka', level: 40 },
    ];

    const otherSkills = [
        'Microservices', 'Hibernate', 'JavaScript', 'C++', 'Tailwind CSS',
        'SonarQube', 'Git', 'Redis', 'Postman'
    ];

    const socialLinks = [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/in/maheshshinde9100/', icon: 'fab fa-linkedin' },
        { name: 'GitHub', url: 'https://github.com/maheshshinde9100', icon: 'fab fa-github' },
        { name: 'HackerRank', url: 'https://www.hackerrank.com/profile/maheshshinde9100', icon: 'fab fa-hackerrank' },
        { name: 'LeetCode', url: 'https://leetcode.com/u/code-with-mahesh/', icon: 'fas fa-code' },
        { name: 'CodeChef', url: 'https://www.codechef.com/users/coder_mahi', icon: 'fas fa-terminal' },
        { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/user/coder_mahi/', icon: 'fas fa-graduation-cap' },
        { name: 'Portfolio', url: 'https://maheshshinde-dev.vercel.app', icon: 'fas fa-globe' },
        { name: 'Codeforces', url: 'https://codeforces.com/profile/shindemahesh.dev', icon: 'fas fa-chart-line' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header/Hero Section */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl mb-12 flex flex-col md:flex-row items-center gap-12 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                    <div className="relative group">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-[6px] border-white shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                            <img
                                src="https://maheshshinde-dev.vercel.app/profile.jpg"
                                alt="Mahesh Shinde"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://ui-avatars.com/api/?name=Mahesh+Shinde&size=512&background=000&color=fff";
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            Available for Opportunities
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-2 tracking-tight">Mahesh Shinde</h1>
                        <p className="text-xl md:text-2xl font-bold text-gray-500 mb-8">B. Tech Computer Engineering Student</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
                            <span className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-sm">
                                <i className="fas fa-university text-blue-600"></i> Sanjivani College of Engineering
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-sm">
                                <i className="fas fa-map-marker-alt text-red-500"></i> Kopargaon, MH
                            </span>
                        </div>

                        <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-2xl font-medium">
                            Passionate full-stack developer with expertise in modern web technologies and backend systems.
                            Focusing on building scalable applications and exploring <span className="text-black font-bold underline decoration-blue-500 underline-offset-4">DevOps</span>, <span className="text-black font-bold underline decoration-indigo-500 underline-offset-4">AI Integration</span>, and cloud native architectures.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            {socialLinks.slice(0, 4).map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-blue-600 transition-all transform hover:scale-110 shadow-xl group"
                                    title={link.name}
                                >
                                    <i className={`${link.icon} text-xl group-hover:rotate-12 transition-transform`}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Skills & Technical Section */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100">
                            <h2 className="text-3xl font-black text-gray-900 mb-12 flex items-center gap-4">
                                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                                    <i className="fas fa-code"></i>
                                </span>
                                Technical Arsenal
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
                                {skills.map((skill) => (
                                    <div key={skill.name} className="group">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-black text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-xs">{skill.name}</span>
                                            <span className="text-blue-600 font-black text-sm">{skill.level}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-sm"
                                                style={{ width: `${skill.level}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Additional Toolkit</h3>
                                <div className="flex flex-wrap gap-3">
                                    {otherSkills.map((skill) => (
                                        <span key={skill} className="px-5 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-default shadow-sm text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Redesigned Contact Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <i className="fas fa-paper-plane text-gray-50 text-9xl -rotate-12"></i>
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Let's build something great</h2>
                                <p className="text-gray-500 font-medium mb-12 max-w-lg">I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <a
                                        href="mailto:maheshshinde9100@gmail.com"
                                        className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 hover:bg-black hover:text-white transition-all group border border-transparent hover:border-black"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-2xl shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-gray-300">Email Me</p>
                                            <p className="font-bold text-sm">maheshshinde9100@gmail.com</p>
                                        </div>
                                    </a>

                                    <a
                                        href="tel:9529544681"
                                        className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 hover:bg-black hover:text-white transition-all group border border-transparent hover:border-black"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white text-green-600 flex items-center justify-center text-2xl shadow-md group-hover:bg-green-600 group-hover:text-white transition-all">
                                            <i className="fas fa-phone"></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-gray-300">Call Me</p>
                                            <p className="font-bold text-sm">+91 9529544681</p>
                                        </div>
                                    </a>
                                </div>

                                <div className="mt-8 flex justify-center">
                                    <div className="bg-black text-white px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 transition-transform flex items-center gap-3">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Available for Freelance
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Profiles Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
                            <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-6 relative z-10 flex items-center gap-3">
                                <i className="fas fa-link text-blue-400"></i>
                                Profiles
                            </h2>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 hover:bg-white hover:text-black transition-all border border-white/5 hover:border-white group/link shadow-lg"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl group-hover/link:bg-black group-hover/link:text-white transition-all">
                                            <i className={link.icon}></i>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-center">{link.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                                <div className="bg-white/5 rounded-3xl p-6 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Current Project</p>
                                    <p className="font-bold text-white mb-2">LocalCab Platform</p>
                                    <p className="text-xs text-gray-400 italic">"Revolutionizing rural transit"</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <i className="fas fa-graduation-cap"></i> Education
                            </h3>
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-white/20">
                                    <div className="absolute w-3 h-3 bg-white rounded-full -left-[7px] top-1.5 shadow-lg shadow-white/50"></div>
                                    <p className="font-black text-sm uppercase tracking-widest mb-1">2022 - 2026</p>
                                    <p className="font-bold text-lg leading-tight mb-2">B.Tech Computer Engineering</p>
                                    <p className="text-sm text-white/70 font-medium italic">Sanjivani College of Engineering, Kopargaon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Home Link */}
                <div className="mt-24 text-center">
                    <Link to="/" className="inline-flex items-center gap-3 text-gray-400 hover:text-black font-black transition-all hover:-translate-x-2 group">
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        BACK TO HOME
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Developer;
