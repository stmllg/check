背書助手 WEB03.1｜自動準備與介面狀態修正版

更新：備份 WEB03，將本 ZIP 解壓縮覆蓋 check 儲存庫；保留 .git 與 models/。GitHub Desktop Commit to main → Push origin，等 Actions build/deploy 成功。
開啟 https://stmllg.github.io/check/index.html，使用原本三星瀏覽器，不清除網站資料。
首次使用自動下載模型；已有模型則自動初始化。準備完成後顯示經文與開始背書，點開始才取得麥克風。準備失敗才顯示重新準備。LINE 內建瀏覽器不啟動下載。
右側四格固定，背書中才顯示觀看結果、即時觀察；結算後顯示從頭開始、持續進度。
保留 WEB03 原有 worker.js、recite-core.js、pcm-worklet.js、scripture.json、Android/Apple 樣式及模型識別。新 UI 檔案使用版本化 URL，Service Worker 使用新 shell cache，避免舊 UI 混用。
測試：Node 語法、原有核心與 Worker 模擬測試通過；Chromium 模擬 Android/Apple UA 自動準備、首頁、右側四格、觀察、結算通過。未實測手機、真實 WASM 或離線部署。
