import {Fragment, useEffect, useLayoutEffect, useRef, useState} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import axios from "axios";
import Cookies from "js-cookie";
import {ChevronUpDownIcon} from "@heroicons/react/20/solid";

const languages = [
    {
        id: 1,
        name: 'notrans(English)',
        code: 'en',
    },
    {
        id: 2,
        name: 'notrans(简体中文)',
        code: 'zh-CN',
    },
    {
        id: 3,
        name: 'notrans(繁體中文)',
        code: 'zh-TW',
    },
    {
        id: 4,
        name: 'notrans(Français)',
        code: 'fr'
    },
    {
        id: 5,
        name: 'notrans(Deutsch)',
        code: 'de'
    },
    {
        id: 6,
        name: 'notrans(日本語)',
        code: 'ja'
    },
    {
        id: 7,
        name: 'notrans(韓国語)',
        code: 'ko'
    },
    {
        id: 8,
        name: 'notrans(Español)',
        code: 'es'
    },
    {
        id: 9,
        name: 'notrans(Italiano)',
        code: 'it'
    }
]

function getLangItem(lang, retDefault = true) {

    for (const item of languages) {
        if (item.code == lang) {
            return item
        }
    }
    if (!retDefault) {
        return undefined
    } else {
        return languages[0]
    }
}


function reloadPage(langCode) {
    const url = new URL(window.location.href)
    let pathname = url.pathname

    for (const lang of languages) {
        if (pathname.startsWith(`/${lang.code}/`)) {
            pathname = pathname.substring(`/${lang.code}`.length)
            break
        }
    }

    pathname = `/${langCode}${pathname}`

    window.location.href = pathname;
}

function getLang() {
    let lang = getLangFromUrl(window.location.href)

    if (lang === undefined) {
        lang = Cookies.get('vlx-i18n-lang')
        if (lang === undefined) {
            lang = window.navigator.language
            const parts = lang.split('-')
            lang = parts[0]
        }
    }
    return lang
}

function getLangFromUrl(link) {
    const url = new URL(link)
    const pathname = url.pathname
    const parts = pathname.split('/')
    if (parts.length < 2) {
        return undefined
    }
    const language = getLangItem(parts[1], false)

    if (language === undefined) {
        return undefined
    }

    return language.code
}

export function LanguageSelector() {
    const [lang, setLang] = useState({})
    let [firstRender, setFirstRender] = useState(true)

    // 在组件渲染前执行，且仅在加载的时候执行一次
    useLayoutEffect(() => {
        setLang(getLangItem(getLang()))
    }, [])

    // 组件渲染完成之后执行，只会在useLayoutEffect之后执行，第一次触发时firstRender的判断是有效的，后面当lang发生变化时触发
    useEffect(() => {
        if (firstRender) {
            setFirstRender(false)
            return
        } else {
            const url = `/vlx-i18n/setlang?lang=${lang.code}`
            axios.get(url).then(response => {
                if (response.data === 'set-lang-success') {
                    reloadPage(lang.code)
                }
            })
        }
    }, [lang])


    return (
        <div className="hidden w-48 md:block">
            <Listbox value={lang} onChange={setLang}>
                <div className="relative mt-1">
                    <Listbox.Button
                        className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-900 dark:text-white  py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm">
                        <span className="block truncate">{lang.name}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
              />
            </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options
                            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900  py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {
                                languages.map((language, languageIdx) => (
                                    <Listbox.Option
                                        key={languageIdx}
                                        className="relative cursor-default select-none py-2 pl-6 pr-4 dark:text-white text-gray-900"
                                        value={language}
                                    >
                                        {({selected}) => (
                                            <>
                                              <span
                                                  className={`block truncate ${
                                                      selected ? 'font-medium' : 'font-normal'
                                                  }`}
                                              >
                                                {language.name}
                                              </span>
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))
                            }
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    )
}
