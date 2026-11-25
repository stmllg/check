背書助手 WEB02 — Android V04.5 辨識核心移植測試版

【更新方式：原 check 專案】
1. 建議先備份目前 WEB01 本機專案（包括 models）。將此 ZIP 全部解壓到目前 GitHub Desktop 的 check 儲存庫根目錄（有 .git 的那一層），同名檔案覆蓋。不要刪除 .git 或 models。ZIP 本身沒有 models 資料夾，故既有分片不會被覆蓋。
2. 不要再執行「準備模型.cmd」！原來 26 個模型相關檔案已經上傳，保持原樣即可。若全新安裝才需要此工具。
3. GitHub Desktop 選 check，Summary 填 WEB02，Commit to main，Push origin。
4. Pages Source 保持 GitHub Actions。Actions 自動執行 Build WEB02 and deploy，build 和 deploy 皆為綠勾才算發布成功。
5. 本版 GitHub Actions 直接下載目前已發布的 WEB01 engine 三個引擎檔、授權及 revision.txt，避免重新編譯不同的上游版本。如果已發布網站不可讀，建置會明確失敗，不會替換為其他引擎。另一個新增步驟會從 Maven Central 取得 Android 相同的 pinyin4j 2.5.1，使用 Java 產生字典。此流程未在本環境實際執行；請保留 WEB01，若失敗提供紅色錯誤 log。需要備份引擎時可以另保存已發布 engine 檔案。
6. 用原來成功的三星瀏覽器開啟 https://stmllg.github.io/check/index.html，確認標題 WEB02。如仍舊版，保持連網重新整理，不要清除網站資料。LINE 中先選預設瀏覽器開啟（依 UA 偵測，無法保證所有 LINE 版本都能辨認）。
7. 點準備辨識模型。同一瀏覽器且同一網站來源，原 OPFS manifest 名稱及 recite-模型版本資料夾均保留；本機模型完整時顯示本次下載 0 MB。網頁及新增字典仍需要更新一次。不要切換瀏覽器或清除資料。
8. 預設前十句、70%、木魚開啟。開始收音後自動評分與換句，請用自然速度背誦。可改 65/70/75/80%，可選全篇或匯入 V500 JSON（匯入教材暫時只在本次頁面有效）。可停下、手動換句、重測。紅字代表拼音完全相同，天空藍代表有加權匹配，灰字未匹配。
9. 先正常念，再刻意念錯、插入三字、測試連續快速換句。判錯後等安靜、三下木魚，音效結束加100ms後普通句重新啟動；單字仍等200ms與100ms安靜邊界。這是網頁為隔離提示音增加的保護，與 Android 第三下即重念的時序略不同，須實測是否漏收句首。靜音選項不播提示音。原始 Kotlin 的2500ms最終判定要求已有至少六個發聲批次及非空辨識文字；本版照此保留，無文字時不會單靠2500ms就判錯。
10. 測試後按停止收音，匯出或複製報告。再用飛航模式重新開啟同一瀏覽器測試。短句測試可匯入 tests/短句測試.json（前十句涵蓋連續單字、二至五字、咒語）。

【已移植】
PhoneticScorer.kt：100/80/65/45 音節加權、普通經文最大權重對齊、咒語編輯距離、句尾定位、長句前綴選擇及中間插字候選。
ReciteCore.kt：門檻及字數截止、插字確認、過關/重念判定（不移植只供診斷的 legacy SequenceMatcher）。
SingleVoiceGate.kt：兩批達到能量6（100ms），一次過關後須重新武裝；單字清回補。
SpeechEngine.kt：正常換句400ms回補、最近發聲200ms內、epoch/sid隔離、相同句安靜等待、2500ms最終判定。網頁與 Android 排程不同，時間以 Web Worker 音訊批次為基礎，待實機驗證。
Tones.kt：以原波形參數合成木魚。網頁重念有額外音效隔離，避免單字誤判。
WEB01 原始模型、16kHz、50ms、Greedy、WASM 單執行緒、OPFS 模型識別與分片驗證維持。

【限制】
此 ZIP 是完整網頁原始碼與部署工具，不包含已存在 GitHub 上的模型或 WASM 二進位，也不包含尚待 Actions 生成的 pinyin.json；不是解壓即可辨識的獨立成品。未實測 WEB02 手機、iPhone、GitHub 新流程或完整字典生成。正式五行大字面板、進度儲存、語音啟動、供養、錯句回顧、實體模型備份留後續階段。只做核心測試。
本機測試：node --check *.js（逐檔）；node tests/test-core.cjs；node tests/test-worker.cjs（模擬辨識器，不是 WASM 實測）。
