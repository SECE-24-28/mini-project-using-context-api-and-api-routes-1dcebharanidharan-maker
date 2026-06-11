import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckSquare, Users, Zap, Shield, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white">T</div>
          <span className="text-xl font-bold">TeamSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" className="text-white hover:bg-white/10">Sign in</Button></Link>
          <Link href="/register"><Button className="bg-indigo-500 hover:bg-indigo-600">Get started free</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-8 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <Zap className="h-3.5 w-3.5" /> Now with real-time collaboration
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Where teams <span className="text-indigo-400">get things done</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          TeamSync brings together chat, task management, and file sharing — all in one modern workspace designed for high-performing teams.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register"><Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8">Start for free</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">Sign in</Button></Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-8 py-20">
        <h2 className="text-center text-3xl font-bold mb-12">Everything your team needs</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: MessageSquare, title: "Real-Time Chat", desc: "Channels, threads, reactions, and direct messages — all with live updates via Socket.IO." },
            { icon: CheckSquare, title: "Task Kanban Board", desc: "Drag-and-drop Kanban with priorities, due dates, assignments, and progress tracking." },
            { icon: Users, title: "Team Workspaces", desc: "Manage members, roles, and permissions across multiple workspaces with ease." },
            { icon: Globe, title: "File Management", desc: "Upload, preview, and share files and documents. Powered by Cloudinary." },
            { icon: Shield, title: "Secure Auth", desc: "Auth.js with Google OAuth, credentials, and password reset via email." },
            { icon: Zap, title: "Smart Notifications", desc: "Real-time alerts for mentions, task assignments, and workspace invites." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-8 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to sync your team?</h2>
        <p className="text-gray-400 mb-8">Join thousands of teams already using TeamSync.</p>
        <Link href="/register">
          <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 px-10">Create your workspace →</Button>
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TeamSync. Built with Next.js, Prisma & Socket.IO.
      </footer>
    </div>
  );
}
