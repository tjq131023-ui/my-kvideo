'use client';

import { useEffect } from 'react';

export function TVNavigation() {
  useEffect(() => {
    // 1. 动态注入电视焦点高亮样式
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      *:focus, .tv-focused {
        outline: 4px solid var(--accent-color, #1e80ff) !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 20px rgba(30, 128, 255, 0.7) !important;
        transform: scale(1.04) !important;
        transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), outline-offset 0.15s ease !important;
        z-index: 9999 !important;
      }
      /* 针对 input 在获取焦点时的额外电视优化 */
      input:focus {
        background-color: rgba(255, 255, 255, 0.15) !important;
      }
    `;
    document.head.appendChild(styleEl);

    // 2. 空间相对位置及几何计算
    function getCenter(el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    function getFocusableElements(): HTMLElement[] {
      // 收集页面中所有的可交互元素
      const selector = 'input, button, a, [tabindex="0"], [role="button"]';
      const rawElements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      
      return rawElements.filter(el => {
        // 排除掉隐藏、零宽高或不可见的元素
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        
        return true;
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (!keys.includes(e.key)) return;

      const activeEl = document.activeElement as HTMLElement;
      const elements = getFocusableElements();
      
      if (elements.length === 0) return;

      // 如果当前没有聚焦在合法元素上，默认聚焦到第一个输入框/按钮
      if (!activeEl || !elements.includes(activeEl)) {
        elements[0].focus();
        e.preventDefault();
        return;
      }

      if (e.key === 'Enter') {
        // 在网页上按下 Enter 键，模拟点击该元素
        activeEl.click();
        e.preventDefault();
        return;
      }

      // 计算空间相对距离
      const activeCenter = getCenter(activeEl);
      let bestCandidate: HTMLElement | null = null;
      let minDistance = Infinity;

      elements.forEach(el => {
        if (el === activeEl) return;
        const center = getCenter(el);
        
        const dx = center.x - activeCenter.x;
        const dy = center.y - activeCenter.y;
        
        let isCorrectDirection = false;
        
        // 容差判定防止微小坐标偏移产生的方向漏判
        if (e.key === 'ArrowDown' && dy > 5) isCorrectDirection = true;
        if (e.key === 'ArrowUp' && dy < -5) isCorrectDirection = true;
        if (e.key === 'ArrowRight' && dx > 5) isCorrectDirection = true;
        if (e.key === 'ArrowLeft' && dx < -5) isCorrectDirection = true;

        if (isCorrectDirection) {
          // 对非主轴方向上的偏移量进行乘权惩罚，确保导航更倾向于正上方/正下方，而不是斜对角
          const distance = (e.key === 'ArrowUp' || e.key === 'ArrowDown')
            ? (dx * dx * 2.8 + dy * dy)
            : (dx * dx + dy * dy * 2.8);

          if (distance < minDistance) {
            minDistance = distance;
            bestCandidate = el;
          }
        }
      });

      if (bestCandidate) {
        (bestCandidate as HTMLElement).focus();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  return null;
}
