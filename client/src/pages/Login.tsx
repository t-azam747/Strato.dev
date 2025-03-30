import { useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";
import { useUser } from "../context/user.context";

export const Login = () => {
    const [personDetails, setPersonDetails] = useState({
        email: "",
        password: "",
    });

    const { setUser } = useUser();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const cookie = new Cookies();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPersonDetails((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await api.post("/auth/login", personDetails);
            const token = result.data?.token;
            setUser(result.data.userObject);

            if (token) {
                localStorage.setItem("token", token);
                cookie.set("token", token);
                console.log("Token set, user will update in next render.");
                navigate("/wallet");
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-800 text-white">
            <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
                <h2 className="text-2xl font-semibold text-white text-center">Login</h2>
                <p className="mt-2 text-gray-300 text-center">Access your account</p>

                <form className="mt-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 text-sm text-gray-300">Email Address</label>
                        <input
                            onChange={handleInputChange}
                            value={personDetails.email}
                            type="email"
                            name="email"
                            id="email"
                            placeholder="example@example.com"
                            className="block w-full px-4 py-2 mt-2 text-white bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-300 focus:outline-none placeholder-gray-300"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm text-gray-300">Password</label>
                        <input
                            onChange={handleInputChange}
                            value={personDetails.password}
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Your Password"
                            className="block w-full px-4 py-2 mt-2 text-white bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-300 focus:outline-none placeholder-gray-300"
                        />
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Sign In
                        </button>
                        {error && <p className="text-center text-red-700 p-4">{error}</p>}
                    </div>
                </form>

                <p className="mt-6 text-sm text-center text-gray-400">
                    Don't have an account yet? {" "}
                    <span onClick={() => navigate("/signup")} className="text-blue-400 cursor-pointer hover:underline">
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
};
