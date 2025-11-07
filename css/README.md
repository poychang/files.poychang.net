# CSS 架構說明

本專案採用模組化 CSS 架構，將樣式依功能拆分成多個檔案，提升可維護性與可讀性。

## 📁 檔案結構

```
css/
├── main.css              # 主樣式表（統一導入所有模組）
├── variables.css         # CSS 變數定義（淺色/深色主題）
├── base.css             # 基礎樣式與重置
├── navbar.css           # 導航列樣式
├── cards.css            # 卡片與容器
├── forms.css            # 表單元素
├── buttons.css          # 按鈕樣式
├── folders.css          # 分類相關
├── files.css            # 檔案相關
├── notifications.css    # 通知與提示訊息
├── modals.css           # Modal 對話框
├── animations.css       # 載入與動畫效果
├── footer.css           # Footer 樣式
├── users.css            # 使用者相關
├── utilities.css        # 工具類樣式
└── styles.css           # (已棄用) 保留作為備份
```

## 🎯 模組說明

### 1. **variables.css** - CSS 變數定義
- 定義所有主題相關的 CSS 變數
- 包含淺色主題（`:root`）與深色主題（`[data-theme="dark"]`）
- 管理顏色、陰影、間距等全域變數

### 2. **base.css** - 基礎樣式
- CSS 重置（`* { margin: 0; padding: 0; box-sizing: border-box; }`）
- `body` 全域樣式
- 文字顏色、連結、`code` 標籤等基礎元素
- 自定義捲軸樣式

### 3. **navbar.css** - 導航列
- 頂部固定導航列
- 使用者頭像與資訊
- 主題切換與登出按鈕
- 響應式調整

### 4. **cards.css** - 卡片與容器
- `.card` 主要卡片樣式
- `.card-header` 與 `.card-body`
- `.list-group-item` 列表群組
- 主題適配

### 5. **forms.css** - 表單元素
- `.form-control` 與 `.form-select`
- 輸入框 focus 狀態
- placeholder 樣式
- `.input-group` 統一高度

### 6. **buttons.css** - 按鈕樣式
- 各種 Bootstrap 按鈕變體（primary、secondary、outline 等）
- 深色主題下的顏色修正
- hover 與 active 狀態

### 7. **folders.css** - 分類管理
- `.folder-card` 分類卡片
- `.folder-list-item` 分類列表項目
- `.folder-delete-btn` 刪除按鈕
- 選取狀態（`.selected`）
- 5 欄網格自定義

### 8. **files.css** - 檔案管理
- `.drop-zone` 拖曳上傳區域
- `.file-item` 檔案列表項目
- `.file-preview-img` 圖片預覽
- 檔案圖示與資訊顯示

### 9. **notifications.css** - 通知訊息
- `.toast` Toast 通知
- `.alert` 警告訊息
- `.progress` 進度條
- `.badge` 徽章
- 成功/錯誤訊息樣式

### 10. **modals.css** - 對話框
- Bootstrap Modal 在深色主題下的樣式覆寫
- `.modal-content`、`.modal-header`、`.modal-body`、`.modal-footer`
- 關閉按鈕在深色主題下的顏色反轉

### 11. **animations.css** - 動畫效果
- `.loading-spinner` 載入動畫
- `@keyframes spin` 旋轉動畫
- `@keyframes slideIn` Toast 滑入動畫
- Spinner 在深色主題下的樣式

### 12. **footer.css** - 頁尾
- `.site-footer` 固定 Footer
- 主題適配
- 連結樣式

### 13. **users.css** - 使用者介面
- `.user-info` 使用者資訊卡片
- `.user-avatar` 頭像
- `.user-code` 使用者代碼
- 指示說明樣式

### 14. **utilities.css** - 工具類
- `.link` 連結樣式
- 其他輔助類別

## 🔧 使用方式

### 在 HTML 中引用
只需引用主樣式表 `main.css`，它會自動載入所有模組：

```html
<link rel="stylesheet" href="css/main.css">
```

### 修改或新增樣式
1. 找到對應功能的 CSS 檔案
2. 在該檔案中進行修改或新增
3. 如需新增新模組，建立新的 CSS 檔案並在 `main.css` 中導入

### 載入順序
`main.css` 按照以下順序導入模組，確保樣式優先級正確：
1. 變數定義（`variables.css`）
2. 基礎樣式（`base.css`）
3. 佈局元件（navbar、footer、cards）
4. 表單與控制項（forms、buttons）
5. 功能模組（folders、files、users）
6. 互動元件（notifications、modals、animations）
7. 工具類（utilities）

## 🎨 主題系統

主題切換透過 `data-theme` 屬性實現：
- 淺色主題：`:root` 或 `[data-theme="light"]`
- 深色主題：`[data-theme="dark"]`

所有顏色均使用 CSS 變數定義於 `variables.css`，確保主題一致性。

## 📝 維護建議

1. **單一職責原則**：每個 CSS 檔案只負責特定功能的樣式
2. **命名一致性**：使用語意化的 class 名稱
3. **註釋說明**：在每個檔案開頭加上功能說明
4. **避免重複**：相同樣式應提取到對應的模組或 utilities
5. **響應式優先**：響應式樣式應放在對應模組內，避免分散

## 🔄 從舊版遷移

原本的 `styles.css` 已完整拆分為上述模組，建議：
1. 保留 `styles.css` 作為備份（可加上 `.backup` 後綴）
2. 確認所有功能正常後可刪除舊檔案
3. 更新 HTML 中的 CSS 引用為 `main.css`

## 📊 效益

- ✅ **可維護性提升**：快速定位與修改特定功能的樣式
- ✅ **可讀性增強**：每個檔案職責清晰，易於理解
- ✅ **團隊協作**：多人可同時編輯不同模組，減少衝突
- ✅ **載入優化**：可選擇性載入需要的模組（按需載入）
- ✅ **版本控制**：Git diff 更清晰，易於追蹤變更
