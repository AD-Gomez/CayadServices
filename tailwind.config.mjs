/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'white': '#FFF',
				'btn-blue': '#00a1ef',
				'btn-hover': '#007bef',
				'btn-hover-light': '#00a1ef',
				'h3-title': '#19171fd2',
				'h1-landing': '#232b36',
				'p-landing': '#555',
				'text-light': '#F8F2F0',
				'light': '#F8F2F0',
				'bg-footer': '#060315',
				'green-moving-text': '#029046',
				'blue-moving-text': '#00a1ef',
				'hover-li': '#e9ecef'
			},
			backgroundImage: {
				'banner-1': "url('./public/img/banner.webp')",
				'banner-2': "url('./public/img/banner1.webp')",
				'banner-5': "url('./public/img/banner5.webp')"
			},
			height: {
				'600': '600px',
				'700': '750px',
				'500': '500px',
				'550': '550px',
				'500': '500px',
				'450': '450px'
			},
			width: {
				'450': '400px',
				'455': '450px'
			},
			screens: {
				'xs': { 'min': '200px', 'max': '600px' },
				'sm': { 'min': '600px', 'max': '767px' },
				'md': { 'min': '768px', 'max': '1223px' },
				'lg': { 'min': '1024px', 'max': '1279px' },
				'xl': { 'min': '1280px', 'max': '1735px' },
			}
		},
		keyframes: {
			marquee: {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(-100%)' },
			},
			spin: {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(180deg)' },
			},
		},
		animation: {
			marquee: 'marquee 8s linear infinite',
			'spin-slow': 'spin 1s linear infinite',
		},
	},
	variants: {
		extend: {
			animation: ['hover', 'focus'],
			transform: ['hover', 'focus'],
		},
	},
	plugins: [],
}
