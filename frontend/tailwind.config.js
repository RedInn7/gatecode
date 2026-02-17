/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				"dark-layer-1": "rgb(255, 255, 255)",           // 主面板背景 → 白色
				"dark-layer-2": "rgb(247, 248, 250)",           // 页面背景 → 浅灰
				"dark-label-2": "rgba(38, 38, 38, 0.85)",       // 标签文字 → 深色
				"dark-divider-border-2": "rgb(229, 231, 235)",  // 分隔线 → 浅灰
				"dark-fill-2": "rgba(0, 0, 0, 0.08)",           // hover 背景
				"dark-fill-3": "rgba(0, 0, 0, 0.05)",           // 次级背景
				"dark-gray-6": "rgb(107, 114, 128)",            // 图标灰
				"dark-gray-7": "rgb(55, 65, 81)",               // 次级文字
				"gray-8": "rgb(38, 38, 38)",
				"dark-gray-8": "rgb(17, 24, 39)",               // 主文字 → 近黑
				"brand-orange": "rgb(255 161 22)",
				"brand-orange-s": "rgb(193, 122, 15)",
				"dark-yellow": "rgb(255 192 30)",
				"dark-pink": "rgb(255 55 95)",
				olive: "rgb(0, 184, 163)",
				"dark-green-s": "rgb(44 187 93)",
				"dark-blue-s": "rgb(10 132 255)",
			},
		},
	},
	plugins: [],
};
