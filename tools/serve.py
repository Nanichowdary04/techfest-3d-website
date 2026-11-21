"""Local dev server for the Techfest site (sends Cache-Control: no-cache so edits show on reload).

usage:  python tools/serve.py [port]      (default 4189, run from the site folder)
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4189
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"Techfest site on http://localhost:{port}  (Ctrl+C to stop)")
    server.serve_forever()
