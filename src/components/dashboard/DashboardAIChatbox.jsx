import React, { useState, useRef, useEffect } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { findPossibleAlternatives } from '../../services/aiMatchingEngine';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function DashboardAIChatbox({ setCurrentRoute }) {
  const { medicines, stats, orders, settings } = usePharmacy();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialGreeting = {
    id: 'msg-init',
    sender: 'ai',
    text: "Hello Dr. Sarah! 👋 I'm your MEDORA Pharmacy Copilot. Ask me anything about current stock levels, out-of-stock items, generic alternatives, or expiry risks.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([initialGreeting]);

  const quickPrompts = [
    { label: 'Out of stock?', query: 'Which medicines are currently out of stock?' },
    { label: 'Paracetamol alternatives', query: 'What alternatives do we have for Paracetamol 500 mg?' },
    { label: 'Low stock count', query: 'Show me all medicines with low stock.' },
    { label: 'Expiry risk', query: 'Are any medicines expiring soon?' }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Out of stock inquiry
    if (q.includes('out of stock') || q.includes('stockout') || q.includes('oos') || q.includes('zero')) {
      const oosMeds = medicines.filter((m) => m.quantity === 0);
      if (oosMeds.length === 0) {
        return "Great news! All medicines currently have available stock in the inventory.";
      }
      const list = oosMeds
        .slice(0, 4)
        .map((m) => `• **${m.name}** (${m.activeIngredient}) — Rack ${m.rack}/Shelf ${m.shelf}${m.expectedRestockDate ? `, restock expected ${m.expectedRestockDate}` : ''}`)
        .join('\n');
      return `There are currently **${oosMeds.length} items out of stock**:\n\n${list}\n\n💡 *Tip: You can find therapeutic alternatives in the database or order restock.*`;
    }

    // 2. Low stock inquiry
    if (q.includes('low stock') || q.includes('threshold') || q.includes('running low')) {
      const lowMeds = medicines.filter((m) => m.quantity > 0 && m.quantity <= m.lowStockThreshold);
      if (lowMeds.length === 0) {
        return "All inventory stock is currently above configured minimum thresholds.";
      }
      const list = lowMeds
        .slice(0, 4)
        .map((m) => `• **${m.name}**: ${m.quantity} units left (threshold: ${m.lowStockThreshold}) — Rack ${m.rack}`)
        .join('\n');
      return `We have **${lowMeds.length} items on Low Stock alert**:\n\n${list}\n\nRecommended action: Create a restock order before these deplete.`;
    }

    // 3. Alternative finder query
    if (q.includes('alternative') || q.includes('substitute') || q.includes('equivalent')) {
      // Try to find a mentioned medicine in inventory
      const matchedMed = medicines.find(
        (m) =>
          q.includes(m.name.toLowerCase()) ||
          q.includes(m.activeIngredient.toLowerCase()) ||
          q.includes(m.brandName?.toLowerCase() || '')
      ) || medicines.find(m => m.name.toLowerCase().includes('paracetamol'));

      if (matchedMed) {
        const alts = findPossibleAlternatives(matchedMed, medicines, { onlyAvailable: true });
        if (alts.length > 0) {
          const topAlts = alts
            .slice(0, 3)
            .map(
              (a) =>
                `• **${a.medicine.name}** (${a.medicine.strength}) — ${a.medicine.quantity} in stock at Rack ${a.medicine.rack}/Shelf ${a.medicine.shelf} • Match Score: **${a.matchScore}%**`
            )
            .join('\n');
          return `Verified alternatives for **${matchedMed.name}**:\n\n${topAlts}\n\n✅ *All options share active ingredient "${matchedMed.activeIngredient}" and are ready for pharmacist verification.*`;
        }
        return `No exact in-stock generic matches found for **${matchedMed.name}**. Consider checking therapeutic class "${matchedMed.therapeuticClass}".`;
      }
      return "To find alternatives, specify a medicine name (e.g. *'Alternatives for Paracetamol'* or *'Substitutes for Amoxicillin'*).";
    }

    // 4. Expiry inquiry
    if (q.includes('expir') || q.includes('expire') || q.includes('date')) {
      const expiring = medicines.filter((m) => {
        const diff = (new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return diff <= (settings.expiryWarningDays || 90);
      });
      if (expiring.length === 0) {
        return `No batches are approaching expiry within the next ${settings.expiryWarningDays || 90} days. All stock is fresh!`;
      }
      const list = expiring
        .slice(0, 3)
        .map((m) => `• **${m.name}** (Batch ${m.batchNumber}): Expires on ${new Date(m.expiryDate).toLocaleDateString()} at Rack ${m.rack}`)
        .join('\n');
      return `Found **${expiring.length} batches nearing expiry threshold**:\n\n${list}\n\nPriority: Dispense soonest-expiring batches first (FEFO).`;
    }

    // 5. General stats/overview inquiry
    if (q.includes('total') || q.includes('inventory') || q.includes('summary') || q.includes('overview') || q.includes('status')) {
      return `📊 **Live Pharmacy Summary**:\n• Total SKUs: **${stats.totalMedicines}**\n• Total Units: **${stats.totalStock}**\n• Healthy Stock: **${stats.availableCount}**\n• Low Stock: **${stats.lowStockCount}**\n• Out of Stock: **${stats.outOfStockCount}**\n• Pending Orders: **${stats.pendingOrdersCount}**`;
    }

    // 6. Specific medicine search
    const foundMed = medicines.find(
      (m) =>
        q.includes(m.name.toLowerCase()) ||
        q.includes(m.activeIngredient.toLowerCase())
    );
    if (foundMed) {
      return `💊 **${foundMed.name}** (${foundMed.activeIngredient} ${foundMed.strength})\n• Status: **${foundMed.quantity === 0 ? 'Out of Stock' : `${foundMed.quantity} Units Available`}**\n• Storage: **Rack ${foundMed.rack}, Shelf ${foundMed.shelf}**\n• Price: **${settings.currencySymbol}${Number(foundMed.price).toFixed(2)}**\n• Batch: \`${foundMed.batchNumber}\` (Expires ${new Date(foundMed.expiryDate).toLocaleDateString()})`;
    }

    // Default intelligent fallback
    return `I can assist with inventory lookups! You can ask:\n• *"Which medicines are out of stock?"*\n• *"What are alternatives for Crocin or Paracetamol?"*\n• *"Show low stock items"*\n• *"Give me an inventory overview"*`;
  };

  const handleSendMessage = (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const reply = generateAIResponse(messageText);
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(13,148,136,0.06)] flex flex-col h-[490px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-teal-100/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                MEDORA AI Copilot
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Ask about stock, alternatives & expiry
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-none shadow-teal-600/10'
                    : 'bg-gradient-to-br from-white to-teal-50/40 border border-teal-100 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">
                  {m.text.split('\n').map((line, i) => {
                    // Quick bold parsing
                    if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={i} className="my-0.5">
                          {parts.map((p, idx) =>
                            idx % 2 === 1 ? <strong key={idx} className={isUser ? 'text-white font-bold' : 'text-slate-900 font-extrabold'}>{p}</strong> : p
                          )}
                        </p>
                      );
                    }
                    return <p key={i} className="my-0.5">{line}</p>;
                  })}
                </div>
                <span
                  className={`block text-[9px] mt-1.5 text-right ${
                    isUser ? 'text-teal-100/70' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-8">
            <div className="flex gap-1 py-1 px-2.5 rounded-full bg-teal-50 border border-teal-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-teal-700 font-medium">Checking inventory database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-2 border-t border-teal-100/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.query)}
            className="text-[10px] font-semibold text-teal-800 bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200/80 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask MEDORA AI about stock, alternatives..."
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-teal-50/40 border border-teal-200/80 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 text-slate-800 placeholder:text-slate-400 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
