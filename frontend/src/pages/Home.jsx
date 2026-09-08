import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import api from "../services/api";

const Home = () => {
  const { userData, setUserData } = useContext(AuthContext);
  const [meetingCode, setMeetingCode] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/auth");
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();

    if (!meetingCode.trim()) {
      return;
    }

    navigate(`/meet/${meetingCode.trim()}`);
  };

  const handleCreateMeeting = async () => {
      try {
          const response = await api.post("/meeting/create");

          navigate(`/meet/${response.data.meetingCode}`);
      } catch (error) {
          console.log(error);
      }
  };

  return (
    <div className="min-h-screen bg-[#020712] text-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-5 md:px-10">
        <h1 className="text-2xl font-bold">
          Next<span className="text-yellow-400">Meet</span>
        </h1>

        <div className="flex items-center gap-5">
          <span className="hidden text-sm text-slate-400 sm:block">
            {userData?.username}
          </span>

          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-5 py-12">

        {/* Welcome */}
        <section>
          <p className="text-sm text-yellow-400">
            Welcome back
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Hello, {userData?.name}
          </h2>

          <p className="mt-3 text-slate-400">
            Ready to connect with someone?
          </p>
        </section>

        {/* Meeting actions */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Create */}
          <div className="rounded-xl border border-slate-800 bg-[#101827] p-7">
            <h3 className="text-xl font-semibold">
              Create a meeting
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Start a new video meeting and invite others.
            </p>

            <button
              onClick={handleCreateMeeting}
              className="mt-6 rounded-md bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
            >
              Create Meeting
            </button>
          </div>

          {/* Join */}
          <div className="rounded-xl border border-slate-800 bg-[#101827] p-7">
            <h3 className="text-xl font-semibold">
              Join a meeting
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Enter a meeting code to join an existing meeting.
            </p>

            <form
              onSubmit={handleJoinMeeting}
              className="mt-6 flex gap-3"
            >
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Meeting code"
                className="min-w-0 flex-1 rounded-md border border-slate-700 bg-[#202b3d] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-yellow-400"
              />

              <button
                type="submit"
                className="rounded-md bg-[#635bff] px-6 py-3 font-semibold transition hover:bg-[#554df0]"
              >
                Join
              </button>
            </form>
          </div>

        </section>

        {/* Recent meetings */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold">
            Recent Meetings
          </h3>

          <div className="mt-4 rounded-xl border border-slate-800 bg-[#101827] p-8 text-center">
            <p className="text-slate-500">
              No recent meetings
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;