"""JerseyBasket user growth chart.
To update: add a new (date, users) point at the end of `pts`, set LAST_LABEL_DATE, run:  python marketing-tools/make_growth_chart.py
Writes GROWTH FROM 20-05-26 TO <date>.png to the project folder and to Downloads."""
import datetime as dt
import os
import shutil
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

D = dt.date
pts = [
    (D(2026, 5, 20), 0), (D(2026, 6, 1), 730), (D(2026, 6, 7), 1000), (D(2026, 6, 13), 1006), (D(2026, 6, 14), 1011),
    (D(2026, 6, 15), 1032), (D(2026, 6, 18), 1047), (D(2026, 6, 20), 1059), (D(2026, 6, 22), 1066),
    (D(2026, 7, 13), 1100), (D(2026, 7, 21), 1138), (D(2026, 7, 22), 1140), (D(2026, 7, 31), 1187),
    (D(2026, 8, 2), 1207), (D(2026, 8, 3), 1349), (D(2026, 8, 4), 1389), (D(2026, 8, 6), 1418), (D(2026, 8, 10), 1466),
    (D(2026, 9, 5), 1727), (D(2026, 9, 7), 1954), (D(2026, 9, 8), 1973), (D(2026, 9, 9), 2066), (D(2026, 9, 10), 2081),
    (D(2026, 9, 11), 2135), (D(2026, 9, 13), 2153), (D(2026, 9, 14), 2162), (D(2026, 9, 15), 2172), (D(2026, 9, 16), 2178),
    (D(2026, 9, 17), 2182), (D(2026, 9, 19), 2199), (D(2026, 9, 20), 2215), (D(2026, 9, 21), 2246), (D(2026, 9, 22), 2270),
    (D(2026, 9, 23), 2287), (D(2026, 9, 24), 2290), (D(2026, 9, 25), 2341), (D(2026, 9, 28), 2397), (D(2026, 9, 30), 2405),
    (D(2026, 10, 2), 2441), (D(2026, 10, 4), 2447), (D(2026, 10, 5), 2460), (D(2026, 10, 8), 2474), (D(2026, 10, 9), 2479),
    (D(2026, 10, 10), 2498), (D(2026, 10, 11), 2510), (D(2026, 10, 12), 2536), (D(2026, 10, 13), 2545), (D(2026, 10, 14), 2549),
    (D(2026, 10, 16), 2556), (D(2026, 10, 18), 2572), (D(2026, 10, 19), 2638), (D(2026, 10, 20), 2667), (D(2026, 10, 22), 2690), (D(2026, 10, 23), 2704), (D(2026, 10, 24), 2722),
]
launch = pts[0][0]
today = pts[-1][0]
days = (today - launch).days
users = pts[-1][1]
avg = users / days

BG, INK, MUTED, BLUE, GRID, GOLD = "#fbfbf9", "#1a1a1a", "#555555", "#2b7de0", "#dddddd", "#d98a00"
fig = plt.figure(figsize=(7.67, 4.76), dpi=200, facecolor=BG)


def stat(x, label, value):
    fig.text(x, 0.925, label, fontsize=8.5, color=MUTED, va="top")
    fig.text(x, 0.865, value, fontsize=15, color=INK, va="top")


stat(0.03, "Users today", f"{users:,}")
stat(0.36, "Days since launch", str(days))
stat(0.69, "Avg. users / day", f"~{avg:.1f}")

ax = fig.add_axes([0.075, 0.2, 0.9, 0.58], facecolor=BG)
xs = [p[0] for p in pts]
ys = [p[1] for p in pts]
ax.fill_between(xs, ys, color=BLUE, alpha=0.12)
ax.plot(xs, ys, color=BLUE, linewidth=1.8)
marks = {D(2026, 5, 20), D(2026, 6, 1), D(2026, 6, 7), D(2026, 8, 3), D(2026, 9, 9), today}
ax.scatter([p[0] for p in pts if p[0] in marks], [p[1] for p in pts if p[0] in marks], color=BLUE, s=22, zorder=3)
ax.axhline(2500, color=GOLD, linewidth=1.0, linestyle=(0, (4, 3)))
ax.text(launch + dt.timedelta(days=1), 2520, "2,500 milestone passed", fontsize=7.5, color=GOLD, va="bottom")
ax.set_ylim(0, 2900)
ax.set_xlim(launch - dt.timedelta(days=2), today + dt.timedelta(days=4))
ax.set_yticks(range(0, 2901, 400))
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{int(v):,}"))
ax.xaxis.set_major_locator(mdates.MonthLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
ax.grid(axis="y", color=GRID, linewidth=0.7)
for s in ("top", "right", "left"):
    ax.spines[s].set_visible(False)
ax.spines["bottom"].set_color(GRID)
ax.tick_params(colors=MUTED, labelsize=7.5, length=0)
ax.annotate(f"{users:,}", (today, users), textcoords="offset points", xytext=(-4, 7), ha="right", fontsize=8, color=INK)
for d, v, t in [(D(2026, 6, 7), 1000, "1,000"), (D(2026, 9, 9), 2066, "2,000 passed")]:
    ax.annotate(t, (d, v), textcoords="offset points", xytext=(-6, 7), ha="right", fontsize=7.5, color=INK)

note = (f"Points are the user counts recorded from launch (20 May 2026) to {today.day} {today.strftime('%b')} 2026 (Jersey users, Google Analytics). "
        "Jun 17's earlier ~1,200 figure was an overstatement and has been left out. Growth stepped up sharply in August and September.")
fig.text(0.03, 0.115, note, fontsize=6.6, color=MUTED, va="top", wrap=True)

name = f"GROWTH FROM 20-05-26 TO {today.strftime('%d-%m-%y')}.png"
root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out = os.path.join(root, name)
fig.savefig(out, facecolor=BG)
shutil.copy(out, os.path.join(os.path.expanduser("~"), "Downloads", name))
print("saved", name, days, round(avg, 1))
