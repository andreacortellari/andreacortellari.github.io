import json
import re
import urllib.request
import xml.etree.ElementTree as ET

FEED_URL = "https://it.globalvoices.org/author/andrea-cortellari/feed/"
LIMIT = 6
CONTENT = "{http://purl.org/rss/1.0/modules/content/}encoded"

req = urllib.request.Request(FEED_URL, headers={"User-Agent": "portfolio-feed-bot"})
with urllib.request.urlopen(req, timeout=30) as resp:
    root = ET.fromstring(resp.read())

items = []
for it in root.iter("item"):
    html = it.findtext(CONTENT) or ""

    # Link to the original English article, from the footer of each post
    m = re.search(r"class='source-link'><a href='([^']+)'", html)
    original = m.group(1) if m else ""

    # Name of the original author, from the same footer
    m = re.search(r"scritto da</span>\s*<a [^>]*>([^<]+)</a>", html)
    author = m.group(1).strip() if m else ""

    items.append({
        "title": (it.findtext("title") or "").strip(),
        "link": (it.findtext("link") or "").strip(),
        "date": (it.findtext("pubDate") or "").strip(),
        "summary": (it.findtext("description") or "").strip(),
        "original": original,
        "author": author,
    })

with open("translations.json", "w", encoding="utf-8") as f:
    json.dump(items[:LIMIT], f, ensure_ascii=False, indent=2)
