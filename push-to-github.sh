#!/usr/bin/env bash
# 一键备份脚本:把扩展代码推送到 GitHub 私有仓库
# 用法:
#   1) 编辑下面的 REPO 变量,改成你的仓库地址
#   2) bash push-to-github.sh
#      或者手动执行脚本中"步骤 1/2/3"里的命令

set -e

REPO="git@github.com:YOUR_USERNAME/screenshot-auto-saver.git"   # ← 改成你的仓库地址

echo "============================================================"
echo "  网页自动截屏助手 → GitHub 私有仓库 备份脚本"
echo "============================================================"
echo ""
echo "目标仓库: $REPO"
echo ""

# ---------- 步骤 1:在 GitHub 网页创建私有空仓库 ----------
# 这一步需要在浏览器手动完成:
#   1. 打开 https://github.com/new
#   2. Repository name: screenshot-auto-saver
#   3. 选择 Private
#   4. **不要**勾选 Add a README / .gitignore / license
#   5. 点 Create repository
#   6. 复制 "git@github.com:..." 或 "https://github.com/..." 地址
#   7. 把地址填到本脚本顶部的 REPO 变量

echo "▶ 步骤 1:请在 GitHub 网页创建私有空仓库"
echo "  打开 https://github.com/new"
echo "  Repository name:screenshot-auto-saver"
echo "  Visibility:Private"
echo "  不要勾选 README/.gitignore/license"
echo ""
read -p "已创建好?按 Enter 继续(取消请 Ctrl+C)..."

# ---------- 步骤 2:添加远程并推送 ----------
echo ""
echo "▶ 步骤 2:配置 remote 并推送"

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO"
  echo "  ✓ 已添加 remote origin = $REPO"
else
  git remote set-url origin "$REPO"
  echo "  ✓ 已更新 remote origin = $REPO"
fi

# 强制把 main 推上去
git branch -M main
git push -u origin main

echo ""
echo "============================================================"
echo "  ✓ 推送完成!"
echo "============================================================"
echo "  查看: ${REPO%.git}"
echo ""
