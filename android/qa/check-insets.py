"""Verify the native game surface clears both system bars in portrait."""
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

size = subprocess.check_output(["adb", "shell", "wm", "size"], text=True)
width, height = map(int, re.findall(r"(\d+)x(\d+)", size)[-1])
nodes = ET.parse(sys.argv[1]).getroot()
web = next(node for node in nodes.iter("node")
           if node.get("class") == "android.webkit.WebView")
left, top, right, bottom = map(int, re.findall(r"\d+", web.attrib["bounds"]))
assert 0 <= left < right <= width and 0 < top < bottom < height, (
    sys.argv[2], web.attrib["bounds"], size)
print(f"{sys.argv[2]}: top inset {top}px, bottom inset {height-bottom}px")
