/**
 * The completed, perfected, standalone Python desktop script
 * based on the user's CustomTkinter code.
 */
export const COMPLETED_PYTHON_SCRIPT = `"""
Personal AI Assistant  -  Smooth Themes Edition
Requirements:  pip install customtkinter pymupdf psutil requests pillow
Optional:      Ollama running locally with the qwen2.5:3b model (for local AI chat)
               OR set GEMINI_API_KEY in your environment for Google Gemini AI.

Features:
  * Smooth slide-in page transitions & animated progress meters
  * Smooth fading hover cards in PC Monitor & Dashboard
  * 5 switchable themes (Ocean Blue, Midnight Violet, Emerald Forest, Sunset Ember, Graphite Slate)
  * AI replies STREAM word by word with typing effect
  * Complete Offline Suite: Notes, File Manager, PC Monitor, Calculator, PDF Studio, Chat
"""

import ast
import json
import operator
import os
import platform
import queue
import re
import subprocess
import sys
import threading
import tkinter as tk
import webbrowser
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, messagebox

import customtkinter as ctk
import fitz  # PyMuPDF
import psutil
import requests
from PIL import Image, ImageTk

# =====================================================================
#  CONFIGURATION & THEME
# =====================================================================

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

APP_DIR = Path.home() / "PersonalAssistantData"
NOTES_DIR = APP_DIR / "notes"
THEME_FILE = APP_DIR / "theme.txt"
APP_DIR.mkdir(parents=True, exist_ok=True)
NOTES_DIR.mkdir(parents=True, exist_ok=True)

# Default palette (Ocean Blue)
NAVY = "#0D2137"
BLUE = "#1557A8"
MID = "#2575C4"
PALE = "#E8F3FC"
ACCENT = "#0EA5E9"
SIDEBAR = "#081726"
CARD = "#112D4A"
CARD_HOVER = "#173B61"
BORDER = "#1F4A75"
MUTED = "#8FB3D9"
GOOD = "#34D399"
WARN = "#F59E0B"
BAD = "#EF4444"

GRADIENT = [NAVY, BLUE, MID]
FONT = "Segoe UI"

THEMES = {
    "Ocean Blue": dict(
        NAVY="#0D2137", BLUE="#1557A8", MID="#2575C4", PALE="#E8F3FC",
        ACCENT="#0EA5E9", SIDEBAR="#081726", CARD="#112D4A",
        CARD_HOVER="#173B61", BORDER="#1F4A75", MUTED="#8FB3D9"),
    "Midnight Violet": dict(
        NAVY="#1A1033", BLUE="#6D28D9", MID="#8B5CF6", PALE="#F3EDFF",
        ACCENT="#C084FC", SIDEBAR="#120A26", CARD="#25194A",
        CARD_HOVER="#32225F", BORDER="#4A3586", MUTED="#B4A3DB"),
    "Emerald Forest": dict(
        NAVY="#0B2420", BLUE="#0F766E", MID="#14B8A6", PALE="#E6FFFA",
        ACCENT="#34D399", SIDEBAR="#071A17", CARD="#0F3530",
        CARD_HOVER="#14463F", BORDER="#1E6258", MUTED="#8ED1C3"),
    "Sunset Ember": dict(
        NAVY="#2A1410", BLUE="#C2410C", MID="#EA580C", PALE="#FFF1E6",
        ACCENT="#FBBF24", SIDEBAR="#1C0D0A", CARD="#3B1E17",
        CARD_HOVER="#4D2A20", BORDER="#6B3A2B", MUTED="#E0B49C"),
    "Graphite Slate": dict(
        NAVY="#111827", BLUE="#475569", MID="#64748B", PALE="#F1F5F9",
        ACCENT="#38BDF8", SIDEBAR="#0B1020", CARD="#1B2433",
        CARD_HOVER="#263247", BORDER="#334155", MUTED="#94A3B8"),
}
DEFAULT_THEME = "Ocean Blue"


def apply_theme(name):
    """Swap every colour constant in this module to the chosen theme."""
    theme = THEMES.get(name, THEMES[DEFAULT_THEME])
    globals().update(theme)
    GRADIENT[:] = [theme["NAVY"], theme["BLUE"], theme["MID"]]


def load_saved_theme():
    try:
        name = THEME_FILE.read_text(encoding="utf-8").strip()
        return name if name in THEMES else DEFAULT_THEME
    except OSError:
        return DEFAULT_THEME


def save_theme(name):
    try:
        THEME_FILE.write_text(name, encoding="utf-8")
    except OSError:
        pass


CURRENT_THEME = load_saved_theme()
apply_theme(CURRENT_THEME)

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "qwen2.5:3b"

AI_UNAVAILABLE = (
    "LOCAL AI UNAVAILABLE\\n\\n"
    f"Ollama may not be running, or the {OLLAMA_MODEL} model "
    "may not be installed. Built-in offline commands remain "
    "available. Type help to view them."
)
AI_BAD_RESPONSE = (
    "AI RESPONSE ERROR\\n"
    "The AI returned an unexpected response. Check Ollama or network and try again."
)

SLIDE_DISTANCE = 36
SLIDE_STEPS = 16
SLIDE_DELAY = 12

DISK_ROOT = Path.home().anchor or "/"
SKIP_DIRS = {
    "AppData", "node_modules", "__pycache__", "Windows",
    "site-packages", "$Recycle.Bin",
}

CONVERSIONS = {
    "KB to MB": (1 / 1024, "MB"),
    "MB to GB": (1 / 1024, "GB"),
    "GB to MB": (1024, "MB"),
    "MB to KB": (1024, "KB"),
    "Bytes to KB": (1 / 1024, "KB"),
    "KB to Bytes": (1024, "Bytes"),
}
UNIT_NAMES = {"kb": "KB", "mb": "MB", "gb": "GB", "bytes": "Bytes"}

QUICK_COMMANDS = [
    ("❓ Help", "help", True),
    ("🖥 System info", "system info", True),
    ("📝 List notes", "list notes", True),
    ("📄 List PDFs", "list pdfs", True),
    ("🔎 Find PDF…", "find pdf ", False),
    ("🔎 Search files…", "search files ", False),
    ("🧮 Calculate…", "calculate ", False),
    ("🔁 Convert…", "convert ", False),
    ("💾 Save note…", "save note ", False),
    ("🤖 Ask AI…", "ask ai ", False),
    ("🌐 Google", "open google", True),
    ("▶ YouTube", "open youtube", True),
]


class AIRequest:
    def __init__(self, question):
        self.question = question


def clean_filename(name):
    name = re.sub(r'[<>:"/\\\\|?*\\x00-\\x1f]', "_", name)
    return name.strip(" .")[:100] or "Untitled"


def friendly_error(message, detail=""):
    if detail:
        return f"{message}\\n\\nDetails: {detail}\\n\\nPlease review your input and try again."
    return f"{message}\\n\\nPlease review your input and try again."


def fmt_number(value):
    if isinstance(value, float):
        if value.is_integer() and abs(value) < 1e15:
            return str(int(value))
        return f"{value:.10g}"
    return str(value)


def alive(widget):
    try:
        return widget is not None and bool(widget.winfo_exists())
    except tk.TclError:
        return False


def open_path(path):
    path = str(path)
    if hasattr(os, "startfile"):
        os.startfile(path)
    elif sys.platform == "darwin":
        subprocess.run(["open", path], check=False)
    else:
        subprocess.run(["xdg-open", path], check=False)


def convert_value(value, unit):
    factor, output_unit = CONVERSIONS[unit]
    input_unit = unit.split(" to ")[0]
    return f"{value:g} {input_unit} = {value * factor:g} {output_unit}"


def make_matcher(query):
    q = query.lower().strip()
    if q == "pdf":
        return lambda name: name.lower().endswith(".pdf")
    if q.startswith("."):
        return lambda name: name.lower().endswith(q)
    return lambda name: q in name.lower()


def walk_files(predicate, limit=100):
    results = []
    try:
        for root, dirs, files in os.walk(Path.home()):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            for name in files:
                if predicate(name):
                    results.append(Path(root) / name)
                    if len(results) >= limit:
                        return results
    except Exception:
        pass
    return results


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#%02x%02x%02x" % tuple(int(c) for c in rgb)


def mix(color_a, color_b, t):
    a, b = hex_to_rgb(color_a), hex_to_rgb(color_b)
    return rgb_to_hex(tuple(a[k] + (b[k] - a[k]) * t for k in range(3)))


def make_gradient(width, height, colors):
    width, height = max(1, width), max(1, height)
    stops = [hex_to_rgb(c) for c in colors]
    segments = len(stops) - 1
    strip = []
    for x in range(width):
        t = x / max(width - 1, 1) * segments
        index = min(int(t), segments - 1)
        frac = t - index
        a, b = stops[index], stops[index + 1]
        strip.append(tuple(int(a[k] + (b[k] - a[k]) * frac) for k in range(3)))
    image = Image.new("RGB", (width, 1))
    image.putdata(strip)
    return image.resize((width, height))


class GradientBanner(tk.Canvas):
    def __init__(self, master, title, subtitle="", height=96, colors=None,
                 title_size=24, subtitle_size=11, pad_x=24):
        super().__init__(master, height=height, highlightthickness=0, bd=0, bg=NAVY)
        self._title = title
        self._subtitle = subtitle
        self._height = height
        self._colors = list(colors or GRADIENT)
        self._title_size = title_size
        self._subtitle_size = subtitle_size
        self._pad_x = pad_x
        self._photo = None
        self._last_width = 0
        self.bind("<Configure>", self._redraw)

    def _redraw(self, event):
        width = event.width
        if width < 2 or width == self._last_width:
            return
        self._last_width = width
        self._photo = ImageTk.PhotoImage(
            make_gradient(width, self._height, self._colors)
        )
        self.delete("all")
        self.create_image(0, 0, image=self._photo, anchor="nw")
        y_title = self._height * (0.40 if self._subtitle else 0.5)
        self.create_text(
            self._pad_x, y_title, text=self._title, anchor="w",
            fill="white", font=(FONT, self._title_size, "bold"),
        )
        if self._subtitle:
            self.create_text(
                self._pad_x, self._height * 0.74, text=self._subtitle,
                anchor="w", fill=PALE, font=(FONT, self._subtitle_size),
            )


def make_button(master, text, command, kind="primary", width=None, height=36, **kw):
    styles = {
        "primary": dict(fg_color=BLUE, hover_color=MID, text_color="white"),
        "accent": dict(fg_color=ACCENT, hover_color=mix(ACCENT, "#FFFFFF", 0.25), text_color=NAVY),
        "ghost": dict(fg_color="transparent", hover_color=CARD_HOVER, text_color=PALE, border_width=1, border_color=BORDER),
        "danger": dict(fg_color="#B3392F", hover_color="#D64B3F", text_color="white"),
        "key": dict(fg_color=CARD, hover_color=CARD_HOVER, text_color="white", border_width=1, border_color=BORDER),
    }
    opts = dict(corner_radius=10, height=height, font=(FONT, 13, "bold"))
    opts.update(styles.get(kind, styles["primary"]))
    if width:
        opts["width"] = width
    opts.update(kw)
    return ctk.CTkButton(master, text=text, command=command, **opts)


def make_entry(master, **kw):
    opts = dict(fg_color=CARD, border_color=BORDER, height=38, corner_radius=10, font=(FONT, 13))
    opts.update(kw)
    return ctk.CTkEntry(master, **opts)


def make_textbox(master, **kw):
    opts = dict(fg_color=CARD, border_color=BORDER, border_width=1, corner_radius=12, font=(FONT, 13), wrap="word")
    opts.update(kw)
    return ctk.CTkTextbox(master, **opts)


def make_hoverable(frame, normal, hovered, on_click=None):
    state = {"job": None, "now": normal}

    def fade_to(target, steps=7):
        if state["job"] is not None:
            try:
                frame.after_cancel(state["job"])
            except Exception:
                pass
            state["job"] = None
        start = state["now"]

        def tick(i=1):
            if not alive(frame):
                return
            color = mix(start, target, i / steps)
            state["now"] = color
            try:
                frame.configure(fg_color=color)
            except tk.TclError:
                return
            if i < steps:
                state["job"] = frame.after(16, lambda: tick(i + 1))
            else:
                state["job"] = None

        tick()

    def inside():
        try:
            x, y = frame.winfo_pointerxy()
            fx, fy = frame.winfo_rootx(), frame.winfo_rooty()
            return (fx <= x < fx + frame.winfo_width() and fy <= y < fy + frame.winfo_height())
        except tk.TclError:
            return False

    def enter(_event=None):
        frame.configure(border_color=ACCENT)
        fade_to(hovered)

    def leave(_event=None):
        if not inside():
            frame.configure(border_color=BORDER)
            fade_to(normal)

    def bind_all(widget):
        widget.bind("<Enter>", enter, add="+")
        widget.bind("<Leave>", leave, add="+")
        if on_click and not isinstance(widget, ctk.CTkButton):
            widget.bind("<Button-1>", lambda _e: on_click(), add="+")
        for child in widget.winfo_children():
            bind_all(child)

    bind_all(frame)


class SafeCalculator:
    OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
        ast.UAdd: operator.pos,
        ast.USub: operator.neg,
    }

    @classmethod
    def calculate(cls, expression):
        tree = ast.parse(expression, mode="eval")

        def visit(node):
            if isinstance(node, ast.Expression):
                return visit(node.body)
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                return node.value
            if isinstance(node, ast.BinOp) and type(node.op) in cls.OPERATORS:
                left = visit(node.left)
                right = visit(node.right)
                if isinstance(node.op, ast.Pow) and abs(right) > 100:
                    raise ValueError("The exponent is too large.")
                result = cls.OPERATORS[type(node.op)](left, right)
                if isinstance(result, complex) or abs(result) > 1e100:
                    raise ValueError("The result exceeds supported range.")
                return result
            if isinstance(node, ast.UnaryOp) and type(node.op) in cls.OPERATORS:
                return cls.OPERATORS[type(node.op)](visit(node.operand))
            raise ValueError("Use numbers, parentheses and + - * / // % ** only.")

        return visit(tree)


class PersonalAssistant(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Personal AI Assistant")
        self.geometry("1180x780")
        self.minsize(960, 640)
        self.configure(fg_color=NAVY)

        self.theme_name = CURRENT_THEME
        self.page_token = 0
        self.current_page = None
        self.nav_buttons = {}
        self.content = None
        self.slide_job = None
        self.bar_jobs = {}

        self.pdf_paths = []
        self.calc_history = []
        self.last_answer = ""
        self.chat_history = []
        self.ai_messages = []
        self.streaming = False
        self.chat_epoch = 0

        self.monitor_job = None
        self.monitor_live = True
        self.meters = {}
        self.current_note = None
        self.selected_file = None
        self.fm_dir = None
        self.fm_search_id = 0
        self.fm_buttons = {}

        self.notes_list = self.note_editor = self.note_name = None
        self.note_status = self.note_search_entry = self.notes_count_label = None
        self.file_query = self.fm_status = self.fm_list = None
        self.calc_entry = self.calc_result = self.calc_history_frame = None
        self.convert_entry = self.convert_unit = self.convert_result = None
        self.pdf_path_entry = self.pdf_status = self.pdf_results = self.pdf_output = None
        self.chat_area = self.chat_entry = self.chat_status = None

        self.pages = {
            "Dashboard": self.show_dashboard,
            "Notes": self.show_notes,
            "File Manager": self.show_files,
            "PC Monitor": self.show_monitor,
            "Calculator": self.show_calculator,
            "PDF Studio": self.show_pdf,
            "Chat Assistant": self.show_chat,
        }
        self.icons = {
            "Dashboard": "🏠", "Notes": "📝", "File Manager": "📁",
            "PC Monitor": "📊", "Calculator": "🧮", "PDF Studio": "📄",
            "Chat Assistant": "💬",
        }

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._build_sidebar()

        self.host = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.host.grid(row=0, column=1, sticky="nsew", padx=18, pady=18)

        self.bind("<Control-s>", self._on_ctrl_s)
        self.go("Dashboard")

    def run_bg(self, work, done, token_bound=True):
        token = self.page_token
        def runner():
            try:
                outcome = (True, work())
            except Exception as error:
                outcome = (False, error)

            def deliver():
                if token_bound and token != self.page_token:
                    return
                done(*outcome)

            try:
                self.after(0, deliver)
            except (RuntimeError, tk.TclError):
                pass
        threading.Thread(target=runner, daemon=True).start()

    def _build_sidebar(self):
        self.sidebar = ctk.CTkFrame(self, width=240, corner_radius=0, fg_color=SIDEBAR)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_propagate(False)

        GradientBanner(
            self.sidebar, "🤖  Personal AI", "Offline tools · Local AI",
            height=104, title_size=20, subtitle_size=10, pad_x=18,
        ).pack(fill="x", pady=(0, 14))

        self.nav_buttons = {}
        for label in self.pages:
            button = ctk.CTkButton(
                self.sidebar,
                text=f"  {self.icons[label]}   {label}",
                anchor="w", height=42, corner_radius=10,
                fg_color=BLUE if label == self.current_page else "transparent",
                hover_color=CARD_HOVER,
                text_color=PALE, font=(FONT, 14, "bold"),
                command=lambda name=label: self.go(name),
            )
            button.pack(fill="x", padx=12, pady=3)
            self.nav_buttons[label] = button

        ctk.CTkLabel(
            self.sidebar, text=f"Local data:\\n{APP_DIR}", wraplength=205,
            justify="left", text_color=MUTED, font=(FONT, 10),
        ).pack(side="bottom", anchor="w", padx=15, pady=(4, 15))

        theme_box = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        theme_box.pack(side="bottom", fill="x", padx=15, pady=(0, 6))
        ctk.CTkLabel(theme_box, text="🎨  Theme", font=(FONT, 12, "bold"),
                     text_color=PALE).pack(anchor="w")

        dots = ctk.CTkFrame(theme_box, fg_color="transparent")
        dots.pack(anchor="w", pady=(6, 2))
        for name, colors in THEMES.items():
            active = name == self.theme_name
            ctk.CTkButton(
                dots, text="✓" if active else "", width=30, height=30,
                corner_radius=15, fg_color=colors["BLUE"],
                hover_color=colors["ACCENT"], border_width=2,
                border_color="white" if active else colors["MID"],
                text_color="white", font=(FONT, 12, "bold"),
                command=lambda n=name: self.set_theme(n),
            ).pack(side="left", padx=(0, 6))

        ctk.CTkLabel(theme_box, text=self.theme_name, text_color=MUTED,
                     font=(FONT, 11)).pack(anchor="w")

    def set_theme(self, name):
        if name == self.theme_name or name not in THEMES:
            return
        self.theme_name = name
        apply_theme(name)
        save_theme(name)

        self.configure(fg_color=NAVY)
        self.sidebar.destroy()
        self._build_sidebar()
        self.go(self.current_page or "Dashboard")

    def go(self, name, animate=True):
        self.page_token += 1
        if self.monitor_job is not None:
            try:
                self.after_cancel(self.monitor_job)
            except Exception:
                pass
            self.monitor_job = None

        if self.slide_job is not None:
            try:
                self.after_cancel(self.slide_job)
            except Exception:
                pass
            self.slide_job = None

        for job in self.bar_jobs.values():
            try:
                self.after_cancel(job)
            except Exception:
                pass
        self.bar_jobs = {}

        if self.content is not None:
            try:
                self.content.destroy()
            except tk.TclError:
                pass

        self.current_page = name
        for label, button in self.nav_buttons.items():
            button.configure(fg_color=BLUE if label == name else "transparent")

        self.content = ctk.CTkFrame(self.host, corner_radius=0, fg_color="transparent")
        start_x = SLIDE_DISTANCE if animate else 0
        self.content.place(x=start_x, y=0, relwidth=1, relheight=1)

        self.pages[name]()

        if animate:
            self._slide_in(self.content, self.page_token)

    def _slide_in(self, frame, token, step=0):
        if token != self.page_token or not alive(frame):
            return
        t = step / SLIDE_STEPS
        eased = 1 - (1 - t) ** 3
        frame.place_configure(x=int(SLIDE_DISTANCE * (1 - eased)))
        if step < SLIDE_STEPS:
            self.slide_job = self.after(
                SLIDE_DELAY, lambda: self._slide_in(frame, token, step + 1))
        else:
            self.slide_job = None

    def banner(self, title, subtitle=""):
        GradientBanner(self.content, title, subtitle).pack(fill="x", pady=(0, 14))

    def show_result(self, widget, text):
        widget.configure(state="normal")
        widget.delete("1.0", "end")
        widget.insert("end", text)

    def _on_ctrl_s(self, _event=None):
        if self.current_page == "Notes":
            self.save_note()

    # --- DASHBOARD ---
    def show_dashboard(self):
        self.banner("Dashboard", f"Welcome back  ·  {datetime.now():%A, %d %B %Y}")
        stats = ctk.CTkFrame(self.content, fg_color="transparent")
        stats.pack(fill="x", pady=(0, 8))

        try:
            disk_text = f"{psutil.disk_usage(DISK_ROOT).free / (1024 ** 3):.1f} GB"
        except OSError:
            disk_text = "N/A"

        values = [
            ("Saved notes", str(len(list(NOTES_DIR.glob("*.txt"))))),
            ("RAM in use", f"{psutil.virtual_memory().percent:.0f}%"),
            ("Disk free", disk_text),
        ]
        for i, (label, value) in enumerate(values):
            stats.grid_columnconfigure(i, weight=1)
            box = ctk.CTkFrame(stats, corner_radius=14, fg_color=CARD, border_width=1, border_color=BORDER)
            box.grid(row=0, column=i, sticky="ew", padx=6)
            ctk.CTkLabel(box, text=value, font=(FONT, 24, "bold"), text_color=ACCENT).pack(anchor="w", padx=16, pady=(12, 0))
            ctk.CTkLabel(box, text=label, text_color=MUTED).pack(anchor="w", padx=16, pady=(0, 12))

        grid = ctk.CTkFrame(self.content, fg_color="transparent")
        grid.pack(fill="both", expand=True, pady=4)
        for column in range(3):
            grid.grid_columnconfigure(column, weight=1, uniform="cards")
        for row in range(2):
            grid.grid_rowconfigure(row, weight=1)

        cards = [
            ("📝", "Notes", "Write, search and manage notes offline."),
            ("📁", "File Manager", "Search, browse and open your files."),
            ("📊", "PC Monitor", "Live CPU, RAM, disk and battery bars."),
            ("🧮", "Calculator", "Keypad calculator with history + converter."),
            ("📄", "PDF Studio", "Find PDFs and read them in-app."),
            ("💬", "Chat Assistant", "Commands, quick buttons and local AI."),
        ]
        for index, (icon, title, description) in enumerate(cards):
            card = ctk.CTkFrame(grid, corner_radius=16, fg_color=CARD, border_width=1, border_color=BORDER)
            card.grid(row=index // 3, column=index % 3, sticky="nsew", padx=6, pady=6)
            ctk.CTkLabel(card, text=icon, font=(FONT, 34)).pack(anchor="w", padx=16, pady=(16, 0))
            ctk.CTkLabel(card, text=title, font=(FONT, 18, "bold")).pack(anchor="w", padx=16, pady=(4, 2))
            ctk.CTkLabel(card, text=description, text_color=MUTED, wraplength=210, justify="left").pack(anchor="w", padx=16, pady=(0, 10))
            make_button(card, "Open  →", lambda n=title: self.go(n), "primary", width=110).pack(anchor="w", padx=16, pady=(0, 16))
            make_hoverable(card, CARD, CARD_HOVER, on_click=lambda n=title: self.go(n))

    # --- NOTES ---
    def show_notes(self):
        self.banner("Notes", f"Saved locally in {NOTES_DIR}   ·   Ctrl+S to save")
        self.current_note = None

        body = ctk.CTkFrame(self.content, fg_color="transparent")
        body.pack(fill="both", expand=True)
        body.grid_columnconfigure(1, weight=1)
        body.grid_rowconfigure(0, weight=1)

        left = ctk.CTkFrame(body, width=270, corner_radius=14, fg_color=CARD, border_width=1, border_color=BORDER)
        left.grid(row=0, column=0, sticky="ns", padx=(0, 10))
        left.pack_propagate(False)

        self.note_search_entry = make_entry(left, placeholder_text="🔎 Search notes…")
        self.note_search_entry.pack(fill="x", padx=10, pady=(10, 4))
        self.note_search_entry.bind("<KeyRelease>", lambda _e: self.refresh_notes())

        self.notes_count_label = ctk.CTkLabel(left, text="", text_color=MUTED, font=(FONT, 11))
        self.notes_count_label.pack(anchor="w", padx=12)

        self.notes_list = ctk.CTkScrollableFrame(left, fg_color="transparent")
        self.notes_list.pack(fill="both", expand=True, padx=4, pady=(2, 8))

        right = ctk.CTkFrame(body, fg_color="transparent")
        right.grid(row=0, column=1, sticky="nsew")

        top = ctk.CTkFrame(right, fg_color="transparent")
        top.pack(fill="x")
        self.note_name = make_entry(top, placeholder_text="Note title")
        self.note_name.pack(side="left", fill="x", expand=True, padx=(0, 8))
        make_button(top, "➕ New", self.new_note, "ghost", width=80).pack(side="left", padx=3)
        make_button(top, "💾 Save", self.save_note, "accent", width=90).pack(side="left", padx=3)
        make_button(top, "🗑 Delete", self.delete_note, "danger", width=90).pack(side="left", padx=3)

        self.note_editor = make_textbox(right)
        self.note_editor.pack(fill="both", expand=True, pady=(10, 6))
        self.note_editor.bind("<KeyRelease>", lambda _e: self.update_note_status())

        self.note_status = ctk.CTkLabel(right, text="Pick a note on the left or start typing.", text_color=MUTED, anchor="w")
        self.note_status.pack(fill="x")
        self.refresh_notes()

    def update_note_status(self, message=None):
        if not alive(self.note_status) or not alive(self.note_editor):
            return
        if message:
            self.note_status.configure(text=message)
            return
        text = self.note_editor.get("1.0", "end-1c")
        self.note_status.configure(text=f"{len(text.split())} words  ·  {len(text)} characters")

    def refresh_notes(self):
        if not alive(self.notes_list):
            return
        query = self.note_search_entry.get().strip().lower()
        for widget in self.notes_list.winfo_children():
            widget.destroy()

        def modified(path):
            try:
                return path.stat().st_mtime
            except OSError:
                return 0

        files = sorted(NOTES_DIR.glob("*.txt"), key=modified, reverse=True)
        shown = 0
        for path in files:
            if query:
                hit = query in path.stem.lower()
                if not hit:
                    try:
                        hit = query in path.read_text(encoding="utf-8", errors="ignore").lower()
                    except OSError:
                        hit = False
                if not hit:
                    continue

            active = self.current_note is not None and path == self.current_note
            make_button(
                self.notes_list, "📝  " + path.stem,
                lambda p=path: self.open_note(p),
                "primary" if active else "ghost", anchor="w", height=34,
            ).pack(fill="x", pady=2, padx=2)
            shown += 1
            if shown >= 200:
                break

        if shown == 0:
            ctk.CTkLabel(self.notes_list, text="No notes found.", text_color=MUTED).pack(pady=20)
        self.notes_count_label.configure(text=f"{shown} of {len(files)} notes")

    def new_note(self):
        self.current_note = None
        self.note_name.delete(0, "end")
        self.note_editor.delete("1.0", "end")
        self.update_note_status("New note — write something and press Save.")
        self.refresh_notes()

    def open_note(self, path):
        try:
            text = Path(path).read_text(encoding="utf-8")
        except OSError as error:
            messagebox.showerror("Open unsuccessful", friendly_error("The note could not be opened.", str(error)))
            return
        self.current_note = Path(path)
        self.note_name.delete(0, "end")
        self.note_name.insert(0, Path(path).stem)
        self.note_editor.delete("1.0", "end")
        self.note_editor.insert("1.0", text)
        self.update_note_status()
        self.refresh_notes()

    def save_note(self):
        if not alive(self.note_editor):
            return
        title = clean_filename(self.note_name.get())
        target = NOTES_DIR / f"{title}.txt"
        try:
            if target.exists() and target != self.current_note:
                if not messagebox.askyesno("Overwrite note?", f'A note named "{title}" already exists. Overwrite it?'):
                    return
            elif self.current_note and self.current_note != target and self.current_note.exists():
                self.current_note.rename(target)

            target.write_text(self.note_editor.get("1.0", "end-1c"), encoding="utf-8")
            self.current_note = target
            self.refresh_notes()
            self.update_note_status(f"Saved ✓  {datetime.now():%H:%M:%S}")
        except OSError as error:
            messagebox.showerror("Save unsuccessful", friendly_error("The note could not be saved.", str(error)))

    def delete_note(self):
        if not self.current_note or not self.current_note.exists():
            messagebox.showinfo("Nothing to delete", "Open a saved note from the list first.")
            return
        if not messagebox.askyesno("Delete note", f'Delete "{self.current_note.stem}" permanently?'):
            return
        try:
            self.current_note.unlink()
        except OSError as error:
            messagebox.showerror("Delete unsuccessful", friendly_error("The note could not be deleted.", str(error)))
            return
        self.new_note()
        self.update_note_status("Note deleted.")

    # --- FILE MANAGER ---
    def show_files(self):
        self.banner("File Manager", "Search by filename or browse folders. Click a file to select it, folder to enter.")
        self.selected_file = None
        self.fm_dir = None
        self.fm_buttons = {}

        bar = ctk.CTkFrame(self.content, fg_color="transparent")
        bar.pack(fill="x")
        self.file_query = make_entry(bar, placeholder_text="Search filename (e.g. notes, .py or pdf)")
        self.file_query.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.file_query.bind("<Return>", lambda _e: self.fm_search())
        make_button(bar, "🔎 Search", self.fm_search, "accent", width=100).pack(side="left", padx=3)
        make_button(bar, "📂 Browse", self.fm_browse_dialog, "primary", width=100).pack(side="left", padx=3)
        make_button(bar, "⬆ Up", self.fm_up, "ghost", width=70).pack(side="left", padx=3)

        actions = ctk.CTkFrame(self.content, fg_color="transparent")
        actions.pack(fill="x", pady=8)
        self.fm_status = ctk.CTkLabel(actions, text="Search results will appear here.", text_color=MUTED, anchor="w")
        self.fm_status.pack(side="left", fill="x", expand=True)
        make_button(actions, "Open", self.fm_open_selected, "primary", width=80).pack(side="left", padx=3)
        make_button(actions, "Show folder", self.fm_show_folder, "ghost", width=110).pack(side="left", padx=3)

        self.fm_list = ctk.CTkScrollableFrame(self.content, fg_color=CARD, corner_radius=12)
        self.fm_list.pack(fill="both", expand=True)

    def fm_render(self, paths, show_parent=True):
        for widget in self.fm_list.winfo_children():
            widget.destroy()
        self.fm_buttons = {}

        if not paths:
            ctk.CTkLabel(self.fm_list, text="Nothing to show.", text_color=MUTED).pack(pady=20)
            return

        for path in paths:
            icon = "📁" if path.is_dir() else "📄"
            text = f"{icon}  {path.name}\\n      {path.parent}" if show_parent else f"{icon}  {path.name}"
            height = 50 if show_parent else 34
            button = make_button(self.fm_list, text, lambda p=path: self.fm_click(p), "ghost", anchor="w", height=height)
            button.pack(fill="x", pady=2, padx=2)
            self.fm_buttons[path] = button

    def fm_click(self, path):
        if path.is_dir():
            self.fm_browse(path)
            return
        self.selected_file = path
        for item, button in self.fm_buttons.items():
            button.configure(fg_color=BLUE if item == path else "transparent")
        self.fm_status.configure(text=f"Selected: {path}")

    def fm_search(self):
        query = self.file_query.get().strip()
        if not query:
            self.fm_status.configure(text="Type a filename fragment, an extension (.py) or 'pdf'.")
            return
        self.fm_search_id += 1
        search_id = self.fm_search_id
        self.fm_status.configure(text="⏳ Searching your user folder…")
        matcher = make_matcher(query)

        def done(ok, value):
            if search_id != self.fm_search_id or not alive(self.fm_list):
                return
            if not ok:
                self.fm_status.configure(text=f"Search failed: {value}")
                return
            self.fm_dir = None
            self.selected_file = None
            self.fm_render(value)
            note = " (showing first 100)" if len(value) >= 100 else ""
            self.fm_status.configure(text=f"{len(value)} result(s){note}")

        self.run_bg(lambda: walk_files(matcher, 100), done)

    def fm_browse(self, folder):
        folder = Path(folder)
        def work():
            return sorted(folder.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))

        def done(ok, value):
            if not alive(self.fm_list):
                return
            if not ok:
                self.fm_status.configure(text=f"Could not open folder: {value}")
                return
            self.fm_dir = folder
            self.selected_file = None
            self.fm_render(value[:100], show_parent=False)
            more = f" (showing 100 of {len(value)})" if len(value) > 100 else ""
            self.fm_status.configure(text=f"📂 {folder}  ·  {len(value)} item(s){more}")

        self.run_bg(work, done)

    def fm_browse_dialog(self):
        folder = filedialog.askdirectory(title="Choose a folder")
        if folder:
            self.fm_browse(folder)

    def fm_up(self):
        if self.fm_dir and self.fm_dir.parent != self.fm_dir:
            self.fm_browse(self.fm_dir.parent)
        else:
            self.fm_status.configure(text="Use Browse to pick a folder first.")

    def fm_open_selected(self):
        target = self.selected_file or self.fm_dir
        if not target:
            chosen = filedialog.askopenfilename(title="Choose a file to open")
            if not chosen:
                return
            target = Path(chosen)
        if not Path(target).exists():
            messagebox.showwarning("Path unavailable", "The selected path does not exist.")
            return
        try:
            open_path(target)
        except OSError as error:
            messagebox.showerror("Could not open item", friendly_error("The system could not open this item.", str(error)))

    def fm_show_folder(self):
        target = self.selected_file.parent if self.selected_file else (self.fm_dir or None)
        if not target:
            self.fm_status.configure(text="Select a file first.")
            return
        try:
            open_path(target)
        except OSError as error:
            messagebox.showerror("Could not open folder", friendly_error("The folder could not be opened.", str(error)))

    # --- PC MONITOR ---
    def show_monitor(self):
        self.banner("PC Monitor", "Live system readings — updated every 2 seconds.")
        self.meters = {}
        self.monitor_live = True

        top = ctk.CTkFrame(self.content, fg_color="transparent")
        top.pack(fill="x", pady=(0, 8))
        self.live_switch = ctk.CTkSwitch(top, text="Live updates", progress_color=ACCENT,
                                         command=self.toggle_live, font=(FONT, 13))
        self.live_switch.select()
        self.live_switch.pack(side="left", padx=4)
        make_button(top, "🔄 Refresh now", self.update_meters, "ghost", width=130).pack(side="right")

        grid = ctk.CTkFrame(self.content, fg_color="transparent")
        grid.pack(fill="x")
        grid.grid_columnconfigure(0, weight=1, uniform="m")
        grid.grid_columnconfigure(1, weight=1, uniform="m")

        for index, (key, title) in enumerate([
            ("cpu", "⚙  CPU usage"), ("ram", "🧠  Memory (RAM)"),
            ("disk", "💽  Disk usage"), ("battery", "🔋  Battery"),
        ]):
            card = ctk.CTkFrame(grid, corner_radius=14, fg_color=CARD, border_width=1, border_color=BORDER)
            card.grid(row=index // 2, column=index % 2, sticky="nsew", padx=6, pady=6)
            head = ctk.CTkFrame(card, fg_color="transparent")
            head.pack(fill="x", padx=16, pady=(14, 6))
            ctk.CTkLabel(head, text=title, font=(FONT, 15, "bold")).pack(side="left")
            value_label = ctk.CTkLabel(head, text="--", font=(FONT, 15, "bold"), text_color=ACCENT)
            value_label.pack(side="right")
            bar = ctk.CTkProgressBar(card, height=14, corner_radius=7, fg_color=NAVY, progress_color=ACCENT)
            bar.set(0)
            bar.pack(fill="x", padx=16, pady=(0, 16))
            self.meters[key] = (value_label, bar)

        ram = psutil.virtual_memory()
        cpu_model = platform.processor() or "Multi-Core x64 Processor"
        lines = [
            f"Device Name       : {platform.node()}",
            f"Operating System  : {platform.system()} {platform.release()} ({platform.architecture()[0]} Edition)",
            f"OS Version Build  : {platform.version()}",
            f"Processor Model   : {cpu_model}",
            f"Processor Cores   : {psutil.cpu_count(logical=False)} Physical, {psutil.cpu_count(logical=True)} Logical Threads",
            f"RAM Memory Total  : {ram.total / (1024 ** 3):.2f} GB (Used: {ram.used / (1024 ** 3):.2f} GB, Free: {ram.available / (1024 ** 3):.2f} GB)",
        ]
        try:
            du = psutil.disk_usage(DISK_ROOT)
            lines.append(f"ROM Storage (Root): {du.total / (1024 ** 3):.1f} GB (Used: {du.used / (1024 ** 3):.1f} GB, Free: {du.free / (1024 ** 3):.1f} GB)")
        except OSError:
            lines.append("ROM Storage       : unavailable")
        
        # Check C: and D: drives on Windows
        if sys.platform == "win32":
            for drive in ["C:\\\\", "D:\\\\"]:
                if os.path.exists(drive):
                    try:
                        d_info = psutil.disk_usage(drive)
                        lines.append(f"Drive {drive[0]}: (NTFS)    : {d_info.total / (1024 ** 3):.1f} GB (Free: {d_info.free / (1024 ** 3):.1f} GB, {d_info.percent}% used)")
                    except Exception:
                        pass

        info = ctk.CTkFrame(self.content, corner_radius=14, fg_color=CARD, border_width=1, border_color=BORDER)
        info.pack(fill="x", padx=6, pady=6)
        ctk.CTkLabel(info, text="\\n".join(lines), font=("Consolas", 12), justify="left", anchor="w", text_color=PALE).pack(
            anchor="w", padx=16, pady=14)

        psutil.cpu_percent(None)
        self.monitor_job = self.after(500, self.monitor_tick)

    def toggle_live(self):
        self.monitor_live = bool(self.live_switch.get())
        if self.monitor_live and self.monitor_job is None:
            self.monitor_tick()

    def monitor_tick(self):
        self.monitor_job = None
        if self.current_page != "PC Monitor" or not self.meters:
            return
        self.update_meters()
        if self.monitor_live:
            self.monitor_job = self.after(2000, self.monitor_tick)

    def _tween_bar(self, bar, target, steps=10, step=1, start=None):
        if not alive(bar):
            return
        if start is None:
            start = bar.get()
        t = step / steps
        eased = 1 - (1 - t) ** 3
        bar.set(start + (target - start) * eased)
        if step < steps:
            self.bar_jobs[id(bar)] = self.after(
                24, lambda: self._tween_bar(bar, target, steps, step + 1, start))
        else:
            self.bar_jobs.pop(id(bar), None)

    def set_meter(self, key, percent, text, invert=False):
        if key not in self.meters:
            return
        label, bar = self.meters[key]
        if not alive(bar):
            return

        job = self.bar_jobs.pop(id(bar), None)
        if job is not None:
            try:
                self.after_cancel(job)
            except Exception:
                pass

        if percent is None:
            self._tween_bar(bar, 0)
            bar.configure(progress_color=MUTED)
            label.configure(text=text, text_color=MUTED)
            return

        color = (BAD if percent < 20 else WARN if percent < 50 else GOOD) if invert else (ACCENT if percent < 60 else WARN if percent < 85 else BAD)
        bar.configure(progress_color=color)
        label.configure(text=text, text_color=color)
        self._tween_bar(bar, max(0.0, min(percent / 100, 1.0)))

    def update_meters(self):
        if self.current_page != "PC Monitor":
            return
        cpu = psutil.cpu_percent(None)
        self.set_meter("cpu", cpu, f"{cpu:.0f}%")

        ram = psutil.virtual_memory()
        self.set_meter("ram", ram.percent, f"{ram.used / (1024 ** 3):.1f} / {ram.total / (1024 ** 3):.1f} GB ({ram.percent:.0f}%)")

        try:
            disk = psutil.disk_usage(DISK_ROOT)
            self.set_meter("disk", disk.percent, f"{disk.free / (1024 ** 3):.0f} GB free ({disk.percent:.0f}%)")
        except OSError:
            self.set_meter("disk", None, "unavailable")

        try:
            battery = psutil.sensors_battery()
        except Exception:
            battery = None
        if battery:
            plug = "⚡ charging" if battery.power_plugged else "on battery"
            self.set_meter("battery", battery.percent, f"{battery.percent:.0f}% · {plug}", invert=True)
        else:
            self.set_meter("battery", None, "not available")

    # --- CALCULATOR & CONVERTER ---
    def show_calculator(self):
        self.banner("Calculator & Converter", "Keypad with safe evaluation + history & converter.")
        tabs = ctk.CTkTabview(
            self.content, fg_color=CARD, corner_radius=14,
            border_width=1, border_color=BORDER,
            segmented_button_selected_color=BLUE,
            segmented_button_selected_hover_color=MID,
            segmented_button_unselected_color=NAVY,
        )
        tabs.pack(fill="both", expand=True)
        self._build_calculator(tabs.add("🧮 Calculator"))
        self._build_converter(tabs.add("🔁 Data Converter"))

    def _build_calculator(self, tab):
        tab.grid_columnconfigure(0, weight=3)
        tab.grid_columnconfigure(1, weight=2)
        tab.grid_rowconfigure(0, weight=1)

        left = ctk.CTkFrame(tab, fg_color="transparent")
        left.grid(row=0, column=0, sticky="nsew", padx=(6, 8), pady=6)

        self.calc_entry = make_entry(left, height=54, font=(FONT, 22, "bold"), justify="right", placeholder_text="0")
        self.calc_entry.pack(fill="x")
        self.calc_entry.bind("<Return>", lambda _e: self.calculate_ui())

        self.calc_result = ctk.CTkLabel(left, text="Result will appear here", font=(FONT, 18), text_color=ACCENT, anchor="e")
        self.calc_result.pack(fill="x", pady=6)

        pad = ctk.CTkFrame(left, fg_color="transparent")
        pad.pack(fill="both", expand=True)

        rows = [
            ["C", "(", ")", "⌫"],
            ["7", "8", "9", "/"],
            ["4", "5", "6", "*"],
            ["1", "2", "3", "-"],
            ["0", ".", "%", "+"],
            ["**", "//", "Ans", "="],
        ]
        for r, row in enumerate(rows):
            pad.grid_rowconfigure(r, weight=1)
            for c, key in enumerate(row):
                pad.grid_columnconfigure(c, weight=1)
                kind = "accent" if key == "=" else ("danger" if key in ("C", "⌫") else ("key" if key.isdigit() or key == "." else "primary"))
                make_button(pad, key, lambda k=key: self.pad_press(k), kind, height=46, font=(FONT, 17, "bold")).grid(
                    row=r, column=c, sticky="nsew", padx=3, pady=3)

        right = ctk.CTkFrame(tab, corner_radius=12, fg_color=NAVY, border_width=1, border_color=BORDER)
        right.grid(row=0, column=1, sticky="nsew", padx=(0, 6), pady=6)

        head = ctk.CTkFrame(right, fg_color="transparent")
        head.pack(fill="x", padx=10, pady=(10, 4))
        ctk.CTkLabel(head, text="🕘 History", font=(FONT, 15, "bold")).pack(side="left")
        make_button(head, "Clear", self.clear_calc_history, "ghost", width=60, height=28).pack(side="right")

        self.calc_history_frame = ctk.CTkScrollableFrame(right, fg_color="transparent")
        self.calc_history_frame.pack(fill="both", expand=True, padx=4, pady=(0, 8))
        self.render_calc_history()

    def pad_press(self, key):
        entry = self.calc_entry
        if key == "C":
            entry.delete(0, "end")
            self.calc_result.configure(text="Result will appear here")
        elif key == "⌫":
            text = entry.get()
            entry.delete(0, "end")
            entry.insert(0, text[:-1])
        elif key == "=":
            self.calculate_ui()
        elif key == "Ans":
            if self.last_answer:
                entry.insert("end", self.last_answer)
        else:
            entry.insert("end", key)

    def calculate_ui(self):
        expression = self.calc_entry.get().strip()
        if not expression:
            return
        try:
            result = fmt_number(SafeCalculator.calculate(expression))
        except ZeroDivisionError:
            self.calc_result.configure(text="Division by zero is not allowed.", text_color=BAD)
            return
        except Exception as error:
            self.calc_result.configure(text=f"Not completed: {error}", text_color=BAD)
            return

        self.calc_result.configure(text=f"= {result}", text_color=ACCENT)
        self.last_answer = result
        self.calc_history.insert(0, (expression, result))
        del self.calc_history[50:]
        self.render_calc_history()

    def render_calc_history(self):
        if not alive(self.calc_history_frame):
            return
        for widget in self.calc_history_frame.winfo_children():
            widget.destroy()
        if not self.calc_history:
            ctk.CTkLabel(self.calc_history_frame, text="No calculations yet.", text_color=MUTED).pack(pady=20)
            return
        for expression, result in self.calc_history:
            make_button(
                self.calc_history_frame, f"{expression}  =  {result}",
                lambda e=expression: self.load_expression(e),
                "ghost", anchor="w", height=34,
            ).pack(fill="x", pady=2, padx=2)

    def load_expression(self, expression):
        self.calc_entry.delete(0, "end")
        self.calc_entry.insert(0, expression)

    def clear_calc_history(self):
        self.calc_history.clear()
        self.render_calc_history()

    def _build_converter(self, tab):
        wrap = ctk.CTkFrame(tab, fg_color="transparent")
        wrap.pack(fill="x", padx=16, pady=20)

        ctk.CTkLabel(wrap, text="Data-size converter", font=(FONT, 18, "bold")).pack(anchor="w", pady=(0, 10))
        row = ctk.CTkFrame(wrap, fg_color="transparent")
        row.pack(fill="x")
        self.convert_entry = make_entry(row, placeholder_text="Enter number, e.g. 1024")
        self.convert_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.convert_entry.bind("<Return>", lambda _e: self.convert_ui())

        self.convert_unit = ctk.CTkOptionMenu(
            row, values=list(CONVERSIONS), height=38, corner_radius=10,
            fg_color=BLUE, button_color=MID, button_hover_color=ACCENT,
        )
        self.convert_unit.pack(side="left", padx=5)
        make_button(row, "Convert", self.convert_ui, "accent", width=100).pack(side="left", padx=5)

        self.convert_result = ctk.CTkLabel(wrap, text="", font=(FONT, 20, "bold"), text_color=ACCENT)
        self.convert_result.pack(anchor="w", pady=18)

    def convert_ui(self):
        try:
            value = float(self.convert_entry.get().strip())
            self.convert_result.configure(text=convert_value(value, self.convert_unit.get()), text_color=ACCENT)
        except ValueError:
            self.convert_result.configure(text="Enter a valid number before converting.", text_color=BAD)

    # --- PDF STUDIO ---
    def show_pdf(self):
        self.banner("PDF Studio", "Find a PDF, read it in-app or open in external viewer.")
        self.pdf_path_entry = make_entry(self.content, placeholder_text="Filename to search, or paste full PDF path…")
        self.pdf_path_entry.pack(fill="x", pady=(0, 8))
        self.pdf_path_entry.bind("<Return>", lambda _e: self.find_pdf_by_name())

        row = ctk.CTkFrame(self.content, fg_color="transparent")
        row.pack(fill="x")
        make_button(row, "📂 Choose PDF", self.choose_pdf, "primary", width=130).pack(side="left", padx=(0, 5))
        make_button(row, "🔎 Find by filename", self.find_pdf_by_name, "accent", width=160).pack(side="left", padx=5)
        make_button(row, "📚 List all PDFs", self.list_pdfs, "primary", width=140).pack(side="left", padx=5)
        make_button(row, "➡ Use entered path", self.use_pdf_path, "ghost", width=150).pack(side="left", padx=5)

        self.pdf_status = ctk.CTkLabel(self.content, text="Search results appear below — click one to open it.", text_color=MUTED, anchor="w")
        self.pdf_status.pack(fill="x", pady=(8, 4))

        self.pdf_results = ctk.CTkScrollableFrame(self.content, height=150, fg_color=CARD, corner_radius=12)
        self.pdf_results.pack(fill="x")

        self.pdf_output = make_textbox(self.content)
        self.pdf_output.pack(fill="both", expand=True, pady=(8, 0))
        self.pdf_output.insert("end", "Document text will appear here.")
        self.render_pdf_results()

    def render_pdf_results(self):
        if not alive(self.pdf_results):
            return
        for widget in self.pdf_results.winfo_children():
            widget.destroy()
        if not self.pdf_paths:
            ctk.CTkLabel(self.pdf_results, text="No PDF list yet.", text_color=MUTED).pack(pady=14)
            return
        for index, path in enumerate(self.pdf_paths, 1):
            make_button(
                self.pdf_results, f"{index}.  {Path(path).name}   —   {Path(path).parent}",
                lambda p=path: self.offer_pdf_options(p), "ghost", anchor="w", height=32,
            ).pack(fill="x", pady=2, padx=2)

    def choose_pdf(self):
        path = filedialog.askopenfilename(title="Choose a PDF", filetypes=[("PDF files", "*.pdf")])
        if path:
            self.pdf_path_entry.delete(0, "end")
            self.pdf_path_entry.insert(0, path)
            self.offer_pdf_options(path)

    def find_pdf_paths(self, query=""):
        q = query.lower().strip()
        everything = q in ("", "pdf", ".pdf")
        return [
            str(p) for p in walk_files(
                lambda name: name.lower().endswith(".pdf") and (everything or q in name.lower()),
                100,
            )
        ]

    def _search_pdfs(self, query):
        self.pdf_status.configure(text="⏳ Searching for PDFs…")
        def done(ok, value):
            if not alive(self.pdf_status):
                return
            if not ok:
                self.pdf_status.configure(text=f"Search failed: {value}")
                return
            self.pdf_paths = value
            self.render_pdf_results()
            self.pdf_status.configure(text=f"{len(value)} PDF(s) found — click one to open it.")
            if len(value) == 1:
                self.pdf_path_entry.delete(0, "end")
                self.pdf_path_entry.insert(0, value[0])
                self.offer_pdf_options(value[0])
            elif not value and query:
                messagebox.showinfo("No matching PDFs", "No PDF matched that filename.")
        self.run_bg(lambda: self.find_pdf_paths(query), done)

    def find_pdf_by_name(self):
        query = self.pdf_path_entry.get().strip().strip('"')
        if not query:
            query = ctk.CTkInputDialog(text="Enter all or part of the PDF filename:", title="Find PDF").get_input()
        if not query:
            return
        if query.lower().endswith(".pdf") and Path(query).expanduser().is_file():
            self.offer_pdf_options(query)
            return
        self._search_pdfs(query)

    def list_pdfs(self):
        self._search_pdfs("")

    def use_pdf_path(self):
        path = self.pdf_path_entry.get().strip().strip('"')
        if not path:
            messagebox.showinfo("PDF path required", "Choose a PDF or paste its full path first.")
            return
        self.offer_pdf_options(path)

    def offer_pdf_options(self, file_path):
        path = Path(file_path).expanduser()
        if not path.is_file() or path.suffix.lower() != ".pdf":
            messagebox.showwarning("PDF unavailable", "The selected path is not an existing PDF.")
            return

        choice = messagebox.askyesnocancel(
            "Choose how to open PDF",
            f"Selected document:\\n{path.name}\\n\\n"
            "YES — Read inside Personal AI Assistant\\n\\n"
            "NO — Open in external PDF viewer\\n\\n"
            "CANCEL — Cancel",
        )
        if choice is True:
            self.display_pdf_inside(str(path))
        elif choice is False:
            try:
                open_path(path)
            except OSError as error:
                messagebox.showerror("External viewer unavailable", friendly_error("The PDF could not be opened externally.", str(error)))

    def read_pdf_text(self, file_path, limit=20000):
        path = Path(file_path).expanduser()
        if not path.is_file() or path.suffix.lower() != ".pdf":
            return "PDF unavailable. Please select a valid PDF file."
        with fitz.open(str(path)) as document:
            page_count = len(document)
            sections = []
            for index, page in enumerate(document):
                page_text = page.get_text().strip()
                if page_text:
                    sections.append(f"Page {index + 1}:\\n{page_text}")

        full_text = "\\n\\n".join(sections)
        if not full_text:
            return f"Document: {path.name}\\nPages: {page_count}\\n\\nNo selectable text was found. This may be a scanned document."

        word_count = len(re.findall(r"\\b[\\w'-]+\\b", full_text))
        preview = full_text[:limit]
        if len(full_text) > limit:
            preview += "\\n\\n[Preview shortened for responsiveness.]"
        return f"DOCUMENT: {path.name}\\nPAGES: {page_count}\\nWORD COUNT: {word_count}\\n\\n{preview}"

    def display_pdf_inside(self, path):
        if self.current_page != "PDF Studio":
            self.go("PDF Studio")
        self.pdf_path_entry.delete(0, "end")
        self.pdf_path_entry.insert(0, path)
        self.show_result(self.pdf_output, "⏳ Reading document…")

        def done(ok, value):
            if not alive(self.pdf_output):
                return
            if ok:
                self.show_result(self.pdf_output, value)
            else:
                self.show_result(self.pdf_output, "Could not read this document.")
                messagebox.showerror("PDF reading error", friendly_error("The document could not be read inside.", str(value)))

        self.run_bg(lambda: self.read_pdf_text(path), done)

    # --- CHAT ASSISTANT ---
    def show_chat(self):
        self.banner("Chat Assistant", "Use quick buttons or type commands (try “help”). Anything else goes to AI.")
        chips = ctk.CTkScrollableFrame(self.content, orientation="horizontal", height=48, fg_color="transparent")
        chips.pack(fill="x")
        for label, command, run in QUICK_COMMANDS:
            make_button(
                chips, label, lambda c=command, r=run: self.quick_command(c, r),
                "ghost", height=32, width=max(90, 9 * len(label) + 20), font=(FONT, 12, "bold"),
            ).pack(side="left", padx=4)

        self.chat_area = ctk.CTkScrollableFrame(self.content, fg_color=CARD, corner_radius=14)
        self.chat_area.pack(fill="both", expand=True, pady=(8, 6))

        self.chat_status = ctk.CTkLabel(
            self.content, text="✍ Assistant is typing…" if self.streaming else "",
            text_color=ACCENT, anchor="w")
        self.chat_status.pack(fill="x")

        row = ctk.CTkFrame(self.content, fg_color="transparent")
        row.pack(fill="x", pady=(2, 0))
        self.chat_entry = make_entry(row, height=44, placeholder_text="Type help to view commands")
        self.chat_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.chat_entry.bind("<Return>", self.send_chat)
        make_button(row, "Send ➤", self.send_chat, "accent", width=90, height=44).pack(side="left", padx=3)
        make_button(row, "🧹 Clear", self.clear_chat, "ghost", width=90, height=44).pack(side="left", padx=3)

        if not self.chat_history:
            self.chat_message("Assistant", "Welcome! Tap a quick button above or type help to see all commands.")
        else:
            for sender, message, stamp in self.chat_history:
                self.render_bubble(sender, message, stamp)
            self.scroll_chat_end()

    def quick_command(self, command, run_now):
        if run_now:
            self.submit_chat(command)
        else:
            self.chat_entry.delete(0, "end")
            self.chat_entry.insert(0, command)
            self.chat_entry.focus_set()

    def clear_chat(self):
        self.chat_epoch += 1
        self.streaming = False
        self.chat_history.clear()
        self.ai_messages.clear()
        self.go("Chat Assistant")

    def render_bubble(self, sender, message, stamp):
        is_user = sender == "You"
        row = ctk.CTkFrame(self.chat_area, fg_color="transparent")
        row.pack(fill="x", pady=5, padx=4)
        bubble = ctk.CTkFrame(
            row, corner_radius=16,
            fg_color=BLUE if is_user else mix(NAVY, CARD, 0.7),
            border_width=0 if is_user else 1, border_color=BORDER,
        )
        bubble.pack(anchor="e" if is_user else "w", padx=(80, 6) if is_user else (6, 80))

        head = "You" if is_user else "🤖 Assistant"
        ctk.CTkLabel(bubble, text=f"{head}  ·  {stamp}", font=(FONT, 10),
                     text_color=PALE if is_user else MUTED).pack(anchor="w", padx=14, pady=(8, 0))
        message_label = ctk.CTkLabel(bubble, text=message, wraplength=520, justify="left", anchor="w",
                                     font=(FONT, 13), text_color="white")
        message_label.pack(anchor="w", padx=14, pady=(2, 8 if is_user else 2))

        if not is_user:
            ctk.CTkButton(
                bubble, text="Copy", width=50, height=22, fg_color="transparent",
                hover_color=CARD_HOVER, text_color=MUTED, font=(FONT, 10),
                command=lambda lbl=message_label: self.copy_text(lbl.cget("text").rstrip("▌ ")),
            ).pack(anchor="e", padx=8, pady=(0, 6))

        return message_label

    def copy_text(self, text):
        self.clipboard_clear()
        self.clipboard_append(text)

    def _scroll_now(self):
        if alive(self.chat_area):
            try:
                self.chat_area._parent_canvas.yview_moveto(1.0)
            except Exception:
                pass

    def scroll_chat_end(self):
        self.after(80, self._scroll_now)

    def chat_message(self, sender, message):
        stamp = datetime.now().strftime("%H:%M")
        self.chat_history.append((sender, message, stamp))
        del self.chat_history[:-200]
        if self.current_page == "Chat Assistant" and alive(self.chat_area):
            self.render_bubble(sender, message, stamp)
            self.scroll_chat_end()

    def send_chat(self, _event=None):
        text = self.chat_entry.get().strip()
        if not text:
            return
        if self.streaming:
            if alive(self.chat_status):
                self.chat_status.configure(text="⏳ Please wait — assistant is answering…")
            return
        self.chat_entry.delete(0, "end")
        self.submit_chat(text)

    def submit_chat(self, text):
        if self.streaming:
            return
        self.chat_message("You", text)
        if alive(self.chat_status):
            self.chat_status.configure(text="⏳ Working…")

        def done(ok, value):
            if ok and isinstance(value, AIRequest):
                self.start_ai_stream(value.question)
                return
            if self.current_page == "Chat Assistant" and alive(self.chat_status):
                self.chat_status.configure(text="")
            if ok:
                self.chat_message("Assistant", value)
            else:
                self.chat_message("Assistant", friendly_error("The command could not be completed.", str(value)))

        self.run_bg(lambda: self.process_command(text), done, token_bound=False)

    def process_command(self, text):
        command = text.lower().strip()
        try:
            if command == "help":
                return (
                    "AVAILABLE COMMANDS\\n\\n"
                    "help\\n"
                    "system info\\n"
                    "search files <name>\\n"
                    "find pdf <filename>\\n"
                    "list pdfs\\n"
                    "read pdf <path or number>\\n"
                    "open file <path>\\n"
                    "open folder <path>\\n"
                    "calculate (12 + 4) * 2\\n"
                    "convert 1024 KB to MB\\n"
                    "list notes\\n"
                    "save note title | content\\n"
                    "open youtube\\n"
                    "open google\\n"
                    "ask ai <question>"
                )
            if command == "system info":
                ram = psutil.virtual_memory()
                lines = [
                    f"Computer: {platform.node()}",
                    f"Operating system: {platform.platform()}",
                    f"Logical CPU cores: {psutil.cpu_count(logical=True)}",
                    f"CPU usage: {psutil.cpu_percent(interval=0.3)}%",
                    f"RAM usage: {ram.percent}%",
                    f"RAM available: {ram.available / (1024 ** 3):.1f} GB",
                ]
                try:
                    lines.append(f"Drive free: {psutil.disk_usage(DISK_ROOT).free / (1024 ** 3):.1f} GB")
                except OSError:
                    pass
                return "\\n".join(lines)

            if command.startswith("search files "):
                query = command[len("search files "):].strip()
                results = walk_files(make_matcher(query), 20) if query else []
                return "FILE SEARCH RESULTS\\n\\n" + "\\n".join(str(p) for p in results) if results else "No matching files."

            if command.startswith("find pdf "):
                query = text[len("find pdf "):].strip()
                self.pdf_paths = self.find_pdf_paths(query)
                return "PDF SEARCH RESULTS\\n\\n" + "\\n".join(f"{i}. {p}" for i, p in enumerate(self.pdf_paths, 1)) if self.pdf_paths else "No matching PDFs found."

            if command in ("list pdfs", "search pdfs"):
                self.pdf_paths = self.find_pdf_paths("")
                return "PDF LIST\\n\\n" + "\\n".join(f"{i}. {p}" for i, p in enumerate(self.pdf_paths, 1)) if self.pdf_paths else "No PDFs found."

            if command.startswith("read pdf number "):
                num_str = command[len("read pdf number "):].strip()
                if not self.pdf_paths or not num_str.isdigit():
                    return "Usage: read pdf number 1"
                num = int(num_str)
                if 1 <= num <= len(self.pdf_paths):
                    p = self.pdf_paths[num - 1]
                    self.after(0, lambda: self.offer_pdf_options(p))
                    return f"Selected document: {Path(p).name}"
                return "Invalid number."

            if command.startswith("read pdf "):
                p = text[len("read pdf "):].strip().strip('"')
                self.after(0, lambda: self.offer_pdf_options(p))
                return f"PDF selected: {p}"

            if command.startswith("calculate "):
                expr = text[len("calculate "):].strip()
                return f"CALCULATION\\n{expr} = {fmt_number(SafeCalculator.calculate(expr))}"

            if command.startswith("convert "):
                m = re.fullmatch(r"(-?\\d+(?:\\.\\d+)?)\\s*(kb|mb|gb|bytes)\\s+to\\s+(kb|mb|gb|bytes)", text[len("convert "):].strip(), re.IGNORECASE)
                if m:
                    unit = f"{UNIT_NAMES[m.group(2).lower()]} to {UNIT_NAMES[m.group(3).lower()]}"
                    if unit in CONVERSIONS:
                        return convert_value(float(m.group(1)), unit)
                return "Format: convert 1024 KB to MB"

            if command == "list notes":
                files = sorted(NOTES_DIR.glob("*.txt"))
                return "SAVED NOTES\\n\\n" + "\\n".join(p.name for p in files) if files else "No saved notes yet."

            if command.startswith("save note "):
                payload = text[len("save note "):]
                if "|" not in payload:
                    return "Format: save note title | content"
                title, content = payload.split("|", 1)
                p = NOTES_DIR / f"{clean_filename(title)}.txt"
                p.write_text(content.strip(), encoding="utf-8")
                self.after(0, self.refresh_notes)
                return f"Note saved successfully: {p.name}"

            if command.startswith("open file "):
                p = Path(text[len("open file "):].strip().strip('"'))
                if p.exists() and p.is_file():
                    open_path(p)
                    return f"Opening: {p}"
                return "File not found."

            if command.startswith("open folder "):
                p = Path(text[len("open folder "):].strip().strip('"'))
                if p.exists() and p.is_dir():
                    open_path(p)
                    return f"Opening folder: {p}"
                return "Folder not found."

            if command == "open youtube":
                webbrowser.open("https://www.youtube.com")
                return "Opening YouTube…"

            if command == "open google":
                webbrowser.open("https://www.google.com")
                return "Opening Google…"

            if command.startswith("ask ai "):
                q = text[len("ask ai "):].strip()
                return AIRequest(q) if q else "Type a question after 'ask ai'."

            return AIRequest(text)
        except ZeroDivisionError:
            return "Division by zero is not permitted."
        except Exception as error:
            return friendly_error("Error processing command", str(error))

    def start_ai_stream(self, question):
        self.streaming = True
        stamp = datetime.now().strftime("%H:%M")
        label = self.render_bubble("Assistant", "Thinking", stamp) if (self.current_page == "Chat Assistant" and alive(self.chat_area)) else None
        self.scroll_chat_end()
        if alive(self.chat_status):
            self.chat_status.configure(text="✍ Assistant is typing…")

        messages = [
            {"role": "system", "content": "You are a helpful personal desktop assistant. Keep answers clear and concise."}
        ] + self.ai_messages[-10:] + [{"role": "user", "content": question}]

        stream = {
            "queue": queue.Queue(), "pending": "", "shown": "", "full": "",
            "started": False, "finished": False, "failed": False, "tick": 0,
            "label": label, "stamp": stamp, "question": question, "epoch": self.chat_epoch,
        }
        threading.Thread(target=self._stream_worker, args=(messages, stream["queue"]), daemon=True).start()
        self._stream_tick(stream)

    def _stream_worker(self, messages, out):
        try:
            with requests.post(
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "messages": messages, "stream": True},
                stream=True, timeout=(5, 120),
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if not line:
                        continue
                    data = json.loads(line)
                    piece = data.get("message", {}).get("content", "")
                    if piece:
                        out.put(("text", piece))
                    if data.get("done"):
                        break
            out.put(("done", None))
        except requests.RequestException:
            out.put(("error", AI_UNAVAILABLE))
        except Exception:
            out.put(("error", AI_BAD_RESPONSE))

    def _stream_tick(self, s):
        if s["epoch"] != self.chat_epoch:
            return
        try:
            while True:
                kind, payload = s["queue"].get_nowait()
                if kind == "text":
                    s["pending"] += payload
                    s["full"] += payload
                    s["started"] = True
                elif kind == "done":
                    s["finished"] = True
                elif kind == "error":
                    prefix = "\\n\\n" if s["full"] else ""
                    s["pending"] += prefix + payload
                    s["started"] = True
                    s["failed"] = True
                    s["finished"] = True
        except queue.Empty:
            pass

        label = s["label"]
        visible = label is not None and alive(label)
        s["tick"] += 1

        if s["pending"]:
            count = max(1, len(s["pending"]) // 6) if visible else len(s["pending"])
            s["shown"] += s["pending"][:count]
            s["pending"] = s["pending"][count:]

        if visible:
            if not s["started"]:
                dots = "." * (1 + (s["tick"] // 20) % 3)
                label.configure(text=f"Thinking{dots}")
            else:
                cursor = "" if (s["finished"] and not s["pending"]) else " ▌"
                label.configure(text=s["shown"] + cursor)
            if s["tick"] % 5 == 0:
                self._scroll_now()

        if s["finished"] and not s["pending"]:
            self._finish_stream(s, visible)
            return

        self.after(16 if visible else 60, lambda: self._stream_tick(s))

    def _finish_stream(self, s, visible):
        final = s["shown"]
        if visible:
            s["label"].configure(text=final)
            self._scroll_now()
        if not s["failed"]:
            self.ai_messages.append({"role": "user", "content": s["question"]})
            self.ai_messages.append({"role": "assistant", "content": s["full"]})
            del self.ai_messages[:-20]
        self.chat_history.append(("Assistant", final, s["stamp"]))
        del self.chat_history[:-200]
        self.streaming = False
        if self.current_page == "Chat Assistant" and alive(self.chat_status):
            self.chat_status.configure(text="")


if __name__ == "__main__":
    try:
        app = PersonalAssistant()
        app.mainloop()
    except Exception as error:
        messagebox.showerror("Application error", friendly_error("Application crashed on startup.", str(error)))
`;
