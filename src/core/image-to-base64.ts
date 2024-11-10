import { invoke } from '@tauri-apps/api/tauri'

export async function imageToBase64(url: string) {
  const res = await invoke<string>('image_to_base64', { url })
  console.log('imageToBase64: size', res.length)
  return `data:image/jpg;base64,${res}`
}
