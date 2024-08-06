import { Fragment, useState, useEffect } from 'react'
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
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import logoweb from '../../public/img/logo-cayad.png'
import MarqueeText from './Marquee'
import { FaPhone } from 'react-icons/fa'

const howItWork = [
  { description: 'How To Ship a Car', href: '/how-auto-transport-works/', icon: ChartPieIcon },
  { description: 'Car Shipping Cost', href: '/how-auto-transport-works/how-much-does-it-cost-ship-car/', icon: CursorArrowRaysIcon },
  { description: 'Cross country car shipping', href: '/how-auto-transport-works/ship-car-across-country/', icon: FingerPrintIcon },
]

const weOffer = [
  { description: 'Door to door transport', href: '/for-individuals/door-to-door/', icon: ChartPieIcon },
  { description: 'Open car transport', href: '/for-individuals/open-car-transport/', icon: CursorArrowRaysIcon },
  { description: 'Enclosed auto transport', href: '/for-individuals/enclosed-auto-transport/', icon: FingerPrintIcon },
  { description: 'Motorcycle shipping', href: '/for-individuals/motorcycle-shipping/', icon: SquaresPlusIcon }
]

const weServe = [
  { description: 'Online car buyers', href: '/for-individuals/car-buyers-auto-transport/', icon: ChartPieIcon },
  { description: 'College students', href: '/for-individuals/students-auto-transport/', icon: CursorArrowRaysIcon },
  { description: 'Snowbirds', href: '/for-individuals/snowbirds-auto-transport/', icon: FingerPrintIcon },
  { description: 'Classic car shipping', href: '/for-individuals/classic-cars-auto-transport/', icon: SquaresPlusIcon },
  { description: 'Car resellers shipping', href: '/for-individuals/car-resellers-auto-transport/', icon: ArrowPathIcon },
  { description: 'Military', href: '/for-individuals/military-auto-transport/', icon: ArrowPathIcon },
  { description: 'Ship cars to another state', href: '/for-individuals/ship-car-to-another-state/', icon: ArrowPathIcon },
]

const forBusinesses = [
  { description: 'Auto dealerships', href: '/for-businesses/auto-dealers/', icon: ChartPieIcon },
  { description: 'Auto auctions', href: '/for-businesses/auto-auctions/', icon: CursorArrowRaysIcon },
  { description: 'Heavy haul', href: '/for-businesses/heavy-haul/', icon: FingerPrintIcon }
]

const whyUs = [
  { description: 'Reviews', href: '/why-us/reviews/', icon: ChartPieIcon },
  //{ description: 'About us', href: '/why-us/about-us/', icon: CursorArrowRaysIcon },
  { description: 'Our team', href: '/why-us/our-team/', icon: FingerPrintIcon },
  { description: 'Vision and Mission', href: '/why-us/vision-mission/', icon: FingerPrintIcon },
  { description: 'Blog', href: '#', icon: FingerPrintIcon }
]

function classNames (...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function Example () {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);
  const isActive = (path: string) => currentPath.startsWith(path);

  const pathsToCheckForIndividuals = ['/for-individuals', ...weOffer.map(item => item.href), ...weServe.map(item => item.href)];
  const pathsToCheckForIBusinesses = ['/for-businesses', ...forBusinesses.map(item => item.href)];
  const pathsToCheckHowItWork = ['/how-auto-transport-works', ...whyUs.map(item => item.href)];
  const pathsToCheckWhyUs = ['/why-us', ...whyUs.map(item => item.href)];
  const isPopoverActive = pathsToCheckForIndividuals.some(path => isActive(path));
  const isPopoverBusinessesActive = pathsToCheckForIBusinesses.some(path => isActive(path));
  const isPopoverWhyUsActive = pathsToCheckWhyUs.some(path => isActive(path));
  const isPopoverHowItWorkActive = pathsToCheckHowItWork.some(path => isActive(path));

  return (
    <>
      <MarqueeText />
      <header className="bg-white border-t-[5px] max-h-[80px] border-[#00a1ef] sticky  top-0  z-50">
        <nav className="mx-auto flex max-w-[95%] max-h-[80px] items-center justify-between py-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
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

            <Popover
              className="relative"
              onMouseEnter={() => setOpenPopover('how-it-work')}
              onMouseLeave={() => setOpenPopover(null)}
            >
              {({ open }) => (
                <>
                  <Popover.Button className={classNames(
                    openPopover === 'how-it-work' ? 'text-btn-blue' : '',
                    isPopoverHowItWorkActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]',
                    'flex items-center hover:text-[#00a1ef] p-2 ease-in-out duration-100 delay-100 focus:outline-none gap-x-1 text-[16px] font-medium text-[#060315] leading-6'
                  )}>
                    HOW IT WORKS?
                    <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    show={openPopover === 'how-it-work'}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                      <div className="p-0">
                        {howItWork.map((item) => (
                          <div
                            key={item.description}
                            className={`group relative flex items-center gap-x-6 rounded-lg py-2 px-4 text-sm leading-6  hover:bg-neutral-300`}
                          >
                            <div className="flex-auto">
                              <a href={item.href} className={`block text-base ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} `}>
                                {item.description}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            <Popover
              className="relative"
              onMouseEnter={() => setOpenPopover('individuals')}
              onMouseLeave={() => setOpenPopover(null)}
            >
              {({ open }) => (
                <>
                  <Popover.Button className={classNames(
                    openPopover === 'individuals' ? 'text-btn-blue' : '',
                    isPopoverActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]',
                    'flex items-center hover:text-[#00a1ef] p-2 ease-in-out duration-100 delay-100 focus:outline-none gap-x-1 text-[16px] font-medium text-[#060315] leading-6'
                  )}>
                    FOR INDIVIDUALS
                    <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    show={openPopover === 'individuals'}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                      <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  py-2 px-4 text-sm leading-6'>
                        <p className='text-white'>
                          We Offer
                        </p>
                      </div>
                      <div className="p-0">
                        {weOffer.map((item) => (
                          <div
                            key={item.description}
                            className={`group relative flex items-center gap-x-6 rounded-lg py-2 px-4 text-sm leading-6  hover:bg-neutral-300`}
                          >
                            <div className="flex-auto">
                              <a href={item.href} className={`block text-base ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} `}>
                                {item.description}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  py-2 px-4 text-sm leading-6'>
                        <p className='text-white'>
                          We Serve
                        </p>
                      </div>
                      <div className="p-0">
                        {weServe.map((item) => (
                          <div
                            key={item.description}
                            className="group relative flex items-center gap-x-6 rounded-lg py-2 px-4 text-sm leading-6 hover:bg-neutral-300"
                          >
                            <div className="flex-auto">
                              <a href={item.href} className={`block text-base  ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} `}>
                                {item.description}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <Popover
              className="relative"
              onMouseEnter={() => setOpenPopover('businesses')}
              onMouseLeave={() => setOpenPopover(null)}
            >
              {({ open }) => (
                <>
                  <Popover.Button className={classNames(
                    openPopover === 'businesses' ? 'text-btn-blue' : '',
                    isPopoverBusinessesActive ? 'border-2 border-btn-blue  rounded  text-btn-blue ' : 'text-[#060315]',
                    'flex items-center hover:text-[#00a1ef] p-2 ease-in duration-100 focus:outline-none delay-100 gap-x-1 text-[16px] font-medium text-[#060315] leading-6'
                  )}>
                    FOR BUSINESSES
                    <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    show={openPopover === 'businesses'}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                      <div className="p-0">
                        {forBusinesses.map((item) => (
                          <div
                            key={item.description}
                            className="group relative flex items-center gap-x-6 rounded-lg py-2 px-4 text-sm leading-6 hover:bg-neutral-300"
                          >
                            <div className="flex-auto">
                              <a href={item.href} className={`block text-base    ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} `}>
                                {item.description}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
            <Popover
              className="relative"
              onMouseEnter={() => setOpenPopover('whyUs')}
              onMouseLeave={() => setOpenPopover(null)}
            >
              {({ open }) => (
                <>
                  <Popover.Button className={classNames(
                    openPopover === 'whyUs' ? 'text-btn-blue' : '',
                    isPopoverWhyUsActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]',
                    'flex items-center p-2 hover:text-[#00a1ef] ease-in duration-100 focus:outline-none delay-100 gap-x-1 text-[16px] font-medium text-[#060315] leading-6'
                  )}>
                    WHY US?
                    <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    show={openPopover === 'whyUs'}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute -left-0 top-full z-10 mt-3 w-screen max-w-60 overflow-hidden bg-white shadow-lg ring-1 ring-gray-900/5">
                      <div className="p-0">
                        {whyUs.map((item) => (
                          <div
                            key={item.description}
                            className="group relative flex items-center gap-x-6 rounded-lg py-2 px-4 text-sm leading-6 hover:bg-neutral-300"
                          >
                            <div className="flex-auto">
                              <a href={item.href} className={`block text-base ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'}`}>
                                {item.description}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            <a href="/faqs/" className={`text-[16px] font-medium p-2 text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100 leading-6
            ${currentPath === '/faqs/' ? 'text-btn-blue border-2 border-btn-blue  rounded ' : ''}  `}>
              FAQS
            </a>
            <a href="/contact" className={`text-[16px] font-medium p-2 text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100 leading-6
            ${currentPath === '/contact/' ? 'text-btn-blue  border-2 border-btn-blue  rounded' : ''}    `}>
              CONTACT
            </a>
            <div className="flex p-2">
              <FaPhone className="text-[#00a1ef] mr-2 mt-1" />
              <a href="tel:469-619-0747" className="text-[18px]  text-[#00a1ef] font-semibold leading-6 ">
                (469) 619-0747
              </a>
            </div>
          </PopoverGroup>
        </nav>
        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img className="h-10 w-auto" src={logoweb.src} alt="" />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <DisclosureButton
                          className={`flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-[#060315]
                         hover:text-[#00a1ef] ease-in-out duration-100 delay-100 *:
                         ${isPopoverHowItWorkActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]'}
                         `}>
                          HOW IT WORKS?
                          <ChevronDownIcon className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')} aria-hidden="true" />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">

                          {[...howItWork].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} hover:bg-neutral-300`}
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
                        <DisclosureButton
                          className={`flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-[#060315]
                         hover:text-[#00a1ef] ease-in-out duration-100 delay-100 *:
                         ${isPopoverActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]'}
                         `}>
                          FOR INDIVIDUALS
                          <ChevronDownIcon className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')} aria-hidden="true" />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  py-2 px-4 text-sm leading-6'>
                            <p className='text-white'>
                              We Offer
                            </p>
                          </div>
                          {[...weOffer].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} hover:bg-neutral-300`}
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}
                          <div className='bg-[#00a1ef] group relative flex items-center gap-x-6  py-2 px-4 text-sm leading-6'>
                            <p className='text-white'>
                              We Serve
                            </p>
                          </div>
                          {[...weServe].map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} hover:bg-neutral-300`}
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
                        <DisclosureButton
                          className={`flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7
                         text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100 ${isPopoverBusinessesActive ? 'border-2 border-btn-blue  rounded  text-btn-blue ' : 'text-[#060315]'}`}>
                          FOR BUSINESSES
                          <ChevronDownIcon className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')} aria-hidden="true" />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          {forBusinesses.map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} hover:bg-neutral-300`}
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
                        <DisclosureButton
                          className={`flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold ${isPopoverWhyUsActive ? 'text-btn-blue border-2 border-btn-blue  rounded' : 'text-[#060315]'}
                        leading-7 text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100`}>
                          WHY US?
                          <ChevronDownIcon className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')} aria-hidden="true" />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2">
                          {whyUs.map((item) => (
                            <DisclosureButton
                              key={item.description}
                              as="a"
                              href={item.href}
                              className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${currentPath === item.href ? 'text-btn-blue' : 'text-gray-600'} hover:bg-neutral-300`}
                            >
                              {item.description}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                  <a href="/faqs/"
                    className={`-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-[#060315] ${currentPath === '/faqs/' ? 'text-btn-blue border-2 border-btn-blue  rounded ' : ''}    hover:text-[#00a1ef] ease-in-out duration-100 delay-100`}>
                    FAQS
                  </a>
                  <a href="/contact" className={`-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 ${currentPath === '/contact' ? 'text-btn-blue border-2 border-btn-blue  rounded ' : ''} text-[#060315] hover:text-[#00a1ef] ease-in-out duration-100 delay-100`}>
                    CONTACT
                  </a>
                  <div className="flex ">
                    <FaPhone className="text-[#00a1ef] text-lg mr-2 mt-1" />
                    <a href="tel:469-619-0747" className="text-[18px] text-[#00a1ef] font-semibold leading-6 ">
                      (469) 619-0747
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="container xs:min-w-[100%] sm:min-w-[90%] md:min-w-[90%] md:mx-auto"
            >
              <div className="py-4">
                <div
                  className="flex w-full items-center flex-col md:flex-row md:justify-between text-center md:text-left"
                >
                  <div><p className="ml-2 text-black">IN GOD WE TRUST</p></div>
                  <div className="mb-3 flex text-black xs:text-xs sm:text-sm md:text-base md:mb-0">
                    &copy;2024
                    <a
                      className="ml-2 mr-2"
                      href="https://www.cayadservices.com">Cayad Services LLC</a>
                    |
                    <p className="ml-2 text-black">All Rights Reserve</p>
                  </div>
                  <div className="space-x-2 xs:text-xs sm:text-sm md:text-sm">
                    <a href="/privacy-policy/" className="text-black capitalize"
                    >Privacy Policy</a>
                    <span>|</span>
                    <a href="/copyright-trademark/" className="text-black capitalize">
                      Copyright & Trademark</a>
                    <span>|</span>
                    <a
                      href="/pdfs/Terms-and-Conditions.pdf"
                      download
                      className="text-black capitalize">Terms & Conditions</a>
                    <span>|</span>
                    <a href="/pdfs/Terms-of-use.pdf" download className="text-black"
                    >Terms of Use</a>
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
