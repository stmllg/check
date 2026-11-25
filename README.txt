背書助手 WEB01 — 十句離線辨識測速開發版

重要：此 ZIP 是完整的 WEB01 網頁原始碼及自動建置流程，不包含未上傳的原始 ONNX 權重或尚未編譯的 WASM 二進位。不是可直接解壓即離線辨識的成品。GitHub Actions 必須成功建置後才可實測。Android V04.5 不修改。

Windows 操作：
1. 將 ZIP 內所有檔案（含 .github）解壓到桌面/check/check（有 .git 那一層）。不可刪除 .git。
2. 雙擊「準備模型.cmd」，選擇原 Android V04.5 的 app/src/main/assets/models 資料夾。需要已安裝 Python 3.8+；若沒有 py 指令，請在 CMD 使用 python tools\prepare_models.py，或 py -3 tools\prepare_models.py "完整模型資料夾路徑"。
3. 工具將原六檔依 16 MiB 分片複製到本網站 models 資料夾，建立 SHA-256 清單。原始檔不修改。確認顯示完成；約需 357 MB 額外空間。不要把原始大型 ONNX 再複製入 Git 儲存庫。
4. GitHub Desktop 選 check，Summary 填 WEB01，Commit to main，再 Push origin（初次可能顯示 Publish branch）。
5. GitHub 網頁 check > Settings > Pages > Build and deployment > Source 選 GitHub Actions。到 Actions 選 Build WEB01 and deploy，若沒有自動執行，選 Run workflow。若編譯失敗，請提供 Actions 紅色錯誤的畫面或 log。此流程以當次 Sherpa 上游版本建置、記錄 commit，尚未在本環境執行，不能保證首次成功；成功後應固定該 commit。
6. Actions build 和 deploy 都成功後，開啟 Pages 顯示的網址加 index.html。先 Windows Chrome，再 iPhone Safari，最後 iPhone 加入主畫面後從圖示開啟，避免 Safari 與 PWA 重複下載。
7. 點準備辨識模型，首次下載所有分片，之後同一儲存環境本機完整即直接載入。可按申請長期保存。模型檔案會透過 OPFS 保存，WASM 以 WorkerFS 掛載（仍有推論記憶體需求）。清除網站資料可能刪除模型。WEB01 暫無實體模型匯入/匯出按鈕。
8. 點開始收音，允許麥克風，念畫面經文，確認天空藍辨識文字，按下一句。第10句再按下一句完成。重測本句不回補；正常下一句最多回補400ms（最近發聲200ms內）。這是測速用回補，完整殘音隔離及過關判定留 WEB02。按停止收音、匯出測試報告。
9. 模型完整且畫面顯示離線程式已安裝後，關閉網路、關閉網頁再開啟，點準備辨識模型及開始收音。測試飛航模式。若不成功，請記錄裝置/iOS版本與畫面訊息。

測速：RTF 為本句每批辨識運算總耗時 / 已送入音訊時長，不等於句尾到文字的延遲；傳送至結果為每批在網頁送出至 Worker 完成的耗時，未含收音裝置及模型內部等待；換句為 Worker 內部重設耗時（含回補）；WASM heap 為線性記憶體大小，不是手機實際總 RAM；遺漏計數是程式可觀測到的批次缺口/超過隊列上限，不代表硬體收音完全無遺漏。WEB01 不進行自動過關、單字判定、木魚或完整面板。

來源：Android V04.5 SpeechEngine.kt（16kHz、80維、greedy_search、endpoint 關閉、800樣本）；V500 JSON 原檔完整保留，畫面取前10句。WASM 使用 https://github.com/k2-fsa/sherpa-onnx 官方編譯流程，移除內嵌模型預載並增加 FS/WORKERFS。模型授權須依原發布來源遵守。程式不使用雲端語音辨識。
