from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional, Tuple, Callable, Dict

try:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox, simpledialog
except Exception as e:
    print("Tkinter is required to run this program.")
    raise

HEX_PAIR = re.compile(r"^[0-9a-fA-F]{2}$")
HEX_CHARS = set("0123456789abcdefABCDEF")
HEX_STR = re.compile(r"^(?:[0-9a-fA-F]{2}\s*)+$")


def clamp(n: int, a: int, b: int) -> int:
    """Clamp n to [a, b]."""
    return max(a, min(b, n))


def parse_offset_expr(s: str) -> int:
    """
    Parse an integer offset expression with hex and +-*/() support. Examples:
    "0x100", "256", "0x100+32", "0x100-0x20", "512/2".
    """
    s = s.strip()
    if not s:
        raise ValueError("empty expression")
    token_re = re.compile(r"0x[0-9a-fA-F]+|\d+")
    expr = ""
    idx = 0
    for m in token_re.finditer(s):
        expr += s[idx:m.start()]
        tok = m.group(0)
        if tok.lower().startswith("0x"):
            expr += str(int(tok, 16))
        else:
            expr += tok
        idx = m.end()
    expr += s[idx:]
    if not re.fullmatch(r"[0-9\+\-\*\/\(\)\s]+", expr):
        raise ValueError("unsupported characters")
    try:
        val = int(eval(expr, {"__builtins__": {}}, {}))
    except Exception:
        raise ValueError("invalid expression")
    return val


class Operation:
    """Base class for undoable operations on a ByteBuffer."""
    def undo(self, buf: "ByteBuffer") -> None:
        raise NotImplementedError

    def redo(self, buf: "ByteBuffer") -> None:
        raise NotImplementedError

    def coalesce(self, other: "Operation") -> bool:
        """Try to merge with another op to keep undo stack compact."""
        return False


@dataclass
class OverwriteOp(Operation):
    offset: int
    old: bytes
    new: bytes

    def undo(self, buf: "ByteBuffer") -> None:
        buf._overwrite_raw(self.offset, self.old)

    def redo(self, buf: "ByteBuffer") -> None:
        buf._overwrite_raw(self.offset, self.new)

    def coalesce(self, other: "Operation") -> bool:
        if not isinstance(other, OverwriteOp):
            return False
        if self.offset + len(self.new) == other.offset:
            self.new += other.new
            self.old += other.old
            return True
        return False


@dataclass
class InsertOp(Operation):
    offset: int
    data: bytes

    def undo(self, buf: "ByteBuffer") -> None:
        buf._delete_raw(self.offset, len(self.data))

    def redo(self, buf: "ByteBuffer") -> None:
        buf._insert_raw(self.offset, self.data)

    def coalesce(self, other: "Operation") -> bool:
        if not isinstance(other, InsertOp):
            return False
        if self.offset + len(self.data) == other.offset:
            self.data += other.data
            return True
        return False


@dataclass
class DeleteOp(Operation):
    offset: int
    data: bytes

    def undo(self, buf: "ByteBuffer") -> None:
        buf._insert_raw(self.offset, self.data)

    def redo(self, buf: "ByteBuffer") -> None:
        buf._delete_raw(self.offset, len(self.data))

    def coalesce(self, other: "Operation") -> bool:
        if not isinstance(other, DeleteOp):
            return False
        if other.offset == self.offset:
            self.data += other.data
            return True
        return False


class ByteBuffer:
    def __init__(self, data: bytes | bytearray | None = None):
        self.data = bytearray(data or b"")
        self.undo_stack: List[Operation] = []
        self.redo_stack: List[Operation] = []
        self.dirty = False

    def _overwrite_raw(self, offset: int, new: bytes) -> None:
        self.data[offset:offset+len(new)] = new

    def _insert_raw(self, offset: int, data: bytes) -> None:
        self.data[offset:offset] = data

    def _delete_raw(self, offset: int, n: int) -> None:
        del self.data[offset:offset+n]

    def overwrite(self, offset: int, new: bytes) -> None:
        old = bytes(self.data[offset:offset+len(new)])
        op = OverwriteOp(offset, old, bytes(new))
        self._apply(op)

    def insert(self, offset: int, data: bytes) -> None:
        op = InsertOp(offset, bytes(data))
        self._apply(op)

    def delete(self, offset: int, n: int) -> None:
        old = bytes(self.data[offset:offset+n])
        op = DeleteOp(offset, old)
        self._apply(op)

    def _apply(self, op: Operation) -> None:
        op.redo(self)
        if self.undo_stack and self.undo_stack[-1].coalesce(op):
            pass
        else:
            self.undo_stack.append(op)
        self.redo_stack.clear()
        self.dirty = True

    def can_undo(self) -> bool:
        return bool(self.undo_stack)

    def can_redo(self) -> bool:
        return bool(self.redo_stack)

    def undo(self) -> None:
        if not self.undo_stack:
            return
        op = self.undo_stack.pop()
        op.undo(self)
        self.redo_stack.append(op)
        self.dirty = True

    def redo(self) -> None:
        if not self.redo_stack:
            return
        op = self.redo_stack.pop()
        op.redo(self)
        self.undo_stack.append(op)
        self.dirty = True

    @classmethod
    def from_file(cls, path: str) -> "ByteBuffer":
        with open(path, "rb") as f:
            data = f.read()
        return cls(data)

    def to_file(self, path: str) -> None:
        with open(path, "wb") as f:
            f.write(self.data)
        self.dirty = False

    def __len__(self) -> int:
        return len(self.data)

    def get(self, offset: int, n: int) -> bytes:
        return bytes(self.data[offset:offset+n])

    def set_byte(self, offset: int, value: int) -> None:
        self.overwrite(offset, bytes([value & 0xFF]))


class GotoDialog(simpledialog.Dialog):
    """Go to a specific offset by expression."""
    def __init__(self, app: "HexEditorApp"):
        self.app = app
        super().__init__(app.root, title="Go To Offset")

    def body(self, master):
        ttk.Label(master, text="Offset (dec or hex like 0x1F, supports + - * /):").grid(row=0, column=0, sticky="w")
        self.var = tk.StringVar()
        e = ttk.Entry(master, textvariable=self.var, width=40)
        e.grid(row=1, column=0, sticky="we")
        return e

    def validate(self):
        try:
            parse_offset_expr(self.var.get())
            return True
        except Exception as e:
            messagebox.showerror("Invalid offset", str(e))
            return False

    def apply(self):
        try:
            val = parse_offset_expr(self.var.get())
        except Exception:
            return
        n = len(self.app.buf)
        if n == 0:
            self.app.move_caret(0)
            return
        self.app.move_caret(clamp(val, 0, n - 1))
        self.app.center_on_offset(self.app.caret)


class FindDialog(tk.Toplevel):
    """
    Find/Replace dialog supporting ASCII or hex patterns.
    - ASCII: type normal text (case-sensitive toggle)
    - Hex: space-separated byte pairs like "DE AD BE EF"
    """
    def __init__(self, app: "HexEditorApp"):
        super().__init__(app.root)
        self.app = app
        self.title("Find / Replace")
        self.transient(app.root)
        self.resizable(False, False)

        self.var_mode = tk.StringVar(value="ascii")
        self.var_find = tk.StringVar()
        self.var_repl = tk.StringVar()
        self.var_case = tk.BooleanVar(value=False)
        self.var_wrap = tk.BooleanVar(value=True)
        self.var_dir = tk.StringVar(value="forward")

        frm = ttk.Frame(self)
        frm.pack(padx=10, pady=10, fill="both", expand=True)

        r = 0
        ttk.Label(frm, text="Find:").grid(row=r, column=0, sticky="e")
        ttk.Entry(frm, textvariable=self.var_find, width=50).grid(row=r, column=1, columnspan=3, sticky="we", pady=2)
        r += 1
        ttk.Label(frm, text="Replace:").grid(row=r, column=0, sticky="e")
        ttk.Entry(frm, textvariable=self.var_repl, width=50).grid(row=r, column=1, columnspan=3, sticky="we", pady=2)
        r += 1

        ttk.Label(frm, text="Mode:").grid(row=r, column=0, sticky="e")
        ttk.Radiobutton(frm, text="ASCII", variable=self.var_mode, value="ascii").grid(row=r, column=1, sticky="w")
        ttk.Radiobutton(frm, text="Hex", variable=self.var_mode, value="hex").grid(row=r, column=2, sticky="w")
        r += 1

        ttk.Checkbutton(frm, text="Case sensitive (ASCII)", variable=self.var_case).grid(row=r, column=1, sticky="w")
        ttk.Checkbutton(frm, text="Wrap around", variable=self.var_wrap).grid(row=r, column=2, sticky="w")
        r += 1

        ttk.Label(frm, text="Direction:").grid(row=r, column=0, sticky="e")
        ttk.Radiobutton(frm, text="Forward", variable=self.var_dir, value="forward").grid(row=r, column=1, sticky="w")
        ttk.Radiobutton(frm, text="Backward", variable=self.var_dir, value="backward").grid(row=r, column=2, sticky="w")
        r += 1

        btns = ttk.Frame(frm)
        btns.grid(row=r, column=0, columnspan=4, sticky="e", pady=(6, 0))
        ttk.Button(btns, text="Find Next", command=self.find_next).pack(side="left", padx=4)
        ttk.Button(btns, text="Replace", command=self.replace_one).pack(side="left", padx=4)
        ttk.Button(btns, text="Replace All", command=self.replace_all).pack(side="left", padx=4)
        ttk.Button(btns, text="Close", command=self.destroy).pack(side="left", padx=4)

        frm.columnconfigure(1, weight=1)
        self.bind("<Return>", lambda e: self.find_next())
        self.protocol("WM_DELETE_WINDOW", self.destroy)
        self.geometry("+200+200")

    def _read_pattern(self) -> Optional[bytes]:
        s = self.var_find.get()
        if not s:
            return None
        if self.var_mode.get() == "ascii":
            return s.encode("utf-8")
        else:
            clean = s.replace(" ", "").replace("_", "")
            if len(clean) % 2 != 0 or not re.fullmatch(r"[0-9a-fA-F]+", clean):
                messagebox.showerror("Invalid hex", "Use even-length hex like 'DE AD BE EF'.")
                return None
            return bytes.fromhex(clean)

    def _read_repl(self) -> bytes:
        s = self.var_repl.get()
        if self.var_mode.get() == "ascii":
            return s.encode("utf-8")
        else:
            s = s.replace(" ", "").replace("_", "")
            if s == "":
                return b""
            if len(s) % 2 != 0 or not re.fullmatch(r"[0-9a-fA-F]+", s):
                messagebox.showerror("Invalid hex", "Replacement must be hex bytes.")
                return b""
            return bytes.fromhex(s)

    def find_next(self) -> None:
        app = self.app
        pat = self._read_pattern()
        if not pat:
            return
        start = app.caret
        ascii_mode = self.var_mode.get() == "ascii"
        case_sensitive = True if not ascii_mode else self.var_case.get()
        if self.var_dir.get() == "forward":
            idx = app.find_bytes(pat, start=start + 1, wrap=self.var_wrap.get(),
                                 ascii_mode=ascii_mode, case_sensitive=case_sensitive)
        else:
            idx = app.find_bytes_backward(pat, start=start - 1, wrap=self.var_wrap.get(),
                                          ascii_mode=ascii_mode, case_sensitive=case_sensitive)
        if idx is None:
            messagebox.showinfo("Find", "Not found.")
            return
        app.move_caret(idx)
        app.select_range(idx, idx + len(pat))
        app.center_on_offset(idx)

    def replace_one(self) -> None:
        app = self.app
        pat = self._read_pattern()
        if not pat:
            return
        repl = self._read_repl()
        sel = app.get_selection()
        if sel and app.buf.get(sel[0], sel[1] - sel[0]) == pat:
            if len(repl) == len(pat):
                app.buf.overwrite(sel[0], repl)
            else:
                app.buf.delete(sel[0], sel[1] - sel[0])
                app.buf.insert(sel[0], repl)
            app.move_caret(sel[0] + len(repl) - 1)
            app.clear_selection()
            app.mark_dirty()
            app.render()
        else:
            self.find_next()

    def replace_all(self) -> None:
        app = self.app
        pat = self._read_pattern()
        if not pat:
            return
        repl = self._read_repl()
        count = 0
        pos = 0
        n = len(app.buf)
        while pos < n:
            idx = app.find_bytes(pat, start=pos, wrap=False, ascii_mode=(self.var_mode.get() == "ascii"),
                                 case_sensitive=self.var_case.get() if self.var_mode.get() == "ascii" else True)
            if idx is None:
                break
            if len(repl) == len(pat):
                app.buf.overwrite(idx, repl)
                pos = idx + len(repl)
            else:
                app.buf.delete(idx, len(pat))
                app.buf.insert(idx, repl)
                pos = idx + len(repl)
                n = len(app.buf)
            count += 1
        app.mark_dirty()
        app.render()
        messagebox.showinfo("Replace All", f"Replaced {count} occurrence(s).")


class HexEditorApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.file_path: Optional[str] = None
        self.buf = ByteBuffer()
        self.bytes_per_row = 16
        self.uppercase_hex = True
        self.read_only = False
        self.insert_mode = False
        self.caret = 0
        self.sel_start: Optional[int] = None
        self.sel_end: Optional[int] = None
        self.bookmarks: Dict[int, int] = {}
        self.theme = "dark"
        self.active_pane = "hex"
        self._pending_nibble: Optional[int] = None

        self._build_ui()
        self._bind_keys()
        self.render()
        self.update_title()

    def _build_ui(self):
        self._setup_style()
        self._build_menu()

        tb = ttk.Frame(self.root)
        tb.pack(fill="x", side="top")
        self._make_toolbar(tb)

        main = ttk.Frame(self.root)
        main.pack(fill="both", expand=True)

        self.vscroll = ttk.Scrollbar(main, orient="vertical")
        self.vscroll.pack(side="right", fill="y")

        self.txt_offset = tk.Text(main, width=10, height=30, wrap="none", padx=6, pady=6, takefocus=0)
        self.txt_hex = tk.Text(main, width=48, height=30, wrap="none", padx=6, pady=6)
        self.txt_ascii = tk.Text(main, width=18, height=30, wrap="none", padx=6, pady=6)

        self.txt_offset.pack(side="left", fill="both")
        self.txt_hex.pack(side="left", fill="both", expand=True)
        self.txt_ascii.pack(side="left", fill="both")

        mono = ("Courier New", 12)
        for w in (self.txt_offset, self.txt_hex, self.txt_ascii):
            w.configure(font=mono, undo=False, tabs=("1c",))
            w.configure(yscrollcommand=self._yscroll)

        self.vscroll.configure(command=self._scroll_y)

        self._apply_text_theme(self.txt_offset, is_gutter=True)
        self._apply_text_theme(self.txt_hex, is_gutter=False)
        self._apply_text_theme(self.txt_ascii, is_gutter=False)

        for w in (self.txt_hex, self.txt_ascii):
            w.tag_configure("sel", background="#2d79c7", foreground="white")
            w.tag_configure("caret", background="#00CCAA")

        self.txt_offset.configure(state="disabled")
        self.txt_hex.configure(insertwidth=0)
        self.txt_ascii.configure(insertwidth=0)

        self.status = ttk.Label(self.root, text="Ready", anchor="w")
        self.status.pack(fill="x", side="bottom")

        self.txt_hex.focus_set()

    def _setup_style(self):
        style = ttk.Style(self.root)
        try:
            style.theme_use("clam")
        except Exception:
            pass
        if self.theme == "dark":
            self.bg = "#1e1f22"
            self.fg = "#e6e6e6"
            self.gutter_bg = "#24262a"
        else:
            self.bg = "#ffffff"
            self.fg = "#000000"
            self.gutter_bg = "#f2f2f2"
        self.root.configure(bg=self.bg)

    def _apply_text_theme(self, widget: tk.Text, is_gutter=False):
        widget.configure(background=self.gutter_bg if is_gutter else self.bg,
                         foreground=self.fg,
                         insertbackground=self.fg,
                         highlightthickness=0,
                         borderwidth=0)

    def _build_menu(self):
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        m_file = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="File", menu=m_file)
        m_file.add_command(label="New", accelerator="Ctrl+N", command=self.new_file)
        m_file.add_command(label="Open...", accelerator="Ctrl+O", command=self.open_file)
        m_file.add_command(label="Save", accelerator="Ctrl+S", command=self.save_file)
        m_file.add_command(label="Save As...", accelerator="Ctrl+Shift+S", command=self.save_file_as)
        m_file.add_separator()
        m_file.add_command(label="Exit", accelerator="Alt+F4", command=self.on_close)

        m_edit = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="Edit", menu=m_edit)
        m_edit.add_command(label="Undo", accelerator="Ctrl+Z", command=self.undo)
        m_edit.add_command(label="Redo", accelerator="Ctrl+Y", command=self.redo)
        m_edit.add_separator()
        m_edit.add_command(label="Cut", accelerator="Ctrl+X", command=self.cut)
        m_edit.add_command(label="Copy", accelerator="Ctrl+C", command=self.copy)
        m_edit.add_command(label="Paste", accelerator="Ctrl+V", command=self.paste)
        m_edit.add_command(label="Delete", accelerator="Del", command=self.delete_selection)
        m_edit.add_separator()
        m_edit.add_command(label="Select All", accelerator="Ctrl+A", command=self.select_all)
        m_edit.add_command(label="Copy as Hex", command=self.copy_as_hex)
        m_edit.add_command(label="Copy as ASCII", command=self.copy_as_ascii)
        m_edit.add_separator()
        m_edit.add_checkbutton(label="Read-only", command=self.toggle_read_only)
        m_edit.add_checkbutton(label="Insert mode", accelerator="Ins", command=self.toggle_insert_mode)

        m_search = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="Search", menu=m_search)
        m_search.add_command(label="Find...", accelerator="Ctrl+F", command=self.open_find)
        m_search.add_command(label="Go To Offset...", accelerator="Ctrl+G", command=self.goto_offset)

        m_view = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="View", menu=m_view)
        for n in (8, 16, 24, 32):
            m_view.add_radiobutton(label=f"Bytes per row: {n}", command=lambda n=n: self.set_bpr(n))
        m_view.add_separator()
        m_view.add_checkbutton(label="Uppercase hex", command=self.toggle_uppercase)
        m_view.add_checkbutton(label="Dark theme", command=self.toggle_theme)

        m_marks = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="Bookmarks", menu=m_marks)
        m_marks.add_command(label="Add Bookmark", accelerator="Ctrl+B", command=self.add_bookmark)
        m_marks.add_command(label="Clear All", command=self.clear_bookmarks)
        for i in range(10):
            m_marks.add_command(label=f"Jump to {i}", accelerator=f"Alt+{i}", command=lambda i=i: self.jump_bookmark(i))

        m_help = tk.Menu(menubar, tearoff=False)
        menubar.add_cascade(label="Help", menu=m_help)
        m_help.add_command(label="About", command=self.show_about)

    def _make_toolbar(self, tb: ttk.Frame):
        def btn(text: str, cmd: Callable[[], None]):
            b = ttk.Button(tb, text=text, command=cmd)
            b.pack(side="left", padx=4, pady=4)
            return b
        btn("Open", self.open_file)
        btn("Save", self.save_file)
        ttk.Separator(tb, orient="vertical").pack(side="left", fill="y", padx=6)
        btn("Undo", self.undo)
        btn("Redo", self.redo)
        ttk.Separator(tb, orient="vertical").pack(side="left", fill="y", padx=6)
        btn("Find", self.open_find)
        btn("Go To", self.goto_offset)
        ttk.Separator(tb, orient="vertical").pack(side="left", fill="y", padx=6)
        btn("BPR-8", lambda: self.set_bpr(8))
        btn("BPR-16", lambda: self.set_bpr(16))
        btn("Insert", self.toggle_insert_mode)
        btn("Readonly", self.toggle_read_only)

    def _bind_keys(self):
        root = self.root
        root.bind_all("<Control-n>", lambda e: self.new_file())
        root.bind_all("<Control-o>", lambda e: self.open_file())
        root.bind_all("<Control-s>", lambda e: self.save_file())
        root.bind_all("<Control-S>", lambda e: self.save_file_as())
        root.bind_all("<Control-Shift-s>", lambda e: self.save_file_as())
        root.bind_all("<Control-q>", lambda e: self.on_close())

        root.bind_all("<Control-z>", lambda e: self.undo())
        root.bind_all("<Control-y>", lambda e: self.redo())
        root.bind_all("<Control-x>", lambda e: self.cut())
        root.bind_all("<Control-c>", lambda e: self.copy())
        root.bind_all("<Control-v>", lambda e: self.paste())
        root.bind_all("<Delete>", lambda e: self.delete_selection())
        root.bind_all("<Control-a>", lambda e: self.select_all())
        root.bind_all("<Insert>", lambda e: self.toggle_insert_mode())

        root.bind_all("<Control-f>", lambda e: self.open_find())
        root.bind_all("<Control-g>", lambda e: self.goto_offset())
        root.bind_all("<Control-b>", lambda e: self.add_bookmark())
        for i in range(10):
            root.bind_all(f"<Alt-Key-{i}>", lambda e, i=i: self.jump_bookmark(i))

        self.txt_hex.bind("<Button-1>", self.on_click_hex)
        self.txt_hex.bind("<B1-Motion>", self.on_drag_hex)
        self.txt_hex.bind("<Key>", self.on_key_hex)
        self.txt_hex.bind("<FocusIn>", lambda e: self._set_active_pane("hex"))

        self.txt_ascii.bind("<Button-1>", self.on_click_ascii)
        self.txt_ascii.bind("<B1-Motion>", self.on_drag_ascii)
        self.txt_ascii.bind("<Key>", self.on_key_ascii)
        self.txt_ascii.bind("<FocusIn>", lambda e: self._set_active_pane("ascii"))

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def mark_dirty(self):
        self.update_title()
        self.status.configure(text=self._status_text())

    def update_title(self):
        name = self.file_path if self.file_path else "(untitled)"
        star = "*" if self.buf.dirty else ""
        self.root.title(f"Hexadamn - {name}{star}")

    def _status_text(self) -> str:
        total = len(self.buf)
        b = self.buf.get(self.caret, 1) if total else b"\x00"
        byte = b[0]
        mode = "INS" if self.insert_mode else "OVR"
        sel = self.get_selection()
        sel_txt = f" sel={sel[1]-sel[0]}" if sel else ""
        ro = "RO" if self.read_only else "RW"
        return f"off=0x{self.caret:08X} ({self.caret})  byte=0x{byte:02X} ({byte})  len={total}{sel_txt}  {mode} {ro} bpr={self.bytes_per_row}"

    def _set_active_pane(self, pane: str):
        self.active_pane = pane

    def render(self):
        lines_off, lines_hex, lines_ascii = self._format_lines()
        self._set_text(self.txt_offset, "\n".join(lines_off), readonly=True)
        self._set_text(self.txt_hex, "\n".join(lines_hex))
        self._set_text(self.txt_ascii, "\n".join(lines_ascii))
        self._render_caret_and_sel()
        self.status.configure(text=self._status_text())

    def _format_lines(self) -> Tuple[List[str], List[str], List[str]]:
        data = self.buf.data
        bpr = self.bytes_per_row
        upper = self.uppercase_hex
        offs, hx, asc = [], [], []
        for base in range(0, len(data), bpr):
            row = data[base:base+bpr]
            offs.append(f"{base:08X}")
            hexes = [f"{b:02X}" if upper else f"{b:02x}" for b in row]
            hx.append(" ".join(hexes))
            asc.append("".join(chr(b) if 32 <= b < 127 else "." for b in row))
        return offs, hx, asc

    def _set_text(self, widget: tk.Text, text: str, readonly: bool = False):
        widget.configure(state="normal")
        widget.delete("1.0", "end")
        if text:
            widget.insert("1.0", text)
        widget.configure(state="disabled" if readonly else "normal")

    def _render_caret_and_sel(self):
        for w in (self.txt_hex, self.txt_ascii):
            w.tag_remove("sel", "1.0", "end")
            w.tag_remove("caret", "1.0", "end")
        if len(self.buf) == 0:
            return
        line, col_hex, col_ascii = self._offset_to_text_indices(self.caret)
        self._tag_hex_byte(line, col_hex, "caret")
        self._tag_ascii_char(line, col_ascii, "caret")
        sel = self.get_selection()
        if sel:
            s, e = sel
            if s > e:
                s, e = e, s
            for off in range(s, e):
                l, ch, ca = self._offset_to_text_indices(off)
                self._tag_hex_byte(l, ch, "sel")
                self._tag_ascii_char(l, ca, "sel")

    def _offset_to_text_indices(self, offset: int) -> Tuple[int, int, int]:
        bpr = self.bytes_per_row
        line = offset // bpr + 1
        in_row = offset % bpr
        hex_col = in_row * 3
        ascii_col = in_row
        return line, hex_col, ascii_col

    def _tag_hex_byte(self, line: int, hex_col: int, tag: str):
        start = f"{line}.0+{hex_col}c"
        end = f"{line}.0+{hex_col+2}c"
        self.txt_hex.tag_add(tag, start, end)

    def _tag_ascii_char(self, line: int, ascii_col: int, tag: str):
        start = f"{line}.0+{ascii_col}c"
        end = f"{line}.0+{ascii_col+1}c"
        self.txt_ascii.tag_add(tag, start, end)

    def _yscroll(self, first, last):
        self.vscroll.set(first, last)
        self.txt_hex.yview_moveto(first)
        self.txt_ascii.yview_moveto(first)
        self.txt_offset.yview_moveto(first)

    def _scroll_y(self, *args):
        for w in (self.txt_hex, self.txt_ascii, self.txt_offset):
            w.yview(*args)

    def move_caret(self, offset: int) -> None:
        if len(self.buf) == 0:
            self.caret = 0
        else:
            self.caret = clamp(offset, 0, len(self.buf) - 1)
        self._render_caret_and_sel()
        self.center_on_offset(self.caret, center=False)

    def center_on_offset(self, offset: int, center: bool = True) -> None:
        if len(self.buf) == 0:
            return
        line = offset // self.bytes_per_row + 1
        self.txt_hex.see(f"{line}.0")
        self.txt_ascii.see(f"{line}.0")
        self.txt_offset.see(f"{line}.0")

    def move_left(self): self.move_caret(self.caret - 1)
    def move_right(self): self.move_caret(self.caret + 1)
    def move_up(self): self.move_caret(self.caret - self.bytes_per_row)
    def move_down(self): self.move_caret(self.caret + self.bytes_per_row)

    def page_up(self):
        n = self._visible_rows()
        self.move_caret(self.caret - n * self.bytes_per_row)

    def page_down(self):
        n = self._visible_rows()
        self.move_caret(self.caret + n * self.bytes_per_row)

    def home(self):
        base = (self.caret // self.bytes_per_row) * self.bytes_per_row
        self.move_caret(base)

    def end(self):
        base = (self.caret // self.bytes_per_row) * self.bytes_per_row
        self.move_caret(min(len(self.buf) - 1, base + self.bytes_per_row - 1))

    def doc_home(self): self.move_caret(0)
    def doc_end(self): self.move_caret(len(self.buf) - 1 if len(self.buf) else 0)

    def _visible_rows(self) -> int:
        try:
            first = int(float(self.txt_hex.index("@0,0").split(".")[0]))
            last = int(float(self.txt_hex.index(f"@0,{self.txt_hex.winfo_height()}").split(".")[0]))
            return max(1, last - first)
        except Exception:
            return 25

    def clear_selection(self):
        self.sel_start = self.sel_end = None
        self._render_caret_and_sel()

    def select_range(self, start: int, end: int):
        self.sel_start = clamp(start, 0, len(self.buf))
        self.sel_end = clamp(end, 0, len(self.buf))
        self._render_caret_and_sel()

    def get_selection(self) -> Optional[Tuple[int, int]]:
        if self.sel_start is None or self.sel_end is None or self.sel_start == self.sel_end:
            return None
        a, b = sorted((self.sel_start, self.sel_end))
        return a, b

    def _get_sel_bytes(self) -> bytes:
        sel = self.get_selection()
        if sel:
            return self.buf.get(sel[0], sel[1] - sel[0])
        else:
            if len(self.buf) == 0:
                return b""
            return self.buf.get(self.caret, 1)

    def copy(self):
        data = self._get_sel_bytes()
        if not data:
            return
        self.root.clipboard_clear()
        self.root.clipboard_append(data.hex(" ").upper() if self.uppercase_hex else data.hex(" "))
        self.status.configure(text=f"Copied {len(data)} byte(s) as hex text")

    def copy_as_hex(self):
        data = self._get_sel_bytes()
        if not data:
            return
        txt = data.hex(" ").upper() if self.uppercase_hex else data.hex(" ")
        self.root.clipboard_clear()
        self.root.clipboard_append(txt)
        self.status.configure(text=f"Copied hex text ({len(data)} bytes)")

    def copy_as_ascii(self):
        data = self._get_sel_bytes()
        if not data:
            return
        txt = "".join(chr(b) if 32 <= b < 127 else "." for b in data)
        self.root.clipboard_clear()
        self.root.clipboard_append(txt)
        self.status.configure(text=f"Copied ASCII text ({len(data)} bytes)")

    def cut(self):
        if self.read_only:
            return
        sel = self.get_selection()
        if not sel:
            return
        data = self.buf.get(sel[0], sel[1] - sel[0])
        self.root.clipboard_clear()
        self.root.clipboard_append(data.hex(" ").upper() if self.uppercase_hex else data.hex(" "))
        self.buf.delete(sel[0], sel[1] - sel[0])
        self.move_caret(sel[0])
        self.clear_selection()
        self.mark_dirty()
        self.render()

    def paste(self):
        if self.read_only:
            return
        try:
            txt = self.root.clipboard_get()
        except Exception:
            return
        clean = txt.strip().replace(" ", "").replace("\n", "").replace("\r", "").replace("_", "")
        if clean and re.fullmatch(r"[0-9a-fA-F]+", clean) and len(clean) % 2 == 0:
            data = bytes.fromhex(clean)
        else:
            data = txt.encode("utf-8", errors="ignore")
        if self.get_selection():
            s, e = self.get_selection()
            if self.insert_mode:
                self.buf.delete(s, e - s)
                self.buf.insert(s, data)
                self.move_caret(s + len(data) - 1)
            else:
                n = e - s
                if len(data) <= n:
                    self.buf.overwrite(s, data)
                    if len(data) < n:
                        self.buf.delete(s + len(data), n - len(data))
                    self.move_caret(s + len(data) - 1)
                else:
                    self.buf.overwrite(s, data[:n])
                    self.buf.insert(e, data[n:])
                    self.move_caret(e + len(data) - n - 1)
        else:
            pos = self.caret
            if self.insert_mode:
                self.buf.insert(pos, data)
                self.move_caret(pos + len(data) - 1)
            else:
                if len(self.buf) == 0:
                    self.buf.insert(0, data)
                    self.move_caret(len(data) - 1)
                else:
                    self.buf.overwrite(pos, data[:1])
                    if len(data) > 1:
                        self.buf.insert(pos + 1, data[1:])
                    self.move_caret(pos + len(data) - 1)
        self.clear_selection()
        self.mark_dirty()
        self.render()

    def delete_selection(self):
        if self.read_only:
            return
        sel = self.get_selection()
        if not sel:
            return
        s, e = sel
        self.buf.delete(s, e - s)
        self.move_caret(s)
        self.clear_selection()
        self.mark_dirty()
        self.render()

    def backspace(self):
        if self.read_only:
            return
        sel = self.get_selection()
        if sel:
            self.delete_selection()
            return
        if self.caret <= 0:
            return
        if self.insert_mode:
            self.buf.delete(self.caret - 1, 1)
            self.move_caret(self.caret - 1)
        else:
            self.buf.set_byte(self.caret - 1, 0)
            self.move_caret(self.caret - 1)
        self.mark_dirty()
        self.render()

    def delete_key(self):
        if self.read_only:
            return
        sel = self.get_selection()
        if sel:
            self.delete_selection()
            return
        if self.caret >= len(self.buf):
            return
        if self.insert_mode:
            self.buf.delete(self.caret, 1)
        else:
            if len(self.buf) > 0:
                self.buf.set_byte(self.caret, 0)
        self.mark_dirty()
        self.render()

    def maybe_save_prompt(self) -> bool:
        if not self.buf.dirty:
            return True
        ans = messagebox.askyesnocancel("Unsaved changes", "Save changes before continuing?")
        if ans is None:
            return False
        if ans:
            return self.save_file()
        return True

    def new_file(self):
        if not self.maybe_save_prompt():
            return
        self.file_path = None
        self.buf = ByteBuffer()
        self.caret = 0
        self.clear_selection()
        self.render()
        self.update_title()

    def open_file(self):
        if not self.maybe_save_prompt():
            return
        path = filedialog.askopenfilename(title="Open binary file")
        if not path:
            return
        try:
            self.buf = ByteBuffer.from_file(path)
            self.file_path = path
            self.caret = 0
            self.clear_selection()
            self.render()
            self.buf.dirty = False
            self.update_title()
        except Exception as e:
            messagebox.showerror("Open failed", str(e))

    def save_file(self) -> bool:
        if not self.file_path:
            return self.save_file_as()
        try:
            self.buf.to_file(self.file_path)
            self.update_title()
            self.status.configure(text="Saved")
            return True
        except Exception as e:
            messagebox.showerror("Save failed", str(e))
            return False

    def save_file_as(self) -> bool:
        path = filedialog.asksaveasfilename(title="Save file as")
        if not path:
            return False
        try:
            self.buf.to_file(path)
            self.file_path = path
            self.update_title()
            self.status.configure(text="Saved")
            return True
        except Exception as e:
            messagebox.showerror("Save failed", str(e))
            return False

    def on_close(self):
        if not self.maybe_save_prompt():
            return
        self.root.destroy()

    def find_bytes(self, pattern: bytes, start: int = 0, wrap: bool = True,
                   ascii_mode: bool = False, case_sensitive: bool = True) -> Optional[int]:
        data = bytes(self.buf.data)
        if len(pattern) == 0:
            return None
        if ascii_mode and not case_sensitive:
            data_cmp = data.lower()
            pat = pattern.lower()
        else:
            data_cmp = data
            pat = pattern
        idx = data_cmp.find(pat, max(0, start))
        if idx == -1 and wrap:
            idx = data_cmp.find(pat, 0)
        return None if idx == -1 else idx

    def find_bytes_backward(self, pattern: bytes, start: int, wrap: bool = True,
                            ascii_mode: bool = False, case_sensitive: bool = True) -> Optional[int]:
        data = bytes(self.buf.data)
        if ascii_mode and not case_sensitive:
            data_cmp = data.lower()
            pat = pattern.lower()
        else:
            data_cmp = data
            pat = pattern
        idx = data_cmp.rfind(pat, 0, clamp(start, 0, len(data)))
        if idx == -1 and wrap:
            idx = data_cmp.rfind(pat, 0, len(data))
        return None if idx == -1 else idx

    def open_find(self):
        dlg = FindDialog(self)
        dlg.grab_set()

    def goto_offset(self):
        GotoDialog(self)

    def add_bookmark(self):
        for i in range(10):
            if i not in self.bookmarks:
                self.bookmarks[i] = self.caret
                self.status.configure(text=f"Bookmark {i} -> 0x{self.caret:X}")
                return
        self.bookmarks[0] = self.caret
        self.status.configure(text=f"Bookmark 0 -> 0x{self.caret:X}")

    def clear_bookmarks(self):
        self.bookmarks.clear()
        self.status.configure(text="Bookmarks cleared")

    def jump_bookmark(self, slot: int):
        if slot in self.bookmarks:
            self.move_caret(self.bookmarks[slot])
            self.center_on_offset(self.caret)
            self.status.configure(text=f"Jumped to bookmark {slot}")
        else:
            self.status.configure(text=f"Bookmark {slot} is empty")

    def set_bpr(self, n: int):
        self.bytes_per_row = n
        self.render()

    def toggle_uppercase(self):
        self.uppercase_hex = not self.uppercase_hex
        self.render()

    def toggle_theme(self):
        self.theme = "light" if self.theme == "dark" else "dark"
        self._setup_style()
        self._apply_text_theme(self.txt_offset, is_gutter=True)
        self._apply_text_theme(self.txt_hex, is_gutter=False)
        self._apply_text_theme(self.txt_ascii, is_gutter=False)
        self.render()

    def toggle_read_only(self):
        self.read_only = not self.read_only
        self.status.configure(text="Read-only ON" if self.read_only else "Read-only OFF")

    def toggle_insert_mode(self, *_):
        self.insert_mode = not self.insert_mode
        self.status.configure(text="Insert mode ON" if self.insert_mode else "Overwrite mode ON")

    def show_about(self):
        messagebox.showinfo(
            "About Hexadamn",
        "© NoahLi404\nthis app gonna be impossible to use (probably)"
        )

    def _text_index_to_offset_hex(self, index: str) -> int:
        line, col = index.split(".")
        line = int(line)
        col = int(col)
        byte_in_row = col // 3
        offset = (line - 1) * self.bytes_per_row + byte_in_row
        return clamp(offset, 0, max(0, len(self.buf) - 1))

    def _text_index_to_offset_ascii(self, index: str) -> int:
        line, col = index.split(".")
        line = int(line)
        col = int(col)
        byte_in_row = col
        offset = (line - 1) * self.bytes_per_row + byte_in_row
        return clamp(offset, 0, max(0, len(self.buf) - 1))

    def on_click_hex(self, event):
        try:
            idx = self.txt_hex.index(f"@{event.x},{event.y}")
            off = self._text_index_to_offset_hex(idx)
            self.move_caret(off)
            self.sel_start = off
            self.sel_end = off
            self._pending_nibble = None
            self._render_caret_and_sel()
            self.txt_hex.focus_set()
        except Exception:
            pass

    def on_drag_hex(self, event):
        try:
            idx = self.txt_hex.index(f"@{event.x},{event.y}")
            off = self._text_index_to_offset_hex(idx)
            self.sel_end = off + 1
            self.move_caret(off)
        except Exception:
            pass

    def on_click_ascii(self, event):
        try:
            idx = self.txt_ascii.index(f"@{event.x},{event.y}")
            off = self._text_index_to_offset_ascii(idx)
            self.move_caret(off)
            self.sel_start = off
            self.sel_end = off
            self._pending_nibble = None
            self._render_caret_and_sel()
            self.txt_ascii.focus_set()
        except Exception:
            pass

    def on_drag_ascii(self, event):
        try:
            idx = self.txt_ascii.index(f"@{event.x},{event.y}")
            off = self._text_index_to_offset_ascii(idx)
            self.sel_end = off + 1
            self.move_caret(off)
        except Exception:
            pass

    def on_key_hex(self, event):
        keysym = event.keysym
        if keysym in ("Left", "Right", "Up", "Down", "Prior", "Next", "Home", "End"):
            return self._nav_key(keysym)
        if keysym == "BackSpace":
            return self.backspace()
        if keysym == "Delete":
            return self.delete_key()
        if len(event.char) == 1 and event.char in HEX_CHARS:
            if self.read_only:
                return "break"
            self._type_hex_digit(event.char)
            return "break"
        if keysym == "Escape":
            self.clear_selection()
            return "break"
        return None

    def _type_hex_digit(self, ch: str):
        digit = int(ch, 16)
        if self._pending_nibble is None:
            self._pending_nibble = digit
        else:
            v = (self._pending_nibble << 4) | digit
            self._pending_nibble = None
            if self.get_selection():
                self.delete_selection()
            if self.insert_mode or len(self.buf) == 0:
                self.buf.insert(self.caret, bytes([v]))
                self.move_caret(self.caret + 1)
            else:
                self.buf.set_byte(self.caret, v)
                self.move_caret(self.caret + 1)
            self.mark_dirty()
            self.render()

    def on_key_ascii(self, event):
        keysym = event.keysym
        if keysym in ("Left", "Right", "Up", "Down", "Prior", "Next", "Home", "End"):
            return self._nav_key(keysym)
        if keysym == "BackSpace":
            return self.backspace()
        if keysym == "Delete":
            return self.delete_key()
        if len(event.char) == 1 and 0 <= ord(event.char) < 256 and event.char not in ("\r", "\n"):
            if self.read_only:
                return "break"
            b = ord(event.char)
            if self.get_selection():
                self.delete_selection()
            if self.insert_mode or len(self.buf) == 0:
                self.buf.insert(self.caret, bytes([b]))
                self.move_caret(self.caret + 1)
            else:
                self.buf.set_byte(self.caret, b)
                self.move_caret(self.caret + 1)
            self.mark_dirty()
            self.render()
            return "break"
        if keysym == "Escape":
            self.clear_selection()
            return "break"
        return None

    def _nav_key(self, keysym: str):
        if keysym == "Left": self.move_left()
        elif keysym == "Right": self.move_right()
        elif keysym == "Up": self.move_up()
        elif keysym == "Down": self.move_down()
        elif keysym == "Prior": self.page_up()
        elif keysym == "Next": self.page_down()
        elif keysym == "Home": self.home()
        elif keysym == "End": self.end()
        return "break"

    def undo(self):
        self.buf.undo()
        self.render()

    def redo(self):
        self.buf.redo()
        self.render()

    def select_all(self):
        self.sel_start = 0
        self.sel_end = len(self.buf)
        self._render_caret_and_sel()

    def goto(self, offset: int):
        self.move_caret(offset)
        self.center_on_offset(offset)

    def show_error(self, msg: str):
        messagebox.showerror("Error", msg)


def main():
    root = tk.Tk()
    app = HexEditorApp(root)
    root.geometry("1100x700+120+80")
    root.minsize(800, 500)
    root.mainloop()


if __name__ == "__main__":
    main()

