import { invoke } from '@tauri-apps/api/tauri'

export async function imageToBase64(url: string) {
  const res = await invoke<string>('image_to_base64', { url })
  return `data:image/jpg;base64,${res}`
}
