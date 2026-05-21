import horse from "../assets/login-horse.webp";
import { useState } from "react";
import { useNavigate } from "react-router";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const accounts = [
        {
            email: "admin@gmail.com",
            password: "123456",
            role: "admin",
        },
        {
            email: "user@gmail.com",
            password: "123456",
            role: "user",
        },
    ];

    const handleLogin = () => {

        const foundUser = accounts.find(
            (acc) =>
                acc.email === email &&
                acc.password === password
        );

        if (foundUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(foundUser)
            );

            navigate("/home");

        } else {

            setError("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen bg-[#031b1c] flex items-center justify-center p-2 overflow-hidden">

            <div className="w-[98vw] h-[94vh] rounded-[28px] overflow-hidden border border-[#214344] flex bg-[#031b1c] shadow-[0_0_40px_rgba(0,0,0,0.45)]">

                {/* LEFT */}
                <div className="w-[33%] bg-[#031718] px-8 py-5 flex flex-col justify-center relative">

                    <div className="absolute top-[-120px] left-[-120px] w-[220px] h-[220px] bg-[#52ffe7]/10 blur-[100px] rounded-full"></div>

                    <div className="flex items-center gap-3 mb-5 relative z-10">

                        <div className="w-6 h-6 rounded-full bg-[#52ffe7]"></div>

                        <h1 className="text-white text-lg font-bold">
                            GoldenHoof
                        </h1>
                    </div>

                    <h1 className="text-white text-[34px] leading-[1.05] font-bold">
                        Welcome Back
                        <br />

                        <span className="text-[#52ffe7]">
                            to GoldenHoof
                        </span>
                    </h1>

                    <p className="text-gray-400 mt-3 text-[14px] leading-6">
                        Sign in to access your account and stay updated
                        with the world of horse racing.
                    </p>

                    {/* EMAIL */}
                    <div className="mt-5">

                        <label className="text-white text-xs block mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#071f20]/80 border border-[#214344] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#52ffe7]"
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="mt-4">

                        <label className="text-white text-xs block mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#071f20]/80 border border-[#214344] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#52ffe7]"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-red-400 text-sm mt-3">
                            {error}
                        </p>
                    )}

                    {/* LOGIN */}
                    <button
                        onClick={handleLogin}
                        className="w-full mt-5 bg-[#5fffe9] text-black text-sm font-bold py-2 rounded-xl hover:bg-[#7effef] transition"
                    >
                        Log In
                    </button>

                    {/* DEMO ACCOUNT */}
                    <div className="mt-6 text-xs text-gray-400 space-y-1">

                        <p className="text-[#52ffe7] font-semibold">
                            Demo Accounts
                        </p>

                        <p>
                            admin@gmail.com / 123456
                        </p>

                        <p>
                            user@gmail.com / 123456
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="relative flex-1 overflow-hidden">

                    <img
                        src={horse}
                        alt="Horse Racing"
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/55"></div>

                    <div className="absolute inset-0 bg-gradient-to-r from-[#031718]/90 via-transparent to-transparent"></div>

                    <div className="absolute left-14 top-1/2 -translate-y-1/2 text-white max-w-[420px]">

                        <h2 className="text-[42px] leading-[1.05] font-bold">
                            Where Champions
                            <br />

                            <span className="text-[#52ffe7]">
                                Run to Glory
                            </span>
                        </h2>

                        <p className="mt-4 text-gray-200 text-[15px] leading-6">
                            Join a global community of racing enthusiasts,
                            track live races, and celebrate every victory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;