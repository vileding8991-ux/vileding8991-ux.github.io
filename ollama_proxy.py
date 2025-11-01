# 匯入 Flask（簡單的 Python 網頁伺服器）
from flask import Flask, request, jsonify
import requests  # 用來幫你轉發 API 給 Ollama

app = Flask(__name__)  # 建立 Flask 應用

# 建立一個 API 路由 /api/chat 讓前端能傳文字給它
@app.route("/api/chat", methods=["POST"])
def chat():
    # 從前端收到 JSON
    data = request.get_json()
    prompt = data.get("prompt", "")           # 使用者訊息 + 系統prompt
    model = data.get("model", "gemma3:1b")    # 預設模型

    # 轉送給本機的 Ollama server
    r = requests.post("http://localhost:11434/api/generate", json={
        "model": model,
        "prompt": prompt,
        "stream": False
    })

    # 把 Ollama 回覆的結果轉給前端
    return jsonify(r.json())

# 啟動 Flask 伺服器，使用5001埠口
if __name__ == "__main__":
    app.run(port=5001)
