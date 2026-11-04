#!/usr/bin/env python3
"""把拆開的檔案合併成單一 HTML（給 Claude artifact 發布用，不能引用本機檔案）。

用法：
  python3 build.py            # 輸出 austria-czech-hungary-island-cdn.html（three.js 改走 cdnjs）
  python3 build.py --local    # 輸出 austria-czech-hungary-island-single.html（仍引用 three.min.js）
"""
import re, sys, pathlib

D = pathlib.Path(__file__).resolve().parent
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
local = '--local' in sys.argv

html = (D / 'austria-czech-hungary-island.html').read_text(encoding='utf-8')

def css(m):
    body = (D / m.group(1)).read_text(encoding='utf-8').rstrip('\n')
    return '<style>\n' + body + '\n</style>'

def js(m):
    name = m.group(1)
    if name == 'config.js' and not local:
        return '<script>window.CFG={AUTH:false};</script>'      # artifact 版：單機模式
    if name == 'three.min.js':
        return m.group(0) if local else '<script src="%s"></script>' % CDN
    body = (D / name).read_text(encoding='utf-8').rstrip('\n')
    assert '</script' not in body.lower(), name + ' 內含 </script，無法內嵌'
    return '<script>\n' + body + '\n</script>'

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<script src="([^"]+)"></script>', js, html)

out = D / ('austria-czech-hungary-island-single.html' if local else 'austria-czech-hungary-island-cdn.html')
out.write_text(html, encoding='utf-8')
print('wrote', out.name, len(html.encode('utf-8')) // 1024, 'KB')
