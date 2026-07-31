import sys, json, base64, os

src_json = sys.argv[1]
out_dir = sys.argv[2]

with open(src_json) as f:
    d = json.load(f)

title = d['title']
content = d['content']
out_path = os.path.join(out_dir, title)
with open(out_path, 'wb') as f:
    f.write(base64.b64decode(content))
print(out_path)
