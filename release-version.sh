#!/bin/bash

# 设置默认的升级类型为 patch
UPGRADE_TYPE="patch"

# 若提供了参数，则使用传入的参数
if [ $# -gt 0 ]; then
    UPGRADE_TYPE=$1
fi

# 检查参数是否合法
if [ "$UPGRADE_TYPE" != "major" ] && [ "$UPGRADE_TYPE" != "minor" ] && [ "$UPGRADE_TYPE" != "patch" ]; then
    echo "无效的升级类型参数。请使用 major、minor 或 patch。"
    exit 1
fi

# 读取 package.json 中的版本号
VERSION=$(jq -r '.version' package.json)

# 分割版本号为大版本、小版本和补丁版本
MAJOR=$(echo $VERSION | cut -d. -f1)
MINOR=$(echo $VERSION | cut -d. -f2)
PATCH=$(echo $VERSION | cut -d. -f3)

# 根据升级类型更新版本号
case $UPGRADE_TYPE in
    major)
        NEW_MAJOR=$((MAJOR + 1))
        NEW_MINOR=0
        NEW_PATCH=0
        NEW_VERSION="$NEW_MAJOR.$NEW_MINOR.$NEW_PATCH"
        ;;
    minor)
        NEW_MINOR=$((MINOR + 1))
        NEW_PATCH=0
        NEW_VERSION="$MAJOR.$NEW_MINOR.$NEW_PATCH"
        ;;
    patch)
        NEW_PATCH=$((PATCH + 1))
        NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
        ;;
esac

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
git push origin main
git push --tags

echo "成功发布版本 $NEW_VERSION"