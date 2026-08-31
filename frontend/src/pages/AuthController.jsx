import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

function AuthController() {
  const { handleRegister, handleLogin } = useContext(AuthContext);

  const [formState, setFormState] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignIn = formState === 0;

  // ==========================
  // LOGIN / REGISTER
  // ==========================

  const handleAuth = async () => {
    try {
      setError("");
      setMessage("");

      if (isSignIn) {
        const result = await handleLogin(username, password);

        setMessage(result || "Sign in successful.");
      } else {
        const result = await handleRegister(
          name,
          username,
          password
        );

        setMessage(result || "Account created successfully.");
        setFormState(0);
        
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ==========================
  // FORM SUBMIT
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    if (!isSignIn && !name) {
      setError("Please enter your name.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    await handleAuth();
  };

  // ==========================
  // SWITCH LOGIN / SIGNUP
  // ==========================

  const switchForm = (type) => {
    setFormState(type);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-950 px-6 text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="mx-auto flex max-w-7xl items-center justify-between py-6">
        <Link
          to="/"
          className="text-2xl font-bold"
        >
          NextMeet
        </Link>

        <Link
          to="/"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          Back to home
        </Link>
      </nav>

      {/* ================= MAIN ================= */}

      <main className="mx-auto grid min-h-[calc(100vh-100px)] max-w-6xl items-center gap-16 py-10 lg:grid-cols-2">

        {/* ================= LEFT ================= */}

        <div className="hidden lg:block">

          <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">
            Welcome to NextMeet
          </p>

          <h1 className="mt-5 text-5xl font-normal leading-tight">
            Connect with your
            <br />
            <span className="text-yellow-400">
              Loved Ones
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-400">
            Join your meetings, connect with people and
            experience simple and reliable video calling
            with NextMeet.
          </p>
          
        </div>

        {/* ================= AUTH CARD ================= */}

        <div className="mx-auto w-full max-w-md">

          {/* Mobile heading */}

          <div className="mb-6 text-center lg:hidden">
            <h1 className="text-3xl font-bold">
              {isSignIn
                ? "Welcome back"
                : "Create your account"}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {isSignIn
                ? "Sign in to continue to NextMeet"
                : "Join NextMeet and start connecting"}
            </p>
          </div>

          {/* Card */}

          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">

            {/* Heading */}

            <div className="mb-7">
              <h2 className="text-2xl font-semibold">
                {isSignIn
                  ? "Sign in to your account"
                  : "Create your account"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {isSignIn
                  ? "Enter your details to continue."
                  : "Fill in your details to get started."}
              </p>
            </div>

            {/* ================= SWITCH ================= */}

            <div className="mb-7 grid grid-cols-2 rounded-lg bg-gray-800 p-1">

              <button
                type="button"
                onClick={() => switchForm(0)}
                className={`rounded-md py-2.5 text-sm font-semibold transition ${
                  isSignIn
                    ? "bg-yellow-400 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => switchForm(1)}
                className={`rounded-md py-2.5 text-sm font-semibold transition ${
                  !isSignIn
                    ? "bg-yellow-400 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>

            </div>

            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >

              {/* Name */}

              {!isSignIn && (
                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-gray-200">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  />

                </div>
              )}

              {/* Username */}

              <div className="flex flex-col gap-2">

                <label className="text-sm font-medium text-gray-200">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />

              </div>

              {/* Password */}

              <div className="flex flex-col gap-2">

                <label className="text-sm font-medium text-gray-200">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    isSignIn
                      ? "current-password"
                      : "new-password"
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />

              </div>

              {/* Error */}

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              {/* Success */}

              {message && (
                <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {message}
                </p>
              )}

              {/* Submit */}

              <button
                type="submit"
                className="w-full rounded-lg bg-yellow-400 py-3 font-semibold text-black transition hover:bg-yellow-300 active:scale-[0.98]"
              >
                {isSignIn
                  ? "Sign in"
                  : "Create account"}
              </button>

            </form>

            {/* ================= DIVIDER ================= */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-gray-700" />

              <span className="text-xs text-gray-500">
                OR CONTINUE WITH
              </span>

              <div className="h-px flex-1 bg-gray-700" />

            </div>

            {/* ================= SOCIAL ================= */}

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                className="rounded-lg border border-gray-700 bg-gray-800 py-2.5 text-sm font-medium transition hover:bg-gray-700"
              >
                Google
              </button>

              <button
                type="button"
                className="rounded-lg border border-gray-700 bg-gray-800 py-2.5 text-sm font-medium transition hover:bg-gray-700"
              >
                GitHub
              </button>

            </div>

            {/* ================= BOTTOM ================= */}

            <p className="mt-7 text-center text-sm text-gray-500">
              {isSignIn
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => switchForm(isSignIn ? 1 : 0)}
                className="ml-1 font-medium text-yellow-400 hover:text-yellow-300"
              >
                {isSignIn
                  ? "Create one"
                  : "Sign in"}
              </button>
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthController;