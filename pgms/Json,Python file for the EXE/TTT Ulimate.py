import tkinter as tk
import json
import os
import sys

def load_q_table():
    q_table = {}
    try:
        if getattr(sys, 'frozen', False):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.dirname(os.path.abspath(__file__))
        q_table_path = os.path.join(base_path, 'q_table.json')
        if os.path.exists(q_table_path):
            with open(q_table_path, 'r') as f:
                q_table = json.load(f)
    except Exception as e:
        pass
    return q_table

q_table = load_q_table()

WIDTH = 300
HEIGHT = 270

state = begin = computer = human = player_now = end = -10

def init():
    global state, begin, computer, human, player_now, end
    state = '0' * 9
    begin = 1
    computer = 2
    human = 1
    end = -2
    draw_board(canvas)

def draw_board(canvas):
    canvas.delete("all")
    canvas.create_rectangle(0, 0, WIDTH, HEIGHT, fill="#1e1e1e")
    for i in range(1, 3):
        canvas.create_line(100 * i, 0, 100 * i, HEIGHT, fill="#3c3c3c", width=2)
        canvas.create_line(0, 90 * i, WIDTH, 90 * i, fill="#3c3c3c", width=2)
    for i in range(9):
        x = (i % 3) * 100 + 50
        y = (i // 3) * 90 + 45
        if state[i] == '1':
            canvas.create_oval(x - 33, y - 30, x + 33, y + 30, outline="#00bfff", width=3)
        elif state[i] == '2':
            canvas.create_line(x - 33, y - 30, x + 33, y + 30, fill="#ff4500", width=3)
            canvas.create_line(x + 33, y - 30, x - 33, y + 30, fill="#ff4500", width=3)
    if end == 0:
        canvas.create_text(150, 30, text="TIE", fill="#ffffff", font=("Arial", 12, "bold"))
    elif end == human:
        canvas.create_text(150, 30, text="Human WINS", fill="#00bfff", font=("Arial", 12, "bold"))
    elif end == computer:
        canvas.create_text(150, 30, text="AI WINS", fill="#ff4500", font=("Arial", 12, "bold"))

def on_click(event, canvas):
    global begin, human, computer, player_now, state, end
    if begin == 1 and end == -2:
        if player_now == human:
            if event.x < WIDTH and event.y < HEIGHT:
                x_index = event.x // 100
                y_index = event.y // 90
                action = x_index + y_index * 3
                if state[action] == '0':
                    step(action, human)
                    check()
                    player_now = computer
        if player_now == computer and end == -2:
            ai_move()
    draw_board(canvas)

def step(action, player):
    global state
    state = state[:action] + str(player) + state[action + 1:]

def check():
    global end, begin
    _obs = state
    win = [_obs[:3], _obs[3:6], _obs[6:], _obs[0] + _obs[3] + _obs[6], _obs[1] + _obs[4] + _obs[7],
           _obs[2] + _obs[5] + _obs[8],
           _obs[0] + _obs[4] + _obs[8], _obs[2] + _obs[4] + _obs[6]]
    if '111' in win:
        end = human
    elif '222' in win:
        end = computer
    elif '0' not in _obs:
        end = 0
    else:
        return
    begin = 0
    draw_board(canvas)
    reset_game()

def reset_game():
    def on_human_first():
        set_human_first()
        dialog.destroy()

    def on_ai_first():
        set_ai_first()
        dialog.destroy()

    dialog = tk.Toplevel(root)
    dialog.title("Game Over")
    dialog.geometry("200x120")
    dialog.configure(bg="#1e1e1e")

    if end == 0:
        result_text = "TIE"
        result_color = "yellow"
    elif end == human:
        result_text = "Human WINS"
        result_color = "lime"
    elif end == computer:
        result_text = "AI WINS"
        result_color = "red"

    result_label = tk.Label(dialog, text=result_text, bg="#1e1e1e", fg=result_color, font=("Arial", 14, "bold"))
    result_label.pack(pady=10)

    label = tk.Label(dialog, text="Choose who goes first:", bg="#1e1e1e", fg="#ffffff", font=("Arial", 10, "bold"))
    label.pack(pady=10)

    human_button = tk.Button(dialog, text="Human First", command=on_human_first, bg="#3c3c3c", fg="#ffffff", font=("Arial", 10, "bold"))
    human_button.pack(side=tk.LEFT, padx=10, pady=5)

    ai_button = tk.Button(dialog, text="AI First", command=on_ai_first, bg="#3c3c3c", fg="#ffffff", font=("Arial", 10, "bold"))
    ai_button.pack(side=tk.RIGHT, padx=10, pady=5)

def set_human_first():
    global player_now
    player_now = human
    init()

def set_ai_first():
    global player_now
    player_now = computer
    init()
    root.after(100, ai_move)

def ai_move():
    global player_now
    if player_now == computer and end == -2:
        state_actions = q_table.get(state, [0] * 9)
        action = state_actions.index(max(state_actions))
        step(action, computer)
        check()
        player_now = human
    draw_board(canvas)

root = tk.Tk()
root.iconbitmap("TTTicon.ico")
root.title("PTTT-Pocket Tic Tac Toe")
root.geometry(f"{WIDTH}x{HEIGHT + 50}")
root.configure(bg="#1e1e1e")

canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="#1e1e1e", highlightthickness=0)
canvas.pack(side=tk.TOP)

button_frame = tk.Frame(root, bg="#1e1e1e")
button_frame.pack(side=tk.BOTTOM, fill=tk.X)

human_first_button = tk.Button(button_frame, text="Human First", command=set_human_first, bg="#3c3c3c", fg="#ffffff", font=("Arial", 10, "bold"))
human_first_button.pack(side=tk.LEFT, padx=10, pady=5)

ai_first_button = tk.Button(button_frame, text="AI First", command=set_ai_first, bg="#3c3c3c", fg="#ffffff", font=("Arial", 10, "bold"))
ai_first_button.pack(side=tk.RIGHT, padx=10, pady=5)

init()

canvas.bind("<Button-1>", lambda event: on_click(event, canvas))

root.mainloop()
#install libraries if needed e.g. tk
