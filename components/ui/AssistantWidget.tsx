"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_NUMBER = "12145314427";

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const QUESTIONS: FaqItem[] = [
  {
    id: "dues",
    q: "How do I set up dues billing?",
    a: "Go to Dues & Payments in your left nav, then Create Billing Cycle. You can set annual, semi-annual, or custom cycles, and members get automatic reminders before renewal.",
  },
  {
    id: "voting",
    q: "Can members vote from their phone?",
    a: "Yes. Voting & Polls works on any device. Board members get a notification and can cast a vote in under a minute.",
  },
  {
    id: "pricing",
    q: "How much does ChamberCore cost?",
    a: "Starter is $299 a month flat for up to 200 members, every module included. Our team can walk you through the tier that fits a chamber your size.",
  },
  {
    id: "board",
    q: "How do I add a new board member?",
    a: "Open Board Overview, select Add Board Member, and assign their role and committee access. They get an email invite to set up their portal login.",
  },
];

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

const INITIAL_MESSAGE: Message = {
  id: "greeting",
  sender: "bot",
  text: "Hi, I'm the ChamberCore Assistant. Ask me anything about the platform, or tap a question below.",
};

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showResolvedOptions, setShowResolvedOptions] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string>("");

  const bodyRef = useRef<HTMLDivElement>(null);

  const initChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowQuestions(true);
    setShowResolvedOptions(false);
    setShowHandoff(false);
    setLastQuestion("");
  };

  // Auto-scroll to bottom on new messages / changes
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, showQuestions, showResolvedOptions, showHandoff]);

  const handleSelectQuestion = (item: FaqItem) => {
    setLastQuestion(item.q);
    setShowQuestions(false);
    setShowResolvedOptions(false);
    setShowHandoff(false);

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: item.q },
      { id: `bot-${Date.now()}`, sender: "bot", text: item.a },
    ]);

    setShowResolvedOptions(true);
  };

  const handleResolved = () => {
    setShowResolvedOptions(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "Glad that helped! Ask me anything else, anytime.",
      },
    ]);
    setShowQuestions(true);
  };

  const handleEscalate = () => {
    setShowResolvedOptions(false);
    setShowQuestions(false);
    setShowHandoff(true);
  };

  const handleBackToChat = () => {
    initChat();
  };

  const whatsappMessage = encodeURIComponent(
    lastQuestion
      ? `Hi, I was asking the ChamberCore Assistant about "${lastQuestion}" and need help beyond what the assistant could answer.`
      : "Hi, I'm on the ChamberCore site and need help beyond what the assistant could answer."
  );

  return (
    <aside aria-label="ChamberCore Assistant Chatbot" className="font-sans">
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3 max-sm:inset-x-0 max-sm:bottom-0 max-sm:items-stretch">
        {/* Chat Panel */}
        {isOpen && (
          <div
            id="cc-panel"
            role="dialog"
            aria-labelledby="cc-assistant-title"
            className="flex h-[500px] max-h-[75vh] w-[368px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#101F36] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-200 animate-in fade-in-0 zoom-in-95 max-sm:h-[80vh] max-sm:max-h-[80vh] max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl"
          >
            {/* Panel Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3.5 text-off-white">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/15 text-lg"
                aria-hidden="true"
              >
                💬
              </div>
              <div className="flex-1">
                <div
                  id="cc-assistant-title"
                  className="font-display text-[0.98rem] font-bold text-off-white"
                >
                  ChamberCore Assistant
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-teal animate-pulse"
                    aria-hidden="true"
                  />
                  Online now
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-off-white focus-visible:outline-2 focus-visible:outline-teal"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Panel Body */}
            <div
              ref={bodyRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#0A1628] p-4 text-sm"
            >
              {/* Message History */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[84%] rounded-xl px-3.5 py-2.5 leading-relaxed text-[0.9rem] ${
                    m.sender === "bot"
                      ? "self-start rounded-bl-sm border border-white/10 bg-white/[0.04] text-off-white"
                      : "self-end rounded-br-sm bg-gold font-medium text-navy"
                  }`}
                >
                  {m.text}
                </div>
              ))}

              {/* FAQ Questions Chips */}
              {showQuestions && !showHandoff && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUESTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectQuestion(item)}
                      className="rounded-full border border-white/20 bg-transparent px-3.5 py-2 text-left text-xs font-semibold text-off-white transition-colors hover:border-gold/60 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-teal"
                    >
                      {item.q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleEscalate}
                    className="rounded-full border border-[#25D366]/60 bg-[#25D366]/10 px-3.5 py-2 text-left text-xs font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/20 focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    💬 Talk to a person
                  </button>
                </div>
              )}

              {/* Resolved / Escalate Action Buttons */}
              {showResolvedOptions && !showHandoff && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResolved}
                    className="rounded-full border border-white/20 bg-transparent px-3.5 py-2 text-xs font-semibold text-off-white transition-colors hover:border-gold/60 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    ✓ That answered it
                  </button>
                  <button
                    type="button"
                    onClick={handleEscalate}
                    className="rounded-full border border-[#25D366] bg-transparent px-3.5 py-2 text-xs font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/15 focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    Still stuck? Talk to a person
                  </button>
                </div>
              )}

              {/* Handoff / WhatsApp Escalation Card */}
              {showHandoff && (
                <div className="flex flex-col gap-3">
                  <div className="self-start rounded-xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-off-white">
                    I couldn&apos;t fully answer that from the help center. Let&apos;s get you to a person on our team.
                  </div>

                  <div className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-off-white">
                    <div className="font-display text-[0.95rem] font-bold text-off-white">
                      Continue on WhatsApp
                    </div>
                    <p className="m-0 text-xs leading-relaxed text-text-muted">
                      We&apos;ll open a WhatsApp chat with our support team, and bring what you already asked along with you.
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#06210F] shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-teal"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.1-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-3 .79.8-2.92-.19-.3A7.94 7.94 0 1 1 12 20Zm4.36-5.96c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                      </svg>
                      Continue on WhatsApp
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToChat}
                    className="self-start text-xs font-semibold text-gold-light underline underline-offset-2 transition-colors hover:text-off-white"
                  >
                    ← Back to questions
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Launcher Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="cc-panel"
          aria-label={isOpen ? "Close ChamberCore Assistant" : "Open ChamberCore Assistant"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-navy shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-200 hover:scale-105 hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal max-sm:mr-4 max-sm:mb-4 max-sm:self-end"
        >
          {isOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <span>💬</span>
          )}
        </button>
      </div>
    </aside>
  );
}
