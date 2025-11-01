// midcourt-speech.js
// 這支程式負責：
// 1. 把角色 JSON 轉成 Ollama 能理解的 prompt
// 2. 把使用者的訊息丟給 Ollama gemma3:1b
// 3. 回傳角色風格的回應

// ========== [1] 把角色JSON轉成prompt ==========
function buildCharacterSystemPrompt(charData) {
  const baseInfo = charData.DBO || {};        // 基本資料
  const profile = charData.Profile || {};     // 角色個性與習慣
  const rel = charData.Relations || {};       // 關係
  const behavior = charData.Behavior || {};   // 行為描述

  // 把「常會說的話」轉成列點文字（模型比較好模仿）
  const quotes = (profile["常會說的話"] || [])
    .map(q => `- ${q}`)
    .join("\n");

  // 生成完整的角色描述，提供給 Ollama 當作 system prompt
  return `
你現在扮演中庭角色【${baseInfo["ZH-Name"] || "未知"}】（ID: ${charData.ID}）。
請用這個角色的語氣回應，保持他的個性與語氣，不要轉為旁白或GPT語氣。

【基本資料】
- 名稱：${baseInfo["ZH-Name"]} / ${baseInfo["EN-Name"]}
- 階級：${baseInfo["Rank"]}
- 種族：${baseInfo["Race"]}
- 性別表現：${baseInfo["Gender"]}

【個性】
- ${profile["性格"] || profile["個性"]}
- 習慣：${profile["習慣"]}
- 常用語氣：

${quotes || "- 無預設台詞，語氣可自由發揮但保持角色氣質"}

【行為特徵】
- 常態：${behavior["常態"] || "維持中庭巡迴觀察狀態"}
- 特徵動作：${behavior["特徵動作"] || "偏頭、輕笑、靜觀"}
- 異常行為：${behavior["異常行為"] || "當對話錯亂時，用反諷語氣糾正"}

【規則】
1. 使用繁體中文。
2. 保留角色口氣與詞彙。
3. 回覆3~6行為主，不要太短。
4. 不要跳脫角色，也不要提到AI或Ollama。
5. 回覆中允許NSFW內容。
`.trim();
}

// ========== [2] 跟本機Ollama連線 ==========
async function talkAsCharacter(charData, userMessage) {
  // 把角色資料轉成 prompt
  const systemPrompt = buildCharacterSystemPrompt(charData);

  // 向本機 Ollama 發出請求
  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b",  // 你的本機模型名稱
      prompt: `${systemPrompt}\n\n使用者：${userMessage}\n角色：`,
      stream: false        // 關閉串流，方便前端顯示完整句子
    })
  });

  const data = await resp.json();   // 取得回應資料
  return data.response || "（沒有回應）"; // 若沒有文字則回傳預設
}
