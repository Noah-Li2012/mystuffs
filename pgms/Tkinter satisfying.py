import turtle
import colorsys
import pygame
import time

pygame.mixer.init()
pygame.mixer.music.load(r"C:\Users\华为\Desktop\for video\background music.mp3") #music path XD
pygame.mixer.music.play(-1, 0.0)

screen = turtle.Screen()
screen.bgcolor("black")
t = turtle.Turtle()
t.speed(0)
t.width(2)
t.hideturtle()

hue = 0
n = 180
turtle.tracer(0)

for i in range(720):
    color = colorsys.hsv_to_rgb(hue, 1, 1)
    t.pencolor(color)
    t.forward(i * 0.5)
    t.left(59)
    t.circle(i * 0.1, 60)
    hue += 0.005
    if i % 2 == 0:
        t.right(120)
    turtle.update()
    time.sleep(0.01)

pygame.mixer.music.stop()

turtle.done()
