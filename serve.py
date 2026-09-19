#!/usr/bin/env python3
"""
Local dev server that serves 404.html for missing pages — this is what
Netlify, GitHub Pages, and Cloudflare Pages already do automatically on
the real site. Python's plain `http.server` doesn't, so this script just
lets you see the same behavior while testing locally.

Usage: python3 serve.py [port]   (default port 8000)
"""
import http.server
import sys
import os

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.exists('404.html'):
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('404.html', 'rb') as f:
                self.wfile.write(f.read())
        else:
            super().send_error(code, message, explain)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Serving on http://localhost:{port} (with 404.html support)")
    http.server.test(HandlerClass=Handler, port=port)
