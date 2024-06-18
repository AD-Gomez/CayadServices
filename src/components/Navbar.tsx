import { Fragment, useState } from 'react'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import logoweb from '../../public/img/logo-cayad.webp'
import MarqueeText from './Marquee'
import { FaPhone } from 'react-icons/fa'

const weOffer = [
  { description: 'Door to door transport', href: '#', icon: ChartPieIcon },
  { description: 'Open car transport', href: '#', icon: CursorArrowRaysIcon },
  { description: 'Enclosed auto transport', href: '#', icon: FingerPrintIcon },
  { description: 'Motorcycle shipping', href: '#', icon: SquaresPlusIcon }
]

const weServe = [
  { description: 'Online car buyers', href: '#', icon: ChartPieIcon },
  { description: 'College students', href: '#', icon: CursorArrowRaysIcon },
  { description: 'Snowbirds', href: '#', icon: FingerPrintIcon },
  { description: 'Car collectors', href: '#', icon: SquaresPlusIcon },
  { description: 'Car resellers shipping', href: '#', icon: ArrowPathIcon },
  { description: 'Military', href: '#', icon: ArrowPathIcon },
]

const forBusinesses = [
  { description: 'Auto dealerships', href: '#', icon: ChartPieIcon },
  { description: 'Auto auctions', href: '#', icon: CursorArrowRaysIcon },
  { description: 'Heavy haul', href: '#', icon: FingerPrintIcon }
]

const whyUs = [
  { description: 'Reviews', href: '#', icon: ChartPieIcon },
  { description: 'About us', href: '#', icon: CursorArrowRaysIcon },
  { description: 'Our team', href: '#', icon: FingerPrintIcon },
  { description: 'Vision and Mission', href: '#', icon: FingerPrintIcon }
]

function classNames (...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function Example () {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <MarqueeText />
      <header className="bg-white border-t-[5px] max-h-[80px] border-[#00a1ef] sticky top-0 xs:static sm:static md:static z-50">
        <nav className="mx-auto flex max-w-[95%] max-h-[80px] items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img className="h-10 w-auto" src={logoweb.src} alt="" />
            </a>
          </div>

          <div className="hidden lg:hidden md:flex xs:flex sm:flex xl:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className=" h-12 w-12 text-btn-blue font-bold" aria-hidden="true" />
            </button>
          </div>
          <PopoverGroup className="flex gap-x-6 xs:hidden sm:hidden md:hidden lg:flex  lg:gap-6 xl:gap-6">
            <a href="#" className="text-[16px] font-medium text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100 leading-6 ">
              HOW IT WORKS?
            </a>
            <Popover className="relative">
              <PopoverButton className="flex items-center hover:text-[#00a1ef] ease-in-out duration-100 delay-100 focus:outline-none gap-x-1 text-[16px] font-medium leading-6 text-[#060315]">
                FOR INDIVIDUALS
                <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </PopoverButton>

              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  p-4 text-sm leading-6'>
                    <p className='text-white'>
                      We Offer
                    </p>
                  </div>
                  <div className="p-0">
                    {weOffer.map((item) => (
                      <div
                        key={item.description}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-neutral-300"
                      >
                        <div className="flex-auto">
                          <a href={item.href} className="block text-base text-gray-600">
                            {item.description}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  p-4 text-sm leading-6'>
                    <p className='text-white'>
                      We Serve
                    </p>
                  </div>
                  <div className="p-0">
                    {weServe.map((item) => (
                      <div
                        key={item.description}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-neutral-300"
                      >
                        <div className="flex-auto">
                          <a href={item.href} className="block text-base text-gray-600">
                            {item.description}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <Popover className="relative">
              <PopoverButton className="flex items-center text-[#060315] hover:text-[#00a1ef] ease-in duration-100 focus:outline-none delay-100 gap-x-1 text-[16px] font-medium leading-6 ">
                FOR BUSINESSES
                <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </PopoverButton>

              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className="p-0">
                    {forBusinesses.map((item) => (
                      <div
                        key={item.description}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-neutral-300"
                      >
                        <div className="flex-auto">
                          <a href={item.href} className="block text-base text-gray-600">
                            {item.description}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <Popover className="relative">
              <PopoverButton className="flex items-center hover:text-[#00a1ef] text-[#060315] ease-in duration-100 focus:outline-none delay-100 gap-x-1 text-[16px] font-medium leading-6 ">
                WHY US?
                <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </PopoverButton>

              <Transition
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className="p-0">
                    {whyUs.map((item) => (
                      <div
                        key={item.description}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-neutral-300"
                      >
                        <div className="flex-auto">
                          <a href={item.href} className="block text-base text-gray-600">
                            {item.description}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverPanel>
              </Transition>
            </Popover>
            <a href="#" className="text-[16px] hover:text-[#00a1ef] text-[#060315] ease-in-out duration-100 delay-100 font-medium leading-6 ">
              FAQS
            </a>
            <a href="#" className="text-[16px] hover:text-[#00a1ef] text-[#060315] ease-in-out duration-100 delay-100 font-medium leading-6 ">
              CONTACT
            </a>
            <div className='flex items-center'>
              <FaPhone className="text-btn-blue text-xl px-0 m-0 mr-1" />
              <a href="tel:(469) 619-0747" className='ml-1 text-xl text-btn-blue'>
                (469) 619-0747
              </a>
            </div>
          </PopoverGroup>
        </nav>
        <Dialog className=" lg:hidden xl:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10" />
          <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  className="h-12 w-auto"
                  src={logoweb.src}
                  alt=""
                />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 "
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-8 font-medium w-8 text-black" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    HOW IT WORKS?
                  </a>
                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          FOR INDIVIDUALS
                          <ChevronDownIcon
                            className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                            aria-hidden="true"
                          />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  p-4 text-sm leading-6'>
                            <p className='text-white'>
                              We Offer
                            </p>
                          </div>
                          {[...weOffer].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}

                        </DisclosurePanel>
                        <DisclosurePanel>
                          <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  p-4 text-sm leading-6'>
                            <p className='text-white'>
                              We Serve
                            </p>
                          </div>
                          {[...weServe].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>

                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          FOR BUSINESSES
                          <ChevronDownIcon
                            className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                            aria-hidden="true"
                          />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          {[...forBusinesses].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>

                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          WHY US?
                          <ChevronDownIcon
                            className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                            aria-hidden="true"
                          />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          {[...whyUs].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    FAQS
                  </a>
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    CONTACT
                  </a>
                  <div className='flex items-center'>
                    <FaPhone className="text-btn-blue text-xl px-0 m-0 mr-1" />
                    <a href="tel:(469) 619-0747" className='ml-1 text-xl text-btn-blue'>
                      (469) 619-0747
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </>
  )
}
