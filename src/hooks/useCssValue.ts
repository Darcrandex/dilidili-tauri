import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 获取/设置 css 变量
 * @param variableName - 变量名
 * @param initialValue - 初始值
 * @returns
 */
export function useCssValue(variableName: string, initialValue?: string) {
  const elementRef = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState<string>()

  // 检查 css 变量名
  useEffect(() => {
    const cssRegex = /^--[\w-]+$/
    if (!cssRegex.test(variableName)) {
      console.error(
        `[useCssValue] Invalid CSS variable name: "${variableName}". It should start with "--" and contain only letters, numbers, and hyphens.`,
      )
    }
  }, [variableName])

  const getTargetElement = useCallback(() => {
    return elementRef.current || document.documentElement
  }, [])

  // 设置 CSS 变量值
  const setCssValue = useCallback(
    (value: string): void => {
      const element = getTargetElement()
      element.style.setProperty(variableName, value)
    },
    [getTargetElement, variableName],
  )

  // 监听 CSS 变量值的变化
  useEffect(() => {
    const element = getTargetElement()
    const observer = new MutationObserver(() => {
      const computedStyle = window.getComputedStyle(element)
      const newValue = computedStyle.getPropertyValue(variableName).trim()

      setValue(newValue)
    })

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style'],
    })

    return () => {
      observer.disconnect()
    }
  }, [getTargetElement, variableName])

  // 初始化 CSS 变量值
  useEffect(() => {
    const element = getTargetElement()
    const computedStyle = window.getComputedStyle(element)
    const currentValue = computedStyle.getPropertyValue(variableName).trim()

    if (currentValue) {
      setValue(currentValue)
    } else if (initialValue) {
      element.style.setProperty(variableName, initialValue)
    }
  }, [getTargetElement, initialValue, variableName])

  return [value, setCssValue, elementRef] as const
}
