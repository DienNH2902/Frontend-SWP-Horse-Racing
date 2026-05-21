// App.jsx hoặc HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router";

// Data mẫu
const upcomingRaces = [
    { id: 1, status: 'LIVE', time: '', raceNum: 'Race 4', name: 'Emerald Stakes', venue: 'Royal Turf Club', distance: '1,600m', surface: 'Turf', image: '/race1.jpg' },
    { id: 2, status: '', time: '15:15', raceNum: 'Race 5', name: 'Golden Mile Cup', venue: 'Sunshine Racecourse', distance: '1,600m', surface: 'Turf', image: null },
    { id: 3, status: '', time: '16:00', raceNum: 'Race 6', name: 'Thunderbolt Sprint', venue: 'Valley Racecourse', distance: '1,200m', surface: 'Dirt', image: null },
    { id: 4, status: '', time: '16:45', raceNum: 'Race 7', name: "Champion's Cup", venue: 'Royal Turf Club', distance: '2,400m', surface: 'Turf', image: null },
    { id: 5, status: '', time: '17:30', raceNum: 'Race 8', name: 'Victory Purse', venue: 'Sunshine Racecourse', distance: '1,800m', surface: 'Turf', image: null },
];

const topHorses = [
    { id: 1, rank: 1, name: 'Silver Bullet', age: '6 yrs', breed: 'Thoroughbred', owner: 'Greenfield Stable', rating: 98, wins: 12, image: '/horse1.jpg' },
    { id: 2, rank: 2, name: 'Emerald Dream', age: '5 yrs', breed: 'Thoroughbred', owner: 'Skyline Racing', rating: 96, wins: 10, image: '/horse2.jpg' },
    { id: 3, rank: 3, name: 'Midnight Runner', age: '7 yrs', breed: 'Thoroughbred', owner: 'Victory Stables', rating: 95, wins: 14, image: '/horse3.jpg' },
    { id: 4, rank: 4, name: 'Thunder King', age: '6 yrs', breed: 'Thoroughbred', owner: 'Royal Bloodstock', rating: 94, wins: 9, image: '/horse4.jpg' },
];

const topJockeys = [
    { id: 1, rank: 1, name: "Liam O'Connor", wins: 123, winRate: '24%', image: '/jockey1.jpg' },
    { id: 2, rank: 2, name: 'Sophia Martinez', wins: 98, winRate: '21%', image: '/jockey2.jpg' },
    { id: 3, rank: 3, name: 'Noah Henderson', wins: 87, winRate: '19%', image: '/jockey3.jpg' },
    { id: 4, rank: 4, name: 'Ava Thompson', wins: 76, winRate: '18%', image: '/jockey4.jpg' },
    { id: 5, rank: 5, name: 'Ethan Walker', wins: 68, winRate: '17%', image: '/jockey5.jpg' },
];

const leaderboardData = [
    { rank: 1, name: 'Silver Bullet', rating: 98, wins: 12, places: 5, points: 1250, image: '/horse1.jpg' },
    { rank: 2, name: 'Emerald Dream', rating: 96, wins: 10, places: 4, points: 1080, image: '/horse2.jpg' },
    { rank: 3, name: 'Midnight Runner', rating: 95, wins: 14, places: 3, points: 1075, image: '/horse3.jpg' },
    { rank: 4, name: 'Thunder King', rating: 94, wins: 9, places: 6, points: 980, image: '/horse4.jpg' },
    { rank: 5, name: 'Royal Phantom', rating: 93, wins: 8, places: 4, points: 870, image: '/horse5.jpg' },
];

const latestResults = [
    { id: 1, status: 'LIVE', race: 'Race 4 - Emerald Stakes', venue: 'Royal Turf Club', distance: '1,600m', surface: 'Turf', winner: 'Silver Bullet', jockey: "L. O'Connor", time: '1:34.25', image: '/result1.jpg' },
    { id: 2, status: 'Finished', race: 'Race 3 - Sunshine Cup', venue: 'Sunshine Racecourse', distance: '1,800m', surface: 'Turf', winner: 'Emerald Dream', jockey: 'S. Martinez', time: '1:48.63', image: '/result2.jpg' },
    { id: 3, status: 'Finished', race: 'Race 2 - Rapid Dash', venue: 'Valley Racecourse', distance: '1,200m', surface: 'Dirt', winner: 'Thunder King', jockey: 'N. Henderson', time: '1:12.45', image: '/result3.jpg' },
    { id: 4, status: 'Finished', race: 'Race 1 - Morning Sprint', venue: 'Royal Turf Club', distance: '1,000m', surface: 'Turf', winner: 'Speed Demon', jockey: 'E. Walker', time: '0:58.34', image: '/result4.jpg' },
];

const topPredictors = [
    { rank: 1, name: 'RacingFan88', points: '2,450 PTS', avatar: '/pred1.jpg' },
    { rank: 2, name: 'TurfMaster', points: '2,150 PTS', avatar: '/pred2.jpg' },
    { rank: 3, name: 'SpeedKing', points: '1,980 PTS', avatar: '/pred3.jpg' },
];

// Icons components
const HorseIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8m16 0H4" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
);

const SurfaceIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


export default function Home() {
    const [leaderboardTab, setLeaderboardTab] = useState('Horses');

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-slate-900 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-400 rounded-full"></div>
                            <span className="text-white font-bold text-xl">GoldenHoof</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            {['Races', 'Horses', 'Jockeys', 'Results', 'Rankings', 'Predictions', 'News', 'About'].map((item) => (
                                <a key={item} href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-300 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="text-gray-300 hover:text-white text-sm">Log in</button>
                        <button className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
                            Sign up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/api/placeholder/1920/600"
                        alt="Horse racing"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-20">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-emerald-400 text-sm font-medium">LIVE THE THRILL</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-2">Where Champions</h1>
                        <h1 className="text-5xl font-bold text-emerald-400 italic mb-6">Run to Glory</h1>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            GoldenHoof is your ultimate destination for horse racing. Follow the races, track the champions, and be part of every thrilling moment.
                        </p>

                        <div className="flex gap-4 mb-12">
                            <button className="bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors">
                                Explore Races
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button className="border border-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
                                View Live Results
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex gap-12">
                            <div>
                                <div className="text-3xl font-bold text-white">120+</div>
                                <div className="text-gray-400 text-sm">Races This Season</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">200+</div>
                                <div className="text-gray-400 text-sm">Horses</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">150+</div>
                                <div className="text-gray-400 text-sm">Jockeys</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">50K+</div>
                                <div className="text-gray-400 text-sm">Active Fans</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Races */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Upcoming Races</h2>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                        View Full Schedule
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {upcomingRaces.map((race) => (
                        <div key={race.id} className="min-w-[220px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {race.status === 'LIVE' ? (
                                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded font-medium">LIVE</span>
                                    ) : (
                                        <span className="text-slate-600 text-sm font-medium">{race.time}</span>
                                    )}
                                    <span className="text-gray-400 text-sm">{race.raceNum}</span>
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">{race.name}</h3>
                                <p className="text-gray-500 text-sm mb-3">{race.venue}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <ClockIcon />
                                        {race.distance}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <SurfaceIcon />
                                        {race.surface}
                                    </span>
                                </div>
                            </div>

                            {race.status === 'LIVE' && (
                                <div className="relative">
                                    <img src="/api/placeholder/220/120" alt="Race" className="w-full h-28 object-cover" />
                                    <button className="absolute bottom-3 left-3 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors">
                                        Watch Live
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {race.status !== 'LIVE' && (
                                <div className="px-4 pb-4">
                                    <button className="w-full border border-gray-200 text-slate-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button className="min-w-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* Top Horses & Top Jockeys */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Top Horses */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Top Horses</h2>
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                                View All Horses
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {topHorses.map((horse) => (
                                <div key={horse.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="relative">
                                        <img src="/api/placeholder/200/140" alt={horse.name} className="w-full h-32 object-cover" />
                                        <span className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${horse.rank === 1 ? 'bg-yellow-500' : horse.rank === 2 ? 'bg-gray-400' : horse.rank === 3 ? 'bg-amber-600' : 'bg-slate-500'
                                            }`}>
                                            {horse.rank}
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-slate-800 text-sm">{horse.name}</h3>
                                        <p className="text-gray-500 text-xs mb-2">{horse.age} · {horse.breed}</p>
                                        <div className="text-xs text-gray-500 mb-2">
                                            <span className="text-gray-400">Owner</span>
                                            <span className="block text-slate-700">{horse.owner}</span>
                                        </div>
                                        <div className="flex justify-between text-xs mb-3">
                                            <div>
                                                <span className="text-gray-400">Rating</span>
                                                <span className="block text-slate-700 font-semibold">{horse.rating}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Wins</span>
                                                <span className="block text-slate-700 font-semibold">{horse.wins}</span>
                                            </div>
                                        </div>
                                        <button className="w-full border border-gray-200 text-slate-700 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Jockeys */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Top Jockeys</h2>
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                                View All Jockeys
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            {topJockeys.map((jockey, index) => (
                                <div key={jockey.id} className={`flex items-center justify-between p-4 ${index !== topJockeys.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 font-medium w-4">{jockey.rank}</span>
                                        <img src="/api/placeholder/40/40" alt={jockey.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{jockey.name}</h4>
                                            <p className="text-gray-500 text-sm">{jockey.wins} Wins</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-emerald-600 font-semibold">Win Rate {jockey.winRate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard & Latest Results */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Leaderboard */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Leaderboard</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                {['Horses', 'Jockeys', 'Owners'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setLeaderboardTab(tab)}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors ${leaderboardTab === tab
                                            ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs text-gray-500 uppercase">
                                        <th className="py-3 px-4 text-left">#</th>
                                        <th className="py-3 px-4 text-left">Horse</th>
                                        <th className="py-3 px-4 text-center">Rating</th>
                                        <th className="py-3 px-4 text-center">Wins</th>
                                        <th className="py-3 px-4 text-center">Places</th>
                                        <th className="py-3 px-4 text-center">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((horse) => (
                                        <tr key={horse.rank} className="border-t border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-500">{horse.rank}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img src="/api/placeholder/32/32" alt={horse.name} className="w-8 h-8 rounded-full object-cover" />
                                                    <span className="font-medium text-slate-800">{horse.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-700">{horse.rating}</td>
                                            <td className="py-3 px-4 text-center text-slate-700">{horse.wins}</td>
                                            <td className="py-3 px-4 text-center text-slate-700">{horse.places}</td>
                                            <td className="py-3 px-4 text-center font-semibold text-slate-800">{horse.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="p-4 border-t border-gray-100">
                                <a href="#" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                                    View Full Rankings
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Latest Race Results */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Latest Race Results</h2>
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
                                View All Results
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="space-y-4">
                            {latestResults.map((result) => (
                                <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4">
                                    <img src="/api/placeholder/100/80" alt="Race" className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${result.status === 'LIVE' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {result.status}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm">{result.race}</h4>
                                        <p className="text-gray-500 text-xs">{result.venue} · {result.distance} · {result.surface}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span className="text-xs font-medium text-slate-800">{result.winner}</span>
                                        </div>
                                        <p className="text-gray-500 text-xs">1st · {result.jockey}</p>
                                        <p className="text-emerald-600 font-bold text-lg">{result.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Predictions CTA */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-slate-800 rounded-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="p-8 md:w-1/3">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8l4-4 4 4h-2v4z" />
                                </svg>
                                <h3 className="text-xl font-bold text-white">Make Your Predictions</h3>
                            </div>
                            <p className="text-gray-400 mb-6">Predict race winners and compete with fans around the world. Win points and unlock exclusive rewards!</p>
                            <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors">
                                Start Predicting
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 md:w-1/3 bg-slate-700/50">
                            <h4 className="text-gray-400 text-sm mb-4">Top Predictors This Week</h4>
                            <div className="space-y-3">
                                {topPredictors.map((predictor) => (
                                    <div key={predictor.rank} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 font-medium">{predictor.rank}</span>
                                            <img src="/api/placeholder/36/36" alt={predictor.name} className="w-9 h-9 rounded-full" />
                                            <span className="text-white font-medium">{predictor.name}</span>
                                        </div>
                                        <span className="text-emerald-400 font-semibold">{predictor.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-1/3 flex items-end justify-end p-8">
                            <img src="/api/placeholder/200/180" alt="Trophy" className="opacity-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-emerald-400 rounded-full"></div>
                                <span className="text-white font-bold text-xl">GoldenHoof</span>
                            </div>
                            <p className="text-sm mb-4">The ultimate platform for horse racing enthusiasts. Stay updated, stay excited.</p>
                            <div className="flex gap-4">
                                {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                                    <a key={social} href="#" className="hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Explore</h4>
                            <ul className="space-y-2 text-sm">
                                {['Races', 'Horses', 'Jockeys', 'Results', 'Rankings'].map((item) => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                {['Help Center', 'Contact Us', 'Terms of Use', 'Privacy Policy', 'FAQ'].map((item) => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Community</h4>
                            <ul className="space-y-2 text-sm">
                                {['News', 'Events', 'Blog', 'Forum', 'About Us'].map((item) => (
                                    <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
                            <p className="text-sm mb-3">Subscribe to our newsletter</p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-800 text-white px-4 py-2 rounded-l-lg flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button className="bg-emerald-500 text-white px-4 py-2 rounded-r-lg hover:bg-emerald-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 text-center text-sm">
                        <p>© 2024 GoldenHoof. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
