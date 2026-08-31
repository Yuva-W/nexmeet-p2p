import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ================= NAVBAR ================= */}
      <nav className="flex items-center justify-between px-35 py-6">
        <h2 className="text-2xl font-bold">NextMeet</h2>

        <div className="flex items-center gap-6">
          <Link
            to="/guest"
            className="text-gray-300 transition hover:text-white"
          >
            Join as Guest
          </Link>

          <Link
            to="/auth"
            className="text-gray-300 transition hover:text-white"
          >
            Register
          </Link>

          <Link
            to="/auth"
            className="rounded-lg bg-yellow-400 px-5 py-2 font-medium text-black transition hover:bg-yellow-300"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="mx-auto min-h-[650px] max-w-7xl flex items-center justify-center text-center">
        <div>
          <p className="text-5xl font-normal leading-tight md:text-6xl">
            <span className="text-yellow-400">Connect</span> with your
            <br />
            Loved Ones
          </p>

          <p className="mt-6 max-w-lg text-lg text-gray-400">
            Cover the distance with simple, secure and reliable video calls
            powered by NextMeet.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/auth"
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
            >
              Get Started
            </Link>

            <Link
              to="/guest"
              className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Join as Guest
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-10 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">
            Why NextMeet?
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Everything you need to stay connected
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            NextMeet makes online conversations simple, fast and comfortable.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-left transition hover:border-yellow-400/50">
              <div className="mb-5 text-3xl">◉</div>

              <h3 className="text-xl font-semibold">
                Easy Video Calls
              </h3>

              <p className="mt-3 text-gray-400">
                Start a video call quickly without complicated setup or
                unnecessary steps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-left transition hover:border-yellow-400/50">
              <div className="mb-5 text-3xl">⚡</div>

              <h3 className="text-xl font-semibold">
                Real-Time Connection
              </h3>

              <p className="mt-3 text-gray-400">
                Communicate with others in real time using fast and reliable
                WebRTC technology.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-left transition hover:border-yellow-400/50">
              <div className="mb-5 text-3xl">🔒</div>

              <h3 className="text-xl font-semibold">
                Secure & Private
              </h3>

              <p className="mt-3 text-gray-400">
                Your conversations are designed with privacy and secure
                authentication in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-gray-800 bg-gray-900/30 px-10 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Connect in three simple steps
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">
                1
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                Create an account
              </h3>

              <p className="mt-3 text-gray-400">
                Register your account and get started with NextMeet.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">
                2
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                Join a meeting
              </h3>

              <p className="mt-3 text-gray-400">
                Enter a meeting room or create one with your friends.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">
                3
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                Start talking
              </h3>

              <p className="mt-3 text-gray-400">
                Turn on your camera and microphone and start your conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-10 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gray-900 px-8 py-16 text-center">
          <h2 className="text-4xl font-bold">
            Ready to connect?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Start your next conversation with NextMeet. No complicated setup,
            just connect and talk.
          </p>

          <Link
            to="/auth"
            className="mt-8 inline-block rounded-lg bg-yellow-400 px-7 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            Get Started
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-10 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h2 className="font-bold">NextMeet</h2>

          <p className="text-sm text-gray-500">
            © 2026 NextMeet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;