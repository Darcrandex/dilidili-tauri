#!/bin/bash

# 读取 package.json 中的版本号
VERSION=$(jq -r '.version' package.json)

# 分割版本号为大版本、小版本和补丁版本
MAJOR=$(echo $VERSION | cut -d. -f1)
MINOR=$(echo $VERSION | cut -d. -f2)
PATCH=$(echo $VERSION | cut -d. -f3)

# 提升小版本号
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# 更新 package.json 中的版本号
jq --arg new_version "$NEW_VERSION" '.version = $new_version' package.json > package.json.tmp
mv package.json.tmp package.json

# 更新 src-tauri/tauri.conf.json 中的版本号
jq --arg new_version "$NEW_VERSION" '.version = $new_version' src-tauri/tauri.conf.json > tauri.conf.json.tmp
mv tauri.conf.json.tmp src-tauri/tauri.conf.json

# 提交 commit
git add .
git commit -m "📃 docs(release): v$NEW_VERSION"

# 创建 tag
git tag -a "app-v$NEW_VERSION" -m "v$NEW_VERSION"

# 推送新的 tags 到远程仓库
# git push origin "app-v$NEW_VERSION"

echo "成功发布版本 $NEW_VERSION"    