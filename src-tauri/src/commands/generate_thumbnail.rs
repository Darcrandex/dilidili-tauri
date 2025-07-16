use std::path::{Path, PathBuf};
use image::GenericImageView;

/// 缩略图宽度
const THUMB_WIDTH: u32 = 300;
/// 缩略图后缀
const SUFFIX: &str = "_thumbnail";

/// 生成缩略图，如果已存在则直接返回
#[tauri::command]
pub fn generate_thumbnail(image_path: String) -> Result<String, String> {
    let original_path = PathBuf::from(&image_path);

    if !original_path.exists() {
        return Err("原始图片不存在".into());
    }

    // 构造缩略图路径：如 /some/path/image_thumbnail.jpg
    let thumb_path = get_thumbnail_path(&original_path);

    if thumb_path.exists() {
        return Ok(thumb_path.to_string_lossy().to_string());
    }

    // 打开原始图像
    let img = image::open(&original_path).map_err(|e| format!("无法打开图片: {e}"))?;

    // 计算缩放尺寸
    let (orig_w, orig_h) = img.dimensions();
    let scale = THUMB_WIDTH as f32 / orig_w as f32;
    let new_height = (orig_h as f32 * scale) as u32;

    // 生成缩略图
    let thumb = img.resize(THUMB_WIDTH, new_height, image::imageops::FilterType::Lanczos3);

    // 保存缩略图
    thumb.save(&thumb_path).map_err(|e| format!("保存缩略图失败: {e}"))?;

    Ok(thumb_path.to_string_lossy().to_string())
}

/// 生成缩略图路径：/some/path/image.jpg → /some/path/image_thumbnail.jpg
fn get_thumbnail_path(original_path: &Path) -> PathBuf {
    let parent = original_path.parent().unwrap_or_else(|| Path::new("."));
    let stem = original_path.file_stem().unwrap_or_default().to_string_lossy();
    let ext = original_path.extension().unwrap_or_default().to_string_lossy();
    parent.join(format!("{stem}{SUFFIX}.{ext}"))
}
