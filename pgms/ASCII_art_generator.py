# Remember to install Pillow
# pip install pillow
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
from tkinter import ttk
root = tk.Tk()
root.title("ASCII Art Generator")
root.geometry("1000x800")
def buddy_its_time_to_open_image():
    file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.bmp;*.gif")])
    if file_path:
        img = Image.open(file_path)
        img.thumbnail((60, 60))
        img_display = ImageTk.PhotoImage(img)
        image_label.config(image=img_display)
        image_label.image = img_display
        global loaded_image
        loaded_image = img
def generate_ascii():
    if loaded_image:
        ascii_art = convert_to_ascii(loaded_image)
        ascii_text.delete(1.0, tk.END)
        ascii_text.insert(tk.END, ascii_art)
def convert_to_ascii(image):
    image = image.convert("L")
    ascii_chars = "@%#*+=-:. "
    width, height = image.size
    aspect_ratio = height / width
    new_width = 100
    new_height = int(aspect_ratio * new_width * 0.55)
    image = image.resize((new_width, new_height))
    pixels = list(image.getdata())
    ascii_image = ""
    for i in range(0, len(pixels), new_width):
        row = pixels[i:i + new_width]
        ascii_image += "".join([ascii_chars[pixel // 32] for pixel in row]) + "\n"
    return ascii_image
loaded_image = None
button_frame = ttk.Frame(root)
button_frame.pack(pady=10)
upload_button = ttk.Button(button_frame, text="Upload Image", command=buddy_its_time_to_open_image)
upload_button.pack(side="left", padx=10)
generate_button = ttk.Button(button_frame, text="Generate", command=generate_ascii)
generate_button.pack(side="left", padx=10)
image_label = tk.Label(root)
image_label.pack(pady=5)
ascii_text = tk.Text(root, wrap="none", width=120, height=80)
ascii_text.pack(pady=5)
root.mainloop()
