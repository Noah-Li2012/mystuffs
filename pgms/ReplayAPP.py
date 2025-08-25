import json
import threading
import time
from tkinter import *
from tkinter import filedialog, messagebox, scrolledtext, ttk
import pyautogui
from pynput import mouse, keyboard
from pynput.keyboard import Controller, Key
from pynput.mouse import Controller as MouseController

pyautogui.FAILSAFE = False
actions = []
recording = False
stop_flag = False
pause_flag = False
last_mouse_pos = None
saved_files = []
settings = {"ignore_hotkeys": True, "replay_speed": 1.0}
hotkeys = ["<ctrl>+<f9>", "<ctrl>+<f10>", "<ctrl>+<f11>", "<ctrl>+<f12>"]

pyautogui.PAUSE = 0
kb_controller = Controller()
mouse_controller = MouseController()

def log_debug(msg):
    debug_text.config(state=NORMAL)
    debug_text.insert(END, msg + "\n")
    debug_text.see(END)
    debug_text.config(state=DISABLED)

def update_saved_label():
    saved_label.config(text=f"Saved Records: {len(saved_files)}")

def start_record():
    global recording, actions, last_mouse_pos
    actions = []
    last_mouse_pos = pyautogui.position()
    recording = True
    log_debug("Recording started")
    threading.Thread(target=record_mouse, daemon=True).start()
    threading.Thread(target=record_keyboard, daemon=True).start()
    status_label.config(text="Recording...", fg="red")

def stop_record():
    global recording
    recording = False
    log_debug("Recording stopped")
    status_label.config(text="Idle", fg="green")

def record_mouse():
    def on_move(x, y):
        if not recording: return False
        global last_mouse_pos
        dx = x - last_mouse_pos[0]
        dy = y - last_mouse_pos[1]
        last_mouse_pos = (x, y)
        actions.append({"type":"mouse","action":"move","x":x,"y":y,"dx":dx,"dy":dy,"time":time.time()})
        log_debug(f"Mouse moved ({x},{y}) dx:{dx} dy:{dy}")

    def on_click(x, y, button, pressed):
        if not recording: return False
        actions.append({"type":"mouse","action":"click","x":x,"y":y,
                        "button": str(button), "pressed": pressed, "time": time.time()})
        log_debug(f"Mouse {'pressed' if pressed else 'released'} at ({x},{y}) {button}")

    def on_scroll(x, y, dx, dy):
        if not recording: return False
        actions.append({"type":"mouse","action":"scroll","x":x,"y":y,"dx":dx,"dy":dy,"time":time.time()})
        log_debug(f"Mouse scrolled at ({x},{y}) dx:{dx} dy:{dy}")

    with mouse.Listener(on_move=on_move, on_click=on_click, on_scroll=on_scroll) as listener:
        listener.join()

def record_keyboard():
    def on_press(key):
        if not recording: return False
        try:
            k = key.char
        except AttributeError:
            k = str(key)

        for hk in hotkeys:
            if hk.lower() in str(key).lower():
                return

        if settings["ignore_hotkeys"] and k.lower() in ["\x08","\x0d"]:
            return

        actions.append({"type":"keyboard","action":"press","key":k,"time":time.time()})
        log_debug(f"Key pressed: {k}")

    def on_release(key):
        if not recording: return False
        try:
            k = key.charz
        except AttributeError:
            k = str(key)
        actions.append({"type":"keyboard","action":"release","key":k,"time":time.time()})
        log_debug(f"Key released: {k}")

    with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
        listener.join()

def replay_actions_exact():
    if not actions:
        messagebox.showwarning("Warning","No actions recorded!")
        return

    global stop_flag, pause_flag
    stop_flag = False
    pause_flag = False
    status_label.config(text="Replaying...", fg="#00eaff")
    log_debug("replay started")

    start_time = time.time()
    first_action_time = actions[0]['time']

    for act in actions:
        if stop_flag: break
        while pause_flag: time.sleep(0.001)

        delay = act['time'] - first_action_time - (time.time() - start_time)
        if delay > 0: time.sleep(delay)

        if act["type"] == "mouse":
            if act["action"] == "move":
                pyautogui.moveTo(act["x"], act["y"])
            elif act["action"] == "click":
                if act["pressed"]:
                    pyautogui.mouseDown(x=act["x"], y=act["y"])
                else:
                    pyautogui.mouseUp(x=act["x"], y=act["y"])
            elif act["action"] == "scroll":
                mouse_controller.scroll(act["dx"], act["dy"])
        elif act["type"] == "keyboard":
            k = act["key"]
            try:
                special_keys = {
                    'Key.ctrl_l': Key.ctrl_l,
                    'Key.ctrl_r': Key.ctrl_r,
                    'Key.shift': Key.shift,
                    'Key.shift_l': Key.shift_l,
                    'Key.shift_r': Key.shift_r,
                    'Key.alt_l': Key.alt_l,
                    'Key.alt_r': Key.alt_r,
                    'Key.space': Key.space,
                    'Key.enter': Key.enter,
                    'Key.tab': Key.tab,
                    'Key.backspace': Key.backspace,
                    'Key.esc': Key.esc,
                    'Key.up': Key.up,
                    'Key.down': Key.down,
                    'Key.left': Key.left,
                    'Key.right': Key.right
                }
                key_to_press = special_keys.get(k, k)

                if act["action"] == "press":
                    kb_controller.press(key_to_press)
                else:
                    kb_controller.release(key_to_press)
            except Exception as e:
                log_debug(f"Error pressing key {k}: {e}")

    status_label.config(text="Idle", fg="#00eaff")
    log_debug("Exact replay finished")

def stop_replay():
    global stop_flag
    stop_flag = True

def pause_resume_replay():
    global pause_flag
    pause_flag = not pause_flag
    status_label.config(text="Paused" if pause_flag else "Replaying...", fg="orange" if pause_flag else "blue")
    log_debug("Replay paused" if pause_flag else "Replay resumed")

def save_actions(file_path=None):
    global saved_files
    if not file_path:
        file_path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON files","*.json")])
    if file_path:
        with open(file_path, "w") as f:
            json.dump(actions, f)
        if file_path not in saved_files:
            saved_files.append(file_path)
        update_saved_label()
        log_debug(f"Actions saved to {file_path}")

def load_actions(file_path=None):
    global actions, saved_files
    if not file_path:
        file_path = filedialog.askopenfilename(filetypes=[("JSON files","*.json")])
    if file_path:
        with open(file_path, "r") as f:
            actions = json.load(f)
        if file_path not in saved_files:
            saved_files.append(file_path)
        update_saved_label()
        log_debug(f"Actions loaded from {file_path}")

def clear_debug():
    debug_text.config(state=NORMAL)
    debug_text.delete(1.0, END)
    debug_text.config(state=DISABLED)
    log_debug("Debug cleared")

def open_settings():
    def toggle_hotkey():
        settings["ignore_hotkeys"] = var_ignore.get()
    settings_win = Toplevel(root)
    settings_win.title("Settings")
    settings_win.geometry("450x350")
    settings_win.resizable(True, True)

    var_ignore = BooleanVar(value=settings["ignore_hotkeys"])
    Checkbutton(settings_win, text="Ignore App Hotkeys While Recording", variable=var_ignore,
                command=toggle_hotkey).pack(anchor=W, pady=10, padx=10)

    Label(settings_win, text="Replay Speed:").pack(anchor=W, pady=5, padx=10)
    speed_slider = Scale(settings_win, from_=0.1, to=3.0, resolution=0.1, orient=HORIZONTAL,
                         length=350, command=lambda v: settings.update({"replay_speed":float(v)}))
    speed_slider.set(settings["replay_speed"])
    speed_slider.pack(padx=10, pady=5)

    Label(settings_win, text="App Hotkeys:", font=("Arial", 12, "bold")).pack(anchor=W, padx=10, pady=(10, 0))
    hotkeys_text = [
        "- Ctrl+F9 : Start Recording",
        "- Ctrl+F10 : Stop Recording",
        "- Ctrl+F11 : Replay",
        "- Ctrl+F12 : Stop Replay",
        "- Ctrl+Shift+P : Pause/Resume Replay"
    ]
    hotkey_listbox = Listbox(settings_win, height=len(hotkeys_text), width=40)
    hotkey_listbox.pack(padx=10, pady=5)
    for line in hotkeys_text:
        hotkey_listbox.insert(END, line)

root = Tk()
root.title("ReplayAppᴰᵉᵛ 1.4 Beta")
root.geometry("1400x900")
root.minsize(1200,820)

style = ttk.Style()
try: style.theme_use('clam')
except: pass
style.configure('TButton', font=('Segoe UI', 12), padding=8)
style.configure('TLabel', font=('Segoe UI', 12))
style.configure('TFrame', background='#23272e')
style.configure('TMenubutton', font=('Segoe UI', 12))
root.configure(bg='#23272e')

menu_bar = Menu(root, bg="#181c22", fg="#fff", activebackground="#2c313c", activeforeground="#00eaff", font=("Segoe UI", 11))
file_menu = Menu(menu_bar, tearoff=0, bg="#23272e", fg="#fff", activebackground="#2c313c", activeforeground="#00eaff", font=("Segoe UI", 11))
file_menu.add_command(label="Open", command=load_actions)
file_menu.add_command(label="Save", command=save_actions)
file_menu.add_separator()
file_menu.add_command(label="Exit", command=root.destroy)
menu_bar.add_cascade(label="File", menu=file_menu)
menu_bar.add_command(label="Settings", command=open_settings)
root.config(menu=menu_bar)

frame_buttons = ttk.Frame(root, style='TFrame')
frame_buttons.pack(pady=10)

def on_enter(e):
    e.widget['background'] = '#00eaff'
    e.widget['foreground'] = '#23272e'
def on_leave(e):
    e.widget['background'] = '#23272e'
    e.widget['foreground'] = '#fff'

def make_modern_btn(master, text, cmd, row, col, colspan=1):
    btn = Button(master, text=text, command=cmd, width=18 if colspan==1 else 37, height=2, bg="#23272e", fg="#fff",
                 activebackground="#00eaff", activeforeground="#23272e", font=("Segoe UI", 12, "bold"),
                 bd=3, relief=RAISED)  # added border
    btn.grid(row=row, column=col, padx=5, pady=5, columnspan=colspan)
    btn.bind("<Enter>", on_enter)
    btn.bind("<Leave>", on_leave)
    return btn

make_modern_btn(frame_buttons, "Start Record", start_record, 0, 0)
make_modern_btn(frame_buttons, "Stop Record", stop_record, 0, 1)
make_modern_btn(frame_buttons, "Replay", lambda: threading.Thread(target=replay_actions_exact, daemon=True).start(), 1, 0)
make_modern_btn(frame_buttons, "Stop Replay", stop_replay, 1, 1)
make_modern_btn(frame_buttons, "Pause/Resume", pause_resume_replay, 2, 0, colspan=2)
make_modern_btn(frame_buttons, "Clear Debug", clear_debug, 3, 0, colspan=2)

status_label = Label(root, text="Idle", fg="#00eaff", bg="#23272e", font=("Segoe UI", 16, "bold"), pady=8)
status_label.pack(pady=5)

saved_label = Label(root, text="Saved Records: 0", fg="#b388ff", bg="#23272e", font=("Segoe UI", 12, "bold"))
saved_label.pack(pady=5)

debug_text = scrolledtext.ScrolledText(root, width=125, height=25, state=DISABLED, font=("Consolas",10), bg="#181c22", fg="#00eaff", insertbackground="#fff", borderwidth=0, highlightthickness=0)
debug_text.pack(pady=10)


root.mainloop()
