import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const activeDialogs = new Map<symbol, HTMLElement>()
const dialogStack: symbol[] = []
const backgroundInertState = new Map<HTMLElement, boolean>()
let originalBodyOverflow = ''

const restoreBackground = () => {
  backgroundInertState.forEach((wasInert, element) => {
    element.inert = wasInert
  })
  backgroundInertState.clear()
}

const syncDocumentState = () => {
  if (!import.meta.client) return

  restoreBackground()

  if (activeDialogs.size === 0) {
    document.body.style.overflow = originalBodyOverflow
    return
  }

  document.body.style.overflow = 'hidden'
  const topmostDialogId = dialogStack.at(-1)
  const topmostDialog = topmostDialogId ? activeDialogs.get(topmostDialogId) : null

  for (const child of document.body.children) {
    if (!(child instanceof HTMLElement)) continue
    if (topmostDialog && (child === topmostDialog || child.contains(topmostDialog))) continue

    backgroundInertState.set(child, child.inert)
    child.inert = true
  }
}

const getFocusableElements = (dialog: HTMLElement) =>
  [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
    .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')

interface AccessibleDialogOptions {
  isOpen: Ref<boolean>
  dialogRef: Ref<HTMLElement | null>
  close: () => void
  closeOnEscape: () => boolean
}

export const useAccessibleDialog = ({
  isOpen,
  dialogRef,
  close,
  closeOnEscape
}: AccessibleDialogOptions) => {
  const dialogId = Symbol('accessible-dialog')
  let previouslyFocusedElement: HTMLElement | null = null
  let activationVersion = 0

  const isTopmostDialog = () => dialogStack.at(-1) === dialogId

  const deactivate = () => {
    const wasTopmostDialog = isTopmostDialog()
    activationVersion += 1
    activeDialogs.delete(dialogId)

    const stackIndex = dialogStack.lastIndexOf(dialogId)
    if (stackIndex >= 0) dialogStack.splice(stackIndex, 1)

    syncDocumentState()

    const focusTarget = previouslyFocusedElement
    previouslyFocusedElement = null
    if (wasTopmostDialog && focusTarget?.isConnected) {
      void nextTick(() => focusTarget.focus())
    }
  }

  const activate = async () => {
    if (!import.meta.client) return

    const version = ++activationVersion
    previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    await nextTick()
    if (version !== activationVersion || !isOpen.value || !dialogRef.value) return

    if (activeDialogs.size === 0) originalBodyOverflow = document.body.style.overflow
    activeDialogs.set(dialogId, dialogRef.value)
    const existingIndex = dialogStack.lastIndexOf(dialogId)
    if (existingIndex >= 0) dialogStack.splice(existingIndex, 1)
    dialogStack.push(dialogId)
    syncDocumentState()

    const initialFocus = dialogRef.value.querySelector<HTMLElement>('[data-dialog-initial-focus], [autofocus]')
    const focusTarget = initialFocus || dialogRef.value
    focusTarget.focus()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value || !dialogRef.value || !isTopmostDialog()) return

    if (event.key === 'Escape' && closeOnEscape()) {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements(dialogRef.value)
    if (focusableElements.length === 0) {
      event.preventDefault()
      dialogRef.value.focus()
      return
    }

    const firstElement = focusableElements[0]!
    const lastElement = focusableElements.at(-1)!
    const activeElement = document.activeElement
    const focusIsOutsideDialog = !(activeElement instanceof Node) || !dialogRef.value.contains(activeElement)

    if (focusIsOutsideDialog) {
      event.preventDefault()
      const focusTarget = event.shiftKey ? lastElement : firstElement
      focusTarget.focus()
    } else if (event.shiftKey && (activeElement === firstElement || activeElement === dialogRef.value)) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  watch(isOpen, (open) => {
    if (open) void activate()
    else deactivate()
  }, { immediate: true, flush: 'post' })

  if (import.meta.client) document.addEventListener('keydown', handleKeydown)

  onBeforeUnmount(() => {
    if (import.meta.client) document.removeEventListener('keydown', handleKeydown)
    deactivate()
  })
}
