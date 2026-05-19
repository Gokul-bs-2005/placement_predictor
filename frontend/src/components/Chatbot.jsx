import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello 👋 I am your AI Placement Assistant. Ask me anything about coding, placements, projects, interviews or careers.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userInput }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, { message: userInput });
      const botReply = response.data.reply || "Sorry, I could not get a response.";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "⚠️ Error connecting to AI backend. Make sure GROQ_API_KEY is set.";
      setMessages((prev) => [...prev, { from: "bot", text: errMsg }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-50 rounded-full bg-emerald-500 p-4 text-white shadow-2xl transition duration-300 hover:scale-110 lg:bottom-6"
      >
        {open ? <X /> : <Bot />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[520px] w-[350px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 lg:bottom-24">
          {/* Header */}
          <div className="bg-emerald-500 p-4 text-white">
            <h2 className="text-lg font-bold">AI Assistant</h2>
            <p className="text-xs opacity-80">Powered by Flask + Groq AI</p>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-100 p-4 dark:bg-slate-800">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow ${
                  msg.from === "bot"
                    ? "bg-white text-black dark:bg-slate-700 dark:text-white"
                    : "ml-auto bg-emerald-500 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="rounded-2xl bg-white px-4 py-3 text-sm dark:bg-slate-700 dark:text-white">
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t p-3 dark:border-slate-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 rounded-2xl border px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-4 text-white transition hover:scale-105 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
