背書助手 WEB03 — 同一程式、同一網址、Android / Apple 介面分流

【更新】
1. 備份目前成功的 WEB02。將本 ZIP 解壓至原本 check 儲存庫根目錄（有 .git 的那一層），同名檔案覆蓋。
2. 保留 .git 和 models/。不必重新執行「準備模型.cmd」，不必清除手機網站資料。
3. GitHub Desktop：Summary 填 WEB03 → Commit to main → Push origin。
4. GitHub Pages 維持 GitHub Actions。Build WEB03 and deploy 的 build、deploy 均綠勾後再測試。
5. 原網址 https://stmllg.github.io/check/index.html 。原三星瀏覽器保持連網重新整理，直到標題 WEB03。
6. LINE 內建瀏覽器仍提示切換預設瀏覽器，避免模型重複下載。

【操作】
手機橫放。五行經文可上下滑動，點任一句選擇進度。滑動本身不重設辨識。
左1 經文：預設入行論第五品、匯入 V500 JSON、選擇全部經文／前十句。匯入後以瀏覽器 localStorage 保存教材及進度；瀏覽器儲存不足時可能無法保存。
左2 辨識：65/70/75/80% 基準；1字有聲、2字40%、3字50%、4字55%，咒語30%（單字例外），5～10字使用基準；超過10字每字增加2個百分點、最高90%。
左3 提醒：木魚／靜音（首次預設靜音，依 Android V04.5）。
左4 顯示：跟著讀／默背；默背已通過句逐句顯示，前一句提示保留。
右1 準備模型／開始背書／觀看結果；觀察模式中返回經文。
右2 背書中即時觀察（上一句過關快照＋目前句）；結算中從頭開始。
右3 結算中持續進度，全文完成後停用。
右4 圓滿供養：停止收音及保存進度；網頁不能像原生 APK 強制退出，因此保留在網頁。
齒輪：模型準備、長期保存、測試資訊、匯出／複製報告。
預設選全部經文。首次按準備模型，原本完整 OPFS 模型應顯示本次下載 0 MB；程式檔更新一次仍需網路。
錯句回顧：紅字錯句及前後各2句，相鄰範圍合併、分段留白。

【架構】
index.html 單一入口，platform.js 偵測裝置，ui.css 共用樣式；android.css 與 apple.css 只處理各自介面。panel.js 同一操作邏輯。app.js 保留 WEB02 收音及辨識控制；worker.js 與 pcm-worklet.js 逐位元不變。recite-core.js 僅改門檻函數。OPFS 模型名稱、manifest 及目錄完全不變。
Actions 直接取得現有已發布的成功 WASM 引擎，使用 pinyin4j 2.5.1 生成字典，驗證 models 分片後發布。ZIP 不含既有 models、WASM 二進位或待生成 pinyin.json。

【尚待實測與差異】
本機通過 JS 語法、core 評分及門檻、模擬 worker、Chromium 模擬 Android／Apple UA 與五行面板操作。瀏覽器測試使用模擬字典及收音狀態，非真實 WASM 或手機測試。GitHub 發布及 Android 飛航模式須再次驗證；Apple 尚未實機測試。
原生 Android 系統亮度控制、語音口令開始／語音提示、經名特別默背流程、原生退出與灑花動畫未移植。本版保留 WEB02 原始語音核心，不另外改動。瀏覽器裝置偵測並非所有 UA 都能保證正確。
