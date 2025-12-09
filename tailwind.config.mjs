/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'white': '#FFF',
				'btn-blue': '#00a1e1',
				'btn-hover': '#0080b4',
				'btn-hover-light': '#00a1e1',
				'h3-title': '#00000',
				'h1-landing': '#232b36',
				'p-landing': '#555',
				'text-light': '#F8F2F0',
				'light': '#F8F2F0',
				'bg-footer': '#060315',
				'green-moving-text': '#029046',
				'blue-moving-text': '#00a1e1',
				'hover-li': '#e9ecef'
			},
			backgroundImage: {
				'banner-1': "url('./public/img/banner.webp')",
				'banner-2': "url('./public/img/banner1.webp')",
				'banner-5': "url('./public/img/banner5.webp')"
			},
			height: {
				'450': '450px',
				'500': '500px',
				'550': '550px',
				'600': '600px',
				'700': '750px'
			},
			width: {
				'450': '400px',
				'455': '450px'
			},
			screens: {
				'xs': '375px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Outfit', 'sans-serif'],
			},
			boxShadow: {
				'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
				'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
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
