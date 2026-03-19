from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import psutil
import webbrowser
import json
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# --- Configuration & Initialization ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSCRIPT_DIR = os.path.join(BASE_DIR, 'Transcripts')
SUMMARY_DIR = os.path.join(BASE_DIR, 'LearnSummaries')

CHANGELOG_PATH = os.path.join(BASE_DIR, 'changelog.json')

os.makedirs(TRANSCRIPT_DIR, exist_ok=True)
os.makedirs(SUMMARY_DIR, exist_ok=True)

# --- Static File Serving ---
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# --- Tool 01: Dashboard & System Status ---
@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "version": "5.1-Unified",
        "engine": "Windows-Intelligence",
        "last_update": datetime.now().strftime("%H:%M:%S")
    })

@app.route('/api/changelog', methods=['GET'])
def get_changelog():
    try:
        if os.path.exists(CHANGELOG_PATH):
            with open(CHANGELOG_PATH, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        return jsonify([])
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/start_work', methods=['POST'])
def start_work():
    data = request.json
    urls = data.get('urls', [])
    
    # 執行開啟網頁
    for url in urls:
        webbrowser.open(url)
    
    # 日誌記錄
    try:
        if os.path.exists(CHANGELOG_PATH):
            with open(CHANGELOG_PATH, 'r+', encoding='utf-8') as f:
                logs = json.load(f)
                msg = f"執行：啟動自訂工作環境 (開啟 {len(urls)} 個項目)"
                logs.insert(0, {"date": datetime.now().strftime("%Y-%m-%d %H:%M"), "msg": msg})
                f.seek(0)
                json.dump(logs[:10], f, ensure_ascii=False, indent=4)
                f.truncate()
    except: pass
    
    return jsonify({"status": "success", "count": len(urls)})

# --- Tool 03: Guardian & Metrics (Real System Data) ---
last_net_io = psutil.net_io_counters()

@app.route('/api/system_info', methods=['GET'])
def get_system_info():
    global last_net_io
    try:
        cpu = psutil.cpu_percent(interval=None)
        virtual_mem = psutil.virtual_memory()
        ram = virtual_mem.percent
        disk = psutil.disk_usage('/').percent
        
        # Network Speed Calculation
        current_net_io = psutil.net_io_counters()
        sent = current_net_io.bytes_sent - last_net_io.bytes_sent
        recv = current_net_io.bytes_recv - last_net_io.bytes_recv
        last_net_io = current_net_io
        
        # Top Processes (Combined CPU/MEM)
        top_procs = []
        for p in sorted(psutil.process_iter(['name', 'cpu_percent', 'memory_percent']), 
                        key=lambda x: (x.info['cpu_percent'] or 0) + (x.info['memory_percent'] or 0), 
                        reverse=True)[:8]:
            top_procs.append({
                "name": p.info['name'], 
                "cpu": p.info['cpu_percent'] or 0,
                "mem": round(p.info['memory_percent'] or 0, 1)
            })
            
        return jsonify({
            "cpu": cpu, 
            "ram": ram, 
            "disk": disk, 
            "net_up": sent, 
            "net_down": recv,
            "top_processes": top_procs
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Tool 04: Summarizer Engine (Web Scraper & Analyzer) ---
@app.route('/api/summarize', methods=['POST'])
def summarize_url():
    import requests
    from bs4 import BeautifulSoup
    import re
    from collections import Counter

    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"status": "error", "message": "No URL provided"}), 400

    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = response.apparent_encoding # Fix Chinese encoding
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Title
        title = soup.title.string if soup.title else ""
        if not title:
            title = soup.find('h1').get_text(strip=True) if soup.find('h1') else "Unknown Title"

        # 2. Description (Meta)
        desc = ""
        meta_desc = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        if meta_desc:
            desc = meta_desc.get('content', '')

        # 3. Key Points Extraction (Refined)
        # Select shorter, meaningful paragraphs as key points
        sentences = []
        for p in soup.find_all(['p', 'h2', 'h3']):
            text = p.get_text(strip=True)
            if 30 < len(text) < 300: # Filter for medium-sized "point" style text
                sentences.append(text)
            if len(sentences) >= 4: break # Limit to 4 points
        
        if not sentences:
            sentences = ["無法提取具體的重點摘要，建議直接查看原網頁內容。"]

        # 4. Keywords extraction (Simple frequency analysis)
        all_text = soup.get_text()
        words = re.findall(r'[\u4e00-\u9fff]{2,}|[a-z]{3,}', all_text.lower()) # Support Chinese and English words
        # Filter common stopwords
        stopwords = {'the', 'and', 'that', 'this', 'with', 'from', 'your', 'will', 'about', 'https', 'http', 'com', 'www', '的一', '是在', '可以', '我們', '一個'}
        filtered_words = [w for w in words if w not in stopwords and not w.isdigit()]
        common_words = [item[0] for item in Counter(filtered_words).most_common(5)]

        return jsonify({
            "status": "success",
            "title": title,
            "description": desc,
            "key_points": sentences,
            "keywords": common_words,
            "url": url
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Tool 06: Desktop Semantic Search (Local File RAG) ---
@app.route('/api/search', methods=['POST'])
def semantic_search():
    data = request.json
    query = data.get('query', '').lower()
    if not query:
        return jsonify({"status": "error", "message": "No query provided"}), 400

    # Detect Desktop path (Handle OneDrive case)
    common_paths = [
        os.path.join(os.path.expanduser('~'), 'Desktop'),
        os.path.join(os.path.expanduser('~'), 'OneDrive', 'Desktop'),
        os.path.join(os.path.expanduser('~'), 'OneDrive - 10個創意', 'Desktop') # Specific case if applicable
    ]
    
    desktop_path = None
    for path in common_paths:
        if os.path.exists(path):
            desktop_path = path
            break
            
    if not desktop_path:
        return jsonify({"status": "error", "message": "無法定位桌面資料夾，請確認桌面路徑是否存在"}), 404

    results = []

    try:
        max_depth = 3
        desktop_depth = desktop_path.count(os.sep)
        
        # Scan desktop files and subdirectories
        for root, dirs, files in os.walk(desktop_path):
            # Calculate current depth
            depth = root.count(os.sep) - desktop_depth
            if depth >= max_depth:
                dirs.clear() # Stop going deeper
                continue
            
            # Prune unwanted directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'dist', 'build', 'AppData', 'Local Settings']]

            for filename in files:
                file_path = os.path.join(root, filename)
                
                # Skip inaccessible files
                try:
                    if not os.path.isfile(file_path):
                        continue
                except: continue
                
                score = 0
                match_reason = ""
                
                # 1. Match filename
                if query in filename.lower():
                    score += 70
                    match_reason = "檔名匹配"
                
                # 2. Match content (for text files only)
                if filename.lower().endswith(('.txt', '.md', '.py', '.log', '.json', '.html')):
                    try:
                        # Read cautiously
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read(10000) # Read first 10KB
                            if query in content.lower():
                                score += 30
                                if not match_reason:
                                    match_reason = "內文匹配"
                                else:
                                    match_reason += " + 內文匹配"
                    except: pass

                if score > 0:
                    results.append({
                        "filename": filename,
                        "path": file_path,
                        "score": min(score, 100),
                        "reason": match_reason
                    })

        # Sort by score
        results = sorted(results, key=lambda x: x['score'], reverse=True)[:15]
        return jsonify({"status": "success", "results": results})

    except Exception as e:
        print(f"Search Error: {str(e)}")
        return jsonify({"status": "error", "message": f"掃描時出錯: {str(e)}"}), 500

# --- Tool 02 & 04: File Exporter (Transcript/Summary) ---
@app.route('/api/save', methods=['POST'])
def save_file():
    data = request.json
    content = data.get('content')
    file_type = data.get('type') # 'transcript' or 'summary'
    filename = data.get('filename')
    
    target_dir = TRANSCRIPT_DIR if file_type == 'transcript' else SUMMARY_DIR
    target_path = os.path.join(target_dir, filename)
    
    try:
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"status": "success", "path": target_path})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("Desktop-X Pro v5.1 Unified Server Active on port 8000...")
    app.run(port=8000, host='0.0.0.0')
