# Vite 部署到 GitHub Pages

## 1️⃣ 設定 `vite.config.js`

打開 `vite.config.js`，加入 `base` 設定（請修改 `這裡放資料夾名字` 為你的 GitHub Repo 名稱）：

```js
export default defineConfig({
  // 第 1 步
  base: '/這裡放資料夾名字/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

## 2️⃣ 編譯專案

```js
npm run build
```

## 3️⃣ 強制加入 dist 資料夾

```js
git add dist -f
```

## 4️⃣ 提交 dist

```js
git commit -m "adding dist"
```

## 5️⃣ 使用 git subtree 推送 dist 到 gh-pages

```js
git subtree push --prefix dist origin gh-pages
```

## 刪除 breach 來重新上傳

```js
git push origin --delete gh-pages
```
