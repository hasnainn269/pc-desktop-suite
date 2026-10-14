import React, { useState } from "react";
import { ThemeColors } from "../types/theme";
import { CalcHistoryItem } from "../types/assistant";
import { GradientBanner } from "./GradientBanner";
import { evaluateExpression, formatResult } from "../utils/calculator";
import { CONVERSIONS, convertValue } from "../utils/converter";
import { History, Trash2, ArrowRightLeft } from "lucide-react";

interface CalculatorViewProps {
  theme: ThemeColors;
  calcHistory: CalcHistoryItem[];
  onAddHistory: (item: CalcHistoryItem) => void;
  onClearHistory: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  theme,
  calcHistory,
  onAddHistory,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "converter">("calculator");
  const [expression, setExpression] = useState("");
  const [resultText, setResultText] = useState("Result will appear here");
  const [isError, setIsError] = useState(false);
  const [lastAns, setLastAns] = useState("");

  // Converter state
  const [convertInput, setConvertInput] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("KB to MB");
  const [convertResult, setConvertResult] = useState("");

  const handleKeyPress = (key: string) => {
    if (key === "C") {
      setExpression("");
      setResultText("Result will appear here");
      setIsError(false);
    } else if (key === "⌫") {
      setExpression((prev) => prev.slice(0, -1));
    } else if (key === "=") {
      calculateNow();
    } else if (key === "Ans") {
      if (lastAns) {
        setExpression((prev) => prev + lastAns);
      }
    } else {
      setExpression((prev) => prev + key);
    }
  };

  const calculateNow = () => {
    if (!expression.trim()) return;
    try {
      const res = evaluateExpression(expression);
      const formatted = formatResult(res);
      setResultText(`= ${formatted}`);
      setIsError(false);
      setLastAns(formatted);

      onAddHistory({
        id: `calc-${Date.now()}`,
        expression,
        result: formatted,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setIsError(true);
      setResultText(`Error: ${err.message || "Invalid input"}`);
    }
  };

  const handleConvert = () => {
    const val = parseFloat(convertInput.trim());
    if (isNaN(val)) {
      setConvertResult("Please enter a valid numeric value.");
      return;
    }
    setConvertResult(convertValue(val, selectedUnit));
  };

  const padRows = [
    ["C", "(", ")", "⌫"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "%", "+"],
    ["**", "//", "Ans", "="],
  ];

  const getKeyStyle = (key: string) => {
    if (key === "=") {
      return {
        bg: theme.ACCENT,
        text: theme.NAVY,
        hover: theme.PALE,
      };
    }
    if (key === "C" || key === "⌫") {
      return {
        bg: "#B3392F",
        text: "#FFFFFF",
        hover: "#D64B3F",
      };
    }
    if (/\d|\./.test(key)) {
      return {
        bg: theme.CARD,
        text: "#FFFFFF",
        hover: theme.CARD_HOVER,
      };
    }
    return {
      bg: theme.BLUE,
      text: "#FFFFFF",
      hover: theme.MID,
    };
  };

  return (
    <div className="space-y-4">
      <GradientBanner
        title="Calculator & Converter"
        subtitle="Keypad with safe evaluation + history & data size converter."
        theme={theme}
      />

      {/* Tabs */}
      <div
        className="p-1 rounded-xl border flex gap-1 w-fit"
        style={{
          backgroundColor: theme.CARD,
          borderColor: theme.BORDER,
        }}
      >
        <button
          onClick={() => setActiveTab("calculator")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: activeTab === "calculator" ? theme.BLUE : "transparent",
            color: activeTab === "calculator" ? "#FFFFFF" : theme.PALE,
          }}
        >
          🧮 Calculator
        </button>
        <button
          onClick={() => setActiveTab("converter")}
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: activeTab === "converter" ? theme.BLUE : "transparent",
            color: activeTab === "converter" ? "#FFFFFF" : theme.PALE,
          }}
        >
          🔁 Data Converter
        </button>
      </div>

      {activeTab === "calculator" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Left: Display + Keypad */}
          <div
            className="md:col-span-7 p-4 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            {/* Display screen */}
            <div
              className="p-4 rounded-xl border mb-3 flex flex-col justify-end min-h-[96px]"
              style={{
                backgroundColor: theme.NAVY,
                borderColor: theme.BORDER,
              }}
            >
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && calculateNow()}
                placeholder="0"
                className="w-full bg-transparent text-right font-bold text-2xl outline-none font-mono tracking-wide text-white"
              />
              <div className="flex items-center justify-end mt-1">
                <div
                  className={`text-right text-sm font-semibold font-mono truncate ${
                    isError ? "text-red-400" : ""
                  }`}
                  style={{ color: isError ? "#EF4444" : theme.ACCENT }}
                >
                  {resultText}
                </div>
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-2">
              {padRows.map((row, rIdx) =>
                row.map((k) => {
                  const style = getKeyStyle(k);
                  return (
                    <button
                      key={`${rIdx}-${k}`}
                      onClick={() => handleKeyPress(k)}
                      className="py-3 rounded-xl font-bold text-sm select-none border transition-all active:scale-95 shadow-sm"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: theme.BORDER,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = style.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = style.bg;
                      }}
                    >
                      {k}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: History Panel */}
          <div
            className="md:col-span-5 p-4 rounded-2xl border flex flex-col h-[460px]"
            style={{
              backgroundColor: theme.CARD,
              borderColor: theme.BORDER,
            }}
          >
            <div
              className="flex items-center justify-between pb-3 border-b mb-3"
              style={{ borderColor: theme.BORDER }}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <History size={16} style={{ color: theme.ACCENT }} />
                <span>History</span>
              </div>
              <button
                onClick={onClearHistory}
                disabled={calcHistory.length === 0}
                className="text-xs font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all disabled:opacity-40"
                style={{
                  borderColor: theme.BORDER,
                  color: theme.PALE,
                }}
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {calcHistory.length === 0 ? (
                <div
                  className="text-center py-20 text-xs"
                  style={{ color: theme.MUTED }}
                >
                  No calculations yet.
                </div>
              ) : (
                calcHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setExpression(item.expression);
                      setResultText(`= ${item.result}`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between"
                    style={{
                      borderColor: theme.BORDER,
                      backgroundColor: theme.NAVY,
                      color: theme.PALE,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.CARD_HOVER;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.NAVY;
                    }}
                  >
                    <span className="truncate">{item.expression}</span>
                    <span className="font-bold shrink-0 ml-2" style={{ color: theme.ACCENT }}>
                      = {item.result}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Data Size Converter Tab */
        <div
          className="p-6 rounded-2xl border max-w-xl space-y-5"
          style={{
            backgroundColor: theme.CARD,
            borderColor: theme.BORDER,
          }}
        >
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={20} style={{ color: theme.ACCENT }} />
            <h3 className="text-base font-bold text-white">Data-size Converter</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Enter number (e.g. 1024)"
              value={convertInput}
              onChange={(e) => setConvertInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConvert()}
              className="flex-1 min-w-[180px] px-3.5 py-2.5 rounded-xl text-sm font-mono outline-none border transition-all"
              style={{
                backgroundColor: theme.NAVY,
                borderColor: theme.BORDER,
                color: "#FFFFFF",
              }}
            />

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer"
              style={{
                backgroundColor: theme.BLUE,
                borderColor: theme.BORDER,
                color: "#FFFFFF",
              }}
            >
              {Object.keys(CONVERSIONS).map((unit) => (
                <option key={unit} value={unit} className="bg-slate-900 text-white">
                  {unit}
                </option>
              ))}
            </select>

            <button
              onClick={handleConvert}
              className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                backgroundColor: theme.ACCENT,
                color: theme.NAVY,
              }}
            >
              Convert
            </button>
          </div>

          {convertResult && (
            <div
              className="p-4 rounded-xl border text-base font-bold font-mono tracking-wide"
              style={{
                backgroundColor: theme.NAVY,
                borderColor: theme.BORDER,
                color: theme.ACCENT,
              }}
            >
              {convertResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
