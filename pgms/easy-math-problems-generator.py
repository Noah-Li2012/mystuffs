import tkinter as tk
import random
from fractions import Fraction
import tkinter.messagebox as msgbox

class MathQuizApp:
    def __init__(self, root):
        self.root = root
        self.root.title("EZ MATH QUIZ")
        self.root.geometry("600x700")
        self.time_left = 180
        self.timer_running = False

        self.total_questions = 6
        self.problems = []
        self.answers = []
        self.user_entries = []

        self.last_x, self.last_y = None, None
        self.build_gui()
        self.start_quiz()

    def build_gui(self):
        self.title_label = tk.Label(self.root, text="Ez Math Challenge", font=("Arial", 20, "bold"))
        self.title_label.pack(pady=10)

        self.timer_label = tk.Label(self.root, text=f"Time left: {self.time_left}", font=("Arial", 16))
        self.timer_label.pack()

        self.problem_frame = tk.Frame(self.root)
        self.problem_frame.pack(pady=20)

        rough_label = tk.Label(self.root, text="📝 Rough Draft (Draw here):", font=("Arial", 14, "italic"))
        rough_label.pack(anchor="w", padx=15)

        self.canvas = tk.Canvas(self.root, bg="white", width=560, height=200, borderwidth=2, relief="sunken")
        self.canvas.pack(padx=15, pady=(0, 10))


        self.canvas.bind("<ButtonPress-1>", self.on_button_press)
        self.canvas.bind("<B1-Motion>", self.on_move_press)
        self.canvas.bind("<ButtonRelease-1>", self.on_button_release)

        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=10)

        self.confirm_button = tk.Button(btn_frame, text="Confirm Answers", font=("Arial", 16), command=self.check_answers)
        self.confirm_button.pack(side="left", padx=10)

        self.clear_button = tk.Button(btn_frame, text="Clear Drawing", font=("Arial", 16), command=self.clear_canvas)
        self.clear_button.pack(side="left", padx=10)

        self.feedback_label = tk.Label(self.root, text="", font=("Arial", 14))
        self.feedback_label.pack(pady=5)

        self.again_button = tk.Button(self.root, text="Again", font=("Arial", 16), command=self.reset_quiz)

    def start_quiz(self):
        self.time_left = 180
        self.timer_running = True
        self.problems.clear()
        self.answers.clear()
        self.user_entries.clear()
        self.feedback_label.config(text="")
        self.confirm_button.config(state="normal")
        self.again_button.pack_forget()
        self.clear_canvas()

        for widget in self.problem_frame.winfo_children():
            widget.destroy()

        for _ in range(2):
            expr, ans = self.generate_grade3()
            self.problems.append(expr)
            self.answers.append(ans)

        expr, ans = self.generate_grade2()
        self.problems.append(expr)
        self.answers.append(ans)

        for _ in range(3):
            expr, ans = self.generate_grade6_fraction()
            self.problems.append(expr)
            self.answers.append(ans)

        for i, expr in enumerate(self.problems):
            row = tk.Frame(self.problem_frame)
            row.pack(pady=7)
            tk.Label(row, text=f"Q{i+1}: {expr} =", font=("Arial", 14)).pack(side="left")
            entry = tk.Entry(row, font=("Arial", 14), width=12)
            entry.pack(side="left")
            self.user_entries.append(entry)

        self.update_timer()

    def generate_grade2(self):
        num1 = random.randint(10, 50)
        num2 = random.randint(1, 20)
        op = random.choice(['+', '-', '*'])
        expr = f"{num1} {op} {num2}"
        answer = eval(expr)
        return expr, answer

    def generate_grade3(self):
        num1 = random.randint(20, 100)
        num2 = random.randint(1, 20)
        op = random.choice(['+', '-', '*', '/'])
        if op == '/':
            num1 = num2 * random.randint(1, 10)
            answer = num1 // num2
            expr = f"{num1} {op} {num2}"
        else:
            expr = f"{num1} {op} {num2}"
            answer = eval(expr)
        return expr, answer

    def generate_grade6_fraction(self):
        def rand_frac():
            return Fraction(random.randint(1, 9), random.randint(2, 9))

        f1 = rand_frac()
        f2 = rand_frac()
        op = random.choice(['+', '-', '*', '/'])

        if op == '+':
            answer = f1 + f2
        elif op == '-':
            answer = f1 - f2
        elif op == '*':
            answer = f1 * f2
        else:
            while f2 == 0:
                f2 = rand_frac()
            answer = f1 / f2

        expr = f"{f1} {op} {f2}"
        return expr, answer

    def update_timer(self):
        if self.time_left > 0 and self.timer_running:
            self.timer_label.config(text=f"Time left: {self.time_left}")
            self.time_left -= 1
            self.root.after(1000, self.update_timer)
        elif self.timer_running:
            self.end_game("⏰ Time's up!")

    def check_answers(self):
        try:
            all_correct = True
            for i, entry in enumerate(self.user_entries):
                user_input = entry.get().strip()
                correct = self.answers[i]

                if user_input == "":
                    entry.delete(0, tk.END)
                    entry.insert(0, str(correct))
                    entry.config(fg="red", state='readonly')
                    all_correct = False
                else:
                    if isinstance(correct, Fraction):
                        try:
                            user_answer = Fraction(user_input)
                        except ValueError:
                            entry.delete(0, tk.END)
                            entry.insert(0, str(correct))
                            entry.config(fg="red", state='readonly')
                            all_correct = False
                            continue
                        if user_answer == correct:
                            entry.config(fg="green")
                        else:
                            entry.delete(0, tk.END)
                            entry.insert(0, str(correct))
                            entry.config(fg="red", state='readonly')
                            all_correct = False
                    else:
                        try:
                            user_answer = float(user_input)
                        except ValueError:
                            entry.delete(0, tk.END)
                            entry.insert(0, str(correct))
                            entry.config(fg="red", state='readonly')
                            all_correct = False
                            continue
                        if abs(user_answer - float(correct)) <= 0.01:
                            entry.config(fg="green")
                        else:
                            entry.delete(0, tk.END)
                            entry.insert(0, str(correct))
                            entry.config(fg="red", state='readonly')
                            all_correct = False

            if all_correct:
                self.feedback_label.config(text="✅ All answers correct! You survived!", fg="green")
            else:
                self.feedback_label.config(text="❌ Well well well, I win, you lose, Get your brain bigger", fg="red")

            self.timer_running = False
            self.confirm_button.config(text="Again")
            self.confirm_button.config(command=self.reset_quiz)

        except Exception:
            self.feedback_label.config(text="⚠️ Please enter valid numbers or fractions (e.g., 3/4)", fg="orange")


    def reset_quiz(self):
        msgbox.showwarning("Nope!", "Again? Nah! You lost your chance...")
        self.root.destroy()

    def end_game(self, message):
        self.timer_running = False
        self.feedback_label.config(text=message, fg="blue")
        self.confirm_button.config(state="disabled")
        self.again_button.pack(pady=10)

    def on_button_press(self, event):
        self.last_x, self.last_y = event.x, event.y

    def on_move_press(self, event):
        x, y = event.x, event.y
        if self.last_x is not None and self.last_y is not None:
            self.canvas.create_line(self.last_x, self.last_y, x, y, fill="black", width=2, capstyle=tk.ROUND, smooth=True)
        self.last_x, self.last_y = x, y

    def on_button_release(self, event):
        self.last_x, self.last_y = None, None

    def clear_canvas(self):
        self.canvas.delete("all")

root = tk.Tk()
app = MathQuizApp(root)
root.mainloop()
