'use client'

import * as React from 'react'
import {
  compositionReducer,
  createStarterComposition,
  pageText,
  parseSavedModules,
  type CompositionAction,
} from '@/lib/builder'
import { createInstance } from '@/modules/registry'
import type { ModuleInstance, VariantId } from '@/modules/types'

export interface SavedPage {
  id: string
  name: string
  updatedAt: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface BuilderState {
  instances: ModuleInstance[]
  selectedUid: string | null
  pageName: string
  savedPageId: string | null
  saveStatus: SaveStatus
  pages: SavedPage[]
  loadingPages: boolean
  addModule: (moduleId: string, variantId?: VariantId) => void
  edit: (action: CompositionAction) => void
  select: (uid: string | null) => void
  replaceAll: (instances: ModuleInstance[], name?: string) => void
  resetToStarter: () => void
  setPageName: (name: string) => void
  save: () => Promise<void>
  loadPage: (id: string) => Promise<void>
  deletePage: (id: string) => Promise<void>
  refreshPages: () => Promise<void>
  getPageText: () => string
}

const BuilderContext = React.createContext<BuilderState | null>(null)

export function useBuilder(): BuilderState {
  const context = React.useContext(BuilderContext)
  if (!context) throw new Error('useBuilder must be used within BuilderProvider')
  return context
}

let uidCounter = 0
function createUid(moduleId: string): string {
  uidCounter += 1
  return `${moduleId}-${Date.now().toString(36)}-${uidCounter}`
}

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [instances, dispatch] = React.useReducer(compositionReducer, [])
  const [selectedUid, setSelectedUid] = React.useState<string | null>(null)
  const [pageName, setPageName] = React.useState('Main page')
  const [savedPageId, setSavedPageId] = React.useState<string | null>(null)
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle')
  const [pages, setPages] = React.useState<SavedPage[]>([])
  const [loadingPages, setLoadingPages] = React.useState(true)

  // Start with the starter composition on first mount
  React.useEffect(() => {
    dispatch({ type: 'replace', modules: createStarterComposition() })
  }, [])

  const refreshPages = React.useCallback(async () => {
    try {
      const res = await fetch('/api/pages', { cache: 'no-store' })
      const data = (await res.json()) as { pages?: SavedPage[] }
      setPages(Array.isArray(data.pages) ? data.pages : [])
    } catch {
      setPages([])
    } finally {
      setLoadingPages(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshPages()
  }, [refreshPages])

  const edit = React.useCallback((action: CompositionAction) => {
    dispatch(action)
    setSaveStatus('idle')
  }, [])

  const addModule = React.useCallback(
    (moduleId: string, variantId: VariantId = 'a') => {
      const uid = createUid(moduleId)
      edit({ type: 'add', uid, moduleId, variantId })
      setSelectedUid(uid)
    },
    [edit],
  )

  const replaceAll = React.useCallback((next: ModuleInstance[], name?: string) => {
    dispatch({ type: 'replace', modules: next })
    if (name) setPageName(name)
    setSaveStatus('idle')
  }, [])

  const resetToStarter = React.useCallback(() => {
    dispatch({ type: 'replace', modules: createStarterComposition() })
    setPageName('Main page')
    setSavedPageId(null)
    setSaveStatus('idle')
    setSelectedUid(null)
  }, [])

  const save = React.useCallback(async () => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedPageId, name: pageName, modules: instances }),
      })
      if (!res.ok) throw new Error('save failed')
      const data = (await res.json()) as { page: SavedPage }
      setSavedPageId(data.page.id)
      setSaveStatus('saved')
      void refreshPages()
    } catch {
      setSaveStatus('error')
    }
  }, [instances, pageName, savedPageId, refreshPages])

  const loadPage = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/pages?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('load failed')
        const data = (await res.json()) as { page: { id: string; name: string; modules: unknown } }
        const parsed = parseSavedModules(data.page.modules)
        dispatch({ type: 'replace', modules: parsed.length > 0 ? parsed : createStarterComposition() })
        setPageName(data.page.name)
        setSavedPageId(data.page.id)
        setSaveStatus('idle')
        setSelectedUid(null)
      } catch {
        setSaveStatus('error')
      }
    },
    [],
  )

  const deletePage = React.useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/pages?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        if (savedPageId === id) {
          setSavedPageId(null)
          setSaveStatus('idle')
        }
        void refreshPages()
      } catch {
        /* non-fatal */
      }
    },
    [savedPageId, refreshPages],
  )

  const getPageText = React.useCallback(() => pageText(instances), [instances])

  const value: BuilderState = {
    instances,
    selectedUid,
    pageName,
    savedPageId,
    saveStatus,
    pages,
    loadingPages,
    addModule,
    edit,
    select: setSelectedUid,
    replaceAll,
    resetToStarter,
    setPageName,
    save,
    loadPage,
    deletePage,
    refreshPages,
    getPageText,
  }

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export { createInstance }
